class NotEmailVerifiedError extends Error {
  code: number;
  isCustomError: boolean;

  constructor(args: any) {
    super(args);

    this.code = 404;
    this.isCustomError = true;
  }
}

export default NotEmailVerifiedError;
