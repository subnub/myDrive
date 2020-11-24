import s3Auth from "../../../db/S3Personal";

const calculateS3Size = async(id:string, key:string, bucket:string) => {

    const s3Storage = s3Auth(id, key);

    const params = {
        Bucket: bucket
    }

    const objectList = await s3Storage.listObjects(params).promise();

    if (!objectList.Contents) return 0;

    let size = 0

    for (let i = 0; i < objectList.Contents!.length; i++) {
        const currentObject = objectList.Contents[i];
        if (!currentObject.Size) continue;

        size += +currentObject.Size!;
    }

    return size;
}

export default calculateS3Size;