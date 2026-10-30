const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpegPath = require("ffmpeg-static");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

app.get("/", (req, res) => {
    res.send("Descargas Musica Backend is Working ✅");
});

app.post("/convert", upload.single("video"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            error: "No video file uploaded"
        });
    }

    const format = req.body.format || "mp3";
    const quality = req.body.quality || "192";

    const inputPath = req.file.path;

    const outputExtension = format === "mp4" ? "mp4" : "mp3";

    const outputPath = path.join(
        "uploads",
        `converted-${Date.now()}.${outputExtension}`
    );

    let args = [];

    if (format === "mp3") {

        args = [
            "-i",
            inputPath,
            "-vn",
            "-b:a",
            `${quality}k`,
            outputPath
        ];

    } else {

        args = [
            "-i",
            inputPath,
            "-vf",
            `scale=-2:${quality}`,
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            outputPath
        ];

    }

    const ffmpeg = spawn(ffmpegPath, args);

    ffmpeg.on("close", (code) => {

        if (code !== 0) {

            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }

            return res.status(500).json({
                error: "Conversion failed"
            });
        }

        res.download(outputPath, () => {

            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }

            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }

        });

    });

});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
