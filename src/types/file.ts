export interface FileInterface {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
  metadata: {
    owner: string;
    parent: string;
    parentList: string;
    hasThumbnail: boolean;
    isVideo: boolean;
    thumbnailID?: string;
    size: number;
    IV: Buffer;
    linkType?: "one" | "public";
    link?: string;
    filePath?: string;
    s3ID?: string;
    personalFile?: boolean;
    trashed?: boolean;
  };
}
interface example {
  selectedRightSectionItem: {
    folder?: {
      id: string;
      name: string;
    };
    file?: {
      id: string;
      filename: string;
    };
  };
  popupFile: {
    id: string;
    filename: string;
  };
  selectedItem: {
    type: string;
    id: string;
  };
}
