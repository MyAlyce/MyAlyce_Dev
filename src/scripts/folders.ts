import { BFSRoutes, csvRoutes } from "graphscript-services.storage";

export async function checkFolderList(listfilename='folderList', hasFolderName?) {
    if(hasFolderName && !(await BFSRoutes.exists(listfilename))) {
        await csvRoutes.createCSV(listfilename, ['folder','lastmodified']);
        let data = {folder:hasFolderName, lastmodified:Date.now()};
        await csvRoutes.appendCSV(data, listfilename);

        return data;
    } else {
        let exists = false;
        let data = {} as any;
        await csvRoutes.processCSVChunksFromDB(listfilename, (csvdata, start, end, size) => {
            for(const key in csvdata) {
                if(key === 'folder') {
                    csvdata[key].forEach((n,i) => {
                        if(n === hasFolderName) {
                            exists = true;
                            csvdata['lastmodified'][i] = Date.now();
                        }
                    });
                }
                if(!data[key]) data[key] = csvdata[key];
                else data[key].push(...csvdata[key]);
            }
        });
        if(!exists) {
            data.folder ? data.folder.push(hasFolderName) : data.folder = [hasFolderName];
            data.lastmodified ? data.lastmodified.push(Date.now()) : data.lastmodified = [Date.now()];
        }

        //todo add a writeCSV function to replace the contents instead of doing all this
        await BFSRoutes.deleteFile(listfilename);
        await csvRoutes.createCSV(listfilename, ['folder','lastmodified']);
        await csvRoutes.appendCSV(data, listfilename);

        return data;
    }

}

export async function parseFolderList(listParentFolder:string):Promise<string[]> {
    if(!listParentFolder) return [];
    return await new Promise ((res) => {
        csvRoutes.readCSVChunkFromDB(
            listParentFolder + '/folderList'
        ).then((data:any) => {
            res(data?.folder ? data?.folder : []);
        });
    });
}
