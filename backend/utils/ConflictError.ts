class ConflictError extends Error {
  code: number;

  constructor(args: any) {
    super(args);

    this.code = 409;
  }
}

export default ConflictError;
