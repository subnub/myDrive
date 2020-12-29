import User from "../../../../dist/models/user";
import mongoose from "../../../../dist/db/mongoose";
import UtilsFolder from "../../../../dist/db/utils/folderUtils";
import Folder from "../../../../dist/models/folder"
const conn = mongoose.connection;
const createUser = require("../../../fixtures/createUser");
const utilsFolder = new UtilsFolder();


let user; 
let folder;

process.env.KEY = "1234";

const waitForDatabase = () => {

    return new Promise((resolve, reject) => {

        if (conn.readyState !== 1) {

            conn.once("open", () => {
                
                resolve();
    
            })

        } else {

            resolve();
        }
    
    })
}

beforeEach(async(done) => {

    await waitForDatabase();

    const {user: gotUser} = await createUser();
    user = gotUser;

    const folderData = {
        name: "bunny",
        owner: user._id, 
        parent: "/",
        parentList: ["/"]
    }
    

    folder = new Folder(folderData);
    await folder.save();

    done();

    // if (conn.readyState === 0) {

    //     conn.once("open", async() => {

    //         //user = await createUser();
    //         const {user: gotUser} = await createUser();
    //         user = gotUser;

    //         const folderData = {
    //             name: "bunny",
    //             owner: user._id, 
    //             parent: "/",
    //             parentList: ["/"]
    //         }
            
    
    //         folder = new Folder(folderData);
    //         await folder.save();
    
    //         done();
    
    
    //     })

    // } else {

    //         //user = await createUser();
    //         const {user: gotUser} = await createUser();
    //         user = gotUser;

    //         const folderData = {
    //             name: "bunny",
    //             owner: user._id, 
    //             parent: "/",
    //             parentList: ["/"]
    //         }
            
    
    //         folder = new Folder(folderData);
    //         await folder.save();
    
    //         done();
    // }
    
})

afterEach( async(done) => {
            
    await User.deleteMany({});
    await Folder.deleteMany({});

    done();

})

test("When giving userID, and search query, should return a searched filtered folder list", async() => {

    const userID = user._id;
    let search = "coco";
    search = new RegExp(search, 'i')

    const folderTwo = await new Folder({
        name: "coconut",
        owner: userID, 
        parent: "/",
        parentList: ["/"]
    })
    
    const folderThree = await new Folder({
        name: "dinnerbone",
        owner: userID, 
        parent: "1234",
        parentList: ["/", "1234"] 
    })

    const folderFour = await new Folder({
        name: "cocoelephant",
        owner: "1234", 
        parent: "/",
        parentList: ["/"] 
    })

    await folderTwo.save();
    await folderThree.save();
    await folderFour.save();



    const recievedFolderList = await utilsFolder.getFolderSearchList(userID, search);


    expect(recievedFolderList.length).toBe(1);
    expect(recievedFolderList[0]._id).toEqual(folderTwo._id)
})

test("When giving the wrong userID, should not return search query", async() => {

    const userID = user._id;
    const wrongUserID = "123456789012"
    let search = "coco";
    search = new RegExp(search, 'i')

    const folderTwo = await new Folder({
        name: "coconut",
        owner: userID, 
        parent: "/",
        parentList: ["/"]
    })
    
    const folderThree = await new Folder({
        name: "dinnerbone",
        owner: userID, 
        parent: "1234",
        parentList: ["/", "1234"] 
    })

    const folderFour = await new Folder({
        name: "cocoelephant",
        owner: "1234", 
        parent: "/",
        parentList: ["/"] 
    })

    await folderTwo.save();
    await folderThree.save();
    await folderFour.save();



    const recievedFolderList = await utilsFolder.getFolderSearchList(wrongUserID, search);


    expect(recievedFolderList.length).toBe(0);
})

test("When giving folderID and userID, should return folder info", async() => {

    const folderID = folder._id;
    const userID = user._id;


    const recievedFolder = await utilsFolder.getFolderInfo(folderID, userID);


    expect(recievedFolder._id).toEqual(folderID);
})

test("When giving the wrong folderID, should not return folder info", async() => {

    const wrongFolderID = "123456789012";
    const userID = user._id;


    const recievedFolder = await utilsFolder.getFolderInfo(wrongFolderID, userID);


    expect(recievedFolder).toBe(null);
})


test("When giving the wrong userID, should not return folder info", async() => {

    const folderID = folder._id;
    const wrongUserID = "123456789012"


    const recievedFolder = await utilsFolder.getFolderInfo(folderID, wrongUserID);


    expect(recievedFolder).toBe(null);
})

test("When giving userID, parent, and sortby, should return filtered folder list by parent", async() => {

    const userID = user._id;
    const parent = "1234";
    const sortBy = {createdAt: -1}

    const folderTwo = await new Folder({
        name: "coconut",
        owner: userID, 
        parent: "/",
        parentList: ["/"]
    })
    
    const folderThree = await new Folder({
        name: "dinnerbone",
        owner: userID, 
        parent: "1234",
        parentList: ["/", "1234"] 
    })

    const folderFour = await new Folder({
        name: "cocoelephant",
        owner: "1234", 
        parent: "/",
        parentList: ["/"] 
    })

    await folderTwo.save();
    await folderThree.save();
    await folderFour.save();



    const recievedFolderList = await utilsFolder.getFolderListByParent(userID, parent, sortBy);


    expect(recievedFolderList.length).toBe(1);
    expect(recievedFolderList[0]._id).toEqual(folderThree._id);
})

test("When giving the wrong userID, should not return folder list filtered by parent", async() => {

    const userID = user._id;
    const parent = "1234";
    const sortBy = {createdAt: -1}
    const wrongUserID = "123456789012"


    const folderTwo = await new Folder({
        name: "coconut",
        owner: userID, 
        parent: "/",
        parentList: ["/"]
    })
    
    const folderThree = await new Folder({
        name: "dinnerbone",
        owner: userID, 
        parent: "1234",
        parentList: ["/", "1234"] 
    })

    const folderFour = await new Folder({
        name: "cocoelephant",
        owner: "1234", 
        parent: "/",
        parentList: ["/"] 
    })

    await folderTwo.save();
    await folderThree.save();
    await folderFour.save();



    const recievedFolderList = await utilsFolder.getFolderListByParent(wrongUserID, parent, sortBy);


    expect(recievedFolderList.length).toBe(0)
})

test("When giving userID, search query, and sort by, should return folder list by search (no limit)" , async() => {

    const userID = user._id;
    let search = "coco";
    search = new RegExp(search, 'i')

    const folderTwo = await new Folder({
        name: "coconut",
        owner: userID, 
        parent: "/",
        parentList: ["/"]
    })
    
    const folderThree = await new Folder({
        name: "dinnerbone",
        owner: userID, 
        parent: "1234",
        parentList: ["/", "1234"] 
    })

    const folderFour = await new Folder({
        name: "cocoelephant",
        owner: "1234", 
        parent: "/",
        parentList: ["/"] 
    })

    await folderTwo.save();
    await folderThree.save();
    await folderFour.save();



    const recievedFolderList = await utilsFolder.getFolderListBySearch(userID, search);


    expect(recievedFolderList.length).toBe(1);
    expect(recievedFolderList[0]._id).toEqual(folderTwo._id)

})

test("When giving wrong userID, should not return folder list by search (no limit)", async() => {

    const userID = user._id;
    let search = "coco";
    search = new RegExp(search, 'i')
    const wrongUserID = "123456789012"

    const folderTwo = await new Folder({
        name: "coconut",
        owner: userID, 
        parent: "/",
        parentList: ["/"]
    })
    
    const folderThree = await new Folder({
        name: "dinnerbone",
        owner: userID, 
        parent: "1234",
        parentList: ["/", "1234"] 
    })

    const folderFour = await new Folder({
        name: "cocoelephant",
        owner: "1234", 
        parent: "/",
        parentList: ["/"] 
    })

    await folderTwo.save();
    await folderThree.save();
    await folderFour.save();



    const recievedFolderList = await utilsFolder.getFolderListBySearch(wrongUserID, search);


    expect(recievedFolderList.length).toBe(0);
})

test("When giving folderID, userID, and title, should rename folder", async() => {

    const folderID = folder._id;
    const userID = user._id;
    const newName = "almonds";


    await utilsFolder.renameFolder(folderID, userID, newName);
    const updatedFolder = await Folder.findById(folderID);


    expect(updatedFolder.name).toBe(newName);
})

test("When giving wrong folderID, should not rename folder", async() => {

    const folderID = folder._id;
    const userID = user._id;
    const newName = "almonds";
    const wrongFolderID = "123456789012"


    await utilsFolder.renameFolder(wrongFolderID, userID, newName);
    const updatedFolder = await Folder.findById(folderID);


    expect(updatedFolder.name).toBe(folder.name);
})

test("When giving the wrong userID, should not rename folder", async() => {

    const folderID = folder._id;
    const wrongUserID = "123456789012";
    const newName = "almonds";


    await utilsFolder.renameFolder(folderID, wrongUserID, newName);
    const updatedFolder = await Folder.findById(folderID);


    expect(updatedFolder.name).toBe(folder.name);
})

test("When giving folderID, userID, parent, and parentList, should move folder", async() => {

    const folderID = folder._id;
    const userID = user._id;
    const parent = "1234";
    const parentList = ["/", "1234"];


    await utilsFolder.moveFolder(folderID, userID, parent, parentList);
    const updatedFolder = await Folder.findById(folderID);

    expect(updatedFolder.parentList.length).toBe(2);
    expect(updatedFolder.parent).toBe(parent);
})

test("When giving the wrong userID for folder move, should not move folder", async() => {

    const folderID = folder._id;
    const wrongUserID = "123456789012";
    const parent = "1234";
    const parentList = ["/", "1234"];

    await utilsFolder.moveFolder(folderID, wrongUserID, parent, parentList);
    const updatedFolder = await Folder.findById(folderID);

    expect(updatedFolder.parentList.length).toBe(1);
    expect(updatedFolder.parent).toBe(folder.parent);
})

