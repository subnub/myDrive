import { Stream } from "stream";

const getBusboyData = (busboy: any) => {
  type dataType = {
    file: Stream;
    filename: {
      filename: string;
    };
    formData: Map<any, any>;
  };

  return new Promise<dataType>((resolve, reject) => {
    const formData = new Map();

    busboy.on("field", (field: any, val: any) => {
      console.log("field", field, val, typeof val);
      // ????? why does it make undefined a string?
      if (typeof val !== "string" || val !== "undefined") {
        formData.set(field, val);
      }
    });

    busboy.on(
      "file",
      async (
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
