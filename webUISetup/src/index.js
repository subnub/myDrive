import Swal from "sweetalert2";
import axios from "axios";

const dockerSelection = document.getElementById("docker-select");
const dockerHidden = document.getElementById("docker-hidden")
const dockerSelectionMongoURL = document.getElementById("docker-select-mongoURL")
const dockerHiddenMongoURL = document.getElementById("docker-hidden-mongoURL")
const mainMongoURLWrapper = document.getElementById("mongoURL-wrapper")
const encryptionSelect = document.getElementById("encryption-select");
const encryptionInput = document.getElementById("encryption-input")
const dbSelect = document.getElementById("db-select")
const fsWrapper = document.getElementById("filesystem-wrapper");
const s3Wrapper = document.getElementById("s3-wrapper");
const saveButton = document.getElementById("save-button")
const clientInput = document.getElementById("client-input")
const mongoURLInput = document.getElementById("mongoURL-input");
const mongoURLInputDocker = document.getElementById("mongoURL-input-docker");
const s3IDInput = document.getElementById("s3-id-input");
const s3KeyInput = document.getElementById("s3-key-input");
const s3BucketInput = document.getElementById("s3-bucket-input");
const fsInput = document.getElementById("fs-input");
const SSLSelect = document.getElementById("ssl-select");
const sendGridInput = document.getElementById("sendgrid-input");
const sendGridInputEmail = document.getElementById("sendgrid-input-email");
// const stripeEmailWrapper = document.getElementById('stripe-wrapper-email');
const sendGridSelect = document.getElementById("sendgrid-select")
const sendGridWrapper = document.getElementById("sendgrid-wrapper");
const sendGridWrapper2 = document.getElementById("sendgrid-wrapper2");
const clientInvalidInputText = document.getElementById("client-input-invalid-text");
const clientInvalidInputText2 = document.getElementById("client-input-invalid-text2");

const accessTokenInput = document.getElementById("access-token-input");
const refreshTokenInput = document.getElementById("refresh-token-input")
const cookieInput = document.getElementById("cookie-input");
const secureCookieSelect = document.getElementById("secure-cookie-select");
const mongoDefaultButton = document.getElementById("mongo-default-button");
const portsSelect = document.getElementById("port-select");
const httpPortInput = document.getElementById("http-port-input");
const httpsPortInput = document.getElementById("https-port-input");
const portsWrappers = document.getElementById("ports-wrapper");
const customPortsWrapper = document.getElementById("section-wrapper-ports");
//const stripeInputEmail = document.getElementById('stripe-input-email');

dockerSelection.addEventListener("change", (e) => {

    const docker = dockerSelection.value === "yes";

    if (docker) {
        dockerHidden.className = "section-wrapper"
        mainMongoURLWrapper.className = "docker-hidden";
        customPortsWrapper.className = "docker-hidden"
        portsWrappers.className = "docker-hidden";
    } else {
        dockerHidden.className = "docker-hidden"
        mainMongoURLWrapper.className = "section-wrapper"
        dockerHiddenMongoURL.className = "docker-hidden"
        customPortsWrapper.className = "section-wrapper";
    }
})

dockerSelectionMongoURL.addEventListener("change", () => {

    const includeMongoDB = dockerSelectionMongoURL.value === "yes";

    if (!includeMongoDB) {
        dockerHiddenMongoURL.className = "section-wrapper"
    } else {
        dockerHiddenMongoURL.className = "docker-hidden"
    }
})

encryptionSelect.addEventListener("change", () => {

    const useWebUIForEncryption = encryptionSelect.value === "yes";

    if (!useWebUIForEncryption) {
        encryptionInput.disabled = false;
        encryptionInput.className = "mongo-input"
    } else {
        encryptionInput.disabled = true;
        encryptionInput.className = "encryption-key-input"
    }
   
})

dbSelect.addEventListener("change", () => {

    console.log("db select on change")

    const storageType = dbSelect.value;

    if (storageType === "s3") {

        s3Wrapper.className = "section-wrapper"
        fsWrapper.className = "docker-hidden";

    } else if (storageType === "fs") {

        s3Wrapper.className = "docker-hidden";
        fsWrapper.className = "section-wrapper";

    } else {

        s3Wrapper.className = "docker-hidden";
        fsWrapper.className = "docker-hidden";
    }
})

sendGridSelect.addEventListener("change", () => {

    //section-wrapper

    const sendGridEnabled = sendGridSelect.value === "yes";

    if (sendGridEnabled) {

        sendGridWrapper.className = 'section-wrapper'
        sendGridWrapper2.className = 'section-wrapper'

    } else {

        sendGridWrapper.classList = "docker-hidden";
        sendGridWrapper2.classList = "docker-hidden";
    }
})

clientInput.addEventListener("input", () => {

    const value = clientInput.value;
    
    if (value && value.length !== 0) {

        const lastCharacter = value[value.length - 1];

        if (lastCharacter === "/") {
            
            clientInput.className = "mongo-input input-invalid"
            clientInvalidInputText.className = "invalid-input-text"

        } else {

            clientInput.className = "mongo-input";
            clientInvalidInputText.className = "invalid-input-text-hidden"
        }

    } else {
        clientInput.className = "mongo-input"
        clientInvalidInputText.className = "invalid-input-text-hidden"
    }
    
    if (value && value.length >= 8 || value && value.length >= 7) {

        const firstChactersHttp = value.substring(0, 7);
        const firstChactersHttps = value.substring(0, 8);

        if (firstChactersHttps !== "https://" && firstChactersHttp !== "http://") {
            clientInput.className = "mongo-input input-invalid"
            clientInvalidInputText2.className = "invalid-input-text"
        } else {
            clientInvalidInputText2.className = "invalid-input-text-hidden"
        }
    }
})

mongoDefaultButton.addEventListener("click", () => {

    mongoURLInput.value = "mongodb://localhost:27017/mydrive-db"
})

portsSelect.addEventListener("change", () => {

    const value = portsSelect.value === "no";

    if (value) {
        portsWrappers.className = "section-wrapper"
    } else {
        portsWrappers.className = "docker-hidden";
    }
})

saveButton.addEventListener("click", () => {

    let clientObj = {}
    let serverObj = {}

    // Client
    clientObj.REMOTE_URL = clientInput.value;
    clientObj.DISABLE_STORAGE = true;
    //if (dbSelect.value !== "fs") clientObj.DISABLE_STORAGE = true;

    // Server

    portsSelect.value === "no" ? serverObj.HTTP_PORT = httpPortInput.value : serverObj.HTTP_PORT = 3000;
    portsSelect.value === "no" ? serverObj.HTTPS_PORT = httpsPortInput.value : serverObj.HTTPS_PORT = 8080;
    if (dockerSelection.value === "yes") serverObj.HTTP_PORT = 3000;
    if (dockerSelection.value === "yes") serverObj.HTTPS_PORT = 8080;
    serverObj.NODE_ENV = "production";
    serverObj.MONGODB_URL = dockerSelection.value !== "yes" ? mongoURLInput.value : 
    dockerSelectionMongoURL.value !== "yes" ? mongoURLInputDocker.value : "mongodb://mongo:27017/mydrive"
    if (encryptionSelect.value !== "yes") serverObj.KEY = encryptionInput.value;
    if (dockerSelection.value === "yes") serverObj.DOCKER = true;
    if (SSLSelect.value === "yes") serverObj.SSL = true;
    if (secureCookieSelect.value === "yes") serverObj.SECURE_COOKIES = true;
    if (sendGridSelect.value === "no") serverObj.DISABLE_EMAIL_VERIFICATION = true;
    if (sendGridSelect.value === "yes") serverObj.SENDGRID_KEY = sendGridInput.value;
    if (sendGridSelect.value === "yes") serverObj.SENDGRID_EMAIL = sendGridInputEmail.value
    serverObj.DB_TYPE = dbSelect.value;    
    serverObj.REMOTE_URL = clientInput.value;
    serverObj.PASSWORD_ACCESS = accessTokenInput.value;
    serverObj.PASSWORD_REFRESH = refreshTokenInput.value;
    serverObj.PASSWORD_COOKIE = cookieInput.value;

    if (dbSelect.value === "s3") {
        
        serverObj.S3_ID = s3IDInput.value;
        serverObj.S3_KEY = s3KeyInput.value;
        serverObj.S3_BUCKET = s3BucketInput.value;

    } else if (dbSelect.value === "fs") {
        
        serverObj.FS_DIRECTORY = fsInput.value;
        serverObj.ROOT = fsInput.value;
    } 

    const data = {
        clientObj,
        serverObj
    }

    axios.post("/submit", data).then((result) => {
        console.log("Submitted");

        Swal.fire(
            'Environment Variables Created',
            'The Environment Variables were successfully created.',
            'success'
          )

    }).catch((err) => {
        console.log("Axios Err", err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error Creating Enviroment Variables, please check the logs.',
          })
    })
})
