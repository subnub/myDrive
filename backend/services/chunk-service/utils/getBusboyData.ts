import { Stream } from "stream";

type dataType = {
  file: Stream;
  filename: {
    filename: string;
  };
  formData: Map<any, any>;
};

const getBusboyData = (busboy: any) => {
  return new Promise<dataType>((resolve, reject) => {
    const formData = new Map();

    busboy.on("field", (field: any, val: any) => {
      if (typeof val !== "string" || val !== "undefined") {
        formData.set(field, val);
      }
    });

    busboy.on(
      "file",
      (
        _: string,
        file: Stream,
        filename: {
          filename: string;
        }
      ) => {
        resolve({
          file,
          filename,
          formData,
        });
      }
    );
  });
};

export default getBusboyData;
