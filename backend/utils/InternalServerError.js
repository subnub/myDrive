class InternalServerError extends Error {
    
    constructor(args) {
        super(args);

        this.code = 500;
    }
}

module.exports = InternalServerError;