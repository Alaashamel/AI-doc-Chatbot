const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    readTxt,
    readPDF,
    readDocx,
    readCSV
} = require("../services/documentReader");

const { splitText } = require("../services/textSplitter");

const { addDocument } = require("../services/vectorStore");

const router = express.Router();

// Multer Storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

// File Filter

const fileFilter = (req, file, cb) => {

    const allowedTypes = [

        ".pdf",

        ".txt",

        ".docx",

        ".csv"

    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (allowedTypes.includes(extension)) {

        cb(null, true);

    }

    else {

        cb(new Error("Unsupported File Type"));

    }

};


const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 10 * 1024 * 1024

    }

});
// Upload Route

router.post(

    "/",

    upload.single("document"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "No file uploaded."

                });

            }

            const extension = path
                .extname(req.file.originalname)
                .toLowerCase();

            let text = "";


            switch (extension) {

                case ".pdf":

                    text = await readPDF(req.file.path);

                    break;

                case ".txt":

                    text = readTxt(req.file.path);

                    break;

                case ".docx":

                    text = await readDocx(req.file.path);

                    break;

                case ".csv":

                    text = await readCSV(req.file.path);

                    break;

                default:

                    return res.status(400).json({

                        success: false,

                        message: "Unsupported File"

                    });

            }


            if (!text || text.trim() === "") {

                return res.status(400).json({

                    success: false,

                    message: "Document is empty."

                });

            }


            const chunks = await splitText(text, req.file.originalname);


            await addDocument(

                chunks,

                req.file.originalname

            );


            res.status(200).json({

                success: true,

                message: "Document uploaded successfully.",

                fileName: req.file.originalname,

                chunks: chunks.length

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

);


module.exports = router;