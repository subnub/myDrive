const videoExtList = [
	"3g2",
	"3gp",
	"aaf",
	"asf",
	"avchd",
	"avi",
	"drc",
	"flv",
	"m2v",
	"m4p",
	"m4v",
	"mkv",
	"mng",
	"mov",
	"mp2",
	"mp4",
	"mpe",
	"mpeg",
	"mpg",
	"mpv",
	"mxf",
	"nsv",
	"ogg",
	"ogv",
	"qt",
	"rm",
	"rmvb",
	"roq",
	"svi",
	"vob",
	"webm",
	"wmv",
	"yuv"
]

const videoChecker =  (filename: string) => {

    if (filename.length < 1 || !filename.includes(".")) {

        return false; 
    }

    const extSplit = filename.split(".");

    if (extSplit.length <= 1) {
        
        return false; 
    }

    const ext = extSplit[extSplit.length - 1];

    return videoExtList.includes(ext.toLowerCase());

}

export default videoChecker;