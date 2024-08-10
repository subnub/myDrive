import { Request, Response } from "express";
import FileService from "../services/file-service/file-service";
import User, { UserInterface } from "../models/user-model";
import sendShareEmail from "../utils/sendShareEmail";
import {
  createStreamVideoCookie,
  removeStreamVideoCookie,
} from "../cookies/create-cookies";
import ChunkService from "../services/chunk-service/chunk-service";
import streamToBuffer from "../utils/streamToBuffer";
import env from "../enviroment/env";
import getFileSize from "../services/chunk-service/utils/getFileSize";
import File, { FileMetadateInterface } from "../models/file-model";
import imageChecker from "../utils/imageChecker";
import videoChecker from "../utils/videoChecker";
import { S3Actions } from "../services/chunk-service/actions/S3-actions";
import { FilesystemActions } from "../services/chunk-service/actions/file-system-actions";
import createVideoThumbnail from "../services/chunk-service/utils/createVideoThumbnail";
import NotAuthorizedError from "../utils/NotAuthorizedError";
import createThumbnail from "../services/chunk-service/utils/createImageThumbnail";

const fileService = new FileService();
type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

interface RequestTypeFullUser extends Request {
  user?: UserInterface;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
}

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

class FileController {
  chunkService;

  constructor() {
    this.chunkService = new ChunkService();
  }

  getThumbnail = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }
    let responseSent = false;
    try {
      const user = req.user;
      const id = req.params.id;

      const { readStream, decipher } = await this.chunkService.getThumbnail(
        user,
        id
      );

      readStream.on("error", (e: Error) => {
        console.log("Get thumbnail read stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error getting thumbnail");
        }
      });

      decipher.on("error", (e: Error) => {
        console.log("Get thumbnail decipher error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error getting thumbnail");
        }
      });

      const bufferData = await streamToBuffer(readStream.pipe(decipher));

      res.send(bufferData);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Thumbnail Error File Route:", e.message);
      }
      if (!responseSent) {
        responseSent = true;
        res.status(500).send("Server error getting thumbnail");
      }
    }
  };

  getFullThumbnail = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }
    let responseSent = false;
    try {
      const user = req.user;
      const fileID = req.params.id;

      const { decipher, readStream, file } =
        await this.chunkService.getFullThumbnail(user, fileID);

      readStream.on("error", (e: Error) => {
        console.log("Get full thumbnail read stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error getting full thumbnail");
        }
      });

      decipher.on("error", (e: Error) => {
        console.log("Get full thumbnail decipher error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error gettingfull thumbnail");
        }
      });

      res.set("Content-Type", "binary/octet-stream");
      res.set(
        "Content-Disposition",
        'attachment; filename="' + file.filename + '"'
      );
      res.set("Content-Length", file.metadata.size.toString());

      readStream.pipe(decipher).pipe(res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Thumbnail Full Error File Route:", e.message);
      }
      res.status(500).send("Server error getting image");
    }
  };

  uploadFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    let responseSent = false;

    const handleError = () => {
      if (!responseSent) {
        responseSent = true;
        res.status(500).send("Server error uploading file");
      }
    };

    const handleFinish = async (
      filename: string,
      metadata: FileMetadateInterface
    ) => {
      try {
        const user = req.user;

        if (!user) throw new NotAuthorizedError("User Not Authorized");

        const date = new Date();

        let length = 0;

        if (env.dbType === "fs" && metadata.filePath) {
          length = (await getFileSize(metadata.filePath)) as number;
        } else {
          // TODO: Fix this we should be using the encrypted file size
          length = metadata.size;
        }

        const currentFile = new File({
          filename,
          uploadDate: date.toISOString(),
          length,
          metadata,
        });

        await currentFile.save();

        const imageCheck = imageChecker(currentFile.filename);
        const videoCheck = videoChecker(currentFile.filename);

        if (videoCheck) {
          const updatedFile = await createVideoThumbnail(
            currentFile,
            filename,
            user
          );

          res.send(updatedFile);
        } else if (currentFile.length < 15728640 && imageCheck) {
          const updatedFile = await createThumbnail(
            currentFile,
            filename,
            user
          );

          res.send(updatedFile);
        } else {
          res.send(currentFile);
        }
      } catch (e: unknown) {
        if (!responseSent) {
          res.writeHead(500, { Connection: "close" });
          res.end();
        }
      }
    };

    try {
      const user = req.user;
      const busboy = req.busboy;

      busboy.on("error", (e: Error) => {
        console.log("busboy error", e);
        handleError();
      });

      req.pipe(busboy);

      const { cipher, fileWriteStream, metadata, filename } =
        await this.chunkService.uploadFile(user, busboy, req);

      cipher.on("error", (e: Error) => {
        console.log("cipher error", e);
        handleError();
      });

      fileWriteStream.on("error", (e: Error) => {
        console.log("file write stream error", e);
        handleError();
      });

      cipher.pipe(fileWriteStream).on("finish", async () => {
        handleFinish(filename, metadata);
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nUploading File Error File Route:", e.message);
      }
      if (!responseSent) {
        res.writeHead(500, { Connection: "close" });
        res.end();
      }
    }
  };

  getPublicDownload = async (req: RequestType, res: Response) => {
    let responseSent = false;
    try {
      const ID = req.params.id;
      const tempToken = req.params.tempToken;

      const { readStream, decipher, file } =
        await this.chunkService.getPublicDownload(ID, tempToken, res);

      readStream.on("error", (e: Error) => {
        console.log("read stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error downloading publicfile");
        }
      });

      decipher.on("error", (e: Error) => {
        console.log("decipher stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error downloading public file");
        }
      });

      res.set("Content-Type", "binary/octet-stream");
      res.set(
        "Content-Disposition",
        'attachment; filename="' + file.filename + '"'
      );
      res.set("Content-Length", file.metadata.size.toString());

      readStream.pipe(decipher).pipe(res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Public Download Error File Route:", e.message);
      }
      if (!responseSent) {
        responseSent = true;
        res.status(500).send("Server error downloading public file");
      }
    }
  };

  removeLink = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      const file = await fileService.removeLink(userID, id);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRemove Public Link Error File Route:", e.message);
      }
      res.status(500).send("Server error removing link");
    }
  };

  makePublic = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const { file, token } = await fileService.makePublic(userID, fileID);

      res.send({ file, token });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMake Public Error File Route:", e.message);
      }
      res.status(500).send("Server error making public");
    }
  };

  getPublicInfo = async (req: RequestType, res: Response) => {
    try {
      const id = req.params.id;
      const tempToken = req.params.tempToken;

      const file = await fileService.getPublicInfo(id, tempToken);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Public Info Error File Route:", e.message);
      }
      res.status(500).send("Server error getting public info");
    }
  };

  makeOneTimePublic = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      const { file, token } = await fileService.makeOneTimePublic(userID, id);

      res.send({ file, token });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMake One Time Public Link Error File Route:", e.message);
      }

      res.status(500).send("Server error making public");
    }
  };

  getFileInfo = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const file = await fileService.getFileInfo(userID, fileID);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet File Info Error File Route:", e.message);
      }

      res.status(500).send("Server error getting file info");
    }
  };

  getQuickList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const limit = req.query.limit?.toString();

      const quickList = await fileService.getQuickList(user, limit);

      res.send(quickList);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Quick List Error File Route:", e.message);
      }

      res.status(500).send("Server error getting quick list");
    }
  };

  getList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;

      const fileList = await fileService.getList(user, query);

      res.send(fileList);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet File List Error File Route:", e.message);
      }

      res.status(500).send("Server error getting file list");
    }
  };

  getDownloadToken = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;

      const tempToken = await fileService.getDownloadToken(user);

      res.send({ tempToken });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Download Token Error File Route:", e.message);
      }

      res.status(500).send("Server error getting download token");
    }
  };

  getAccessTokenStreamVideo = async (
    req: RequestTypeFullUser,
    res: Response
  ) => {
    if (!req.user) return;

    try {
      const user = req.user;

      const currentUUID = req.headers.uuid as string;

      const streamVideoAccessToken = await user.generateAuthTokenStreamVideo(
        currentUUID
      );

      createStreamVideoCookie(res, streamVideoAccessToken);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(
          "\nGet Access Token Stream Video Fle Route Error:",
          e.message
        );
      }

      res.status(500).send("Server error getting video stream token");
    }
  };

  removeStreamVideoAccessToken = async (
    req: RequestTypeFullUser,
    res: Response
  ) => {
    if (!req.user) return;

    try {
      const userID = req.user._id;

      const accessTokenStreamVideo = req.accessTokenStreamVideo!;

      await User.updateOne(
        { _id: userID },
        { $pull: { tempTokens: { token: accessTokenStreamVideo } } }
      );

      removeStreamVideoCookie(res);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRemove Video Token File Router Error:", e.message);
      }

      res.status(500).send("Server error removing video stream token");
    }
  };

  removeTempToken = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const tempToken = req.params.tempToken;
      const currentUUID = req.params.uuid;

      await fileService.removeTempToken(user, tempToken, currentUUID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRemove Temp Token Error File Route:", e.message);
      }

      res.status(500).send("Server error removing temp token");
    }
  };

  streamVideo = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }
    let responseSent = false;

    try {
      const user = req.user;
      const fileID = req.params.id;
      const headers = req.headers;

      const { decipher, readStream, head } =
        await this.chunkService.streamVideo(user, fileID, headers);

      const cleanUp = () => {
        if (readStream) readStream.destroy();
        if (decipher) decipher.end();
      };

      const handleError = (e: Error) => {
        console.log("stream video read stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error streaming video");
        }
        cleanUp();
      };

      readStream.on("error", handleError);

      decipher.on("error", handleError);

      readStream.on("end", () => {
        if (!responseSent) {
          responseSent = true;
          res.end();
        }
        cleanUp();
      });

      readStream.on("close", () => {
        cleanUp();
      });

      decipher.on("end", () => {
        if (!responseSent) {
          responseSent = true;
          res.end();
        }
        cleanUp();
      });

      decipher.on("close", () => {
        cleanUp();
      });

      res.writeHead(206, head);

      readStream.pipe(decipher).pipe(res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nStream Video Error File Route:", e.message);
      }

      if (!responseSent) {
        responseSent = true;
        res.status(500).send("Server error streaming video");
      }
    }
  };

  downloadFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }
    let responseSent = false;
    try {
      const user = req.user;
      const fileID = req.params.id;

      const { readStream, decipher, file } =
        await this.chunkService.downloadFile(user, fileID, res);

      readStream.on("error", (e: Error) => {
        console.log("read stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error downloading file");
        }
      });

      decipher.on("error", (e: Error) => {
        console.log("decipher stream error", e);
        if (!responseSent) {
          responseSent = true;
          res.status(500).send("Server error downloading file");
        }
      });

      res.set("Content-Type", "binary/octet-stream");
      res.set(
        "Content-Disposition",
        'attachment; filename="' + file.filename + '"'
      );
      res.set("Content-Length", file.metadata.size.toString());

      readStream.pipe(decipher).pipe(res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nDownload File Error File Route:", e.message);
      }
      if (!responseSent) {
        responseSent = true;
        res.status(500).send("Server error downloading file");
      }
    }
  };

  getSuggestedList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      let searchQuery = req.query.search || "";
      const trashMode = req.query.trashMode === "true";
      const mediaMode = req.query.mediaMode === "true";

      const { fileList, folderList } = await fileService.getSuggestedList(
        userID,
        searchQuery,
        trashMode,
        mediaMode
      );

      return res.send({ folderList, fileList });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Suggested List Error File Route:", e.message);
      }

      res.status(500).send("Server error getting suggested list");
    }
  };

  renameFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const title = req.body.title;
      const userID = req.user._id;

      await fileService.renameFile(userID, fileID, title);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRename File Error File Route:", e.message);
      }

      res.status(500).send("Server error renaming file");
    }
  };

  sendEmailShare = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user!;

      const fileID = req.body.file._id;
      const respient = req.body.file.resp;

      const file = await fileService.getFileInfo(user._id, fileID);

      await sendShareEmail(file, respient);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nSend Share Email Error File Route:", e.message);
      }

      res.status(500).send("Server error sending email link");
    }
  };

  moveFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id as string;
      const userID = req.user._id as string;
      const parentID = (req.body.parentID as string) || "/";

      await fileService.moveFile(userID, fileID, parentID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMove File Error File Route:", e.message);
      }

      res.status(500).send("Server error moving file");
    }
  };

  trashFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      const trashedFile = await fileService.trashFile(userID, fileID);

      res.send(trashedFile.toObject());
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nTrash File Error File Route:", e.message);
      }

      res.status(500).send("Server error trashing file");
    }
  };

  restoreFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      const file = await fileService.restoreFile(userID, fileID);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRestore File Error File Route:", e.message);
      }

      res.status(500).send("Server error restoring file");
    }
  };

  deleteFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      await this.chunkService.deleteFile(userID, fileID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nDelete File Error File Route:", e.message);
      }

      res.status(500).send("Server error deleting file");
    }
  };

  deleteMulti = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;

      console.log("items", req.body);

      await this.chunkService.deleteMulti(userID, items);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("Delete Multi Error File Route:", e.message);
      }

      res.status(500).send("Server error deleting multi");
    }
  };

  trashMulti = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;

      await fileService.trashMulti(userID, items);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nTrash Multi Error File Route:", e.message);
      }

      res.status(500).send("Server error trashing multi");
    }
  };

  restoreMulti = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const items = req.body.items;

      await fileService.restoreMulti(userID, items);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRestore Multi Error File Route:", e.message);
      }

      res.status(500).send("Server error restoring multi");
    }
  };
}

export default FileController;
