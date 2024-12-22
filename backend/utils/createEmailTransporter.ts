import env from "../enviroment/env";
import nodemailer from "nodemailer";

const createEmailTransporter = () => {
  const emailVerification = env.emailVerification === "true";
  const emailAPIKey = env.emailAPIKey;
  const emailDomain = env.emailDomain;
  const emailHost = env.emailHost;
  const emailPort = env.emailPort;
  const emailAddress = env.emailAddress;

  if (!emailVerification) {
    throw new Error("Email Verification Not Enabled");
  }

  if (!emailAPIKey || !emailDomain || !emailHost || !emailAddress) {
    throw new Error("Email Verification Not Setup Correctly");
  }

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: emailHost,
    port: emailPort || 587,
    auth: {
      user: emailDomain,
      pass: emailAPIKey,
    },
  });

  return transporter;
};

export default createEmailTransporter;
