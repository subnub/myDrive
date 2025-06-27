import env from "../enviroment/env";
import { UserInterface } from "../models/user-model";
import Mailjet from "node-mailjet";

const mailjet = Mailjet.connect(
  process.env.MAILJET_API_KEY || "62f8f68c2d64b999643ec22cd4fa5a2d",
  process.env.MAILJET_SECRET_KEY || "7eea6a0c286bbd96ba3c5e603751f35d"
);

const sendVerificationEmail = async (
  user: UserInterface,
  emailToken: string
) => {
  try {
    const emailAddress = env.emailAddress!;
    const url = env.remoteURL + `/verify-email/${emailToken}`;

    const html = `
      <div style="background:#0074D9;padding:32px 0;text-align:center;">
        <div style="background:#fff;border-radius:8px;max-width:400px;margin:0 auto;padding:32px;">
          <h2 style="color:#0074D9;margin-bottom:16px;">Welcome to Cloud9!</h2>
          <p style="color:#333;">Please verify your email address by clicking the button below:</p>
          <a href="${url}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#0074D9;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Verify Email</a>
          <p style="color:#888;font-size:12px;">If you did not request this, you can ignore this email.</p>
        </div>
      </div>
    `;

    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: { Email: emailAddress, Name: "Cloud9" },
            To: [{ Email: user.email }],
            Subject: "Cloud9 Email Verification",
            TextPart: `Please verify your email address: ${url}`,
            HTMLPart: html,
          },
        ],
      });

    return true;
  } catch (e) {
    console.log("Error sending email verification", e);
    return false;
  }
};

export default sendVerificationEmail;