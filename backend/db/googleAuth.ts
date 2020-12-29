import { UserInterface } from "../models/user";
import {google} from "googleapis";
import env from "../enviroment/env";

const getGoogleAuth = async (user: UserInterface) => {

    const googleIDandToken = await user?.decryptDriveIDandKey();

    const clientID = googleIDandToken?.clientID;
    const clientKey = googleIDandToken?.clientKey;
    const token = await user?.decryptDriveTokenData();
    const refreshToken = token.refresh_token;


    const date = new Date();
    const time = date.getTime();

    if (time >= token.expiry_date) {
        // console.log("TOKEN EXPIRED!")
    }

    const redirectURL = env.remoteURL + "/add-google-account";

    const oauth2Client = new google.auth.OAuth2(
        clientID,
        clientKey,
        redirectURL,
    );

    oauth2Client.setCredentials(token);

    return oauth2Client
}

export default getGoogleAuth;