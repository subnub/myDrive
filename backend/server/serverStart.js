const getKey = require("../key/getKey");

const serverStart = async() => {

    await getKey();

    if (process.env.NODE_ENV === 'production') {

        const {server, serverHttps} = require("./server");
    
        server.listen(process.env.HTTP_PORT,process.env.URL, () => {
            console.log("Http Server Running On Port:", process.env.HTTP_PORT);
        })
        
        serverHttps.listen(process.env.HTTPS_PORT, function () {
            console.log( 'Https Server Running On Port:', process.env.HTTPS_PORT);
        } );
        
    } else if (process.env.NODE_ENV === 'production-no-ssl') {

        const server = require("./server");
    
        server.listen(process.env.HTTP_PORT,process.env.URL, () => {
            console.log("Http Server (No-SSL) Running On Port:", process.env.HTTP_PORT);
        })

    } else {
    
        const server = require("./server");
    
        server.listen(process.env.HTTP_PORT,process.env.URL, () => {
            console.log("Development Server Running On Port:", process.env.HTTP_PORT);
        })
    }
}

serverStart();




