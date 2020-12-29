import env from "../enviroment/env";
import {UserInterface} from "../models/user"
import sgMail from "@sendgrid/mail";

const sendVerificationEmail = async (user: UserInterface, emailToken: string) => {

    if (process.env.NODE_ENV === "test") {
        return;
    }

    const apiKey: any = env.sendgridKey;
    const sendgridEmail:any = env.sendgridEmail;
    const url = env.remoteURL + `/verify-email/${emailToken}`    

    // console.log("send grid api key", apiKey)
    // console.log("send grid email", sendgridEmail);
    // console.log("send grid verify url", url)
    sgMail.setApiKey(apiKey);

    const msg = {
        to: user.email,
        from: sendgridEmail,
        subject: "myDrive Email Verification", 
        text: `Please navigate to the following link to verify your email address: ${url}`
    }

    await sgMail.send(msg);
    //console.log("Send grid email sent");
}

export default sendVerificationEmail;