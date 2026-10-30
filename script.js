const API_URL =
    "https://descargas-musica-backend.onrender.com";


/* =========================
   ELEMENTS
========================= */

const languageSelect =
    document.getElementById("languageSelect");

const videoUrl =
    document.getElementById("videoUrl");

const linkFormatButtons =
    document.querySelectorAll(".link-format-btn");

const linkQualityLabel =
    document.getElementById("linkQualityLabel");

const linkQualitySelect =
    document.getElementById("linkQualitySelect");

const convertLinkButton =
    document.getElementById("convertLinkButton");

const linkStatus =
    document.getElementById("linkStatus");


const videoFile =
    document.getElementById("videoFile");

const selectedFileName =
    document.getElementById("selectedFileName");

const formatButtons =
    document.querySelectorAll(".format-btn");

const qualityLabel =
    document.getElementById("qualityLabel");

const qualitySelect =
    document.getElementById("qualitySelect");

const convertUploadButton =
    document.getElementById("convertUploadButton");

const uploadStatus =
    document.getElementById("uploadStatus");


/* =========================
   LANGUAGE
========================= */

languageSelect?.addEventListener(
    "change",
    function () {

        const english =
            this.value === "en";

        document.querySelector(
            ".hero-badge"
        ).textContent =
            english
                ? "Fast and simple converter"
                : "Conversor rápido y sencillo";

        document.querySelector(
            ".hero h1"
        ).textContent =
            english
                ? "Music Downloads"
                : "Descargas Musica";

        document.querySelector(
            ".hero-text"
        ).textContent =
            english
                ? "Convert compatible videos and media links to MP3 or MP4 using a simple interface."
                : "Convierte videos y enlaces multimedia compatibles a MP3 o MP4 desde una interfaz sencilla.";

        document.querySelector(
            ".converter-box > h2"
        ).textContent =
            english
                ? "Video to MP3 and MP4 Converter"
                : "Convertidor de Video a MP3 y MP4";

        videoUrl.placeholder =
            english
                ? "Paste a compatible media link"
                : "Pega un enlace multimedia compatible";

        convertLinkButton.textContent =
            english
                ? "Convert link"
                : "Convertir enlace";

        convertUploadButton.textContent =
            english
                ? "Convert file"
                : "Convertir archivo";
    }
);


/* =========================
   QUALITY OPTIONS
========================= */

function setQuality(
    format,
    label,
    select
) {

    if (format === "mp3") {

        label.textContent =
            "Calidad MP3";

        select.innerHTML = `
            <option value="128">128 kbps</option>
            <option value="192">192 kbps</option>
            <option value="256">256 kbps</option>
            <option value="320">320 kbps</option>
        `;

    } else {

        label.textContent =
            "Calidad de video";

        select.innerHTML = `
            <option value="360">360p</option>
            <option value="480">480p</option>
            <option value="720">720p HD</option>
            <option value="1080">1080p Full HD</option>
        `;
    }
}


/* LINK FORMAT */

linkFormatButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            function () {

                linkFormatButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );

                this.classList.add(
                    "active"
                );

                setQuality(
                    this.dataset.format,
                    linkQualityLabel,
                    linkQualitySelect
                );
            }
        );
    }
);


/* UPLOAD FORMAT */

formatButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            function () {

                formatButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );

                this.classList.add(
                    "active"
                );

                setQuality(
                    this.dataset.format,
                    qualityLabel,
                    qualitySelect
                );
            }
        );
    }
);


/* =========================
   FILE SELECT
========================= */

videoFile?.addEventListener(
    "change",
    function () {

        if (
            this.files &&
            this.files.length > 0
        ) {

            selectedFileName.textContent =
                "✓ Archivo seleccionado: " +
                this.files[0].name;

        } else {

            selectedFileName.textContent =
                "";
        }
    }
);


/* =========================
   LINK CONVERT
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

        try {
            new URL(url);
        } catch {

            linkStatus.textContent =
                "El enlace no es válido.";

            return;
        }

        const active =
            document.querySelector(
                ".link-format-btn.active"
            );

        const format =
            active?.dataset.format ||
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

        linkStatus.textContent =
            "Comprobando enlace y preparando conversión...";

        await runConversion({
            formData,
            button: convertLinkButton,
            status: linkStatus,
            format,
            fallbackName:
                getUrlName(url)
        });
    }
);


/* =========================
   UPLOAD CONVERT
========================= */

convertUploadButton?.addEventListener(
    "click",
    async function () {

        if (
            !videoFile.files ||
            videoFile.files.length === 0
        ) {

            uploadStatus.textContent =
                "Primero selecciona un video.";

            return;
        }

        const file =
            videoFile.files[0];

        const active =
            document.querySelector(
                ".format-btn.active"
            );

        const format =
            active?.dataset.format ||
            "mp3";

        const quality =
            qualitySelect.value;

        const formData =
            new FormData();

        formData.append(
            "video",
            file
        );

        formData.append(
            "format",
            format
        );

        formData.append(
            "quality",
            quality
        );

        uploadStatus.textContent =
            "Subiendo y convirtiendo archivo...";

        await runConversion({
            formData,
            button:
                convertUploadButton,
            status:
                uploadStatus,
            format,
            fallbackName:
                removeExtension(
                    file.name
                )
        });
    }
);


/* =========================
   SHARED CONVERSION
========================= */

async function runConversion({
    formData,
    button,
    status,
    format,
    fallbackName
}) {

    const oldText =
        button.textContent;

    button.disabled = true;

    button.textContent =
        "Convirtiendo...";

    try {

        const response =
            await fetch(
                API_URL + "/convert",
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {

            let message =
                "No se pudo convertir este recurso.";

            try {

                const error =
                    await response.json();

                if (error.error) {
                    message =
                        error.error;
                }

            } catch {}

            throw new Error(
                message
            );
        }

        const blob =
            await response.blob();

        let filename =
            getFilenameFromHeaders(
                response
            );

        if (!filename) {

            filename =
                `${fallbackName}.${format}`;
        }

        const objectUrl =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            objectUrl;

        link.download =
            filename;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            objectUrl
        );

        status.textContent =
            "✓ Conversión completada.";

        button.textContent =
            "¡Completado!";

    } catch (error) {

        console.error(
            error
        );

        status.textContent =
            error.message;

    } finally {

        setTimeout(() => {

            button.disabled =
                false;

            button.textContent =
                oldText;

        }, 1800);
    }
}


/* =========================
   FILE NAME
========================= */

function removeExtension(name) {

    return name.replace(
        /\.[^/.]+$/,
        ""
    );
}


function getUrlName(url) {

    try {

        const parsed =
            new URL(url);

        let name =
            parsed.pathname
                .split("/")
                .filter(Boolean)
                .pop();

        if (!name) {
            return "descargas-musica";
        }

        name =
            decodeURIComponent(
                name
            );

        name =
            removeExtension(
                name
            );

        name =
            name.replace(
                /[^a-zA-Z0-9-_ ]/g,
                ""
            );

        return name ||
            "descargas-musica";

    } catch {

        return "descargas-musica";
    }
}


function getFilenameFromHeaders(
    response
) {

    const disposition =
        response.headers.get(
            "content-disposition"
        );

    if (!disposition) {
        return null;
    }

    const match =
        disposition.match(
            /filename="?([^"]+)"?/i
        );

    return match
        ? match[1]
        : null;
}
