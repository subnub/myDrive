import SMTPTransport from "nodemailer/lib/smtp-transport";
import env from "../enviroment/env";
import { UserInterface } from "../models/userModel";
import nodemailer from "nodemailer";

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
    const emailVerification = env.emailVerification === "true";
    const emailAPIKey = env.emailAPIKey;
    const emailDomain = env.emailDomain;
    const emailHost = env.emailHost;
    const emailPort = env.emailPort;
    const emailAddress = env.emailAddress;

    if (!emailVerification) {
      return false;
    }

    if (!emailAPIKey || !emailDomain || !emailHost || !emailAddress) {
      console.log("Email Verification Not Setup Correctly");
      return false;
    }

    const url = env.remoteURL + `/verify-email/${emailToken}`;

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: 587 || emailPort,
      auth: {
        user: emailDomain,
        pass: emailAPIKey,
      },
    });

    const mailOptions = {
      from: emailAddress,
      to: user.email,
      subject: "myDrive Email Verification",
      text:
        "Please navigate to the following link to verify your email address: " +
        url,
    };

    console.log("Sending email verification", mailOptions, {
      host: emailHost,
      port: 587 || emailPort,
      auth: {
        user: emailDomain,
        pass: emailAPIKey,
      },
    });

    await sendEmail(transporter, mailOptions);

    return true;
  } catch (e) {
    console.log("Error sending email verification", e);
    return false;
  }
};

export default sendVerificationEmail;
