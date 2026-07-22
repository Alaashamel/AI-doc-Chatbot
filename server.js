require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoute = require("./routes/upload");
const chatRoute = require("./routes/chat");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logger

app.use((req, res, next) => {

    console.log(`${req.method} ${req.url}`);

    next();

});

// Home

app.get("/", (req, res) => {

    res.send("AI RAG Chatbot Running...");

});

// Status

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        message: "Server is running"

    });

});

// Upload

app.use("/upload", uploadRoute);
app.use("/chat", chatRoute);

// Start Server
app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});