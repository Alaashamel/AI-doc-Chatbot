// Elements
const uploadBtn = document.getElementById("uploadBtn");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");

const fileInput = document.getElementById("fileInput");
const questionInput = document.getElementById("questionInput");

const chatBox = document.getElementById("chatBox");
const uploadStatus = document.getElementById("uploadStatus");
const loading = document.getElementById("loading");

// Upload Document

uploadBtn.addEventListener("click", uploadDocument);

async function uploadDocument() {

    const file = fileInput.files[0];

    if (!file) {

        alert("Please choose a document.");

        return;
    }

    const formData = new FormData();

    formData.append("document", file);

    showLoading();

    try {

        const response = await fetch("/upload", {

            method: "POST",

            body: formData

        });

        const data = await response.json();

        hideLoading();

        if (data.success) {

            uploadStatus.innerHTML =
                `✅ ${data.fileName} uploaded successfully (${data.chunks} chunks)`;

        } else {

            uploadStatus.innerHTML = `❌ ${data.message}`;

        }

    } catch (error) {

        hideLoading();

        uploadStatus.innerHTML = "❌ Upload Failed.";

        console.error(error);

    }

}
// Send Question

sendBtn.addEventListener("click", sendQuestion);

questionInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        sendQuestion();

    }

});

async function sendQuestion() {

    const question = questionInput.value.trim();

    if (question === "") {

        alert("Please enter your question.");

        return;

    }

    addUserMessage(question);

    questionInput.value = "";

    showLoading();

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                question

            })

        });

        const data = await response.json();

        hideLoading();

        if (data.success) {

            addAIMessage(

                data.answer,

                data.sources

            );

        }

        else {

            addAIMessage(data.message);

        }

    }

    catch (error) {

        hideLoading();

        addAIMessage("Server Error.");

        console.log(error);

    }

}
// User Message

function addUserMessage(message) {

    const div = document.createElement("div");

    div.className = "message user-message";

    div.innerHTML = message;

    chatBox.appendChild(div);

    scrollChat();

}


// AI Message
function addAIMessage(message, sources = []) {

    const div = document.createElement("div");

    div.className = "message ai-message";

    let html = `<div>${message}</div>`;

    if (sources.length > 0) {

        html += `

        <div class="source">

        Source:

        ${sources.join(", ")}

        </div>

        `;

    }

    div.innerHTML = html;

    chatBox.appendChild(div);

    scrollChat();

}
// Loading

function showLoading() {

    loading.classList.remove("d-none");

}

function hideLoading() {

    loading.classList.add("d-none");

}
// Scroll Chat

function scrollChat() {

    chatBox.scrollTop = chatBox.scrollHeight;

}
// Clear Chat

clearBtn.addEventListener("click", () => {

    chatBox.innerHTML = "";

});
// Dark Mode

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeBtn.innerHTML = "☀️ Light Mode";

    }

    else {

        themeBtn.innerHTML = "🌙 Dark Mode";

    }

});