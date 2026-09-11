// One-time maintenance script: re-wraps every user's file-encryption key
// (user.privateKey) under the new scrypt-derived master key instead of the
// old unsalted MD5-based one, without touching any file content.
//
// Run with the server STOPPED, after taking a database backup:
//   npm run build:backend
//   npm run rewrap-master-key
//
// Background: user.privateKey is a small blob wrapping a random 32-byte
// file-encryption key in two layers:
//   1. an inner layer keyed off the user's bcrypt password hash
//   2. an outer layer keyed off the server-wide master key (env.KEY)
// Both layers reuse the same IV (stored as user.publicKey). This script
// only unwraps/rewraps the outer layer with the new master key, reusing
// the existing IV - it never touches the inner layer, the IV, or any
// actual file bytes, so it should take seconds to a few minutes even for
// a large user base.

import getEnvVariables from "../enviroment/get-env-variables";
getEnvVariables();

import crypto from "crypto";
import prompts from "prompts";
import cliProgress from "cli-progress";
import mongoose from "../db/connections/mongoose-server-utils";
import User from "../models/user-model";
import env from "../enviroment/env";
import { deriveMasterKey, getOrCreateKeySalt } from "../key/derive-master-key";

const waitForDatabase = (): Promise<void> => {
  return new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once("open", () => resolve());
    }
  });
};

// Recreates the OLD (pre-fix) master key derivation exactly, purely so
// this script can unwrap data that was wrapped under it. This should
// never be used anywhere else once the migration is complete.
const deriveLegacyMasterKey = (passphrase: string): Buffer => {
  const md5Hex = crypto.createHash("md5").update(passphrase).digest("hex");
  return crypto.createHash("sha256").update(md5Hex).digest();
};

const unwrapWithMasterKey = (
  privateKeyHex: string,
  iv: Buffer,
  masterKey: Buffer
): Buffer => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", masterKey, iv);
  const decrypted = decipher.update(Buffer.from(privateKeyHex, "hex"));
  return Buffer.concat([decrypted, decipher.final()]);
};

const wrapWithMasterKey = (
  innerBlob: Buffer,
  iv: Buffer,
  masterKey: Buffer
): Buffer => {
  const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, iv);
  const encrypted = cipher.update(innerBlob);
  return Buffer.concat([encrypted, cipher.final()]);
};

const run = async () => {
  console.log(
    "\nThis re-wraps every user's file-encryption key with a new, " +
      "properly salted/stretched master-key derivation (scrypt) instead " +
      "of the old unsalted MD5-based one.\n\n" +
      "It does NOT touch any file content or the inner per-user key " +
      "layer - only the small master-wrapped blob on each user document " +
      "- so it should complete in seconds to a few minutes.\n\n" +
      "Make sure you have backed up your database (e.g. mongodump) and " +
      "that the myDrive server is stopped before continuing.\n"
  );

  const confirmation = await prompts({
    type: "text",
    name: "value",
    message:
      "Have you backed up your database, and is the server stopped? (yes/no)",
  });

  if (!confirmation.value || confirmation.value.toLowerCase() !== "yes") {
    console.log("Exiting...");
    process.exit();
  }

  const oldPassphraseAnswer = await prompts({
    type: "password",
    name: "value",
    message:
      "Enter your CURRENT server encryption password (the existing KEY value)",
  });

  const oldPassphrase: string | undefined = oldPassphraseAnswer.value;

  if (!oldPassphrase) {
    console.log("A current password is required. Exiting...");
    process.exit();
    return;
  }

  const newPassphraseAnswer = await prompts({
    type: "password",
    name: "value",
    message:
      "Enter a NEW server encryption password, or press Enter to keep the current one",
  });

  const newPassphrase: string = newPassphraseAnswer.value || oldPassphrase;

  console.log("\nWaiting for database connection...");
  await waitForDatabase();
  console.log("Connected.\n");

  const oldMasterKey = deriveLegacyMasterKey(oldPassphrase);
  const newSalt = getOrCreateKeySalt();
  const newMasterKey = deriveMasterKey(newPassphrase, newSalt);

  // masterKeyVersion is absent on every pre-migration document, so { $ne: 2 }
  // correctly matches them (and skips anyone already migrated, making
  // re-running this script safe).
  const users = await User.find({ masterKeyVersion: { $ne: 2 } });

  console.log(`Found ${users.length} user(s) to migrate.\n`);

  if (users.length === 0) {
    console.log("Nothing to do.");
    process.exit();
    return;
  }

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(users.length, 0);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      if (!user.privateKey || !user.publicKey) {
        skipped++;
        progressBar.increment();
        continue;
      }

      // Both layers share one IV by design - reuse it as-is, do not
      // generate a new one, or the inner (user-key) layer will no longer
      // decrypt correctly.
      const iv = Buffer.from(user.publicKey, "hex");

      const innerBlob = unwrapWithMasterKey(user.privateKey, iv, oldMasterKey);
      const newPrivateKey = wrapWithMasterKey(innerBlob, iv, newMasterKey);

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            privateKey: newPrivateKey.toString("hex"),
            masterKeyVersion: 2,
          },
        }
      );

      migrated++;
    } catch (e) {
      skipped++;
      console.log(
        `\nCould not migrate user ${user._id} (wrong current password, or ` +
          "already migrated?):",
        e instanceof Error ? e.message : e
      );
    }

    progressBar.increment();
  }

  progressBar.stop();

  console.log(`\nMigrated ${migrated} user(s). Skipped ${skipped}.\n`);

  if (skipped > 0) {
    console.log(
      "Some users were skipped - if the current password you entered was " +
        "wrong, fix it and re-run this script (already-migrated users are " +
        "skipped automatically). Otherwise investigate those users " +
        "individually before proceeding.\n"
    );
  }

  console.log(
    "Before restarting the server, make sure your environment has:\n" +
      `  KEY=${newPassphrase}\n` +
      (env.keySalt
        ? ""
        : "KEY_SALT was not set, so the new salt was written to the " +
          "key-salt file (or KEY_SALT_PATH, if you set one) - keep that " +
          "file, back it up alongside your database, and do not delete " +
          "it.\n")
  );

  process.exit();
};

run();
