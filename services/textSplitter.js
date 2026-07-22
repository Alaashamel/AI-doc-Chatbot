const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

async function splitText(text, fileName) {

    const splitter = new RecursiveCharacterTextSplitter({

        chunkSize: 1000,

        chunkOverlap: 200

    });

    const chunks = await splitter.createDocuments(
        [text],
        [{ fileName }]
    );

    return chunks;

}

module.exports = {
    splitText
};