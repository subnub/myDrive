class InternalServerError extends Error {
  code: number;
  isCustomError: boolean;

  constructor(args: any) {
    super(args);

    this.code = 500;
    this.isCustomError = true;
  }
}

export default InternalServerError;
