"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const getKey = require("../key/getKey");
const serverStart = () => __awaiter(void 0, void 0, void 0, function* () {
    yield getKey();
    if (process.env.NODE_ENV === 'production') {
        const { server, serverHttps } = require("./server");
        server.listen(process.env.HTTP_PORT, process.env.URL, () => {
            console.log("Http Server Running On Port:", process.env.HTTP_PORT);
        });
        serverHttps.listen(process.env.HTTPS_PORT, function () {
            console.log('Https Server Running On Port:', process.env.HTTPS_PORT);
        });
    }
    else if (process.env.NODE_ENV === 'production-no-ssl') {
        const server = require("./server");
        server.listen(process.env.HTTP_PORT, process.env.URL, () => {
            console.log("Http Server (No-SSL) Running On Port:", process.env.HTTP_PORT);
        });
    }
    else {
        const server = require("./server");
        server.listen(process.env.HTTP_PORT, process.env.URL, () => {
            console.log("Development Server Running On Port:", process.env.HTTP_PORT);
        });
    }
});
serverStart();
