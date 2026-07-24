# 🤖 AI Document Chatbot

An intelligent AI-powered chatbot that allows users to upload documents and ask questions in natural language using Retrieval-Augmented Generation (RAG).

---

## ✨ Features

- 📄 Upload PDF, DOCX, and CSV files
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔍 Semantic Search
- 💬 ChatGPT-like conversational interface
- ⚡ Fast document processing
- 📚 Context-aware responses
- 🔗 Source relevance ranking
- 📝 Markdown formatted answers

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express.js
- OpenAI API
- LangChain
- pdf-parse
- Multer

### Frontend

- HTML
- CSS
- JavaScript

---

## 📂 Project Structure

```
AI-doc-Chatbot
│
├── public/
├── routes/
├── services/
├── uploads/
├── server.js
├── package.json
└── README.md
```

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/Alaashamel/AI-doc-Chatbot.git
```

Move into the project

```bash
cd AI-doc-Chatbot
```

Install dependencies

```bash
npm install
```

Create environment variables

```env
OPENAI_API_KEY=your_api_key
```

Run the server

```bash
npm start
```

---

## 💬 How It Works

1. Upload your documents.
2. The system extracts text.
3. Documents are indexed.
4. User asks a question.
5. Relevant chunks are retrieved.
6. AI generates an answer using the retrieved context.

---

## 📌 Supported File Types

- PDF
- DOCX
- CSV

---

## 🔮 Future Improvements

- Authentication
- Chat History
- Multiple Conversations
- Vector Database
- Streaming Responses
- Voice Input
- Image OCR Support
- Docker Deployment

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

## 📄 License

MIT License

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.
