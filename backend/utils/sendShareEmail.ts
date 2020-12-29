import env from "../enviroment/env";
import sgMail from "@sendgrid/mail";

const currentURL = env.remoteURL;

const sendShareEmail = async (file: any, respient: string) => {

    if (process.env.NODE_ENV === "test") {
        return;
    }

    const apiKey: any = env.sendgridKey;
    const sendgridEmail:any = env.sendgridEmail;

    sgMail.setApiKey(apiKey);

    const fileLink = `${currentURL}/download-page/${file._id}/${file.metadata.link}`

    const msg = {
        to: respient,
        from: sendgridEmail,
        subject: "A File Was Shared With You Through myDrive", 
        text: `Please navigate to the following link to view the file ${fileLink}`
    }

    await sgMail.send(msg);
}

export default sendShareEmail