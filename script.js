const languageSelect = document.getElementById("languageSelect");

languageSelect.addEventListener("change", function () {
    if (this.value === "en") {
        document.querySelector(".hero h1").textContent = "Music Downloads";
        document.querySelector(".hero > p").textContent =
            "Convert your own videos to MP3 or MP4 quickly and easily from any device.";
        document.querySelector(".converter-box h2").textContent =
            "Video to MP3 & MP4 Converter";
        document.querySelector(".convert-button").textContent = "Convert now";
    }

    if (this.value === "es") {
        document.querySelector(".hero h1").textContent = "Descargas Musica";
        document.querySelector(".hero > p").textContent =
            "Convierte tus propios videos a MP3 o MP4 de forma rápida, sencilla y desde cualquier dispositivo.";
        document.querySelector(".converter-box h2").textContent =
            "Convertidor de Video a MP3 y MP4";
        document.querySelector(".convert-button").textContent = "Convertir ahora";
    }
});
const formatButtons = document.querySelectorAll(".format-btn");
const qualitySelect = document.getElementById("qualitySelect");
const qualityLabel = document.getElementById("qualityLabel");

formatButtons.forEach((button) => {
    button.addEventListener("click", function () {

        formatButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

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
        }

        if (format === "mp4") {
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
const convertButtonEl = document.querySelector(".convert-button");

convertButtonEl.addEventListener("click", async function () {

    if (!videoFile.files || videoFile.files.length === 0) {
        alert("Primero selecciona un video.");
        return;
    }

    const activeFormatButton = document.querySelector(".format-btn.active");
    const selectedFormat = activeFormatButton.dataset.format;
    const selectedQuality = qualitySelect.value;

    const formData = new FormData();

    formData.append("video", videoFile.files[0]);
    formData.append("format", selectedFormat);
    formData.append("quality", selectedQuality);

    const oldButtonText = convertButtonEl.textContent;

    convertButtonEl.disabled = true;
    convertButtonEl.textContent = "Convirtiendo...";

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

        const downloadUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");

        downloadLink.href = downloadUrl;

        downloadLink.download =
            selectedFormat === "mp3"
                ? "descargas-musica.mp3"
                : "descargas-musica.mp4";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        downloadLink.remove();

        URL.revokeObjectURL(downloadUrl);

        convertButtonEl.textContent = "¡Conversión completada!";

        setTimeout(() => {
            convertButtonEl.textContent = oldButtonText;
            convertButtonEl.disabled = false;
        }, 2000);

    } catch (error) {

        console.error(error);

        alert(
            "No se pudo convertir el video. Inténtalo de nuevo."
        );

        convertButtonEl.textContent = oldButtonText;
        convertButtonEl.disabled = false;
    }

});
