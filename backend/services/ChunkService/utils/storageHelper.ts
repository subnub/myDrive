import env from "../../../enviroment/env";

type GenericParmasType = {
  filePath?: string;
  Key?: string;
  Bucket?: string;
};

export const createGenericParams = ({ filePath, Key }: GenericParmasType) => {
  // TODO: Remove file split after migration
  if (env.dbType === "fs") {
    const filePathSplit = filePath!.split("/");
    const fileName = filePathSplit[filePathSplit.length - 1];
    return {
      filePath: env.fsDirectory + fileName,
    };
  } else {
    return {
      Key,
    };
  }
};
