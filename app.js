"use strict";

/*
  FILMAPP
  Wersja demonstracyjna.

  ADMIN:
  login: Admin2012
  hasło: 2012

  UWAGA:
  GitHub Pages działa tylko jako strona statyczna.
  Konto administratora, konta użytkowników, Premium,
  komentarze i filmy są przechowywane lokalnie w przeglądarce.
*/

/* =========================================================
   USTAWIENIA
========================================================= */

const ADMIN_LOGIN = "Admin2012";
const ADMIN_PASSWORD = "2012";

const STATE_KEY = "filmapp_state";
const ACCOUNTS_KEY = "filmapp_accounts";
const SESSION_KEY = "filmapp_session";


/* =========================================================
   BRAK PRZYKŁADOWYCH FILMÓW
========================================================= */

const movies = [];


/* =========================================================
   DOMYŚLNY STAN
========================================================= */

const DEFAULT_STATE = {
  user: null,
  favorites: [],
  history: [],
  progress: {},
  ratings: {},
  comments: {},
  customMovies: [],
  premium: {
    plan: "Free",
    expires: null
  }
};


/* =========================================================
   POMOCNICZE
========================================================= */

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);

    if (!saved) {
      return clone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      premium: {
        ...clone(DEFAULT_STATE.premium),
        ...(parsed.premium || {})
      }
    };
  } catch (error) {
    console.error(error);
    return clone(DEFAULT_STATE);
  }
}

let state = getState();


function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}


function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
}


function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}


function getCurrentAccount() {
  if (!state.user || !state.user.id) {
    return null;
  }

  const accounts = getAccounts();

  return accounts.find(account => account.id === state.user.id) || null;
}


function isAdmin() {
  return !!(
    state.user &&
    state.user.role === "admin"
  );
}


function isLoggedIn() {
  return !!state.user;
}


function allMovies() {
  return [
    ...movies,
    ...(state.customMovies || [])
  ];
}


function findMovie(id) {
  return allMovies().find(movie => movie.id === id);
}


function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* =========================================================
   ADMIN
========================================================= */

function ensureAdminAccount() {
  const accounts = getAccounts();

  const existing = accounts.find(
    account =>
      account.role === "admin" &&
      account.email.toLowerCase() === ADMIN_LOGIN.toLowerCase()
  );

  if (!existing) {
    accounts.push({
      id: "admin-account",
      name: "Administrator",
      email: ADMIN_LOGIN,
      password: ADMIN_PASSWORD,
      role: "admin",
      createdAt: Date.now()
    });

    saveAccounts(accounts);
  }
}


/* =========================================================
   EKRANY
========================================================= */

const screens = [
  "movieScreen",
  "loginScreen",
  "registerScreen",
  "profileScreen",
  "libraryScreen",
  "premiumScreen",
  "searchScreen",
  "addScreen"
];


function hideAllScreens() {
  screens.forEach(id => {
    const element = document.getElementById(id);

    if (element) {
      element.classList.add("hidden");
    }
  });
}


function showScreen(id) {
  hideAllScreens();

  const element = document.getElementById(id);

  if (element) {
    element.classList.remove("hidden");
  }
}


function showHome() {
  hideAllScreens();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  renderMovies();
}


/* =========================================================
   MOVIE CARDS
========================================================= */

function getAccessLabel(movie) {
  if (movie.access === "Premium 4K") {
    return "💎 PREMIUM 4K";
  }

  if (movie.access === "Premium") {
    return "💎 PREMIUM";
  }

  return "🆓 BASIC";
}


function getAccessClass(movie) {
  if (movie.access === "Premium 4K") {
    return "premium4k";
  }

  if (movie.access === "Premium") {
    return "premium";
  }

  return "basic";
}


function movieCard(movie) {
  return `
    <article class="movie-card" data-movie-id="${escapeHTML(movie.id)}">

      <div
        class="poster ${movie.poster ? "" : (movie.posterClass || "poster4")}"
        ${movie.poster ? `style="background-image:url('${escapeHTML(movie.poster)}')"` : ""}
      >

        <span class="quality">
          ${escapeHTML(movie.quality || "HD")}
        </span>

        <span
          class="quality"
          style="left:9px;right:auto;top:9px;"
        >
          ${escapeHTML(getAccessLabel(movie))}
        </span>

        <div class="poster-title">
          ${escapeHTML(movie.title)}
        </div>

        <div class="play">
          ▶
        </div>

      </div>

      <h3>
        ${escapeHTML(movie.title)}
      </h3>

      <p>
        ⭐ ${escapeHTML(movie.rating ?? "—")}
        · ${escapeHTML(movie.duration || "—")}
      </p>

    </article>
  `;
}


function renderMovies() {
  const movieRow = document.getElementById("movieRow");
  const topRow = document.getElementById("topRow");
  const continueRow = document.getElementById("continueRow");

  const list = allMovies();

  if (movieRow) {
    if (list.length === 0) {
      movieRow.innerHTML = `
        <div class="empty-library">
          <div>🎬</div>
          <p>Biblioteka jest pusta.</p>
        </div>
      `;
    } else {
      movieRow.innerHTML = list.map(movieCard).join("");
    }
  }

  if (topRow) {
    const top = [...list]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 10);

    topRow.innerHTML = top.length
      ? top.map(movieCard).join("")
      : `
        <div class="empty-library">
          <p>Brak filmów.</p>
        </div>
      `;
  }

  if (continueRow) {
    const continueMovies = (state.history || [])
      .map(id => findMovie(id))
      .filter(Boolean)
      .slice(0, 10);

    continueRow.innerHTML = continueMovies.length
      ? continueMovies.map(movieCard).join("")
      : `
        <div class="empty-library">
          <p>Nie masz jeszcze rozpoczętych filmów.</p>
        </div>
      `;
  }
}


/* =========================================================
   DOSTĘP DO FILMU
========================================================= */

function hasMovieAccess(movie) {
  if (!movie) return false;

  const access = movie.access || "Basic";

  if (access === "Basic") {
    return true;
  }

  if (!isLoggedIn()) {
    return false;
  }

  if (access === "Premium") {
    return state.premium.plan === "Premium" ||
           state.premium.plan === "Premium 4K" ||
           state.premium.plan === "Premium na zawsze";
  }

  if (access === "Premium 4K") {
    return state.premium.plan === "Premium 4K" ||
           state.premium.plan === "Premium na zawsze";
  }

  return false;
}


/* =========================================================
   OTWIERANIE FILMU
========================================================= */

let currentMovie = null;


function openMovie(movieId) {
  const movie = findMovie(movieId);

  if (!movie) {
    showToast("Nie znaleziono filmu.");
    return;
  }

  currentMovie = movie;

  if (!hasMovieAccess(movie)) {
    showToast(
      movie.access === "Premium 4K"
        ? "Ten film wymaga Premium 4K."
        : "Ten film wymaga Premium."
    );

    openPremium();
    return;
  }

  const title = document.getElementById("movieTitle");
  const description = document.getElementById("movieDescription");
  const category = document.getElementById("movieCategory");
  const quality = document.getElementById("movieQuality");
  const rating = document.getElementById("movieRating");
  const duration = document.getElementById("movieDuration");
  const video = document.getElementById("videoPlayer");

  if (title) title.textContent = movie.title;

  if (description) {
    description.textContent =
      movie.description || "Brak opisu filmu.";
  }

  if (category) {
    category.textContent =
      movie.category || "Brak kategorii";
  }

  if (quality) {
    quality.textContent =
      movie.quality || "HD";
  }

  if (rating) {
    rating.textContent =
      `⭐ ${movie.rating ?? "—"}`;
  }

  if (duration) {
    duration.textContent =
      movie.duration || "—";
  }

  if (video) {
    video.pause();

    video.src = movie.video || "";

    video.currentTime =
      Number(state.progress?.[movie.id] || 0);

    video.load();
  }

  addToHistory(movie.id);
  renderRatingButtons();
  renderFavoriteButton();
  renderComments();

  showScreen("movieScreen");
}


/* =========================================================
   HISTORIA / POSTĘP
========================================================= */

function addToHistory(movieId) {
  if (!isLoggedIn()) return;

  state.history = [
    movieId,
    ...(state.history || []).filter(id => id !== movieId)
  ];

  state.history = state.history.slice(0, 50);

  saveState();
}


function saveMovieProgress() {
  if (!currentMovie) return;
  if (!isLoggedIn()) return;

  const video = document.getElementById("videoPlayer");

  if (!video) return;

  state.progress[currentMovie.id] =
    Math.floor(video.currentTime || 0);

  saveState();
}


/* =========================================================
   ODTWARZANIE
========================================================= */

function playMovie() {
  if (!currentMovie) return;

  if (!hasMovieAccess(currentMovie)) {
    showToast("Nie masz dostępu do tego filmu.");
    return;
  }

  const video = document.getElementById("videoPlayer");

  if (!video || !currentMovie.video) {
    showToast("Ten film nie ma jeszcze pliku wideo.");
    return;
  }

  video.play().catch(() => {
    showToast("Naciśnij ponownie Odtwórz.");
  });
}


/* =========================================================
   ULUBIONE
========================================================= */

function toggleFavorite() {
  if (!isLoggedIn()) {
    showToast("Zaloguj się, aby dodać film do biblioteki.");
    showLogin();
    return;
  }

  if (!currentMovie) return;

  const index = state.favorites.indexOf(currentMovie.id);

  if (index >= 0) {
    state.favorites.splice(index, 1);
    showToast("Usunięto z biblioteki.");
  } else {
    state.favorites.push(currentMovie.id);
    showToast("Dodano do biblioteki.");
  }

  saveState();
  renderFavoriteButton();
}


function renderFavoriteButton() {
  const button = document.getElementById("favoriteButton");

  if (!button || !currentMovie) return;

  const favorite =
    state.favorites.includes(currentMovie.id);

  button.textContent =
    favorite ? "♥ W bibliotece" : "♡ Biblioteka";
}


/* =========================================================
   OCENY
========================================================= */

function renderRatingButtons() {
  const buttons =
    document.querySelectorAll(".rating button");

  buttons.forEach(button => {
    const value = Number(button.dataset.rating);

    if (
      currentMovie &&
      Number(state.ratings[currentMovie.id]) === value
    ) {
      button.style.background = "#7650a1";
    } else {
      button.style.background = "#191220";
    }
  });
}


function rateMovie(value) {
  if (!isLoggedIn()) {
    showToast("Zaloguj się, aby ocenić film.");
    showLogin();
    return;
  }

  if (!currentMovie) return;

  state.ratings[currentMovie.id] = Number(value);

  saveState();

  renderRatingButtons();

  showToast(`Ocena ${value}/10 została zapisana.`);
}


/* =========================================================
   KOMENTARZE
========================================================= */

function ensureCommentsSection() {
  const content =
    document.querySelector("#movieScreen .screen-content");

  if (!content) return null;

  let section =
    document.getElementById("commentsSection");

  if (!section) {
    section = document.createElement("div");
    section.id = "commentsSection";

    section.innerHTML = `
      <h3>Komentarze</h3>

      <div id="commentsList"></div>

      <div style="margin-top:20px;">
        <textarea
          id="commentInput"
          placeholder="Napisz komentarz..."
          style="
            display:block;
            width:100%;
            min-height:110px;
            border:1px solid #281e33;
            background:#14101a;
            color:#fff;
            padding:16px;
            border-radius:14px;
            outline:none;
          "
        ></textarea>

        <button
          class="primary full"
          id="commentButton"
          style="margin-top:10px;"
        >
          Dodaj komentarz
        </button>
      </div>
    `;

    content.appendChild(section);

    document
      .getElementById("commentButton")
      ?.addEventListener("click", addComment);
  }

  return section;
}


function renderComments() {
  if (!currentMovie) return;

  ensureCommentsSection();

  const list =
    document.getElementById("commentsList");

  if (!list) return;

  const comments =
    state.comments?.[currentMovie.id] || [];

  if (comments.length === 0) {
    list.innerHTML = `
      <p style="color:#81798b;">
        Brak komentarzy. Bądź pierwszy!
      </p>
    `;

    return;
  }

  list.innerHTML = comments
    .map(comment => `
      <div
        style="
          background:#15101d;
          padding:15px;
          border-radius:15px;
          margin-bottom:10px;
        "
      >
        <strong>
          ${escapeHTML(comment.name)}
        </strong>

        <p
          style="
            margin:7px 0 0;
            color:#aaa1b4;
            white-space:pre-wrap;
          "
        >
          ${escapeHTML(comment.text)}
        </p>
      </div>
    `)
    .join("");
}


function addComment() {
  if (!isLoggedIn()) {
    showToast("Zaloguj się, aby dodać komentarz.");
    showLogin();
    return;
  }

  if (!currentMovie) return;

  const input =
    document.getElementById("commentInput");

  if (!input) return;

  const text = input.value.trim();

  if (!text) {
    showToast("Napisz komentarz.");
    return;
  }

  if (!state.comments) {
    state.comments = {};
  }

  if (!state.comments[currentMovie.id]) {
    state.comments[currentMovie.id] = [];
  }

  state.comments[currentMovie.id].push({
    id: Date.now().toString(),
    name: state.user.name,
    text,
    createdAt: Date.now()
  });

  saveState();

  input.value = "";

  renderComments();

  showToast("Komentarz został dodany.");
}


/* =========================================================
   LOGOWANIE
========================================================= */

function showLogin() {
  showScreen("loginScreen");
}


function login() {
  const loginInput =
    document.getElementById("loginEmail");

  const passwordInput =
    document.getElementById("loginPassword");

  const loginValue =
    loginInput?.value.trim() || "";

  const password =
    passwordInput?.value || "";

  if (!loginValue || !password) {
    showToast("Wpisz login i hasło.");
    return;
  }

  const accounts = getAccounts();

  const account = accounts.find(
    user =>
      user.email.toLowerCase() === loginValue.toLowerCase()
  );

  if (!account || account.password !== password) {
    showToast("Nieprawidłowy login lub hasło.");
    return;
  }

  state.user = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role
  };

  localStorage.setItem(
    SESSION_KEY,
    account.id
  );

  saveState();

  loginInput.value = "";
  passwordInput.value = "";

  updateProfile();

  showToast(
    account.role === "admin"
      ? "Zalogowano jako administrator."
      : "Zalogowano."
  );

  showHome();
}


/* =========================================================
   REJESTRACJA
========================================================= */

function createAccount() {
  const name =
    document.getElementById("registerName")?.value.trim();

  const email =
    document.getElementById("registerEmail")?.value.trim();

  const password =
    document.getElementById("registerPassword")?.value;

  if (!name || !email || !password) {
    showToast("Uzupełnij wszystkie pola.");
    return;
  }

  if (password.length < 4) {
    showToast("Hasło musi mieć minimum 4 znaki.");
    return;
  }

  const accounts = getAccounts();

  const exists = accounts.some(
    account =>
      account.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    showToast("Konto z takim loginem już istnieje.");
    return;
  }

  const account = {
    id:
      "user-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2),

    name,
    email,
    password,
    role: "user",

    createdAt: Date.now()
  };

  accounts.push(account);

  saveAccounts(accounts);

  state.user = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: "user"
  };

  state.favorites = [];
  state.history = [];
  state.progress = {};
  state.ratings = {};
  state.comments = {};
  state.premium = {
    plan: "Free",
    expires: null
  };

  saveState();

  document.getElementById("registerName").value = "";
  document.getElementById("registerEmail").value = "";
  document.getElementById("registerPassword").value = "";

  updateProfile();

  showToast("Konto zostało utworzone.");

  showHome();
}


/* =========================================================
   WYLOGOWANIE
========================================================= */

function logout() {
  state.user = null;

  localStorage.removeItem(SESSION_KEY);

  saveState();

  updateProfile();

  showToast("Wylogowano.");

  showHome();
}


/* =========================================================
   ODZYSKIWANIE HASŁA
========================================================= */

function forgotPassword() {
  showToast(
    "Reset hasła online będzie dostępny po podłączeniu backendu."
  );
}


/* =========================================================
   PROFIL
========================================================= */

function updateProfile() {
  const name =
    document.getElementById("profileName");

  const email =
    document.getElementById("profileEmail");

  const loggedOut =
    document.getElementById("profileLoggedOut");

  const loggedIn =
    document.getElementById("profileLoggedIn");

  if (!state.user) {
    if (name) name.textContent = "Gość";

    if (email) {
      email.textContent =
        "Nie jesteś zalogowany";
    }

    loggedOut?.classList.remove("hidden");
    loggedIn?.classList.add("hidden");

  } else {
    if (name) {
      name.textContent =
        state.user.name;
    }

    if (email) {
      email.textContent =
        state.user.email;
    }

    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");
  }

  updateAdminInterface();
}


/* =========================================================
   ADMIN INTERFEJS
========================================================= */

function updateAdminInterface() {
  const addButton =
    document.getElementById("navAdd");

  if (addButton) {
    if (isAdmin()) {
      addButton.classList.remove("hidden");
    } else {
      addButton.classList.add("hidden");
    }
  }

  let adminMenu =
    document.getElementById("adminMenu");

  const profileMenu =
    document.querySelector(".profile-menu");

  if (!profileMenu) return;

  if (isAdmin()) {
    if (!adminMenu) {
      adminMenu = document.createElement("button");

      adminMenu.id = "adminMenu";

      adminMenu.innerHTML =
        "👑 Panel administratora";

      adminMenu.addEventListener(
        "click",
        openAdd
      );

      profileMenu.prepend(adminMenu);
    }
  } else {
    adminMenu?.remove();
  }
}


/* =========================================================
   BIBLIOTEKA
========================================================= */

function openLibrary() {
  if (!isLoggedIn()) {
    showLogin();
    return;
  }

  showScreen("libraryScreen");

  renderLibrary("favorites");
}


function renderLibrary(type) {
  const container =
    document.getElementById("libraryMovies");

  if (!container) return;

  let ids = [];

  if (type === "favorites") {
    ids = state.favorites || [];
  }

  if (type === "history") {
    ids = state.history || [];
  }

  if (type === "continue") {
    ids = state.history || [];
  }

  const list =
    ids
      .map(id => findMovie(id))
      .filter(Boolean);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-library">
        <div>📚</div>
        <p>Ta sekcja jest pusta.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    list
      .map(movie => `
        <div
          class="library-item"
          data-movie-id="${escapeHTML(movie.id)}"
        >

          <div
            class="mini-poster ${movie.poster ? "" : (movie.posterClass || "poster4")}"
            ${
              movie.poster
                ? `style="background-image:url('${escapeHTML(movie.poster)}');background-size:cover;background-position:center;"`
                : ""
            }
          ></div>

          <div>
            <h3>
              ${escapeHTML(movie.title)}
            </h3>

            <p>
              ${escapeHTML(movie.category || "")}
              ·
              ${escapeHTML(movie.quality || "")}
            </p>

            <p>
              ${escapeHTML(getAccessLabel(movie))}
            </p>
          </div>

        </div>
      `)
      .join("");
}


/* =========================================================
   PREMIUM
========================================================= */

function openPremium() {
  showScreen("premiumScreen");
  renderPremium();
}


function renderPremium() {
  const current =
    document.getElementById("currentPlan");

  if (!current) return;

  current.innerHTML = `
    <div class="plan-status">
      <strong>Twój plan:</strong>
      ${escapeHTML(state.premium.plan)}
      ${
        state.premium.expires
          ? `<br>Ważny do: ${new Date(
              state.premium.expires
            ).toLocaleDateString("pl-PL")}`
          : ""
      }
    </div>
  `;
}


function buyPlan(plan, days) {
  if (!isLoggedIn()) {
    showToast("Zaloguj się, aby kupić Premium.");
    showLogin();
    return;
  }

  const now = new Date();

  let expires = null;

  if (days > 0) {
    now.setDate(now.getDate() + days);
    expires = now.toISOString();
  }

  state.premium = {
    plan,
    expires
  };

  saveState();

  renderPremium();

  showToast(
    `Aktywowano ${plan}.`
  );
}


/* =========================================================
   VOUCHERY
========================================================= */

const voucherCodes = {
  "FILM-PREMIUM-2026": {
    plan: "Premium",
    days: 30
  },

  "FILM-4K-2026": {
    plan: "Premium 4K",
    days: 30
  },

  "FILM-LIFE-2026": {
    plan: "Premium na zawsze",
    days: 0
  }
};


function activateVoucher(type) {
  if (!isLoggedIn()) {
    showToast("Zaloguj się, aby aktywować bon.");
    showLogin();
    return;
  }

  let inputId = "premiumCode";

  if (type === "4k") {
    inputId = "premium4kCode";
  }

  if (type === "lifetime") {
    inputId = "lifetimeCode";
  }

  const input =
    document.getElementById(inputId);

  const code =
    input?.value.trim().toUpperCase();

  if (!code) {
    showToast("Wpisz kod bonu.");
    return;
  }

  const voucher =
    voucherCodes[code];

  if (!voucher) {
    showToast("Nieprawidłowy kod bonu.");
    return;
  }

  const now = new Date();

  let expires = null;

  if (voucher.days > 0) {
    now.setDate(
      now.getDate() + voucher.days
    );

    expires = now.toISOString();
  }

  state.premium = {
    plan: voucher.plan,
    expires
  };

  saveState();

  input.value = "";

  renderPremium();

  showToast(
    `Aktywowano ${voucher.plan}.`
  );
}


/* =========================================================
   WYSZUKIWANIE
========================================================= */

function openSearch() {
  showScreen("searchScreen");

  const input =
    document.getElementById("searchInput");

  input?.focus();

  renderSearch("");
}


function renderSearch(query) {
  const container =
    document.getElementById("searchResults");

  if (!container) return;

  const q =
    query.trim().toLowerCase();

  const results =
    allMovies().filter(movie => {
      if (!q) return true;

      return (
        movie.title.toLowerCase().includes(q) ||
        (movie.category || "")
          .toLowerCase()
          .includes(q) ||
        (movie.description || "")
          .toLowerCase()
          .includes(q)
      );
    });

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-library">
        <div>🔍</div>
        <p>Nie znaleziono filmu.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    results.map(movie => `
      <div
        class="result"
        data-movie-id="${escapeHTML(movie.id)}"
      >
        <strong>
          ${escapeHTML(movie.title)}
        </strong>

        <p>
          ${escapeHTML(movie.category || "")}
          ·
          ${escapeHTML(movie.quality || "")}
          ·
          ${escapeHTML(getAccessLabel(movie))}
        </p>
      </div>
    `).join("");
}


/* =========================================================
   KATEGORIE
========================================================= */

function filterCategory(category) {
  const row =
    document.getElementById("movieRow");

  if (!row) return;

  let list =
    allMovies();

  if (category !== "Wszystkie") {
    list =
      list.filter(
        movie =>
          movie.category === category
      );
  }

  if (list.length === 0) {
    row.innerHTML = `
      <div class="empty-library">
        <div>🎬</div>
        <p>Brak filmów w tej kategorii.</p>
      </div>
    `;

    return;
  }

  row.innerHTML =
    list.map(movieCard).join("");
}


/* =========================================================
   DODAWANIE FILMU — TYLKO ADMIN
========================================================= */

function openAdd() {
  if (!isAdmin()) {
    showToast(
      "Tylko administrator może dodawać filmy."
    );

    return;
  }

  createAdminFields();

  showScreen("addScreen");
}


function createAdminFields() {
  const screen =
    document.getElementById("addScreen");

  const content =
    screen?.querySelector(".screen-content");

  if (!content) return;

  if (
    document.getElementById("addAccess")
  ) {
    return;
  }

  const qualityInput =
    document.getElementById("addQuality");

  if (qualityInput) {
    qualityInput.insertAdjacentHTML(
      "afterend",
      `
        <select
          id="addAccess"
          style="
            display:block;
            width:100%;
            border:1px solid #281e33;
            background:#14101a;
            color:#fff;
            padding:16px;
            border-radius:14px;
            outline:none;
            margin-bottom:12px;
          "
        >
          <option value="Basic">🆓 Basic — dla wszystkich</option>
          <option value="Premium">💎 Premium</option>
          <option value="Premium 4K">💎 Premium 4K</option>
        </select>

        <input
          id="addPoster"
          type="url"
          placeholder="Adres zdjęcia / plakatu"
        />
      `
    );
  }
}


function addMovie() {
  if (!isAdmin()) {
    showToast(
      "Nie masz uprawnień administratora."
    );

    return;
  }

  const title =
    document.getElementById("addTitle")?.value.trim();

  const description =
    document.getElementById("addDescription")?.value.trim();

  const category =
    document.getElementById("addCategory")?.value.trim();

  const duration =
    document.getElementById("addDuration")?.value.trim();

  const quality =
    document.getElementById("addQuality")?.value.trim();

  const video =
    document.getElementById("addVideo")?.value.trim();

  const access =
    document.getElementById("addAccess")?.value ||
    "Basic";

  const poster =
    document.getElementById("addPoster")?.value.trim() ||
    "";

  if (!title) {
    showToast("Wpisz tytuł filmu.");
    return;
  }

  if (!category) {
    showToast("Wpisz kategorię.");
    return;
  }

  if (!description) {
    showToast("Wpisz opis filmu.");
    return;
  }

  if (!video) {
    showToast("Dodaj adres filmu MP4.");
    return;
  }

  const movie = {
    id:
      "custom-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2),

    title,
    category,
    description,
    duration: duration || "—",
    quality: quality || "HD",
    access,
    poster,

    posterClass: "poster4",

    rating: 0,

    video,

    createdAt: Date.now()
  };

  state.customMovies.push(movie);

  saveState();

  clearAddForm();

  renderMovies();

  showToast(
    `Dodano film: ${title}`
  );

  showHome();
}


function clearAddForm() {
  const ids = [
    "addTitle",
    "addDescription",
    "addCategory",
    "addDuration",
    "addQuality",
    "addVideo",
    "addPoster"
  ];

  ids.forEach(id => {
    const element =
      document.getElementById(id);

    if (element) {
      element.value = "";
    }
  });

  const access =
    document.getElementById("addAccess");

  if (access) {
    access.value = "Basic";
  }
}


/* =========================================================
   ADMIN — USUWANIE FILMÓW
========================================================= */

function deleteMovie(movieId) {
  if (!isAdmin()) {
    showToast("Brak uprawnień.");
    return;
  }

  const movie =
    state.customMovies.find(
      item => item.id === movieId
    );

  if (!movie) {
    showToast("Nie można usunąć tego filmu.");
    return;
  }

  const confirmDelete =
    confirm(
      `Czy na pewno usunąć film "${movie.title}"?`
    );

  if (!confirmDelete) return;

  state.customMovies =
    state.customMovies.filter(
      item => item.id !== movieId
    );

  saveState();

  renderMovies();

  showToast("Film został usunięty.");
}


/* =========================================================
   PRZYCISKI / EVENTY
========================================================= */

function setupEvents() {

  /* FILMY */

  document.addEventListener(
    "click",
    event => {
      const movieElement =
        event.target.closest(
          "[data-movie-id]"
        );

      if (!movieElement) return;

      const movieId =
        movieElement.dataset.movieId;

      if (movieId) {
        openMovie(movieId);
      }
    }
  );


  /* PROFIL */

  document
    .getElementById("profileTopButton")
    ?.addEventListener(
      "click",
      () => {
        showScreen("profileScreen");
        updateProfile();
      }
    );

  document
    .getElementById("navProfile")
    ?.addEventListener(
      "click",
      () => {
        showScreen("profileScreen");
        updateProfile();
      }
    );

  document
    .getElementById("profileLogin")
    ?.addEventListener(
      "click",
      showLogin
    );


  /* LOGOWANIE */

  document
    .getElementById("loginButton")
    ?.addEventListener(
      "click",
      login
    );

  document
    .getElementById("forgotButton")
    ?.addEventListener(
      "click",
      forgotPassword
    );

  document
    .getElementById("registerButton")
    ?.addEventListener(
      "click",
      () => showScreen("registerScreen")
    );

  document
    .getElementById("goLoginButton")
    ?.addEventListener(
      "click",
      showLogin
    );


  /* REJESTRACJA */

  document
    .getElementById("createAccountButton")
    ?.addEventListener(
      "click",
      createAccount
    );


  /* WYLOGOWANIE */

  document
    .getElementById("profileLogout")
    ?.addEventListener(
      "click",
      logout
    );


  /* PROFIL */

  document
    .getElementById("profileLibrary")
    ?.addEventListener(
      "click",
      openLibrary
    );

  document
    .getElementById("profilePremium")
    ?.addEventListener(
      "click",
      openPremium
    );


  /* BIBLIOTEKA */

  document
    .getElementById("navLibrary")
    ?.addEventListener(
      "click",
      openLibrary
    );

  document
    .querySelectorAll(
      "[data-library]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          renderLibrary(
            button.dataset.library
          );
        }
      );
    });


  /* SZUKANIE */

  document
    .getElementById("navSearch")
    ?.addEventListener(
      "click",
      openSearch
    );

  document
    .getElementById("searchInput")
    ?.addEventListener(
      "input",
      event => {
        renderSearch(
          event.target.value
        );
      }
    );


  /* DODAWANIE */

  document
    .getElementById("navAdd")
    ?.addEventListener(
      "click",
      openAdd
    );

  document
    .getElementById("addMovieButton")
    ?.addEventListener(
      "click",
      addMovie
    );


  /* FILM */

  document
    .getElementById("playMovieButton")
    ?.addEventListener(
      "click",
      playMovie
    );

  document
    .getElementById("favoriteButton")
    ?.addEventListener(
      "click",
      toggleFavorite
    );


  /* OCENY */

  document
    .querySelectorAll(
      ".rating button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          rateMovie(
            Number(button.dataset.rating)
          );
        }
      );
    });


  /* VIDEO */

  document
    .getElementById("videoPlayer")
    ?.addEventListener(
      "timeupdate",
      () => {
        saveMovieProgress();
      }
    );


  /* PREMIUM */

  document
    .getElementById("premiumHomeButton")
    ?.addEventListener(
      "click",
      openPremium
    );


  document
    .querySelectorAll(
      "[data-buy]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          buyPlan(
            button.dataset.buy,
            Number(button.dataset.days || 0)
          );
        }
      );
    });


  document
    .querySelectorAll(
      "[data-voucher]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          activateVoucher(
            button.dataset.voucher
          );
        }
      );
    });


  /* KATEGORIE */

  document
    .querySelectorAll(
      "[data-category]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          filterCategory(
            button.dataset.category
          );
        }
      );
    });


  /* HERO */

  document
    .getElementById("heroWatch")
    ?.addEventListener(
      "click",
      () => {
        const first =
          allMovies()[0];

        if (first) {
          openMovie(first.id);
        } else {
          showToast(
            "Biblioteka jest jeszcze pusta."
          );
        }
      }
    );


  /* WIĘCEJ */

  document
    .getElementById("continueMore")
    ?.addEventListener(
      "click",
      openLibrary
    );


  /* DOLNA NAWIGACJA */

  document
    .getElementById("navHome")
    ?.addEventListener(
      "click",
      showHome
    );


  /* POWROTY */

  document
    .getElementById("movieBack")
    ?.addEventListener(
      "click",
      showHome
    );

  document
    .getElementById("loginBack")
    ?.addEventListener(
      "click",
      showHome
    );

  document
    .getElementById("registerBack")
    ?.addEventListener(
      "click",
      showLogin
    );

  document
    .getElementById("profileBack")
    ?.addEventListener(
      "click",
      showHome
    );

  document
    .getElementById("libraryBack")
    ?.addEventListener(
      "click",
      () => {
        showScreen("profileScreen");
      }
    );

  document
    .getElementById("premiumBack")
    ?.addEventListener(
      "click",
      () => {
        showScreen("profileScreen");
      }
    );

  document
    .getElementById("searchBack")
    ?.addEventListener(
      "click",
      showHome
    );

  document
    .getElementById("addBack")
    ?.addEventListener(
      "click",
      () => {
        showHome();
      }
    );
}


/* =========================================================
   SESJA
========================================================= */

function restoreSession() {
  const sessionId =
    localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    state.user = null;
    saveState();
    return;
  }

  const accounts =
    getAccounts();

  const account =
    accounts.find(
      user => user.id === sessionId
    );

  if (!account) {
    localStorage.removeItem(SESSION_KEY);
    state.user = null;
    saveState();
    return;
  }

  state.user = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role
  };

  saveState();
}


/* =========================================================
   START
========================================================= */

ensureAdminAccount();
restoreSession();
setupEvents();
updateProfile();
renderMovies();
