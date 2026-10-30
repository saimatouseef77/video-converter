const languageSelect = document.getElementById("languageSelect");
const formatButtons = document.querySelectorAll(".format-btn");
const qualitySelect = document.getElementById("qualitySelect");
const qualityLabel = document.getElementById("qualityLabel");
const videoFile = document.getElementById("videoFile");
const selectedFileName = document.getElementById("selectedFileName");
const videoUrl = document.getElementById("videoUrl");
const convertButton = document.querySelector(".convert-button");

/* LANGUAGE */
const translations = {
    es: {
        title: "Descargas Musica",
        description: "Convierte tus propios videos a MP3 o MP4 de forma rápida, sencilla y desde cualquier dispositivo.",
        converterTitle: "Convertidor de Video a MP3 y MP4",
        placeholder: "Pega un enlace permitido",
        convert: "Convertir ahora"
    },
    en: {
        title: "Music Downloads",
        description: "Convert your own videos to MP3 or MP4 quickly and easily from any device.",
        converterTitle: "Video to MP3 & MP4 Converter",
        placeholder: "Paste a permitted link",
        convert: "Convert now"
    }
};

languageSelect?.addEventListener("change", function () {
    const text = translations[this.value];

    if (!text) return;

    document.querySelector(".hero h1").textContent = text.title;
    document.querySelector(".hero > p").textContent = text.description;
    document.querySelector(".converter-box h2").textContent = text.converterTitle;
    videoUrl.placeholder = text.placeholder;
    convertButton.textContent = text.convert;
});

/* MP3 / MP4 */
formatButtons.forEach((button) => {
    button.addEventListener("click", function () {
        formatButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const format = this.dataset.format;

        if (format === "mp3") {
            qualityLabel.textContent = "Calidad MP3";

            qualitySelect.innerHTML = `
                <option value="128">128 kbps</option>
                <option value="192">192 kbps</option>
                <option value="256">256 kbps</option>
                <option value="320">320 kbps</option>
            `;
        } else {
            qualityLabel.textContent = "Calidad de video";

            qualitySelect.innerHTML = `
                <option value="360">360p</option>
                <option value="480">480p</option>
                <option value="720">720p HD</option>
                <option value="1080">1080p Full HD</option>
            `;
        }
    });
});

/* FILE SELECT */
videoFile?.addEventListener("change", function () {
    if (this.files && this.files.length > 0) {
        const file = this.files[0];

        selectedFileName.textContent =
            "✓ Archivo seleccionado: " + file.name;
    } else {
        selectedFileName.textContent = "";
    }
});

/* CONVERT UPLOADED FILE */
convertButton?.addEventListener("click", async function () {

    /* URL entered */
    if (videoUrl.value.trim() && (!videoFile.files || videoFile.files.length === 0)) {
        alert("La conversión mediante enlace se añadirá por separado. Por ahora selecciona un archivo de video.");
        return;
    }

    if (!videoFile.files || videoFile.files.length === 0) {
        alert("Primero selecciona un video.");
        return;
    }

    const activeButton = document.querySelector(".format-btn.active");
    const format = activeButton.dataset.format;
    const quality = qualitySelect.value;

    const formData = new FormData();

    formData.append("video", videoFile.files[0]);
    formData.append("format", format);
    formData.append("quality", quality);

    const originalText = convertButton.textContent;

    convertButton.disabled = true;
    convertButton.textContent = "Convirtiendo...";

    try {
        const response = await fetch(
            "https://descargas-musica-backend.onrender.com/convert",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Conversion failed");
        }

        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = fileUrl;
        link.download =
            format === "mp3"
                ? "descargas-musica.mp3"
                : "descargas-musica.mp4";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(fileUrl);

        convertButton.textContent = "¡Completado!";

        setTimeout(() => {
            convertButton.textContent = originalText;
            convertButton.disabled = false;
        }, 2000);

    } catch (error) {
        console.error(error);

        alert("No se pudo convertir el video.");

        convertButton.textContent = originalText;
        convertButton.disabled = false;
    }
});
