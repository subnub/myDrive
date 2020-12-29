import {UserInterface} from "../../models/user";
import env from "../../enviroment/env";
import { google } from "googleapis";

class UserGoogleService {
    
    constructor() {

    }

    createGoogleStorageURL = async(user: UserInterface, googleData: any) => {
        
        const {clientID, clientKey, clientRedirect} = googleData;

        const oauth2Client = new google.auth.OAuth2(
            clientID, clientKey, env.remoteURL + "/add-google-account"
        );
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: "consent",
            scope: ["https://www.googleapis.com/auth/drive"],
        });

        await user.encryptDriveIDandKey(clientID, clientKey);
        user.decryptDriveIDandKey();

        return url;
    }

    addGoogleStorage = async(user: UserInterface, code: string, uuid: string | undefined) => {

        const redirectURL = env.remoteURL + "/add-google-account";

        const decrypyedIdandKey = await user.decryptDriveIDandKey();

        const clientID = decrypyedIdandKey.clientID;
        const clientKey = decrypyedIdandKey.clientKey

        const oauth2Client = new google.auth.OAuth2(
            clientID,
            clientKey,
            redirectURL,
        );

        return new Promise<{accessToken: string, refreshToken: string}>((resolve, reject) => {
            oauth2Client.getToken(code, async(err, tokens) => {

                if (!err) {
    
                    const token: any = tokens; 
    
                    user.encryptDriveTokenData(token);

                    const {accessToken, refreshToken} = await user.generateAuthToken(uuid);

                    resolve({accessToken, refreshToken});
                    
                } else {
                   reject("Get Google Token Error")
                }
            })
        })
    }

    removeGoogleStorage = async(user: UserInterface, uuid: string | undefined) => {

        user.googleDriveEnabled = undefined;
        user.googleDriveData = undefined;

        await user.save();

        return await user.generateAuthToken(uuid);
    }
}

export default UserGoogleService;