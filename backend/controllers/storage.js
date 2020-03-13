const env = require("../enviroment/env")
const disk = require('diskusage');

class StorageController {

    constructor() {

    }

    async getStorageInfo(req, res) {

        if (!req.user) {

            return;
        }
    
        try {
    
            const info = await disk.check(env.root);
        
            res.send(info)
    
        } catch (e) {
    
            console.log(e);
            res.status(500).send(e);
        }
    }
}

module.exports = StorageController;