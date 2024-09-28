class NotValidDataError extends Error {
  code: number;
  isCustomError: boolean;

  constructor(args: any) {
    super(args);

    this.code = 403;
    this.isCustomError = true;
  }
}

export default NotValidDataError;
