import disk from "diskusage";
import env from "../enviroment/env";
import { Request, Response } from "express";
import { UserInterface } from "../models/user";

interface RequestType extends Request {
    user?: UserInterface,
}

class StorageController {

    constructor() {

    }

    getStorageInfo = async(req: RequestType, res: Response) => {

        if (!req.user) {

            return;
        }
    
        try {
    
            const info = await disk.check(env.root!);
        
            res.send(info)
    
        } catch (e) {
    
            console.log(e);
            res.status(500).send(e);
        }
    }
}

export default StorageController;