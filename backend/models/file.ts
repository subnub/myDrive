export interface FileInterface {
    _id: string,
    length: number,
    chunkSize: number,
    updateDate: string,
    filename: string,
    metadata: {
        owner: string,
        parent: string,
        parentList: string,
        hasThumbnail: boolean,
        isVideo: boolean,
        thumbnailID?: string,
        size: number,
        IV: any,
        linkType?: 'one' | 'public',
        link?: string
    }
}