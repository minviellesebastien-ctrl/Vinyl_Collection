const STORAGE_KEY = "vinyl-collection-v1";

const starter = [];

const form = document.querySelector("#addForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const records =
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || [...starter];

  const artist = document.querySelector("#artist").value.trim();
  const album = document.querySelector("#album").value.trim();

  if(records.some(r => (r.artist||"").toLowerCase()===artist.toLowerCase() && (r.album||"").toLowerCase()===album.toLowerCase())){
    sessionStorage.setItem("toastMessage","⚠️ Vinyle déjà présent");
    window.location.href="index.html";
    return;
  }

  records.push({
    artist,
    album,
    year: ""
  });

  records.sort((a, b) =>
    a.artist.localeCompare(b.artist, 'fr', { sensitivity: 'base' })
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  sessionStorage.setItem("toastMessage","✓ Vinyle ajouté");

  window.location.href = "index.html";
});


document.querySelector('.back').addEventListener('click',()=>{
const e=document.querySelector('.back');
e.classList.remove('bounce');void e.offsetWidth;
e.classList.add('bounce');
if(navigator.vibrate)navigator.vibrate(10);
setTimeout(()=>e.classList.remove('bounce'),460);
});
document.querySelector('.btn-ajout').addEventListener('click',()=>{
const e=document.querySelector('.btn-ajout');
e.classList.remove('bounce');void e.offsetWidth;
e.classList.add('bounce');
if(navigator.vibrate)navigator.vibrate(12);
setTimeout(()=>e.classList.remove('bounce'),460);
});
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

importBtn.addEventListener("click", () => {
    if (navigator.vibrate) navigator.vibrate(12);
    importFile.click();
});
importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const records = JSON.parse(reader.result);

            if (!Array.isArray(records)) {
                throw new Error("Format invalide");
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

            sessionStorage.setItem(
                "toastMessage",
                "✓ Collection importée"
            );

            window.location.href = "index.html";

        } catch (err) {
            alert("Fichier de collection invalide.");
        }
    };

    reader.readAsText(file);
});
const exportBtn = document.getElementById("exportBtn");

exportBtn.addEventListener("click", () => {

    if (navigator.vibrate) navigator.vibrate(12);

    const records = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const blob = new Blob(
        [JSON.stringify(records, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
a.href = url;

const d = new Date();
const nom = `collection_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}m${String(d.getSeconds()).padStart(2,'0')}s.json`;

a.download = nom;

document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  
    sessionStorage.setItem(
    "toastMessage",
    "✓ Collection exportée"
);

window.location.href = "index.html";
});
