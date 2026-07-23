const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

// Embedding Model
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
});

const vectorStores = [];

async function addDocument(chunks, fileName) {

    const store = await MemoryVectorStore.fromDocuments(
        chunks,
        embeddings
    );

    vectorStores.push({
        fileName,
        store,
    });

    console.log(`Document Added: ${fileName}`);
}

function getAllVectorStores() {
    return vectorStores;
}

function clearVectorStores() {
    vectorStores.length = 0;
}

async function searchDocuments(question, k = 4) {

    let allResults = [];

    for (const item of vectorStores) {

        const docsWithScores = await item.store.similaritySearchWithScore(question, k);

        docsWithScores.forEach(([doc, score]) => {

            allResults.push({

                fileName: item.fileName,

                content: doc.pageContent,

                score

            });

        });

    }

    allResults.sort((a, b) => b.score - a.score);

    return allResults.slice(0, k);
}

module.exports = {

    addDocument,

    getAllVectorStores,

    clearVectorStores,

    searchDocuments

};