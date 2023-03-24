
import { fs, fsInited, initFS } from "graphscript-services.storage";

export class GDrive {
    //------------------------
    //-GOOGLE DRIVE FUNCTIONS-
    //------------------------
    
    gapi = (window as any).gapi //need to init the script
    directory = "MyAlyce_Data"
    fs = fs;

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