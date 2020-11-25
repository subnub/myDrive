import {UserInterface} from "../../../models/user";
import env from "../../../enviroment/env";
import { google } from "googleapis";
import getGoogleAuth from "../../../db/googleAuth";
import createQueryGoogle, {googleQueryType} from "../../../utils/createQueryGoogle";

const fields = 'id, name, size, modifiedTime, hasThumbnail, parents, mimeType, thumbnailLink, webViewLink, shared';

class GoogleDbUtil {

    constructor() {

    }

    getList = async(query: googleQueryType, user: UserInterface) => {

        const oauth2Client = await getGoogleAuth(user);

        const limit = query.limit;

        let parent = query.parent === "/" ? "root" : query.parent;

        const {queryBuilder, orderBy} = createQueryGoogle(query, parent)

        const previosPageToken = query.pageToken;

        const drive = google.drive({version:"v3", auth: oauth2Client});
        const files = await drive.files.list({pageSize: limit, fields: `nextPageToken, files(${fields})`, q: queryBuilder, orderBy, pageToken: previosPageToken});

        return files
    }
}

export default GoogleDbUtil;