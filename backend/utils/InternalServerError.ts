class InternalServerError extends Error {

    code: number;
    
    constructor(args: any) {
        super(args);

        this.code = 500;
    }
}

export default InternalServerError;