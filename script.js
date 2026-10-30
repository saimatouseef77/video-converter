/* =========================
   BASIC ELEMENTS
========================= */

const languageSelect = document.getElementById("languageSelect");

/* Upload converter */
const uploadFormatButtons = document.querySelectorAll(".format-btn");
const qualitySelect = document.getElementById("qualitySelect");
const qualityLabel = document.getElementById("qualityLabel");
const videoFile = document.getElementById("videoFile");
const selectedFileName = document.getElementById("selectedFileName");

const uploadConvertButton =
    document.querySelector(".convert-upload-button") ||
    document.querySelector(".convert-button");

/* Link converter */
const videoUrl = document.getElementById("videoUrl");
const linkStatus = document.getElementById("linkStatus");
const linkFormatButtons = document.querySelectorAll(".link-format-btn");
const linkQualitySelect = document.getElementById("linkQualitySelect");
const linkQualityLabel = document.getElementById("linkQualityLabel");
const convertLinkButton = document.getElementById("convertLinkButton");


/* =========================
   LANGUAGE
========================= */

const translations = {
    es: {
        title: "Descargas Musica",
        description:
            "Convierte tus videos a MP3 o MP4 de forma rápida y sencilla.",
        converterTitle:
            "Convertidor de Video a MP3 y MP4"
    },

    en: {
        title: "Music Downloads",
        description:
            "Convert your videos to MP3 or MP4 quickly and easily.",
        converterTitle:
            "Video to MP3 and MP4 Converter"
    }
};

languageSelect?.addEventListener("change", function () {

    const text = translations[this.value];

    if (!text) return;

    const heroTitle =
        document.querySelector(".hero h1");

    const heroDescription =
        document.querySelector(".hero > p");

    const converterTitle =
        document.querySelector(".converter-box h2");

    if (heroTitle)
        heroTitle.textContent = text.title;

    if (heroDescription)
        heroDescription.textContent =
            text.description;

    if (converterTitle)
        converterTitle.textContent =
            text.converterTitle;
});


/* =========================
   UPLOAD MP3 / MP4
========================= */

uploadFormatButtons.forEach((button) => {

    button.addEventListener("click", function () {

        uploadFormatButtons.forEach((btn) =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        const format = this.dataset.format;

        if (format === "mp3") {

            qualityLabel.textContent =
                "Calidad MP3";

            qualitySelect.innerHTML = `
                <option value="128">128 kbps</option>
                <option value="192">192 kbps</option>
                <option value="256">256 kbps</option>
                <option value="320">320 kbps</option>
            `;

        } else {

            qualityLabel.textContent =
                "Calidad de video";

            qualitySelect.innerHTML = `
                <option value="360">360p</option>
                <option value="480">480p</option>
                <option value="720">720p HD</option>
                <option value="1080">1080p Full HD</option>
            `;
        }
    });
});


/* =========================
   LINK MP3 / MP4
========================= */

linkFormatButtons.forEach((button) => {

    button.addEventListener("click", function () {

        linkFormatButtons.forEach((btn) =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        const format = this.dataset.format;

        if (format === "mp3") {

            linkQualityLabel.textContent =
                "Calidad MP3";

            linkQualitySelect.innerHTML = `
                <option value="128">128 kbps</option>
                <option value="192">192 kbps</option>
                <option value="256">256 kbps</option>
                <option value="320">320 kbps</option>
            `;

        } else {

            linkQualityLabel.textContent =
                "Calidad de video";

            linkQualitySelect.innerHTML = `
                <option value="360">360p</option>
                <option value="480">480p</option>
                <option value="720">720p HD</option>
                <option value="1080">1080p Full HD</option>
            `;
        }
    });
});


/* =========================
   FILE SELECT
========================= */

videoFile?.addEventListener("change", function () {

    if (this.files && this.files.length > 0) {

        selectedFileName.textContent =
            "✓ Archivo seleccionado: " +
            this.files[0].name;

    } else {

        selectedFileName.textContent = "";
    }
});


/* =========================
   UPLOAD CONVERSION
========================= */

uploadConvertButton?.addEventListener(
    "click",
    async function () {

        if (
            !videoFile.files ||
            videoFile.files.length === 0
        ) {

            alert(
                "Primero selecciona un video."
            );

            return;
        }

        const activeButton =
            document.querySelector(
                ".format-btn.active"
            );

        const format =
            activeButton?.dataset.format ||
            "mp3";

        const quality =
            qualitySelect.value;

        const originalFile =
            videoFile.files[0];

        const baseName =
            originalFile.name.replace(
                /\.[^/.]+$/,
                ""
            );

        const formData =
            new FormData();

        formData.append(
            "video",
            originalFile
        );

        formData.append(
            "format",
            format
        );

        formData.append(
            "quality",
            quality
        );

        await convertMedia(
            formData,
            uploadConvertButton,
            baseName,
            format
        );
    }
);


/* =========================
   LINK CONVERSION
========================= */

convertLinkButton?.addEventListener(
    "click",
    async function () {

        const url =
            videoUrl.value.trim();

        if (!url) {

            linkStatus.textContent =
                "Introduce un enlace.";

            return;
        }

        let parsed;

        try {

            parsed = new URL(url);

        } catch {

            linkStatus.textContent =
                "El enlace no es válido.";

            return;
        }

        const hostname =
            parsed.hostname
                .replace("www.", "")
                .toLowerCase();

        if (
            hostname.includes("tiktok.com")
        ) {

            linkStatus.textContent =
                "Comprobando enlace público de TikTok...";

        } else if (
            hostname.includes("instagram.com")
        ) {

            linkStatus.textContent =
                "Comprobando enlace público de Instagram...";

        } else {

            linkStatus.textContent =
                "Comprobando enlace multimedia...";
        }

        const activeButton =
            document.querySelector(
                ".link-format-btn.active"
            );

        const format =
            activeButton?.dataset.format ||
            "mp3";

        const quality =
            linkQualitySelect.value;

        const formData =
            new FormData();

        formData.append(
            "url",
            url
        );

        formData.append(
            "format",
            format
        );

        formData.append(
            "quality",
            quality
        );

        let baseName =
            getNameFromUrl(parsed);

        try {

            await convertMedia(
                formData,
                convertLinkButton,
                baseName,
                format,
                true
            );

            linkStatus.textContent =
                "✓ Conversión completada.";

        } catch (error) {

            linkStatus.textContent =
                error.message;
        }
    }
);


/* =========================
   SHARED CONVERSION
========================= */

async function convertMedia(
    formData,
    button,
    baseName,
    format,
    throwError = false
) {

    const oldText =
        button.textContent;

    button.disabled = true;
    button.textContent =
        "Convirtiendo...";

    try {

        const response =
            await fetch(
                "https://descargas-musica-backend.onrender.com/convert",
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {

            let message =
                "Este enlace o archivo no se puede convertir.";

            try {

                const data =
                    await response.json();

                if (data.error) {
                    message =
                        data.error;
                }

            } catch {}

            throw new Error(message);
        }

        const blob =
            await response.blob();

        const objectUrl =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href =
            objectUrl;

        link.download =
            `${baseName}.${format}`;

        document.body.appendChild(link);

        link.click();
        link.remove();

        URL.revokeObjectURL(
            objectUrl
        );

        button.textContent =
            "¡Completado!";

        setTimeout(() => {

            button.textContent =
                oldText;

            button.disabled =
                false;

        }, 2000);

    } catch (error) {

        button.textContent =
            oldText;

        button.disabled =
            false;

        if (throwError) {
            throw error;
        }

        alert(error.message);
    }
}


/* =========================
   GET NAME FROM URL
========================= */

function getNameFromUrl(parsedUrl) {

    let pathname =
        parsedUrl.pathname;

    let lastPart =
        pathname
            .split("/")
            .filter(Boolean)
            .pop();

    if (!lastPart) {
        return "descargas-musica";
    }

    try {
        lastPart =
            decodeURIComponent(
                lastPart
            );
    } catch {}

    lastPart =
        lastPart.replace(
            /\.[^/.]+$/,
            ""
        );

    lastPart =
        lastPart.replace(
            /[^a-zA-Z0-9-_ ]/g,
            ""
        );

    if (!lastPart) {
        return "descargas-musica";
    }

    return lastPart;
}
