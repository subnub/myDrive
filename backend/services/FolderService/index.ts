import Folder from "../../models/folder";
import InternalServerError from "../../utils/InternalServerError";
import NotFoundError from "../../utils/NotFoundError";
import UtilsFile from "../../db/utils/fileUtils";
import UtilsFolder from "../../db/utils/folderUtils";
import sortBySwitch from "../../utils/sortBySwitchFolder";
import { UserInterface } from "../../models/user";

type userAccessType = {
    _id: string,
    emailVerified: boolean,
    email: string,
    s3Enabled: boolean,
}

const utilsFile = new UtilsFile();
const utilsFolder = new UtilsFolder();

class FolderService {

    uploadFolder = async(data: any) => {

        const folder = new Folder(data);
    
        await folder.save();

        if (!folder) throw new InternalServerError("Upload Folder Error");

        return folder;
    }

    getFolderInfo = async(userID: string, folderID: string) => {

        let currentFolder = await utilsFolder.getFolderInfo(folderID, userID);
    
        if (!currentFolder) throw new NotFoundError("Folder Info Not Found Error");
    
        const parentID = currentFolder.parent;
    
        let parentName = ""; 
    
        if (parentID === "/") {
    
            parentName = "Home"
    
        } else {
    
            const parentFolder = await utilsFolder.getFolderInfo(parentID, userID);
                
            if (parentFolder) {
    
                parentName = parentFolder.name;
    
            } else {
    
                parentName = "Unknown"
            }
    
        }
    
        const folderName = currentFolder.name
    
        currentFolder = {...currentFolder._doc, parentName, folderName}
        // Must Use ._doc here, or the destucturing/spreading 
        // Will add a bunch of unneeded variables to the object.

        return currentFolder;
    }

    getFolderSublist = async(userID: string, folderID: string) => {

        const folder = await utilsFolder.getFolderInfo(folderID, userID);

        if (!folder) throw new NotFoundError("Folder Sublist Not Found Error");
    
        const subfolderList = folder.parentList;

        let folderIDList = [];
        let folderNameList = [];

        for (let i = 0; i < subfolderList.length; i++) {

            const currentSubFolderID = subfolderList[i];

            if (currentSubFolderID === "/") {

                folderIDList.push("/");
                folderNameList.push("Home")

            } else {

                const currentFolder = await utilsFolder.getFolderInfo(currentSubFolderID, userID);

                folderIDList.push(currentFolder._id);
                folderNameList.push(currentFolder.name)
            }   
        }

        folderIDList.push(folderID);
        folderNameList.push(folder.name)

        return {
            folderIDList, 
            folderNameList
        }
    }

    getFolderList = async(user: userAccessType | UserInterface, query: any) => {

        const userID = user._id;

        let searchQuery = query.search || "";
        const parent = query.parent || "/";
        let sortBy = query.sortby || "DEFAULT"
        const type = query.type;
        const storageType = query.storageType || undefined;
        const folderSearch = query.folder_search || undefined;
        const itemType = query.itemType || undefined;
        sortBy = sortBySwitch(sortBy);

        const s3Enabled = user.s3Enabled ? true : false;

        if (searchQuery.length === 0) {

            const folderList = await utilsFolder.getFolderListByParent(userID, parent, sortBy, s3Enabled, type, storageType, itemType);

            if (!folderList) throw new NotFoundError("Folder List Not Found Error");

            return folderList;

        } else {

            searchQuery = new RegExp(searchQuery, 'i')
            const folderList = await utilsFolder.getFolderListBySearch(userID, searchQuery, sortBy, type, parent, storageType, folderSearch, itemType, s3Enabled);

            if (!folderList) throw new NotFoundError("Folder List Not Found Error");

            return folderList;
        }
    }

    renameFolder = async(userID: string, folderID: string, title: string) => {

        const folder = await utilsFolder.renameFolder(folderID, userID, title);

        if (!folder) throw new NotFoundError("Rename Folder Not Found");
    }

    getSubfolderFullList = async(user: userAccessType, id: string) => {

        const userID = user._id;

        const folder = await utilsFolder.getFolderInfo(id, userID)

        const subFolders = await this.getFolderList(user, {parent: id}) //folderService.getFolderList(user._id, {parent: id})

        let folderList: any[] = [];

        const rootID = "/"

        let currentID = folder.parent;

        folderList.push({
            _id: folder._id,
            parent: folder._id,
            name: folder.name,
            subFolders: subFolders
        })

        while (true) {

            if (rootID === currentID) break;

            const currentFolder = await this.getFolderInfo(userID, currentID);
            const currentSubFolders = await this.getFolderList(user, {parent: currentFolder._id});

            folderList.splice(0, 0, {
                _id: currentFolder._id,
                parent: currentFolder._id,
                name: currentFolder.name,
                subFolders: currentSubFolders
            })
            
            currentID = currentFolder.parent;
        }

        return folderList;
    }

    moveFolder = async(userID: string, folderID: string, parentID: string) => {

        let parentList = ["/"];

        if (parentID.length !== 1) {

            const parentFile = await utilsFolder.getFolderInfo(parentID, userID);
            parentList = parentFile.parentList;
            parentList.push(parentID);
        }

        const folder = await utilsFolder.moveFolder(folderID, userID, parentID, parentList);

        if (!folder) throw new NotFoundError("Move Folder Not Found")

        const folderChilden = await utilsFolder.findAllFoldersByParent(folderID.toString(), userID);

        folderChilden.map( async(currentFolderChild) => {

            let currentFolderChildParentList = currentFolderChild.parentList;

            const indexOfFolderID = currentFolderChildParentList.indexOf(folderID.toString());

            currentFolderChildParentList = currentFolderChildParentList.splice(indexOfFolderID);

            currentFolderChildParentList = [...parentList, ...currentFolderChildParentList];

            currentFolderChild.parentList = currentFolderChildParentList;

            await currentFolderChild.save()
        })

        const fileChildren = await utilsFile.getFileListByParent(userID, folderID.toString());

        fileChildren.map( async(currentFileChild) => {

            let currentFileChildParentList: string | string[] = currentFileChild.metadata.parentList;

            currentFileChildParentList = currentFileChildParentList.split(",");

            const indexOfFolderID = currentFileChildParentList.indexOf(folderID.toString());

            currentFileChildParentList = currentFileChildParentList.splice(indexOfFolderID);

            currentFileChildParentList = [...parentList, ...currentFileChildParentList];

            await utilsFile.moveFile(currentFileChild._id, userID, currentFileChild.metadata.parent, currentFileChildParentList.toString())

        })
    }
}

export default FolderService;