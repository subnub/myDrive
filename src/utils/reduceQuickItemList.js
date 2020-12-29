const { default: mobilecheck } = require("./mobileCheck");

const reduceQuickItemList = (quickItemList) => {
    
    const isMobile = mobilecheck()

    if (quickItemList.length > 10 && !isMobile) {
        quickItemList = quickItemList.slice(0, 10);
    } else if (quickItemList.length > 2 && isMobile) {
        quickItemList = quickItemList.slice(0, 2);
    }

    return quickItemList;
}

export default reduceQuickItemList;