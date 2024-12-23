import s3 from "../../../db/connections/s3";
import env from "../../../enviroment/env";
import { UserInterface } from "../../../models/user-model";

const getPrevIV = (
  start: number,
  key: string,
  isPersonal: boolean,
  user: UserInterface
) => {
  return new Promise<Buffer | string>(async (resolve, reject) => {
    const params: any = {
      Bucket: env.s3Bucket,
      Key: key,
      Range: `bytes=${start}-${start + 15}`,
    };

    const stream = s3.getObject(params).createReadStream();

    stream.on("data", (data: any) => {
      resolve(data);
    });
  });
};

export default getPrevIV;
