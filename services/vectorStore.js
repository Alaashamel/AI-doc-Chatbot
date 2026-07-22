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
async function searchDocuments(question, k = 3) {

    let allResults = [];

    for (const item of vectorStores) {

        const docs = await item.store.similaritySearch(question, k);

        docs.forEach(doc => {

            allResults.push({

                fileName: item.fileName,

                content: doc.pageContent,

                score: doc.score || 0

            });

        });

    }

    return allResults;
}

module.exports = {

    addDocument,

    getAllVectorStores,

    clearVectorStores,

    searchDocuments

};