const createError = (message, code, exception) => {

    let error = new Error(message);
    error.message = message
    error.code = code
    error.exception = exception

    throw error;

}

module.exports = createError;