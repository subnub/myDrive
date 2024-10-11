import Thumbnail from "../../models/thumbnail-model";
import { ObjectId } from "mongodb";

class ThumbnailDB {
  constructor() {}

  // READ

  getThumbnailInfo = async (userID: string, thumbnailID: string) => {
    const thumbnail = await Thumbnail.findOne({
      _id: new ObjectId(thumbnailID),
      owner: userID,
    });
    return thumbnail;
  };

  // DELETE

  removeThumbnail = async (userID: string, thumbnailID: ObjectId) => {
    const result = await Thumbnail.deleteOne({
      _id: thumbnailID,
      owner: userID,
    });
    return result;
  };
}

export default ThumbnailDB;
