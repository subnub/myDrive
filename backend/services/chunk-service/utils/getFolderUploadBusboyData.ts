import { Stream } from "stream";

const getFolderBusboyData = (busboy: any) => {
  type dataType = Record<string, any>;

  return new Promise<dataType>((resolve, reject) => {
    const formData = new Map();

    let filesProcessed = 0;
    let filesToProcess = 0;

    const fileDataMap: dataType = {};

    busboy.on("field", (field: any, val: any) => {
      if (typeof val !== "string" || val !== "undefined") {
        formData.set(field, val);
        if (field === "file-data") {
          const fileData = JSON.parse(val);
          console.log("file data", fileData);
          fileDataMap[fileData.path] = {
            ...fileData,
          };
        }
        if (field === "total-files") {
          filesToProcess = +val;
          console.log("total files", filesToProcess);
        }
      }
    });

    busboy.on(
      "file",
      async (
        data: string,
        file: Stream,
        fileData: {
          filename: string;
        }
      ) => {
        const path = fileData.filename;
        fileDataMap[path] = {
          ...fileDataMap[path],
          file,
        };

        filesProcessed++;

        if (filesProcessed === filesToProcess) {
          resolve(fileDataMap);
        }
        // resolve({
        //   file,
        //   filename,
        //   formData,
        // });
        console.log("flr", fileData);
      }
    );
  });
};

export default getFolderBusboyData;
