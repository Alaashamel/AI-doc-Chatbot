<div align="center">

# 🤖 AI Document Chatbot

### Intelligent Document Question Answering using Retrieval-Augmented Generation (RAG)

Upload your documents, ask questions in natural language, and receive context-aware AI-powered answers.

<p>

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-black?logo=express)
![OpenAI](https://img.shields.io/badge/OpenAI-AI-412991?logo=openai&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![MIT License](https://img.shields.io/badge/License-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen)

</p>

---

**AI-powered chatbot capable of understanding PDFs, DOCX, and CSV files using Retrieval-Augmented Generation (RAG).**

</div>

---

# ✨ Features

- 📄 Upload PDF documents
- 📝 Upload DOCX files
- 📊 Upload CSV files
- 🤖 AI-powered conversational interface
- 🔍 Semantic document retrieval
- 🧠 Retrieval-Augmented Generation (RAG)
- 📚 Context-aware answers
- ⚡ Fast document parsing
- 📝 Markdown formatted responses
- 🎯 Source relevance ranking
- 📂 Multiple document support
- 💬 ChatGPT-like experience

---

# 📸 Screenshots

> Add screenshots here after deployment.

Example:

```
screenshots/
│
├── home.png
├── upload.png
├── chat.png
└── result.png
```

---

# 🏗️ Architecture

```text
              User
                │
                ▼
        Upload Documents
                │
                ▼
      PDF / DOCX / CSV Parser
                │
                ▼
      Text Chunking & Processing
                │
                ▼
     Retrieval (Relevant Chunks)
                │
                ▼
          OpenAI API
                │
                ▼
        AI Generated Answer
                │
                ▼
             Response
```

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js
- OpenAI API
- Multer
- pdf-parse

## AI

- Retrieval-Augmented Generation (RAG)
- Prompt Engineering
- Context Injection

## Supported Formats

- PDF
- DOCX
- CSV

---

# 📂 Project Structure

```
AI-doc-Chatbot/
│
├── public/
├── routes/
├── services/
├── uploads/
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Alaashamel/AI-doc-Chatbot.git
```

```bash
cd AI-doc-Chatbot
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

---

## Start Development Server

```bash
npm start
```

or

```bash
node server.js
```

---

# 💬 How It Works

```text
Upload File
      │
      ▼
Extract Text
      │
      ▼
Split Into Chunks
      │
      ▼
Retrieve Relevant Context
      │
      ▼
Generate AI Answer
      │
      ▼
Return Response
```

---

# 📄 Supported File Types

| File Type | Supported |
|-----------|-----------|
| PDF | ✅ |
| DOCX | ✅ |
| CSV | ✅ |
| TXT | 🚧 Planned |

---

# 📈 Roadmap

- [x] PDF Support
- [x] DOCX Support
- [x] CSV Support
- [x] RAG Pipeline
- [x] Source Ranking
- [ ] Authentication
- [ ] Chat History
- [ ] Vector Database
- [ ] Streaming Responses
- [ ] Multiple Conversations
- [ ] OCR Support
- [ ] Image Understanding
- [ ] Docker Support
- [ ] Cloud Deployment
- [ ] Admin Dashboard

---

# ⚙️ API Flow

```text
POST /upload
        │
        ▼
Document Processing
        │
        ▼
Vector Search
        │
        ▼
POST /chat
        │
        ▼
OpenAI Response
```

---

# 🌟 Future Improvements

- Pinecone Integration
- ChromaDB Integration
- FAISS Support
- User Authentication
- Chat Sessions
- Multi-user Support
- Redis Cache
- Docker
- Kubernetes Deployment
- Streaming Tokens
- Better UI
- Dark Mode

---

# 🤝 Contributing

Contributions are welcome!

1.

```bash
Fork the repository
```

2.

```bash
git checkout -b feature/new-feature
```

3.

```bash
git add .
```

4.

```bash
git commit -m "Add awesome feature"
```

5.

```bash
git push origin feature/new-feature
```

6.

Open a Pull Request 🎉

---

# 📋 Requirements

- Node.js 18+
- npm
- OpenAI API Key

---

# 🔒 Environment

```
Node.js
Express
OpenAI API
```

---

# 📊 Project Status

🟢 Active Development

---

# 📜 License

Distributed under the MIT License.

---

# 🙌 Acknowledgements

- OpenAI
- Node.js
- Express.js
- PDF Parsing Libraries

---

<div align="center">

### ⭐ If you found this project useful, please consider giving it a Star.

Made with ❤️ by **Alaa Shamel**

</div>
