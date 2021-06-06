import { Stream } from 'stream';

const getBusboyData = (busboy: any) => {
  type dataType = {
    file: Stream;
    filename: string;
    formData: Map<any, any>;
  };

  return new Promise<dataType>((resolve, reject) => {
    const formData = new Map();

    busboy.on('field', (field: any, val: any) => {
      //console.log("current field", field, val)

      formData.set(field, val);
    });

    busboy.on('file', (_: string, file: Stream, filename: string) => {
      //console.log("current file", file, filename);

      resolve({
        file,
        filename,
        formData,
      });
    });
  });
};

export default getBusboyData;
