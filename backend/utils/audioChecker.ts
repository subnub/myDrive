interface IQueryObjectKeys {
  [key: string]: boolean;
}

interface supportedFormatsType extends IQueryObjectKeys {
  mp3: boolean;
  wav: boolean;
  ogg: boolean;
}

const supportedFormats: supportedFormatsType = {
  mp3: true,
  wav: true,
  ogg: true,
};

const audioChecker = (filename: string) => {
  if (filename.length < 1 || !filename.includes('.')) {
    return false;
  }

  const extSplit = filename.split('.');

  if (extSplit.length <= 1) {
    return false;
  }

  const ext = extSplit[extSplit.length - 1].toLowerCase();

  return supportedFormats[ext];
};

export default audioChecker;
