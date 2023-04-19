
import { fs, fsInited, initFS } from "graphscript-services.storage";

declare var window:any;



export class GDrive {
    //------------------------
    //-GOOGLE DRIVE FUNCTIONS-
    //------------------------
    
    google = (window as any).google
    gapi = (window as any).gapi
    directory = "MyAlyce_Data"
    fs = fs;

    constructor(apiKey?, googleClientId?) {
        if(apiKey && googleClientId)
            this.initGapi(apiKey, googleClientId);
    }

    //this is deprecated now?: https://developers.google.com/identity/gsi/web/guides/overview
    initGapi = (
        apiKey:string, 
        googleClientID:string
    ) => {

        const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
        const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
        let tokenClient;
        let gapiInited = false;
        let gisInited = false;


        if (location.hostname === 'localhost') return;

        const gapiLoaded = () => {
            this.gapi = window.gapi;
            this.gapi.load('client', initializeGapiClient);
          }
    
        const gisLoaded =() => {
            this.google = window.google;
            tokenClient = this.google.accounts.oauth2.initTokenClient({
              client_id: googleClientID,
              scope: SCOPES,
              callback: '', // defined later
            });
            gisInited = true;
          }

          const initializeGapiClient = async () => {
            await this.gapi.client.init({
              apiKey: apiKey,
              discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
          }
        
        function handleClientLoad() {
           // window.gapi.load('client:oauth2', initClient);
        }
        
        function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
                console.log("Signed in with Google.")
            } else {
                console.log("Signed out of Google")
            }
        }
        
        const script1 = document.createElement('script');
        script1.type = "text/javascript";
        script1.src = "https://apis.google.com/js/api.js";
        script1.async = true;
        script1.defer = true;
        script1.onload = gapiLoaded;
        document.head.appendChild(script1);
        const script2 = document.createElement('script');
        script2.type = "text/javascript";
        script2.src = "https://accounts.google.com/gsi/client";
        script2.async = true;
        script2.defer = true;
        script2.onload = gisLoaded;
        document.head.appendChild(script2);

    }



    checkFolder(
        name=this.directory,
        onResponse=(result)=>{}
    ) {
        return new Promise((res,rej) => {

            this.gapi.client.drive.files.list({
                q:"name='"+name+"' and mimeType='application/vnd.google-apps.folder'",
            }).then((response) => {
                if(response.result.files.length === 0) {
                    this.createDriveFolder();
                    if(onResponse) onResponse(response.result);
                    res(response.result as any);
                }
                else if(onResponse) onResponse(response.result);
                res(response.result as any);
            });
        })
    }

    createDriveFolder(
        name=this.directory
    ) {
        return new Promise((res,rej) => {
            let data = new Object() as any;
            data.name = name;
            data.mimeType = "application/vnd.google-apps.folder";
            this.gapi.client.drive.files.create({'resource': data}).then((response)=>{
                console.log(response.result);
                res(response.result as any);
            });
        });
    }

    //backup file to drive by name (requires gapi authorization)
    backupToDrive = (
        bfsPath:string
    ) => {
        return new Promise(async (res,rej) => {
            if(!fsInited) await initFS(['data']);
            if(this.gapi.auth2.getAuthInstance().isSignedIn.get()){
                fs.readFile(bfsPath, (e,output)=>{
                    if(e) throw e; if(!output) return;
                    let file = new Blob([output.toString()],{type:'text/csv'});
                    this.checkFolder(this.directory, (result)=>{
                        let metadata = {
                            'name':bfsPath.split('/')[1]+".csv",
                            'mimeType':'application/vnd.google-apps.spreadsheet',
                            'parents':[result.files[0].id]
                        }
                        let token = this.gapi.auth.getToken().access_token;
                        var form = new FormData();
                        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
                        form.append('file', file);
    
                        var xhr = new XMLHttpRequest();
                        xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
                        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                        xhr.responseType = 'json';
                        xhr.onload = () => {
                            console.log("Uploaded file id: ",xhr.response.id); // Retrieve uploaded file ID.
                            //this.listDriveFiles();
                            res(true);
                        };
                        xhr.send(form);
                    });   
                });
            } else {
                alert("Sign in with Google first!")
            }
        });
        
    }

    listDriveFiles(
        pageSize=100,
        onload?:(files)=>{}
    ) {
        return new Promise((res,rej) => {
            this.checkFolder(this.directory, (result)=> {
                this.gapi.client.drive.files.list({
                    q: `'${result.files[0].id}' in parents`,
                    'pageSize': pageSize,
                    'fields': "nextPageToken, files(id, name)"
                }).then((response) => {
                    //document.getElementById(this.props.id+'drivefiles').innerHTML = ``;
                    //this.appendContent('Drive Files (Brainsatplay_Data folder):','drivefiles');
                    var files = response.result.files;
                    if (files && files.length > 0) {
                        if(onload) onload(files);
                        res(files);
                        // for (var i = 0; i < files.length; i++) {
                        //     var file = files[i];
                        //     document.getElementById(listDivId).insertAdjacentHTML('beforeend',`<div id=${file.id} style='border: 1px solid white;'>${file.name}<button id='${file.id}dload'>Download</button></div>`);
                        //     document.getElementById(file.id+'dload').onclick = () => {
                                
                        //         //Get CSV data from drive
                        //         var request = this.gapi.client.drive.files.export({'fileId': file.id, 'mimeType':'text/csv'});
                        //         request.then((resp) => {
                        //             let filename = file.name;
                        //             fs.appendFile('/data/'+filename,resp.body,(e)=>{
                        //                 if(e) throw e;
                        //                 ondownload(resp.body);
                        //             });
                        //         });
                        //     }
                        // }
                    } else {
                        res(undefined);//this.appendContent('<p>No files found.</p>','drivefiles');
                    }
                });
            })
            
        })

    }

    //pass a queried drive folder (i.e. from listDriveFiles)
    driveToBFS(
        file:{id:string, name:string, [key:string]:any}, //you need the file id from gdrive
        bfsDir='data',
        ondownload=(body)=>{}
    ) {
        return new Promise((res,rej) => {

            var request = this.gapi.client.drive.files.export({'fileId': file.id, 'mimeType':'text/csv'});
            request.then(async (resp) => {
                let filename = file.name;
                if(!fsInited) await initFS(['data']);
                fs.appendFile(
                    '/'+bfsDir+'/'+filename,
                    resp.body,
                    (e)=>{
                    if(e) throw e;
                    ondownload(resp.body);
                    res(resp.body);
                });
            });
        })
    }
}