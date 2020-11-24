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
const jwtInput = document.getElementById("jwt-input");
const SSLSelect = document.getElementById("ssl-select");
const sendGridInput = document.getElementById("sendgrid-input");
const sendGridInputEmail = document.getElementById("sendgrid-input-email");
const commericalSelection = document.getElementById('commercial-select');
const stripeWrapper = document.getElementById('stripe-wrapper');
// const stripeEmailWrapper = document.getElementById('stripe-wrapper-email');
const stripeInput = document.getElementById('stripe-input');
//const stripeInputEmail = document.getElementById('stripe-input-email');

dockerSelection.addEventListener("change", (e) => {

    const docker = dockerSelection.value === "yes";

    if (docker) {
        dockerHidden.className = "section-wrapper"
        mainMongoURLWrapper.className = "docker-hidden"
    } else {
        dockerHidden.className = "docker-hidden"
        mainMongoURLWrapper.className = "section-wrapper"
        dockerHiddenMongoURL.className = "docker-hidden"
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

commericalSelection.addEventListener('change', (e) => {

    const commericalMode = commericalSelection.value === 'yes';

    if (commericalMode) {
        stripeWrapper.className = 'section-wrapper';
    } else {
        stripeWrapper.className = 'docker-hidden'
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

saveButton.addEventListener("click", () => {

    let clientObj = {}
    let serverObj = {}

    // Client
    clientObj.REMOTE_URL = clientInput.value;
    if (dbSelect.value !== "fs") clientObj.DISABLE_STORAGE = true;
    if (commericalSelection.value === "yes") clientObj.COMMERCIAL_MODE = true;

    // Server
    serverObj.HTTP_PORT = 3000;
    serverObj.HTTPS_PORT = 8080;
    serverObj.NODE_ENV = "production";
    serverObj.MONGODB_URL = dockerSelection.value !== "yes" ? mongoURLInput.value : 
    dockerSelectionMongoURL.value !== "yes" ? mongoURLInputDocker.value : "mongodb://mongo:27017/mydrive"
    if (encryptionSelect.value !== "yes") serverObj.KEY = encryptionInput.value;
    if (dockerSelection.value === "yes") serverObj.DOCKER = true;
    if (SSLSelect.value === "yes") serverObj.SSL = true;
    if (commericalSelection.value === "yes") serverObj.STRIPE_KEY = stripeInput.value;
    serverObj.DB_TYPE = dbSelect.value;
    serverObj.PASSWORD = jwtInput.value;
    serverObj.SENDGRID_KEY = sendGridInput.value;
    serverObj.SENDGRID_EMAIL = sendGridInputEmail.value
    serverObj.REMOTE_URL = clientInput.value;

    if (dbSelect.value === "s3") {
        
        serverObj.S3_ID = s3IDInput.value;
        serverObj.S3_KEY = s3KeyInput.value;
        serverObj.S3_BUCKET = s3BucketInput.value;
        clientObj.DISABLE_STORAGE = true;

    } else if (dbSelect.value === "fs") {
        
        serverObj.FS_DIRECTORY = fsInput.value;
        serverObj.ROOT = fsInput.value;
    }  else {
        clientObj.DISABLE_STORAGE = true;
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
