import axios from "axios";

const formElement = document.getElementById("form-submit")
const inputElement = document.getElementById("input-password");
const mainDiv = document.getElementById("main-div")

formElement.addEventListener("submit", async (e) => {

    e.preventDefault();

    const port = process.env.PORT || "3000";
    const fullURL = `http://localhost:${port}`;

    const value = inputElement.value;

    const data = {password: value}

    axios.post("/submit", data).then(() => {

        inputElement.value = "";
        mainDiv.style.display = "none";

    }).catch((err) => {
        console.log("Error", err);
    });
})