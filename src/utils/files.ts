export const getFileExtension = (filename: string, length = 4) => {
  const filenameSplit = filename.split(".");

  if (filenameSplit.length > 1) {
    let extension = filenameSplit[filenameSplit.length - 1];

    if (extension.length > length)
      extension =
        extension.substring(0, length - 1) +
        extension.substring(extension.length - 1, extension.length);

    return extension.toUpperCase();
  } else {
    return "UNK";
  }
};

type ColorMap = {
  [key: string]: string;
};

export const getFileColor = (filename: string) => {
  const letter = getFileExtension(filename).substring(0, 1).toUpperCase();

  const colorMap: ColorMap = {
    A: "#e53935",
    B: "#d81b60",
    C: "#8e24aa",
    D: "#5e35b1",
    E: "#3949ab",
    F: "#1e88e5",
    G: "#039be5",
    H: "#00acc1",
    I: "#00897b",
    J: "#43a047",
    K: "#fdd835",
    L: "#ffb300",
    M: "#fb8c00",
    N: "#f4511e",
    O: "#d32f2f",
    P: "#c2185b",
    Q: "#7b1fa2",
    R: "#512da8",
    S: "#303f9f",
    T: "#1976d2",
    U: "#0288d1",
    V: "#0097a7",
    W: "#0097a7",
    X: "#00796b",
    Y: "#388e3c",
    Z: "#fbc02d",
  };

  if (colorMap[letter]) {
    return colorMap[letter];
  } else {
    return "#03a9f4";
  }
};
