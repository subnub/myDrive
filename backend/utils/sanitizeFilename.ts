const sanitizeFilename = (filename: string) => {
  filename = filename.replace(/[\u0000-\u001F\u007F\u202F]/g, " ");
  filename = filename.replace(/["<>:|?*\\;]/g, "_");
  filename = filename.trim();

  return filename;
};

export default sanitizeFilename;
