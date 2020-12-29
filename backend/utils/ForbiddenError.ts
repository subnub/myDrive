class ForbiddenError extends Error {

    code: number;
    
    constructor(args: any) {
        super(args);

        this.code = 403;
    }
}

export default ForbiddenError;