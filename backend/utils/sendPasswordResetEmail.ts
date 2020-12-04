import env from "../enviroment/env";
import {UserInterface} from "../models/user"
import sgMail from "@sendgrid/mail";

const sendPasswordResetEmail = async (user: UserInterface, passwordResetToken: string) => {

    if (process.env.NODE_ENV === "test") {
        return;
    }

    const apiKey: any = env.sendgridKey;
    const sendgridEmail:any = env.sendgridEmail;
    const url = env.remoteURL + `/reset-password/${passwordResetToken}`    

    // console.log("send grid api key", apiKey)
    // console.log("send grid email", sendgridEmail);
    // console.log("send grid reset url", url)
    sgMail.setApiKey(apiKey);

    const msg = {
        to: user.email,
        from: sendgridEmail,
        subject: "myDrive Password Reset", 
        text: `Please navigate to the following link to reset your password: ${url}`
    }

    await sgMail.send(msg);
    //console.log("Send grid email sent reset");
}

export default sendPasswordResetEmail;