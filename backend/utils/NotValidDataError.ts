class NotValidDataError extends Error {

    code: number;
    
    constructor(args: any) {
        super(args);

        this.code = 403;
    }
}

export default NotValidDataError;