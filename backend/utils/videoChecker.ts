interface IQueryObjectKeys {
  [key: string]: boolean;
}

const videoExtList = {
  '3g2': true,
  '3gp': true,
  'aaf': true,
  'asf': true,
  'avchd': true,
  'avi': true,
  'drc': true,
  'flv': true,
  'm2v': true,
  'm4p': true,
  'm4v': true,
  'mkv': true,
  'mng': true,
  'mov': true,
  'mp2': true,
  'mp4': true,
  'mpe': true,
  'mpeg': true,
  'mpg': true,
  'mpv': true,
  'mxf': true,
  'nsv': true,
  'ogg': true,
  'ogv': true,
  'qt': true,
  'rm': true,
  'rmvb': true,
  'roq': true,
  'svi': true,
  'vob': true,
  'webm': true,
  'wmv': true,
  'yuv': true,
} as IQueryObjectKeys;

const videoChecker = (filename: string) => {
  if (filename.length < 1 || !filename.includes('.')) {
    return false;
  }

  const extSplit = filename.split('.');

  if (extSplit.length <= 1) {
    return false;
  }

  const ext = extSplit[extSplit.length - 1].toLowerCase();

  return videoExtList[ext];
};

export default videoChecker;
