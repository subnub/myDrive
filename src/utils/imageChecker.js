const videoExtList = [
	"jpeg",
	"jpg",
	"png",
	"gif",
	"svg",
	"tiff",
	"bmp"
]

const videoChecker =  (filename) => {

    if (filename.length < 1 || !filename.includes(".")) {

        return false; 
    }

    const extSplit = filename.split(".");

    if (extSplit < 1) {
        
        return false; 
    }

    const ext = extSplit[extSplit.length - 1];

    return videoExtList.includes(ext.toLowerCase());

}

module.exports = videoChecker;