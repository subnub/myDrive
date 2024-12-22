import SMTPTransport from "nodemailer/lib/smtp-transport";
import env from "../enviroment/env";
import { UserInterface } from "../models/user-model";
import nodemailer from "nodemailer";
import createEmailTransporter from "./createEmailTransporter";

type MailOptionsType = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

const sendEmail = (
  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>,
  mailOptions: MailOptionsType
) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

const sendVerificationEmail = async (
  user: UserInterface,
  emailToken: string
) => {
  try {
    const transporter = createEmailTransporter();

    const emailAddress = env.emailAddress!;
    const url = env.remoteURL + `/verify-email/${emailToken}`;

    const mailOptions = {
      from: emailAddress,
      to: user.email,
      subject: "myDrive Email Verification",
      text:
        "Please navigate to the following link to verify your email address: " +
        url,
    };

    await sendEmail(transporter, mailOptions);

    return true;
  } catch (e) {
    console.log("Error sending email verification", e);
    return false;
  }
};

export default sendVerificationEmail;
