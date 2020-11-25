const sortGoogleMongoQuickFiles = (convertedFiles: any[], quickList: any[]) => {

    let combinedData = [...convertedFiles, ...quickList]
    
    combinedData = combinedData.sort((a, b) => {
        const convertedDateA = new Date(a.uploadDate).getTime();
        const convertedDateB = new Date(b.uploadDate).getTime();
        
        return convertedDateB - convertedDateA;
    })

    if (combinedData.length >= 10) {
        combinedData = combinedData.slice(0, 10);
    }

    return combinedData;
}

export default sortGoogleMongoQuickFiles;