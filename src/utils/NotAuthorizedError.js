class NotAuthorizedError extends Error {
    
    constructor(args) {
        super(args);

        this.code = 401;
    }
}

module.exports = NotAuthorizedError;