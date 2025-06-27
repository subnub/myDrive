import env from "../enviroment/env";
import Mailjet from "node-mailjet";

const mailjet = Mailjet.connect(
  process.env.MAILJET_API_KEY || "62f8f68c2d64b999643ec22cd4fa5a2d",
  process.env.MAILJET_SECRET_KEY || "7eea6a0c286bbd96ba3c5e603751f35d"
);

const currentURL = env.remoteURL;

const sendShareEmail = async (file: any, recipient: string) => {
  try {
    const emailAddress = env.emailAddress!;
    const fileLink = `${currentURL}/download-page/${file._id}/${file.metadata.link}`;

    const html = `
      <div style="background:#0074D9;padding:32px 0;text-align:center;">
        <div style="background:#fff;border-radius:8px;max-width:400px;margin:0 auto;padding:32px;">
          <h2 style="color:#0074D9;margin-bottom:16px;">A File Was Shared With You on Cloud9</h2>
          <p style="color:#333;">Click the button below to view the shared file:</p>
          <a href="${fileLink}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#0074D9;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">View File</a>
          <p style="color:#888;font-size:12px;">If you do not recognize this, you can ignore this email.</p>
        </div>
      </div>
    `;

    await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: { Email: emailAddress, Name: "Cloud9" },
            To: [{ Email: recipient }],
            Subject: "A File Was Shared With You Through Cloud9",
            TextPart: `A file was shared with you. View it here: ${fileLink}`,
            HTMLPart: html,
          },
        ],
      });

    return true;
  } catch (e) {
    console.log("Error sending share email", e);
    return false;
  }
};

export default sendShareEmail;