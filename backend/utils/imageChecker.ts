const imageExtList = [
	"jpeg",
	"jpg",
	"png",
	"gif",
	"svg",
	"tiff",
	"bmp"
]

const imageChecker =  (filename: string) => {

    if (filename.length < 1 || !filename.includes(".")) {

        return false; 
    }

    const extSplit = filename.split(".");

    if (extSplit.length <= 1) {
        
        return false; 
    }

    const ext = extSplit[extSplit.length - 1];

    return imageExtList.includes(ext.toLowerCase());

}

export default imageChecker;