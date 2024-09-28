class NotAuthorizedError extends Error {
  code: number;
  isCustomError: boolean;

  constructor(args: any) {
    super(args);

    this.code = 401;
    this.isCustomError = true;
  }
}

export default NotAuthorizedError;
