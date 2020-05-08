import getEnvVariables from "../enviroment/getEnvVariables";
getEnvVariables();
import getKey from "../key/getKey";
import servers from "./server";

const {server, serverHttps} = servers;

const serverStart = async() => {

    await getKey();

    console.log("ENV", process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'production' && process.env.SSL === "true") {
    
        server.listen(process.env.HTTP_PORT,process.env.URL, () => {
            console.log("Http Server Running On Port:", process.env.HTTP_PORT);
        })
        
        serverHttps.listen(process.env.HTTPS_PORT, function () {
            console.log( 'Https Server Running On Port:', process.env.HTTPS_PORT);
        } );
        
    } else if (process.env.NODE_ENV === 'production') {

        const port = process.env.HTTP_PORT || process.env.PORT;
    
        server.listen(port, process.env.URL, () => {
            console.log("Http Server (No-SSL) Running On Port:", port);
        })

    } else {
    
        const port = process.env.HTTP_PORT || process.env.PORT;

        server.listen(port, process.env.URL, () => {
            console.log("Development Server Running On Port:", port);
        })
    }
}

serverStart();
