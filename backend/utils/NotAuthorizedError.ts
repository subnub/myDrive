class NotAuthorizedError extends Error {

    code: number;
    
    constructor(args: any) {
        super(args);

        this.code = 401;
    }
}

export default NotAuthorizedError;