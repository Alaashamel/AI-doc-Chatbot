const fs = require("fs");
const mammoth = require("mammoth");
const csv = require("csv-parser");
const { PDFParse } = require("pdf-parse");

// Read TXT File
function readTxt(filePath) {
    return fs.readFileSync(filePath, "utf8");
}

// Read PDF File
async function readPDF(filePath) {

    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({ data: buffer });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
}
// Read DOCX File
async function readDocx(filePath) {

    const result = await mammoth.extractRawText({
        path: filePath
    });

    return result.value;
}

// Read CSV File
function readCSV(filePath) {

    return new Promise((resolve, reject) => {

        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())

            .on("data", (row) => {
                const rowText = Object.entries(row)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ");

                rows.push(rowText);
            })

            .on("end", () => {
                resolve(rows.join("\n"));
            })

            .on("error", (error) => {
                reject(error);
            });

    });

}

module.exports = {
    readTxt,
    readPDF,
    readDocx,
    readCSV
};