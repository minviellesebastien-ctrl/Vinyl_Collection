const textarea = document.getElementById("wishlist");

// Charger la note
textarea.value = localStorage.getItem("wishlist") || "";

// Sauvegarder automatiquement
textarea.addEventListener("input", () => {
    localStorage.setItem("wishlist", textarea.value);
});
