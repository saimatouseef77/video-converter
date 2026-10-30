const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpegPath = require("ffmpeg-static");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const dns = require("dns").promises;
const net = require("net");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    dest: uploadDir,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

app.get("/", (req, res) => {
    res.send("Descargas Musica Backend is Working ✅");
});

/* -----------------------------
   SECURITY: BLOCK PRIVATE URLS
----------------------------- */

function isPrivateIP(ip) {

    if (net.isIPv4(ip)) {
        const parts = ip.split(".").map(Number);

        if (parts[0] === 10) return true;
        if (parts[0] === 127) return true;

        if (
            parts[0] === 172 &&
            parts[1] >= 16 &&
            parts[1] <= 31
        ) return true;

        if (
            parts[0] === 192 &&
            parts[1] === 168
        ) return true;

        if (
            parts[0] === 169 &&
            parts[1] === 254
        ) return true;

        return false;
    }

    if (net.isIPv6(ip)) {
        const lower = ip.toLowerCase();

        return (
            lower === "::1" ||
            lower.startsWith("fc") ||
            lower.startsWith("fd") ||
            lower.startsWith("fe80")
        );
    }

    return true;
}

async function validateRemoteUrl(urlString) {

    let parsedUrl;

    try {
        parsedUrl = new URL(urlString);
    } catch {
        throw new Error("INVALID_URL");
    }

    if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
    ) {
        throw new Error("INVALID_URL");
    }

    if (
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname.endsWith(".local")
    ) {
        throw new Error("INVALID_URL");
    }

    const addresses = await dns.lookup(
        parsedUrl.hostname,
        { all: true }
    );

    for (const address of addresses) {
        if (isPrivateIP(address.address)) {
            throw new Error("INVALID_URL");
        }
    }

    return parsedUrl.toString();
}

/* -----------------------------
   DOWNLOAD DIRECT MEDIA URL
----------------------------- */

async function downloadRemoteMedia(urlString) {

    const safeUrl = await validateRemoteUrl(urlString);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 30000);

    try {

        const response = await fetch(safeUrl, {
            signal: controller.signal,
            redirect: "follow",
            headers: {
                "User-Agent": "DescargasMusica/1.0"
            }
        });

        if (!response.ok) {
            throw new Error("REMOTE_FETCH_FAILED");
        }

        const contentType =
            response.headers.get("content-type") || "";

        if (
            !contentType.startsWith("video/") &&
            !contentType.startsWith("audio/") &&
            !contentType.includes("octet-stream")
        ) {
            throw new Error("NOT_MEDIA");
        }

        const contentLength =
            Number(response.headers.get("content-length"));

        const maxSize = 100 * 1024 * 1024;

        if (
            contentLength &&
            contentLength > maxSize
        ) {
            throw new Error("FILE_TOO_LARGE");
        }

        const tempPath = path.join(
            uploadDir,
            `remote-${Date.now()}`
        );

        const fileStream =
            fs.createWriteStream(tempPath);

        const reader =
            response.body.getReader();

        let downloaded = 0;

        while (true) {

            const { done, value } =
                await reader.read();

            if (done) break;

            downloaded += value.length;

            if (downloaded > maxSize) {
                reader.cancel();
                fileStream.destroy();

                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }

                throw new Error("FILE_TOO_LARGE");
            }

            fileStream.write(Buffer.from(value));
        }

        fileStream.end();

        await new Promise((resolve, reject) => {
            fileStream.on("finish", resolve);
            fileStream.on("error", reject);
        });

        return tempPath;

    } finally {
        clearTimeout(timeout);
    }
}

/* -----------------------------
   CONVERT ROUTE
----------------------------- */

app.post(
    "/convert",
    upload.single("video"),
    async (req, res) => {

        let inputPath = null;
        let outputPath = null;

        try {

            const format =
                req.body.format === "mp4"
                    ? "mp4"
                    : "mp3";

            const quality =
                req.body.quality || "192";

            /* Uploaded file */

            if (req.file) {

                inputPath = req.file.path;

            }

            /* Direct media URL */

            else if (req.body.url) {

                inputPath =
                    await downloadRemoteMedia(
                        req.body.url.trim()
                    );

            }

            else {

                return res.status(400).json({
                    error:
                        "Selecciona un video o introduce un enlace multimedia directo."
                });

            }

            const outputPathName =
                `converted-${Date.now()}.${format}`;

            outputPath =
                path.join(
                    uploadDir,
                    outputPathName
                );

            let args;

            /* MP3 */

            if (format === "mp3") {

                const allowedBitrates = [
                    "128",
                    "192",
                    "256",
                    "320"
                ];

                const bitrate =
                    allowedBitrates.includes(
                        String(quality)
                    )
                        ? String(quality)
                        : "192";

                args = [
                    "-y",
                    "-i",
                    inputPath,
                    "-vn",
                    "-b:a",
                    `${bitrate}k`,
                    outputPath
                ];

            }

            /* MP4 */

            else {

                const allowedHeights = [
                    "360",
                    "480",
                    "720",
                    "1080"
                ];

                const height =
                    allowedHeights.includes(
                        String(quality)
                    )
                        ? String(quality)
                        : "720";

                args = [
                    "-y",
                    "-i",
                    inputPath,
                    "-vf",
                    `scale=-2:${height}`,
                    "-c:v",
                    "libx264",
                    "-preset",
                    "veryfast",
                    "-c:a",
                    "aac",
                    "-movflags",
                    "+faststart",
                    outputPath
                ];

            }

            const ffmpeg =
                spawn(ffmpegPath, args);

            let ffmpegError = "";

            ffmpeg.stderr.on(
                "data",
                (data) => {
                    ffmpegError +=
                        data.toString();
                }
            );

            ffmpeg.on(
                "close",
                (code) => {

                    if (code !== 0) {

                        console.error(
                            "FFmpeg error:",
                            ffmpegError
                        );

                        cleanupFiles(
                            inputPath,
                            outputPath
                        );

                        return res
                            .status(500)
                            .json({
                                error:
                                    "No se pudo convertir este archivo."
                            });
                    }

                    let downloadBaseName = "descargas-musica";

if (req.file && req.file.originalname) {

    downloadBaseName =
        req.file.originalname.replace(
            /\.[^/.]+$/,
            ""
        );
}

if (!req.file && req.body.url) {

    try {

        const parsedUrl =
            new URL(req.body.url);

        let urlName =
            parsedUrl.pathname
                .split("/")
                .filter(Boolean)
                .pop();

        if (urlName) {

            urlName =
                decodeURIComponent(
                    urlName
                );

            urlName =
                urlName.replace(
                    /\.[^/.]+$/,
                    ""
                );

            urlName =
                urlName.replace(
                    /[^a-zA-Z0-9-_ ]/g,
                    ""
                );

            if (urlName) {
                downloadBaseName =
                    urlName;
            }
        }

    } catch {}
}

const downloadFileName =
    `${downloadBaseName}.${format}`;

res.download(
    outputPath,
    downloadFileName,
    () => {

        cleanupFiles(
            inputPath,
            outputPath
        );

    }
);

                }
            );

        } catch (error) {

            console.error(error);

            cleanupFiles(
                inputPath,
                outputPath
            );

            let message =
                "Este enlace no se puede convertir.";

            if (
                error.message ===
                "FILE_TOO_LARGE"
            ) {
                message =
                    "El archivo supera el límite permitido.";
            }

            if (
                error.message ===
                "NOT_MEDIA"
            ) {
                message =
                    "El enlace no apunta directamente a un archivo de audio o video compatible.";
            }

            return res
                .status(400)
                .json({
                    error: message
                });
        }
    }
);

/* -----------------------------
   CLEAN TEMP FILES
----------------------------- */

function cleanupFiles(...files) {

    files.forEach((file) => {

        if (
            file &&
            fs.existsSync(file)
        ) {

            try {
                fs.unlinkSync(file);
            } catch (error) {
                console.error(
                    "Cleanup error:",
                    error
                );
            }

        }

    });

}

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
