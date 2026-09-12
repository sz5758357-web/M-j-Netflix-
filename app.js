"use strict";

/*
=========================================================
 FILMAPP
 WERSJA DEMO / GITHUB PAGES

 ADMIN:
 Login: Admin2012
 Hasło: 2012

 UWAGA:
 To jest lokalna wersja demonstracyjna.
 Prawdziwe bezpieczne logowanie wymaga backendu.
=========================================================
*/


/* =====================================================
   ADMIN
===================================================== */

const ADMIN_LOGIN = "Admin2012";
const ADMIN_PASSWORD = "2012";


/* =====================================================
   STORAGE
===================================================== */

const STORAGE = {
  accounts: "filmapp_accounts_v4",
  session: "filmapp_session_v4",
  movies: "filmapp_movies_v4",
  userData: "filmapp_user_data_v4"
};


/* =====================================================
   PUSTA BIBLIOTEKA
===================================================== */

let movies = JSON.parse(
  localStorage.getItem(STORAGE.movies) || "[]"
);

let accounts = JSON.parse(
  localStorage.getItem(STORAGE.accounts) || "[]"
);

let userData = JSON.parse(
  localStorage.getItem(STORAGE.userData) || "{}"
);

let currentUser = JSON.parse(
  localStorage.getItem(STORAGE.session) || "null"
);

let currentMovie = null;


/* =====================================================
   DOM
===================================================== */

const $ = id => document.getElementById(id);

const loadingScreen = $("loadingScreen");
const loadingProgress = $("loadingProgress");

const movieScreen = $("movieScreen");
const loginScreen = $("loginScreen");
const registerScreen = $("registerScreen");
const profileScreen = $("profileScreen");
const libraryScreen = $("libraryScreen");
const premiumScreen = $("premiumScreen");
const searchScreen = $("searchScreen");
const addScreen = $("addScreen");

const videoPlayer = $("videoPlayer");


/* =====================================================
   ZAPIS
===================================================== */

function saveAccounts() {
  localStorage.setItem(
    STORAGE.accounts,
    JSON.stringify(accounts)
  );
}

function saveMovies() {
  localStorage.setItem(
    STORAGE.movies,
    JSON.stringify(movies)
  );
}

function saveUserData() {
  localStorage.setItem(
    STORAGE.userData,
    JSON.stringify(userData)
  );
}

function saveSession() {

  if (currentUser) {
    localStorage.setItem(
      STORAGE.session,
      JSON.stringify(currentUser)
    );
  } else {
    localStorage.removeItem(STORAGE.session);
  }
}


/* =====================================================
   USER DATA
===================================================== */

function createUserData(userId) {

  if (!userData[userId]) {

    userData[userId] = {

      favorites: [],
      history: [],
      progress: {},
      ratings: {},
      comments: {},

      premium: {
        plan: "Basic",
        expires: null
      }

    };

    saveUserData();
  }

  return userData[userId];
}


function getMyData() {

  if (!currentUser) return null;

  return createUserData(currentUser.id);
}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;

function toast(message) {

  const el = $("toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove("show");
  }, 2600);
}


/* =====================================================
   LOADING
===================================================== */

function startLoading() {

  if (!loadingScreen) return;

  let progress = 0;

  const timer = setInterval(() => {

    progress += Math.floor(Math.random() * 12) + 5;

    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);

      setTimeout(() => {

        loadingScreen.classList.add("loading-hide");

        setTimeout(() => {
          loadingScreen.remove();
        }, 700);

      }, 350);
    }

    if (loadingProgress) {
      loadingProgress.style.width = progress + "%";
    }

  }, 120);
}


/* =====================================================
   SCREENY
===================================================== */

function hideAllScreens() {

  [
    movieScreen,
    loginScreen,
    registerScreen,
    profileScreen,
    libraryScreen,
    premiumScreen,
    searchScreen,
    addScreen
  ].forEach(screen => {

    if (screen) {
      screen.classList.add("hidden");
    }

  });

}


function showScreen(screen) {

  hideAllScreens();

  if (screen) {
    screen.classList.remove("hidden");
  }

  window.scrollTo(0, 0);
}


/* =====================================================
   ADMIN
===================================================== */

function isAdmin() {

  return !!(
    currentUser &&
    currentUser.role === "admin"
  );

}


function updateAdminUI() {

  const addButton = $("navAdd");

  if (addButton) {

    if (isAdmin()) {
      addButton.classList.remove("hidden");
    } else {
      addButton.classList.add("hidden");
    }

  }

}


/* =====================================================
   PROFIL
===================================================== */

function updateProfile() {

  const name = $("profileName");
  const email = $("profileEmail");

  const loggedOut = $("profileLoggedOut");
  const loggedIn = $("profileLoggedIn");

  if (!currentUser) {

    if (name) name.textContent = "Gość";

    if (email) {
      email.textContent = "Nie jesteś zalogowany";
    }

    loggedOut?.classList.remove("hidden");
    loggedIn?.classList.add("hidden");

  } else {

    if (name) {
      name.textContent = currentUser.name;
    }

    if (email) {

      if (currentUser.role === "admin") {

        email.textContent =
          "👑 Administrator FilmApp";

      } else {

        email.textContent =
          "@" + currentUser.login;

      }

    }

    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");

  }

  updateAdminUI();
}


/* =====================================================
   KARTY FILMÓW
===================================================== */

function getMoviePoster(movie) {

  if (movie.poster) {

    return `background-image:url("${movie.poster}")`;

  }

  return "";
}


function movieCard(movie) {

  const access =
    movie.access || "Basic";

  const accessIcon =
    access === "Basic"
      ? "🆓"
      : access === "Premium"
        ? "💎"
        : "💎 4K";

  return `

    <article
      class="movie-card"
      data-movie-id="${escapeHTML(movie.id)}">

      <div
        class="poster"
        style="${getMoviePoster(movie)}">

        ${
          !movie.poster
            ? `<div class="poster-title">
                 ${escapeHTML(movie.title)}
               </div>`
            : ""
        }

        <span class="quality">
          ${escapeHTML(movie.quality || "HD")}
        </span>

        <span class="movie-access">
          ${accessIcon}
        </span>

        <div class="play">
          ▶
        </div>

      </div>

      <h3>
        ${escapeHTML(movie.title)}
      </h3>

      <p>
        ⭐ ${getMovieRating(movie)}
        · ${escapeHTML(movie.duration || "—")}
      </p>

    </article>

  `;
}


function renderMovies(list = movies) {

  const movieRow = $("movieRow");
  const topRow = $("topRow");
  const continueRow = $("continueRow");

  if (!movieRow || !topRow || !continueRow) {
    return;
  }

  if (!list.length) {

    const empty = `
      <div class="empty-movies">
        <div>🎬</div>
        <h3>Biblioteka jest pusta</h3>
        <p>
          Administrator może dodać pierwszy film.
        </p>
      </div>
    `;

    movieRow.innerHTML = empty;
    topRow.innerHTML = empty;
    continueRow.innerHTML = `
      <div class="empty-movies small-empty">
        ▶ Brak filmów do kontynuowania
      </div>
    `;

    return;
  }


  movieRow.innerHTML =
    list.map(movieCard).join("");


  const sorted = [...list].sort(
    (a, b) =>
      getMovieRating(b) - getMovieRating(a)
  );

  topRow.innerHTML =
    sorted.slice(0, 10)
      .map(movieCard)
      .join("");


  const data = getMyData();

  if (!data || !data.history.length) {

    continueRow.innerHTML = `
      <div class="empty-movies small-empty">
        ▶ Obejrzyj film, aby pojawił się tutaj
      </div>
    `;

  } else {

    const continueMovies =
      data.history
        .map(id =>
          movies.find(movie => movie.id === id)
        )
        .filter(Boolean);

    continueRow.innerHTML =
      continueMovies.map(movieCard).join("");

  }

}


/* =====================================================
   OCENY
===================================================== */

function getMovieRating(movie) {

  const ratings = movie.ratings || [];

  if (!ratings.length) {
    return "—";
  }

  const total =
    ratings.reduce(
      (sum, rating) => sum + Number(rating),
      0
    );

  return (
    total / ratings.length
  ).toFixed(1);

}


function rateMovie(rating) {

  if (!currentUser) {

    toast("Zaloguj się, aby ocenić film.");
    showScreen(loginScreen);
    return;

  }

  if (!currentMovie) return;

  const movie =
    movies.find(
      movie => movie.id === currentMovie
    );

  if (!movie) return;

  if (!movie.ratings) {
    movie.ratings = [];
  }

  const data = getMyData();

  const previous =
    data.ratings[movie.id];

  if (previous) {

    const index =
      movie.ratings.indexOf(previous);

    if (index >= 0) {
      movie.ratings.splice(index, 1);
    }

  }

  movie.ratings.push(Number(rating));

  data.ratings[movie.id] =
    Number(rating);

  saveMovies();
  saveUserData();

  toast(`Oceniono film: ${rating}/10 ⭐`);

  renderMovies();

  openMovie(movie.id);

}


/* =====================================================
   DOSTĘP DO FILMU
===================================================== */

function hasMovieAccess(movie) {

  if (!movie) return false;

  if (movie.access === "Basic") {
    return true;
  }

  if (!currentUser) {
    return false;
  }

  const data = getMyData();

  if (!data) return false;

  const plan = data.premium.plan;

  if (plan === "Premium na zawsze") {
    return true;
  }

  if (movie.access === "Premium") {

    return (
      plan === "Premium" ||
      plan === "Premium 4K"
    );

  }

  if (movie.access === "Premium 4K") {

    return plan === "Premium 4K";

  }

  return false;
}


/* =====================================================
   OTWIERANIE FILMU
===================================================== */

async function openMovie(id) {

  const movie =
    movies.find(
      movie => movie.id === id
    );

  if (!movie) return;

  currentMovie = id;

  showScreen(movieScreen);

  $("movieTitle").textContent =
    movie.title;

  $("movieDescription").textContent =
    movie.description || "Brak opisu.";

  $("movieCategory").textContent =
    movie.category || "Inne";

  $("movieDuration").textContent =
    movie.duration || "—";

  $("movieQuality").textContent =
    movie.quality || "HD";

  $("movieRating").textContent =
    "⭐ " + getMovieRating(movie);


  const accessBadge =
    $("movieAccessBadge");

  if (accessBadge) {

    if (movie.access === "Basic") {

      accessBadge.textContent =
        "🆓 BASIC — dostępny dla każdego";

      accessBadge.className =
        "access-badge basic";

    } else {

      accessBadge.textContent =
        `💎 ${movie.access}`;

      accessBadge.className =
        "access-badge premium";

    }

  }


  renderComments(movie);


  const data = getMyData();

  if (data && !data.history.includes(id)) {

    data.history.unshift(id);

    data.history =
      data.history.slice(0, 50);

    saveUserData();

  }


  videoPlayer.pause();
  videoPlayer.removeAttribute("src");

  if (movie.videoData) {

    videoPlayer.src =
      movie.videoData;

  }

  videoPlayer.load();

  updatePlayButton(movie);

  renderMovies();

}


/* =====================================================
   ODTWARZANIE
===================================================== */

function updatePlayButton(movie) {

  const button =
    $("playMovieButton");

  if (!button) return;

  if (hasMovieAccess(movie)) {

    button.textContent =
      "▶ Odtwórz";

    button.disabled = false;

  } else {

    button.textContent =
      "🔒 Wymaga Premium";

    button.disabled = false;

  }

}


function playMovie() {

  if (!currentMovie) return;

  const movie =
    movies.find(
      movie => movie.id === currentMovie
    );

  if (!movie) return;

  if (!hasMovieAccess(movie)) {

    toast(
      movie.access === "Premium 4K"
        ? "Ten film wymaga Premium 4K."
        : "Ten film wymaga Premium."
    );

    showScreen(premiumScreen);
    return;
  }

  if (!movie.videoData) {

    toast(
      "Ten film nie ma jeszcze pliku wideo."
    );

    return;
  }

  videoPlayer.play().catch(() => {

    toast(
      "Naciśnij ponownie Odtwórz."
    );

  });

}


/* =====================================================
   ULUBIONE
===================================================== */

function toggleFavorite() {

  if (!currentUser) {

    toast("Zaloguj się, aby korzystać z biblioteki.");
    showScreen(loginScreen);
    return;

  }

  if (!currentMovie) return;

  const data = getMyData();

  const index =
    data.favorites.indexOf(currentMovie);

  if (index >= 0) {

    data.favorites.splice(index, 1);

    $("favoriteButton").textContent =
      "♡ Biblioteka";

    toast("Usunięto z biblioteki.");

  } else {

    data.favorites.push(currentMovie);

    $("favoriteButton").textContent =
      "♥ Biblioteka";

    toast("Dodano do biblioteki.");

  }

  saveUserData();

}


/* =====================================================
   KOMENTARZE
===================================================== */

function renderComments(movie) {

  const section =
    $("commentsSection");

  if (!section) return;

  const comments =
    movie.comments || [];

  let html = `

    <div class="comments-box">

      <h3>💬 Komentarze</h3>

  `;


  if (currentUser) {

    html += `

      <textarea
        id="commentInput"
        placeholder="Napisz komentarz..."></textarea>

      <button
        class="primary full"
        id="commentButton">

        Dodaj komentarz

      </button>

    `;

  } else {

    html += `

      <div class="comment-login">
        Zaloguj się, aby komentować.
      </div>

    `;

  }


  if (!comments.length) {

    html += `

      <div class="no-comments">
        Brak komentarzy. Bądź pierwszy!
      </div>

    `;

  } else {

    html += `<div class="comments-list">`;

    comments
      .slice()
      .reverse()
      .forEach(comment => {

        html += `

          <div class="comment">

            <div class="comment-user">
              👤 ${escapeHTML(comment.name)}
            </div>

            <div class="comment-text">
              ${escapeHTML(comment.text)}
            </div>

            <small>
              ${escapeHTML(comment.date)}
            </small>

          </div>

        `;

      });

    html += `</div>`;

  }


  html += `</div>`;

  section.innerHTML = html;


  $("commentButton")?.addEventListener(
    "click",
    addComment
  );

}


function addComment() {

  if (!currentUser || !currentMovie) {
    return;
  }

  const input =
    $("commentInput");

  const text =
    input?.value.trim();

  if (!text) {

    toast("Wpisz komentarz.");
    return;

  }

  const movie =
    movies.find(
      movie => movie.id === currentMovie
    );

  if (!movie) return;

  if (!movie.comments) {
    movie.comments = [];
  }

  movie.comments.push({

    name: currentUser.name,
    text,
    date: new Date().toLocaleDateString(
      "pl-PL"
    )

  });

  saveMovies();

  renderComments(movie);

  toast("Dodano komentarz.");

}


/* =====================================================
   BIBLIOTEKA
===================================================== */

function renderLibrary(type = "favorites") {

  const container =
    $("libraryMovies");

  if (!container) return;

  const data =
    getMyData();

  if (!data) {

    container.innerHTML = `
      <div class="empty-library">
        <div>🔐</div>
        <h3>Zaloguj się</h3>
        <p>
          Zaloguj się, aby zobaczyć bibliotekę.
        </p>
      </div>
    `;

    return;
  }


  let ids = [];

  if (type === "favorites") {
    ids = data.favorites;
  }

  if (type === "history") {
    ids = data.history;
  }

  if (type === "continue") {
    ids = data.history;
  }


  const list =
    ids
      .map(id =>
        movies.find(
          movie => movie.id === id
        )
      )
      .filter(Boolean);


  if (!list.length) {

    container.innerHTML = `
      <div class="empty-library">
        <div>🎬</div>
        <h3>Nic tutaj nie ma</h3>
        <p>
          Obejrzyj lub dodaj film do biblioteki.
        </p>
      </div>
    `;

    return;

  }


  container.innerHTML =
    list.map(movie => `

      <div
        class="library-item"
        data-movie-id="${escapeHTML(movie.id)}">

        <div
          class="mini-poster"
          style="${getMoviePoster(movie)}">

        </div>

        <div>

          <h3>
            ${escapeHTML(movie.title)}
          </h3>

          <p>
            ${escapeHTML(movie.category || "Inne")}
          </p>

          <p>
            ⭐ ${getMovieRating(movie)}
            · ${escapeHTML(movie.quality || "HD")}
          </p>

        </div>

      </div>

    `).join("");

}


/* =====================================================
   LOGOWANIE
===================================================== */

function login() {

  const login =
    $("loginEmail").value.trim();

  const password =
    $("loginPassword").value;


  if (!login || !password) {

    toast("Wpisz login i hasło.");
    return;

  }


  /* ADMIN */

  if (
    login === ADMIN_LOGIN &&
    password === ADMIN_PASSWORD
  ) {

    currentUser = {

      id: "admin",
      name: "Administrator",
      login: ADMIN_LOGIN,
      role: "admin"

    };

    saveSession();
    createUserData("admin");

    updateProfile();
    renderMovies();

    toast("👑 Zalogowano jako administrator.");

    showScreen(profileScreen);

    return;
  }


  /* ZWYKŁY UŻYTKOWNIK */

  const account =
    accounts.find(
      account =>
        account.login.toLowerCase() ===
        login.toLowerCase()
    );


  if (!account) {

    toast("Nie znaleziono takiego konta.");
    return;

  }


  if (account.password !== password) {

    toast("Nieprawidłowe hasło.");
    return;

  }


  currentUser = {

    id: account.id,
    name: account.name,
    login: account.login,
    role: "user"

  };

  saveSession();

  createUserData(account.id);

  updateProfile();
  renderMovies();

  toast("Zalogowano.");

  showScreen(profileScreen);

}


/* =====================================================
   REJESTRACJA
===================================================== */

function register() {

  const name =
    $("registerName").value.trim();

  const login =
    $("registerEmail").value.trim();

  const password =
    $("registerPassword").value;


  if (!name || !login || !password) {

    toast("Wypełnij wszystkie pola.");
    return;

  }


  if (login.toLowerCase() ===
      ADMIN_LOGIN.toLowerCase()) {

    toast("Ten login jest zarezerwowany.");
    return;

  }


  if (password.length < 4) {

    toast("Hasło musi mieć minimum 4 znaki.");
    return;

  }


  if (
    accounts.some(
      account =>
        account.login.toLowerCase() ===
        login.toLowerCase()
    )
  ) {

    toast("Takie konto już istnieje.");
    return;

  }


  const account = {

    id:
      "user_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2),

    name,
    login,
    password

  };


  accounts.push(account);

  saveAccounts();

  createUserData(account.id);


  currentUser = {

    id: account.id,
    name: account.name,
    login: account.login,
    role: "user"

  };

  saveSession();

  updateProfile();
  renderMovies();

  toast("Konto zostało utworzone.");

  showScreen(profileScreen);

}


/* =====================================================
   WYLOGOWANIE
===================================================== */

function logout() {

  currentUser = null;

  saveSession();

  updateProfile();
  renderMovies();

  toast("Wylogowano.");

  showScreen(loginScreen);

}


/* =====================================================
   RESET HASŁA
===================================================== */

function forgotPassword() {

  if (!currentUser) {

    toast(
      "To jest lokalna wersja demo. Zaloguj się ponownie."
    );

    return;

  }

  const newPassword =
    prompt("Podaj nowe hasło:");

  if (!newPassword) return;

  if (currentUser.role === "admin") {

    toast(
      "Hasło administratora w tej wersji jest ustawione w app.js."
    );

    return;

  }


  const account =
    accounts.find(
      account =>
        account.id === currentUser.id
    );

  if (!account) return;

  account.password =
    newPassword;

  saveAccounts();

  toast(
    "Hasło zmienione lokalnie."
  );

}


/* =====================================================
   PREMIUM
===================================================== */

function updatePremiumScreen() {

  const current =
    $("currentPlan");

  if (!current) return;

  if (!currentUser) {

    current.innerHTML = `

      <div class="plan-status">
        Zaloguj się, aby korzystać z Premium.
      </div>

    `;

    return;

  }


  const data =
    getMyData();

  current.innerHTML = `

    <div class="plan-status">

      💎 Twój plan:
      <strong>
        ${escapeHTML(data.premium.plan)}
      </strong>

    </div>

  `;

}


function buyPlan(plan) {

  if (!currentUser) {

    toast("Najpierw się zaloguj.");
    showScreen(loginScreen);
    return;

  }

  const data =
    getMyData();

  /*
    DEMO:
    Nie ma prawdziwej płatności.
  */

  data.premium.plan =
    plan;

  data.premium.expires =
    plan === "Premium na zawsze"
      ? null
      : Date.now() +
        30 * 24 * 60 * 60 * 1000;

  saveUserData();

  updatePremiumScreen();

  toast(
    `💎 Aktywowano ${plan} — DEMO`
  );

}


/* =====================================================
   VOUCHERY
===================================================== */

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

  if (!currentUser) {

    toast("Zaloguj się.");
    showScreen(loginScreen);
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
    $(inputId);

  const code =
    input.value.trim().toUpperCase();


  const voucher =
    voucherCodes[code];

  if (!voucher) {

    toast("Nieprawidłowy kod.");
    return;

  }


  const data =
    getMyData();

  data.premium.plan =
    voucher.plan;

  data.premium.expires =
    voucher.days === 0
      ? null
      : Date.now() +
        voucher.days *
        24 *
        60 *
        60 *
        1000;

  saveUserData();

  input.value = "";

  updatePremiumScreen();

  toast(
    `💎 Aktywowano ${voucher.plan}.`
  );

}


/* =====================================================
   WYSZUKIWANIE
===================================================== */

function searchMovies() {

  const query =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();


  if (!query) {

    $("searchResults").innerHTML =
      "";

    return;

  }


  const results =
    movies.filter(movie =>

      movie.title
        .toLowerCase()
        .includes(query)

      ||

      (movie.category || "")
        .toLowerCase()
        .includes(query)

      ||

      (movie.description || "")
        .toLowerCase()
        .includes(query)

    );


  $("searchResults").innerHTML =
    results.length

      ? results.map(movie => `

          <div
            class="result"
            data-movie-id="${escapeHTML(movie.id)}">

            <strong>
              ${escapeHTML(movie.title)}
            </strong>

            <p>
              ${escapeHTML(movie.category || "Inne")}
              · ${escapeHTML(movie.quality || "HD")}
              · ⭐ ${getMovieRating(movie)}
            </p>

          </div>

        `).join("")

      : `

        <div class="empty-library">
          🔎 Nie znaleziono filmu.
        </div>

      `;

}


/* =====================================================
   DODAWANIE FILMU
===================================================== */

let selectedPoster = null;
let selectedVideo = null;


function readFileAsDataURL(file) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.onload =
      () => resolve(reader.result);

    reader.onerror =
      reject;

    reader.readAsDataURL(file);

  });

}


/* PLAKAT */

async function handlePosterFile() {

  const input =
    $("addPosterFile");

  const file =
    input.files[0];

  if (!file) return;


  if (!file.type.startsWith("image/")) {

    toast("Wybierz zdjęcie.");
    return;

  }


  try {

    selectedPoster =
      await readFileAsDataURL(file);


    const preview =
      $("posterPreview");

    preview.classList.remove("hidden");

    preview.style.backgroundImage =
      `url("${selectedPoster}")`;

    preview.innerHTML = "";

    toast("🖼️ Plakat wybrany.");

  } catch {

    toast("Nie udało się wczytać zdjęcia.");

  }

}


/* FILM */

function handleVideoFile() {

  const input =
    $("addVideoFile");

  const file =
    input.files[0];

  if (!file) return;


  if (!file.type.startsWith("video/")) {

    toast("Wybierz plik wideo.");
    return;

  }


  selectedVideo = file;


  $("videoFileName").textContent =
    `🎬 ${file.name}`;


  toast("Film został wybrany.");

}


/* DODAJ */

async function addMovie() {

  if (!isAdmin()) {

    toast("Tylko administrator może dodawać filmy.");
    showScreen(loginScreen);
    return;

  }


  const title =
    $("addTitle").value.trim();

  const category =
    $("addCategory").value;

  const access =
    $("addAccess").value;

  const quality =
    $("addQuality").value;

  const duration =
    $("addDuration").value.trim();

  const description =
    $("addDescription").value.trim();


  if (!title) {

    toast("Podaj tytuł filmu.");
    return;

  }

  if (!category) {

    toast("Wybierz kategorię.");
    return;

  }

  if (!selectedPoster) {

    toast("Wybierz plakat filmu.");
    return;

  }

  if (!selectedVideo) {

    toast("Wybierz plik filmu.");
    return;

  }


  const maxVideoSize =
    80 * 1024 * 1024;


  if (selectedVideo.size > maxVideoSize) {

    toast(
      "Film jest za duży. Maksymalnie 80 MB w tej wersji."
    );

    return;

  }


  toast("Przygotowywanie filmu...");


  try {

    const videoData =
      await readFileAsDataURL(
        selectedVideo
      );


    const movie = {

      id:
        "movie_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2),

      title,
      category,
      access,
      quality,

      poster:
        selectedPoster,

      videoData,

      duration:
        duration || "—",

      description:
        description || "Brak opisu.",

      ratings: [],
      comments: [],

      createdAt:
        Date.now()

    };


    movies.unshift(movie);

    saveMovies();

    resetAddForm();

    renderMovies();

    toast(
      "🎬 Film został dodany!"
    );

    showScreen(
      document.getElementById("homePage")
        ? null
        : addScreen
    );

    hideAllScreens();

  } catch (error) {

    console.error(error);

    toast(
      "Nie udało się dodać filmu."
    );

  }

}


/* =====================================================
   RESET FORMULARZA
===================================================== */

function resetAddForm() {

  $("addTitle").value = "";
  $("addCategory").value = "";
  $("addAccess").value = "Basic";
  $("addQuality").value = "HD";
  $("addDuration").value = "";
  $("addDescription").value = "";

  $("addPosterFile").value = "";
  $("addVideoFile").value = "";

  $("videoFileName").textContent = "";

  selectedPoster = null;
  selectedVideo = null;

  const preview =
    $("posterPreview");

  preview.style.backgroundImage =
    "";

  preview.classList.add("hidden");

}


/* =====================================================
   KATEGORIE
===================================================== */

function filterCategory(category) {

  if (category === "Wszystkie") {

    renderMovies(movies);
    return;

  }


  const filtered =
    movies.filter(
      movie =>
        movie.category === category
    );


  renderMovies(filtered);

}


/* =====================================================
   BEZPIECZNY TEKST
===================================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   EVENTY
===================================================== */

function setupEvents() {


  /* PROFILE */

  $("profileTopButton")
    ?.addEventListener(
      "click",
      () => showScreen(profileScreen)
    );

  $("navProfile")
    ?.addEventListener(
      "click",
      () => showScreen(profileScreen)
    );


  $("profileLogin")
    ?.addEventListener(
      "click",
      () => showScreen(loginScreen)
    );


  $("profileLogout")
    ?.addEventListener(
      "click",
      logout
    );


  $("profileReset")
    ?.addEventListener(
      "click",
      forgotPassword
    );


  $("profileLibrary")
    ?.addEventListener(
      "click",
      () => {

        renderLibrary("favorites");
        showScreen(libraryScreen);

      }
    );


  $("profilePremium")
    ?.addEventListener(
      "click",
      () => {

        updatePremiumScreen();
        showScreen(premiumScreen);

      }
    );


  /* LOGIN */

  $("loginButton")
    ?.addEventListener(
      "click",
      login
    );


  $("registerButton")
    ?.addEventListener(
      "click",
      () => showScreen(registerScreen)
    );


  $("forgotButton")
    ?.addEventListener(
      "click",
      forgotPassword
    );


  $("createAccountButton")
    ?.addEventListener(
      "click",
      register
    );


  $("goLoginButton")
    ?.addEventListener(
      "click",
      () => showScreen(loginScreen)
    );


  /* NAV */

  $("navHome")
    ?.addEventListener(
      "click",
      () => {

        hideAllScreens();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );


  $("navSearch")
    ?.addEventListener(
      "click",
      () => showScreen(searchScreen)
    );


  $("navLibrary")
    ?.addEventListener(
      "click",
      () => {

        renderLibrary("favorites");
        showScreen(libraryScreen);

      }
    );


  $("navAdd")
    ?.addEventListener(
      "click",
      () => {

        if (!isAdmin()) {

          toast(
            "Tylko administrator ma dostęp."
          );

          return;

        }

        showScreen(addScreen);

      }
    );


  /* BACK */

  $("movieBack")
    ?.addEventListener(
      "click",
      () => {

        videoPlayer.pause();
        showScreen(null);

      }
    );


  $("loginBack")
    ?.addEventListener(
      "click",
      () => showScreen(profileScreen)
    );


  $("registerBack")
    ?.addEventListener(
      "click",
      () => showScreen(loginScreen)
    );


  $("profileBack")
    ?.addEventListener(
      "click",
      () => showScreen(null)
    );


  $("libraryBack")
    ?.addEventListener(
      "click",
      () => showScreen(profileScreen)
    );


  $("premiumBack")
    ?.addEventListener(
      "click",
      () => showScreen(profileScreen)
    );


  $("searchBack")
    ?.addEventListener(
      "click",
      () => showScreen(null)
    );


  $("addBack")
    ?.addEventListener(
      "click",
      () => showScreen(null)
    );


  /* HERO */

  $("heroWatch")
    ?.addEventListener(
      "click",
      () => {

        if (movies.length) {

          openMovie(
            movies[0].id
          );

        } else {

          toast(
            "Biblioteka jest jeszcze pusta."
          );

        }

      }
    );


  $("continueMore")
    ?.addEventListener(
      "click",
      () => {

        renderLibrary("continue");
        showScreen(libraryScreen);

      }
    );


  $("premiumHomeButton")
    ?.addEventListener(
      "click",
      () => {

        updatePremiumScreen();
        showScreen(premiumScreen);

      }
    );


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


  /* RATING */

  document
    .querySelectorAll(
      ".rating button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          rateMovie(
            button.dataset.rating
          );

        }
      );

    });


  /* FAVORITE */

  $("favoriteButton")
    ?.addEventListener(
      "click",
      toggleFavorite
    );


  /* PLAY */

  $("playMovieButton")
    ?.addEventListener(
      "click",
      playMovie
    );


  /* SEARCH */

  $("searchInput")
    ?.addEventListener(
      "input",
      searchMovies
    );


  /* LIBRARY */

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


  /* PREMIUM */

  document
    .querySelectorAll(
      "[data-buy]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          buyPlan(
            button.dataset.buy
          );

        }
      );

    });


  /* VOUCHERS */

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


  /* POSTER */

  $("addPosterFile")
    ?.addEventListener(
      "change",
      handlePosterFile
    );


  /* VIDEO */

  $("addVideoFile")
    ?.addEventListener(
      "change",
      handleVideoFile
    );


  /* ADD */

  $("addMovieButton")
    ?.addEventListener(
      "click",
      addMovie
    );


  /* KLIKAN NA FILMY */

  document.addEventListener(
    "click",
    event => {

      const target =
        event.target.closest(
          "[data-movie-id]"
        );

      if (!target) return;

      const id =
        target.dataset.movieId;

      if (id) {

        openMovie(id);

      }

    }
  );


  /* ENTER LOGIN */

  [
    $("loginEmail"),
    $("loginPassword")
  ].forEach(input => {

    input?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          login();
        }

      }
    );

  });


  /* ENTER REGISTER */

  $("registerPassword")
    ?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          register();
        }

      }
    );

}


/* =====================================================
   START
===================================================== */

function init() {

  startLoading();

  updateProfile();

  renderMovies();

  setupEvents();

}


/* =====================================================
   START APP
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  init
);
