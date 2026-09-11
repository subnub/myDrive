import crypto from "crypto";
import fs from "fs";
import env from "../enviroment/env";

// Key length (in bytes) of the derived master key. AES-256 needs 32 bytes.
const KEY_LENGTH = 32;

// Default location for the auto-generated salt file when KEY_SALT is not
// set explicitly via the environment. The salt is not secret, but it must
// stay constant across restarts or every existing user's wrapped
// encryption key becomes undecryptable.
const DEFAULT_SALT_PATH = "./key-salt";

/**
 * Derives the master AES-256 key from the operator-supplied encryption
 * passphrase using scrypt (a deliberately slow, memory-hard KDF), instead
 * of a bare, unsalted MD5/SHA-256 hash. This only runs once at process
 * startup (and once per user during the rewrap migration), so the extra
 * cost is negligible in practice.
 */
export const deriveMasterKey = (passphrase: string, salt: Buffer): Buffer => {
  return crypto.scryptSync(passphrase, salt, KEY_LENGTH);
};

/**
 * Returns the salt used to derive the master key. Prefers an explicit
 * KEY_SALT env var (hex-encoded) so operators can manage it alongside
 * their other secrets (e.g. via a secrets manager); otherwise falls back
 * to a local file that is auto-generated on first run and then reused on
 * every subsequent start. Losing this salt has the same effect as losing
 * KEY itself: existing users' file-encryption keys can no longer be
 * unwrapped.
 */
export const getOrCreateKeySalt = (): Buffer => {
  if (env.keySalt) {
    return Buffer.from(env.keySalt, "hex");
  }

  const saltPath = env.keySaltPath || DEFAULT_SALT_PATH;

  if (fs.existsSync(saltPath)) {
    return Buffer.from(fs.readFileSync(saltPath, "utf-8").trim(), "hex");
  }

  const salt = crypto.randomBytes(16);

  fs.writeFileSync(saltPath, salt.toString("hex"));

  console.log(
    `\nGenerated a new key salt and saved it to "${saltPath}".\n` +
      "This file must be kept and backed up alongside your database - " +
      "losing it makes existing users' encrypted files unrecoverable, " +
      "the same as losing KEY. To manage it via an environment variable " +
      `instead, set KEY_SALT=${salt.toString("hex")} and remove the file.\n`
  );

  return salt;
};
