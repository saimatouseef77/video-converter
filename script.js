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
