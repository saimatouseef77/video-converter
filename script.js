const languageSelect = document.getElementById("languageSelect");

const translations = {
    es: {
        badge: "Conversor rápido y sencillo",
        title: "Descargas Musica",
        description: "Convierte tus propios videos a MP3 o MP4 de forma rápida, sencilla y desde cualquier dispositivo.",
        converterTitle: "Convertidor de Video a MP3 y MP4",
        placeholder: "Pega un enlace permitido o selecciona tu video",
        convertButton: "Convertir ahora",
        note: "Usa únicamente contenido propio o contenido que tengas permiso para convertir."
    },

    en: {
        badge: "Fast and simple converter",
        title: "Music Downloads",
        description: "Convert your own videos to MP3 or MP4 quickly and easily from any device.",
        converterTitle: "Video to MP3 & MP4 Converter",
        placeholder: "Paste a permitted link or select your video",
        convertButton: "Convert now",
        note: "Only use your own content or content that you have permission to convert."
    },

    pt: {
        badge: "Conversor rápido e simples",
        title: "Downloads de Música",
        description: "Converta seus próprios vídeos para MP3 ou MP4 de forma rápida e fácil em qualquer dispositivo.",
        converterTitle: "Conversor de Vídeo para MP3 e MP4",
        placeholder: "Cole um link permitido ou selecione seu vídeo",
        convertButton: "Converter agora",
        note: "Use apenas conteúdo próprio ou conteúdo que você tenha permissão para converter."
    },

    fr: {
        badge: "Convertisseur rapide et simple",
        title: "Téléchargements Musique",
        description: "Convertissez vos propres vidéos en MP3 ou MP4 rapidement et facilement depuis n'importe quel appareil.",
        converterTitle: "Convertisseur Vidéo MP3 et MP4",
        placeholder: "Collez un lien autorisé ou sélectionnez votre vidéo",
        convertButton: "Convertir maintenant",
        note: "Utilisez uniquement votre propre contenu ou du contenu que vous êtes autorisé à convertir."
    },

    de: {
        badge: "Schneller und einfacher Konverter",
        title: "Musik Downloads",
        description: "Konvertiere deine eigenen Videos schnell und einfach in MP3 oder MP4.",
        converterTitle: "Video zu MP3 & MP4 Konverter",
        placeholder: "Erlaubten Link einfügen oder Video auswählen",
        convertButton: "Jetzt konvertieren",
        note: "Verwende nur eigene Inhalte oder Inhalte, die du konvertieren darfst."
    },

    it: {
        badge: "Convertitore rapido e semplice",
        title: "Download Musica",
        description: "Converti i tuoi video in MP3 o MP4 in modo rapido e semplice da qualsiasi dispositivo.",
        converterTitle: "Convertitore Video MP3 e MP4",
        placeholder: "Incolla un link consentito o seleziona il tuo video",
        convertButton: "Converti ora",
        note: "Utilizza solo contenuti tuoi o contenuti che hai il permesso di convertire."
    }
};

languageSelect.addEventListener("change", function () {

    const selectedLanguage = this.value;
    const text = translations[selectedLanguage];

    document.querySelector(".badge").textContent = text.badge;
    document.querySelector(".hero h1").textContent = text.title;
    document.querySelector(".hero > p").textContent = text.description;
    document.querySelector(".converter-box h2").textContent = text.converterTitle;
    document.querySelector(".converter-box input").placeholder = text.placeholder;
    document.querySelector(".convert-button").textContent = text.convertButton;
    document.querySelector(".small-note").textContent = text.note;

    document.documentElement.lang = selectedLanguage;
});
