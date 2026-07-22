const express = require("express");
const router = express.Router();

const chatModel = require("../services/chatService");
const { searchDocuments } = require("../services/vectorStore");

router.post("/", async (req, res) => {

    try {

        const { question } = req.body;

        if (!question) {

            return res.status(400).json({
                success: false,
                message: "Question is required."
            });

        }

        const results = await searchDocuments(question);

        if (results.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Please upload a document first."
            });

        }

        const context = results
            .map(doc => doc.content)
            .join("\n\n");

        const prompt = `
You are an AI assistant.

Answer ONLY using the provided context.

If the answer is not found in the context, say:

"I couldn't find this information in the uploaded document."

Context:
${context}

Question:
${question}
`;

        const response = await chatModel.invoke(prompt);

        res.json({

            success: true,

            answer: response.content,

            sources: [...new Set(results.map(doc => doc.fileName))]

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

module.exports = router;