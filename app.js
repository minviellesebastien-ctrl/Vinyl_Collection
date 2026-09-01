const STORAGE_KEY = "vinyl-collection-v1";
const starter = [];

let records =
  JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || starter;

const list = document.querySelector("#vinylList");
const scroller = document.querySelector("#listViewport");
const addButton = document.querySelector("#addButton");

const escapeHtml = value =>
  String(value).replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]));


/* =========================
   AFFICHAGE COLLECTION
========================= */

function render() {

  list.innerHTML = records.length
    ? records.map((r, i) => `
      <article class="vinyl-item" tabindex="0">
        <div class="number">
          ${String(i + 1).padStart(2, '0')}
        </div>

        <div class="details">
          <div class="artist">
            ${escapeHtml(r.artist)}
          </div>

          <div class="album">
            ${escapeHtml(r.album)}
          </div>

          <div class="year">
            ${escapeHtml(r.year)}
          </div>
        </div>

        <div class="chevron">›</div>
      </article>
    `).join('')

    : '<div class="empty">Aucun vinyle pour le moment</div>';
}

render();


/* =========================
   TOAST AU RETOUR
========================= */

const toastMsg = sessionStorage.getItem("toastMessage");

if (toastMsg) {

  sessionStorage.removeItem("toastMessage");

  const toast = document.createElement("div");
  toast.className = "toast";

  if (toastMsg.startsWith("✓")) {

    toast.innerHTML =
      "<span style='color:#32d74b;font-weight:bold'>✓</span>" +
      toastMsg.substring(1);

  } else {

    toast.textContent = toastMsg;
  }

  document.body.appendChild(toast);

  requestAnimationFrame(() =>
    toast.classList.add("show")
  );

  if (navigator.vibrate) {
    navigator.vibrate(
      toastMsg.startsWith("✓")
        ? 20
        : [40, 40, 40]
    );
  }

  setTimeout(() => {

    toast.classList.remove("show");

    setTimeout(() =>
      toast.remove(), 300);

  }, 2200);
}


/* =========================
   INITIALISATION
========================= */

attachLongPress();

window.setTimeout(() =>
  list.classList.add("visible"), 520);


/* =========================
   BOUTON AJOUT
========================= */

addButton.addEventListener("click", () => {

  addButton.classList.remove("bounce");

  void addButton.offsetWidth;

  addButton.classList.add("bounce");

  window.location.href = "ajouter.html";
});


if ("serviceWorker" in navigator) {

  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./service-worker.js")
  );
}


const btn = document.querySelector('#addButton');

btn.addEventListener('pointerup', () => {

  btn.classList.remove('bounce');

  void btn.offsetWidth;

  btn.classList.add('bounce');
});


/* =========================
   RECHERCHE
========================= */

const searchBar = document.querySelector('.search-bar');

if (searchBar) {

  function renderFiltered(items) {

    list.innerHTML = items.length

      ? items.map((r, i) => `
        <article class="vinyl-item" tabindex="0">

          <div class="number">
            ${String(i + 1).padStart(2, '0')}
          </div>

          <div class="details">

            <div class="artist">
              ${escapeHtml(r.artist)}
            </div>

            <div class="album">
              ${escapeHtml(r.album)}
            </div>

            <div class="year">
              ${escapeHtml(r.year)}
            </div>

          </div>

          <div class="chevron">›</div>

        </article>
      `).join('')

      : '<div class="empty">Aucun résultat</div>';

    /*
      Important :
      on transmet les résultats filtrés à attachLongPress()
      afin que l'index affiché soit correctement relié
      à l'élément correspondant dans records.
    */

    attachLongPress(items);
  }


  function searchRecords() {

    const q =
      searchBar.value.trim().toLowerCase();

    if (!q) {

      render();

      attachLongPress();

      return;
    }

    const results = records.filter(r =>
      (r.artist || '').toLowerCase().includes(q) ||
      (r.album || '').toLowerCase().includes(q)
    );

    renderFiltered(results);

    searchBar.blur();
  }


  searchBar.addEventListener('keydown', e => {

    if (e.key === 'Enter') {

      e.preventDefault();

      searchRecords();
    }
  });


  searchBar.addEventListener(
    'search',
    searchRecords
  );


  document.addEventListener('pointerdown', e => {

    if (e.target !== searchBar) {
      searchBar.blur();
    }
  });
}


/* =========================
   SUPPRESSION APPUI LONG
========================= */

let pressTimer = null;
let currentDeleteIndex = -1;

const dlg =
  document.getElementById('deleteDialog');

const dlgText =
  document.getElementById('deleteText');

const confirmBtn =
  document.getElementById('confirmDelete');


function openDeleteDialog(index) {

  /*
    Sécurité : si aucun élément valide n'est trouvé,
    on ne fait rien.
  */

  if (index < 0 || index >= records.length) {
    return;
  }

  currentDeleteIndex = index;

  dlgText.textContent =
    `${records[index].artist} — ${records[index].album}`;

  dlg.showModal();
}


confirmBtn.addEventListener('click', e => {

  e.preventDefault();

  if (
    currentDeleteIndex < 0 ||
    currentDeleteIndex >= records.length
  ) {
    return;
  }

  records.splice(currentDeleteIndex, 1);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(records)
  );

  dlg.close();

  render();

  attachLongPress();

  updateCount();


  const toast = document.createElement("div");

  toast.className = "toast";

  toast.textContent = " ❌ Vinyle supprimé";

  document.body.appendChild(toast);

  requestAnimationFrame(() =>
    toast.classList.add("show")
  );

  if (navigator.vibrate) {
    navigator.vibrate([40, 40, 40]);
  }

  setTimeout(() => {

    toast.classList.remove("show");

    setTimeout(() =>
      toast.remove(), 300);

  }, 2200);


  currentDeleteIndex = -1;
});


/* =========================
   COMPTEUR
========================= */

function updateCount() {

  const count =
    document.getElementById('vinylCount');

  if (count) {
    count.textContent = records.length;
  }
}


/* =========================
   APPUI LONG
========================= */

function attachLongPress(items = records) {

  document
    .querySelectorAll('.vinyl-item')
    .forEach((el, index) => {

      const start = () => {

        pressTimer = setTimeout(() => {

          navigator.vibrate &&
            navigator.vibrate(35);


          /*
            Si on est dans une recherche,
            items contient les résultats filtrés.

            On retrouve donc l'objet correspondant
            dans la collection complète.
          */

          const realIndex =
            records.indexOf(items[index]);


          openDeleteDialog(realIndex);

        }, 800);
      };


      const cancel = () => {
        clearTimeout(pressTimer);
      };


      ['touchstart', 'mousedown']
        .forEach(ev =>
          el.addEventListener(ev, start)
        );


      [
        'touchend',
        'touchcancel',
        'mouseup',
        'mouseleave'
      ].forEach(ev =>
        el.addEventListener(ev, cancel)
      );

    });
}


/* =========================
   COMPTEUR ANIMÉ
========================= */

const count =
  document.getElementById('vinylCount');

if (count) {

  const total = records.length;

  const duration = 2300;

  const start = performance.now();


  function anim(t) {

    const p =
      Math.min(
        (t - start) / duration,
        1
      );


    const e =
      1 - Math.pow(1 - p, 4);


    count.textContent =
      Math.round(total * e);


    if (p < 1) {

      requestAnimationFrame(anim);

    } else {

      /*
        Le compteur est maintenant terminé.
      */

      count.textContent = total;

      count.classList.add('count-bounce');


      count.addEventListener(
        'animationend',
        () => {

          count.classList.remove(
            'count-bounce'
          );

        },
        { once: true }
      );


      /*
        Le bandeau Mixtapes arrive seulement
        après la fin complète du compteur.
      */

      const mixtapeBanner =
        document.querySelector(
          '.mixtape-banner'
        );


      if (mixtapeBanner) {

        setTimeout(() => {

          /*
            ARRIVÉE BRUTALE
          */

          mixtapeBanner.classList.add(
            'show'
          );


          /*
            Impact juste après le placardage
          */

          setTimeout(() => {

            mixtapeBanner.classList.add(
              'impact'
            );

            document.body.classList.add(
              'screen-shake'
            );


            /*
              Vibration Android synchronisée
            */

            if (navigator.vibrate) {
              navigator.vibrate([
                80,
                35,
                50
              ]);
            }


            /*
              Fin de la secousse
            */

            setTimeout(() => {

              mixtapeBanner.classList.remove(
                'impact'
              );

              document.body.classList.remove(
                'screen-shake'
              );

            }, 380);

          }, 430);

        }, 250);
      }
    }
  }


  requestAnimationFrame(anim);
}


/* =========================
   BARRE BAS / HAUTEUR
========================= */

function fixBottomBar() {

  const viewport =
    window.visualViewport;

  const height =
    viewport
      ? viewport.height
      : window.innerHeight;


  document.documentElement.style.setProperty(
    "--app-height",
    `${Math.round(height)}px`
  );
}


function refreshBottomBar() {

  fixBottomBar();


  requestAnimationFrame(() => {

    fixBottomBar();

    setTimeout(fixBottomBar, 50);
    setTimeout(fixBottomBar, 150);
    setTimeout(fixBottomBar, 300);

  });
}


window.addEventListener(
  "load",
  refreshBottomBar
);

window.addEventListener(
  "resize",
  refreshBottomBar
);

window.addEventListener(
  "orientationchange",
  refreshBottomBar
);

window.addEventListener(
  "pageshow",
  refreshBottomBar
);


window.addEventListener(
  "focus",
  () => {
    setTimeout(
      refreshBottomBar,
      50
    );
  }
);


window.addEventListener(
  "visibilitychange",
  () => {

    if (!document.hidden) {
      refreshBottomBar();
    }

  }
);


if (window.visualViewport) {

  window.visualViewport.addEventListener(
    "resize",
    refreshBottomBar
  );

  window.visualViewport.addEventListener(
    "scroll",
    refreshBottomBar
  );
}


refreshBottomBar();
