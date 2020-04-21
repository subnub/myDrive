class NotFoundError extends Error {

    code: number;
    
    constructor(args: any) {
        super(args);

        this.code = 404;
    }
}

export default NotFoundError;