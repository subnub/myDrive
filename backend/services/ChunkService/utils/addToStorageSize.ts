import {UserInterface} from "../../../models/user";
import env from "../../../enviroment/env";

const addToStoageSize = async(user: UserInterface, size: number, isPersonalFile: boolean) => {

    if  (isPersonalFile) {
        //console.log("user storage")
        user.storageDataPersonal!.storageSize = +user.storageDataPersonal!.storageSize! + +size;
        await user.save()
        return;
    }

    if (!user.storageData || (!user.storageData.storageSize && !user.storageData.storageLimit)) user.storageData = {storageSize: 0, storageLimit: 0};

    user.storageData!.storageSize = +user.storageData!.storageSize! + +size; 

    await user.save();
}

export default addToStoageSize;