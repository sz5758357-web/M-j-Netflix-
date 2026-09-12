"use strict";

/* =========================================================
   FILMAPP
   SYSTEM KONT ADMIN / USER
   WERSJA DEMO - localStorage
   ========================================================= */


/* =========================================================
   FILMY STARTOWE
   ========================================================= */

const movies = [
  {
    id: "fight",
    title: "Ostatnia walka",
    category: "Sport / Walki",
    rating: 8.7,
    duration: "1h 48min",
    quality: "4K",
    description: "Zawodnik dostaje ostatnią szansę na powrót na szczyt.",
    poster: "poster1",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },

  {
    id: "horror",
    title: "Noc bez końca",
    category: "Horror",
    rating: 8.1,
    duration: "1h 36min",
    quality: "HD",
    description: "Grupa przyjaciół odkrywa miejsce, z którego nie da się łatwo wydostać.",
    poster: "poster2",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },

  {
    id: "action",
    title: "Ostatnia misja",
    category: "Akcja",
    rating: 9.0,
    duration: "2h 04min",
    quality: "4K",
    description: "Agent otrzymuje zadanie, które zmieni całe jego życie.",
    poster: "poster3",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },

  {
    id: "space",
    title: "Poza gwiazdami",
    category: "Sci-Fi",
    rating: 8.9,
    duration: "2h 12min",
    quality: "4K",
    description: "Załoga statku kosmicznego odkrywa coś, czego nie powinno być w kosmosie.",
    poster: "poster4",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },

  {
    id: "shadow",
    title: "Cień miasta",
    category: "Thriller",
    rating: 8.5,
    duration: "1h 55min",
    quality: "4K",
    description: "Tajemnicze wydarzenia prowadzą detektywa do ukrytej prawdy.",
    poster: "poster5",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },

  {
    id: "comedy",
    title: "Nieplanowana podróż",
    category: "Komedia",
    rating: 7.9,
    duration: "1h 42min",
    quality: "HD",
    description: "Zwykła podróż zamienia się w serię absurdalnych wydarzeń.",
    poster: "poster6",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  }
];


/* =========================================================
   DOM
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   POMOCNICZE
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function toast(message) {
  const element = $("toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.filmappToastTimer);

  window.filmappToastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}


function randomId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}


/* =========================================================
   HASH HASŁA
   Nie zapisujemy hasła jako zwykły tekst.
   Nadal NIE jest to pełne zabezpieczenie produkcyjne.
   ========================================================= */

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}


/* =========================================================
   BAZA DEMO
   ========================================================= */

const DEFAULT_DB = {
  accounts: [],
  currentUserId: null,
  customMovies: [],
  comments: {},
  usedVouchers: [],
  progress: {}
};


function loadDB() {
  try {
    const saved = localStorage.getItem("filmapp_database");

    if (!saved) {
      return JSON.parse(JSON.stringify(DEFAULT_DB));
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_DB,
      ...parsed,
      accounts: Array.isArray(parsed.accounts)
        ? parsed.accounts
        : [],

      customMovies: Array.isArray(parsed.customMovies)
        ? parsed.customMovies
        : [],

      comments: parsed.comments || {},

      usedVouchers: Array.isArray(parsed.usedVouchers)
        ? parsed.usedVouchers
        : [],

      progress: parsed.progress || {}
    };
  } catch (error) {
    console.error(error);

    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}


let db = loadDB();


function saveDB() {
  try {
    localStorage.setItem(
      "filmapp_database",
      JSON.stringify(db)
    );
  } catch (error) {
    console.error(error);
    toast("Nie udało się zapisać danych.");
  }
}


/* =========================================================
   AKTUALNY UŻYTKOWNIK
   ========================================================= */

function currentUser() {
  if (!db.currentUserId) {
    return null;
  }

  return db.accounts.find(
    account => account.id === db.currentUserId
  ) || null;
}


function isLoggedIn() {
  return !!currentUser();
}


function isAdmin() {
  const user = currentUser();

  return !!user && user.role === "admin";
}


/* =========================================================
   DANE UŻYTKOWNIKA
   ========================================================= */

function createUserData() {
  return {
    favorites: [],
    history: [],
    ratings: {},
    premium: {
      plan: "Free",
      expires: null
    }
  };
}


function ensureUserData(user) {
  if (!user) return;

  if (!Array.isArray(user.favorites)) {
    user.favorites = [];
  }

  if (!Array.isArray(user.history)) {
    user.history = [];
  }

  if (!user.ratings || typeof user.ratings !== "object") {
    user.ratings = {};
  }

  if (!user.premium) {
    user.premium = {
      plan: "Free",
      expires: null
    };
  }
}


function saveCurrentUser() {
  const user = currentUser();

  if (!user) return;

  ensureUserData(user);
  saveDB();
}


/* =========================================================
   FILMY
   ========================================================= */

function allMovies() {
  return [
    ...movies,
    ...db.customMovies
  ];
}


function getMovie(id) {
  return allMovies().find(
    movie => movie.id === id
  );
}


/* =========================================================
   EKRANY
   ========================================================= */

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.add("hidden");
    });

  const screen = $(id);

  if (!screen) {
    console.error("Brak ekranu:", id);
    return;
  }

  screen.classList.remove("hidden");
  screen.scrollTop = 0;

  document.body.style.overflow = "hidden";
}


function closeScreen() {
  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.add("hidden");
    });

  const video = $("videoPlayer");

  if (video) {
    video.pause();
  }

  document.body.style.overflow = "";
}


function goHome() {
  closeScreen();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setActiveNav("navHome");
}


function setActiveNav(id) {
  document
    .querySelectorAll(".nav")
    .forEach(nav => nav.classList.remove("active"));

  $(id)?.classList.add("active");
}


/* =========================================================
   KARTY
   ========================================================= */

function createMovieCard(movie) {
  return `
    <article
      class="movie-card"
      data-movie-id="${escapeHTML(movie.id)}"
      role="button"
      tabindex="0">

      <div class="poster ${escapeHTML(movie.poster || "poster1")}">

        <span class="quality">
          ${escapeHTML(movie.quality || "HD")}
        </span>

        <span class="poster-title">
          ${escapeHTML(movie.title)}
        </span>

        <span class="play">
          ▶
        </span>

      </div>

      <h3>
        ${escapeHTML(movie.title)}
      </h3>

      <p>
        ⭐ ${Number(movie.rating || 0).toFixed(1)}
        · ${escapeHTML(movie.duration || "—")}
      </p>

    </article>
  `;
}


/* =========================================================
   RENDER FILMÓW
   ========================================================= */

function renderMovies(list = allMovies()) {
  const movieRow = $("movieRow");
  const topRow = $("topRow");
  const continueRow = $("continueRow");

  if (!movieRow || !topRow || !continueRow) {
    return;
  }

  movieRow.innerHTML = list
    .slice(0, 10)
    .map(createMovieCard)
    .join("");

  const top = [...allMovies()]
    .sort(
      (a, b) =>
        Number(b.rating || 0) -
        Number(a.rating || 0)
    )
    .slice(0, 10);

  topRow.innerHTML = top
    .map(createMovieCard)
    .join("");

  const user = currentUser();

  let continueMovies = [];

  if (user) {
    continueMovies = user.history
      .map(id => getMovie(id))
      .filter(Boolean);
  }

  if (continueMovies.length) {
    continueRow.innerHTML = continueMovies
      .map(createMovieCard)
      .join("");
  } else {
    continueRow.innerHTML = allMovies()
      .slice(0, 5)
      .map(createMovieCard)
      .join("");
  }
}


/* =========================================================
   FILM
   ========================================================= */

let currentMovie = null;


function openMovie(id) {
  const movie = getMovie(id);

  if (!movie) {
    toast("Nie znaleziono filmu.");
    return;
  }

  currentMovie = movie;

  $("movieTitle").textContent = movie.title;
  $("movieDescription").textContent = movie.description;
  $("movieCategory").textContent = movie.category;

  $("movieQuality").textContent =
    movie.quality || "HD";

  $("movieRating").textContent =
    `⭐ ${Number(movie.rating || 0).toFixed(1)}`;

  $("movieDuration").textContent =
    movie.duration || "—";

  const video = $("videoPlayer");

  if (video) {
    video.pause();
    video.removeAttribute("src");

    if (movie.video) {
      video.src = movie.video;
      video.load();

      video.onloadedmetadata = () => {
        const user = currentUser();

        if (!user) return;

        const saved =
          db.progress[user.id]?.[movie.id];

        if (
          saved &&
          saved > 5 &&
          saved < video.duration - 5
        ) {
          video.currentTime = saved;
        }
      };
    }
  }

  updateFavoriteButton();
  renderRatingButtons();
  renderComments();
  renderAdminMovieTools();

  showScreen("movieScreen");
}


/* =========================================================
   ODTWARZANIE + POSTĘP
   ========================================================= */

function playMovie() {
  if (!currentMovie) {
    toast("Najpierw wybierz film.");
    return;
  }

  if (!isLoggedIn()) {
    toast("Zaloguj się, aby oglądać film.");

    setTimeout(openLogin, 600);
    return;
  }

  const video = $("videoPlayer");

  if (!video || !currentMovie.video) {
    toast("Ten film nie ma materiału wideo.");
    return;
  }

  video.play()
    .then(() => {
      addToHistory(currentMovie.id);
      toast("Odtwarzanie ▶");
    })
    .catch(error => {
      console.error(error);
      toast("Kliknij ponownie, aby rozpocząć.");
    });
}


function saveProgress() {
  const user = currentUser();
  const video = $("videoPlayer");

  if (
    !user ||
    !currentMovie ||
    !video ||
    !Number.isFinite(video.currentTime)
  ) {
    return;
  }

  if (!db.progress[user.id]) {
    db.progress[user.id] = {};
  }

  db.progress[user.id][currentMovie.id] =
    video.currentTime;

  saveDB();
}


function addToHistory(movieId) {
  const user = currentUser();

  if (!user) return;

  user.history = user.history.filter(
    id => id !== movieId
  );

  user.history.unshift(movieId);

  if (user.history.length > 50) {
    user.history.length = 50;
  }

  saveCurrentUser();
  renderMovies();
}


/* =========================================================
   BIBLIOTEKA
   ========================================================= */

function toggleFavorite() {
  const user = currentUser();

  if (!user) {
    toast("Zaloguj się, aby korzystać z biblioteki.");
    setTimeout(openLogin, 600);
    return;
  }

  const index =
    user.favorites.indexOf(currentMovie.id);

  if (index === -1) {
    user.favorites.push(currentMovie.id);
    toast("Dodano do biblioteki ❤️");
  } else {
    user.favorites.splice(index, 1);
    toast("Usunięto z biblioteki.");
  }

  saveCurrentUser();
  updateFavoriteButton();
}


function updateFavoriteButton() {
  const button = $("favoriteButton");

  if (!button || !currentMovie) return;

  const user = currentUser();

  if (!user) {
    button.textContent = "♡ Biblioteka";
    return;
  }

  button.textContent =
    user.favorites.includes(currentMovie.id)
      ? "♥ W bibliotece"
      : "♡ Biblioteka";
}


function openLibrary() {
  if (!isLoggedIn()) {
    toast("Zaloguj się, aby zobaczyć bibliotekę.");
    setTimeout(openLogin, 600);
    return;
  }

  setActiveNav("navLibrary");

  showScreen("libraryScreen");

  showLibrary("favorites");
}


function showLibrary(type) {
  const container = $("libraryMovies");

  const user = currentUser();

  if (!container || !user) return;

  let ids = [];

  if (type === "favorites") {
    ids = user.favorites;
  }

  if (type === "history") {
    ids = user.history;
  }

  if (type === "continue") {
    ids = user.history.filter(id => {
      const progress =
        db.progress[user.id]?.[id] || 0;

      return progress > 0;
    });
  }

  const selected = ids
    .map(getMovie)
    .filter(Boolean);

  if (!selected.length) {
    container.innerHTML = `
      <div class="empty-library">
        <div>♡</div>

        <h2>Biblioteka jest pusta</h2>

        <p>
          Filmy, które dodasz, pojawią się tutaj.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = selected
    .map(movie => `
      <div
        class="library-item"
        data-movie-id="${escapeHTML(movie.id)}">

        <div
          class="mini-poster ${escapeHTML(movie.poster || "poster1")}">
        </div>

        <div>

          <h3>
            ${escapeHTML(movie.title)}
          </h3>

          <p>
            ${escapeHTML(movie.category)}
          </p>

          <p>
            ⭐ ${Number(movie.rating || 0).toFixed(1)}
            · ${escapeHTML(movie.duration || "—")}
          </p>

        </div>

      </div>
    `)
    .join("");
}


/* =========================================================
   OCENY
   ========================================================= */

function rateMovie(number) {
  const user = currentUser();

  if (!user) {
    toast("Zaloguj się, aby oceniać.");
    setTimeout(openLogin, 600);
    return;
  }

  if (!currentMovie) return;

  const rating =
    Math.max(1, Math.min(10, Number(number)));

  user.ratings[currentMovie.id] = rating;

  saveCurrentUser();

  renderRatingButtons();

  toast(`Twoja ocena: ${rating}/10 ⭐`);
}


function renderRatingButtons() {
  const user = currentUser();

  const rating =
    user?.ratings?.[currentMovie?.id] || 0;

  document
    .querySelectorAll("[data-rating]")
    .forEach(button => {

      const value =
        Number(button.dataset.rating);

      button.style.opacity =
        !rating || value <= rating
          ? "1"
          : ".45";
    });
}


/* =========================================================
   KATEGORIE
   ========================================================= */

function filterMovies(category) {
  setActiveNav("navHome");

  if (category === "Wszystkie") {
    renderMovies();
    goHome();
    return;
  }

  const filtered =
    allMovies().filter(
      movie => movie.category === category
    );

  const movieRow = $("movieRow");

  if (!movieRow) return;

  movieRow.innerHTML =
    filtered.length
      ? filtered.map(createMovieCard).join("")
      : `
        <p>
          Brak filmów w kategorii
          „${escapeHTML(category)}”.
        </p>
      `;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   SZUKANIE
   ========================================================= */

function openSearch() {
  setActiveNav("navSearch");

  showScreen("searchScreen");

  setTimeout(() => {
    $("searchInput")?.focus();
  }, 250);
}


function searchMovies() {
  const input = $("searchInput");
  const results = $("searchResults");

  if (!input || !results) return;

  const query =
    input.value.toLowerCase().trim();

  if (!query) {
    results.innerHTML = "";
    return;
  }

  const found = allMovies().filter(movie =>
    movie.title.toLowerCase().includes(query) ||
    movie.category.toLowerCase().includes(query) ||
    movie.description.toLowerCase().includes(query)
  );

  if (!found.length) {
    results.innerHTML = `
      <div class="result">
        Nie znaleziono filmu.
      </div>
    `;

    return;
  }

  results.innerHTML = found
    .map(movie => `
      <div
        class="result"
        data-movie-id="${escapeHTML(movie.id)}">

        <strong>
          ${escapeHTML(movie.title)}
        </strong>

        <p>
          ${escapeHTML(movie.category)}
          · ⭐ ${Number(movie.rating || 0).toFixed(1)}
          · ${escapeHTML(movie.duration || "—")}
        </p>

      </div>
    `)
    .join("");
}


/* =========================================================
   REJESTRACJA
   ========================================================= */

async function createAccount() {
  const name =
    $("registerName").value.trim();

  const email =
    $("registerEmail")
      .value
      .trim()
      .toLowerCase();

  const password =
    $("registerPassword").value;

  if (!name || !email || !password) {
    toast("Wypełnij wszystkie pola.");
    return;
  }

  if (
    !email.includes("@") ||
    !email.includes(".")
  ) {
    toast("Podaj prawidłowy e-mail.");
    return;
  }

  if (password.length < 8) {
    toast("Hasło musi mieć minimum 8 znaków.");
    return;
  }

  const exists = db.accounts.some(
    account =>
      account.email.toLowerCase() === email
  );

  if (exists) {
    toast("Konto z tym e-mailem już istnieje.");
    return;
  }

  const passwordHash =
    await hashPassword(password);

  const account = {
    id: randomId("user"),
    name,
    email,
    passwordHash,
    role: "user",
    ...createUserData()
  };

  db.accounts.push(account);

  db.currentUserId = account.id;

  saveDB();

  $("registerName").value = "";
  $("registerEmail").value = "";
  $("registerPassword").value = "";

  toast("Konto zostało utworzone 🎉");

  setTimeout(openProfile, 500);
}


/* =========================================================
   LOGOWANIE
   ========================================================= */

async function login() {
  const email =
    $("loginEmail")
      .value
      .trim()
      .toLowerCase();

  const password =
    $("loginPassword").value;

  if (!email || !password) {
    toast("Wpisz e-mail i hasło.");
    return;
  }

  const account =
    db.accounts.find(
      user =>
        user.email.toLowerCase() === email
    );

  if (!account) {
    toast("Nieprawidłowy e-mail lub hasło.");
    return;
  }

  const passwordHash =
    await hashPassword(password);

  if (passwordHash !== account.passwordHash) {
    toast("Nieprawidłowy e-mail lub hasło.");
    return;
  }

  ensureUserData(account);

  db.currentUserId = account.id;

  saveDB();

  $("loginEmail").value = "";
  $("loginPassword").value = "";

  if (account.role === "admin") {
    toast("Zalogowano jako administrator 👑");
  } else {
    toast("Zalogowano 👋");
  }

  updateProfile();
  updateAdminUI();

  setTimeout(openProfile, 500);
}


/* =========================================================
   PROFIL
   ========================================================= */

function openProfile() {
  setActiveNav("navProfile");

  updateProfile();
  updateAdminUI();

  showScreen("profileScreen");
}


function updateProfile() {
  const user = currentUser();

  if (user) {
    $("profileName").textContent =
      user.name;

    $("profileEmail").textContent =
      user.email;

    $("profileLoggedOut")
      ?.classList.add("hidden");

    $("profileLoggedIn")
      ?.classList.remove("hidden");

    addAdminProfileButton();
  } else {
    $("profileName").textContent =
      "Gość";

    $("profileEmail").textContent =
      "Nie jesteś zalogowany";

    $("profileLoggedOut")
      ?.classList.remove("hidden");

    $("profileLoggedIn")
      ?.classList.add("hidden");

    removeAdminProfileButton();
  }
}


function openLogin() {
  showScreen("loginScreen");
}


function openRegister() {
  showScreen("registerScreen");
}


/* =========================================================
   RESET HASŁA
   ========================================================= */

function forgotPassword() {
  if (!isLoggedIn()) {
    toast(
      "Reset hasła przez e-mail wymaga backendu."
    );

    return;
  }

  const user = currentUser();

  const oldPassword =
    prompt("Podaj obecne hasło:");

  if (!oldPassword) return;

  hashPassword(oldPassword)
    .then(oldHash => {

      if (oldHash !== user.passwordHash) {
        toast("Nieprawidłowe obecne hasło.");
        return;
      }

      const newPassword =
        prompt("Podaj nowe hasło:");

      if (!newPassword) return;

      if (newPassword.length < 8) {
        toast(
          "Nowe hasło musi mieć minimum 8 znaków."
        );

        return;
      }

      return hashPassword(newPassword);
    })
    .then(newHash => {

      if (!newHash) return;

      user.passwordHash = newHash;

      saveCurrentUser();

      toast("Hasło zostało zmienione 🔐");
    });
}


/* =========================================================
   WYLOGOWANIE
   ========================================================= */

function logout() {
  db.currentUserId = null;

  saveDB();

  updateProfile();
  updateAdminUI();

  toast("Wylogowano.");

  setTimeout(() => {
    closeScreen();
    setActiveNav("navHome");
    renderMovies();
  }, 500);
}


/* =========================================================
   PREMIUM
   ========================================================= */

function openPremium() {
  updatePremium();
  showScreen("premiumScreen");
}


function updatePremium() {
  const element = $("currentPlan");

  const user = currentUser();

  if (!element || !user) {
    if (element) {
      element.innerHTML = `
        <div class="plan-status">
          Zaloguj się, aby korzystać z Premium.
        </div>
      `;
    }

    return;
  }

  ensureUserData(user);

  const premium = user.premium;

  if (premium.plan === "Free") {
    element.innerHTML = `
      <div class="plan-status">
        Aktualny plan:
        <strong>Free</strong>
      </div>
    `;

    return;
  }

  if (premium.expires === null) {
    element.innerHTML = `
      <div class="plan-status">
        💎
        <strong>
          ${escapeHTML(premium.plan)}
        </strong>
        <br>
        Aktywny bezterminowo.
      </div>
    `;

    return;
  }

  const expires =
    Number(premium.expires);

  if (
    !Number.isFinite(expires) ||
    expires <= Date.now()
  ) {
    user.premium = {
      plan: "Free",
      expires: null
    };

    saveCurrentUser();

    updatePremium();

    return;
  }

  const date =
    new Date(expires);

  element.innerHTML = `
    <div class="plan-status">
      💎
      <strong>
        ${escapeHTML(premium.plan)}
      </strong>
      <br>
      Aktywny do:
      ${date.toLocaleDateString("pl-PL")}
    </div>
  `;
}


function buyPlan(plan, days) {
  const user = currentUser();

  if (!user) {
    toast("Najpierw zaloguj się.");
    setTimeout(openLogin, 600);
    return;
  }

  /*
    DEMO.
    Tutaj NIE ma prawdziwej płatności.
  */

  user.premium =
    days === 0
      ? {
          plan,
          expires: null
        }
      : {
          plan,
          expires:
            Date.now() +
            days * 86400000
        };

  saveCurrentUser();

  updatePremium();

  toast(
    `${plan} został aktywowany 💎`
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
  const user = currentUser();

  if (!user) {
    toast("Najpierw zaloguj się.");
    setTimeout(openLogin, 600);
    return;
  }

  let input = null;

  if (type === "premium") {
    input = $("premiumCode");
  }

  if (type === "4k") {
    input = $("premium4kCode");
  }

  if (type === "lifetime") {
    input = $("lifetimeCode");
  }

  if (!input) {
    toast("Nie znaleziono pola kodu.");
    return;
  }

  const code =
    input.value.trim().toUpperCase();

  if (!code) {
    toast("Wpisz kod bonu.");
    return;
  }

  const voucher =
    voucherCodes[code];

  if (!voucher) {
    toast("Nieprawidłowy kod.");
    return;
  }

  if (db.usedVouchers.includes(code)) {
    toast("Ten bon został już wykorzystany.");
    return;
  }

  if (
    type === "premium" &&
    voucher.plan !== "Premium"
  ) {
    toast("Ten kod jest do innego pakietu.");
    return;
  }

  if (
    type === "4k" &&
    voucher.plan !== "Premium 4K"
  ) {
    toast("Ten kod jest do innego pakietu.");
    return;
  }

  if (
    type === "lifetime" &&
    voucher.plan !== "Premium na zawsze"
  ) {
    toast("Ten kod jest do innego pakietu.");
    return;
  }

  user.premium =
    voucher.days === 0
      ? {
          plan: voucher.plan,
          expires: null
        }
      : {
          plan: voucher.plan,
          expires:
            Date.now() +
            voucher.days * 86400000
        };

  db.usedVouchers.push(code);

  saveDB();

  input.value = "";

  updatePremium();

  toast("Bon został aktywowany 🎉");
}


/* =========================================================
   DODAWANIE FILMÓW
   TYLKO ADMIN
   ========================================================= */

function openAdd() {
  if (!isLoggedIn()) {
    toast("Tylko administrator może dodawać filmy.");
    setTimeout(openLogin, 600);
    return;
  }

  if (!isAdmin()) {
    toast("Nie masz uprawnień administratora.");
    return;
  }

  showScreen("addScreen");
}


function addMovie() {
  if (!isAdmin()) {
    toast("Brak uprawnień administratora.");
    return;
  }

  const title =
    $("addTitle").value.trim();

  const description =
    $("addDescription").value.trim();

  const category =
    $("addCategory").value.trim() ||
    "Inne";

  const duration =
    $("addDuration").value.trim() ||
    "—";

  const quality =
    $("addQuality").value.trim() ||
    "HD";

  const video =
    $("addVideo").value.trim();

  if (!title || !description) {
    toast("Podaj tytuł i opis.");
    return;
  }

  if (
    video &&
    !/^https?:\/\//i.test(video)
  ) {
    toast(
      "Adres filmu musi zaczynać się od http:// lub https://"
    );

    return;
  }

  const newMovie = {
    id: randomId("movie"),
    title,
    category,
    rating: 0,
    duration,
    quality,
    description,
    poster: "poster4",
    video,
    addedBy: currentUser().id
  };

  db.customMovies.push(newMovie);

  saveDB();

  renderMovies();

  clearAddForm();

  toast("Film został dodany 🎬");

  setTimeout(closeScreen, 600);
}


function clearAddForm() {
  $("addTitle").value = "";
  $("addDescription").value = "";
  $("addCategory").value = "";
  $("addDuration").value = "";
  $("addQuality").value = "";
  $("addVideo").value = "";
}


/* =========================================================
   USUWANIE FILMU
   ========================================================= */

function deleteMovie(movieId) {
  if (!isAdmin()) {
    toast("Brak uprawnień.");
    return;
  }

  const movie =
    db.customMovies.find(
      item => item.id === movieId
    );

  if (!movie) {
    toast(
      "Tego filmu nie można usunąć."
    );

    return;
  }

  const confirmed =
    confirm(
      `Usunąć film „${movie.title}”?`
    );

  if (!confirmed) return;

  db.customMovies =
    db.customMovies.filter(
      item => item.id !== movieId
    );

  saveDB();

  if (currentMovie?.id === movieId) {
    currentMovie = null;
    closeScreen();
  }

  renderMovies();

  toast("Film został usunięty.");
}


/* =========================================================
   PANEL ADMINA W PROFILU
   ========================================================= */

function addAdminProfileButton() {
  if (!isAdmin()) {
    removeAdminProfileButton();
    return;
  }

  const menu =
    document.querySelector(".profile-menu");

  if (!menu) return;

  if ($("adminPanelButton")) return;

  const button =
    document.createElement("button");

  button.id = "adminPanelButton";
  button.innerHTML =
    "👑 Panel administratora";

  button.addEventListener(
    "click",
    openAdminPanel
  );

  menu.prepend(button);
}


function removeAdminProfileButton() {
  $("adminPanelButton")?.remove();
}


function updateAdminUI() {
  const addButton = $("navAdd");

  if (!addButton) return;

  if (isAdmin()) {
    addButton.style.display = "flex";
  } else {
    addButton.style.display = "none";
  }
}


/* =========================================================
   PANEL ADMINA
   ========================================================= */

function openAdminPanel() {
  if (!isAdmin()) {
    toast("Brak uprawnień.");
    return;
  }

  showAdminPanel();

  showScreen("profileScreen");
}


function showAdminPanel() {
  const loggedIn =
    $("profileLoggedIn");

  if (!loggedIn) return;

  let panel =
    $("adminPanel");

  if (!panel) {
    panel =
      document.createElement("div");

    panel.id = "adminPanel";

    panel.style.marginTop = "20px";
    panel.style.padding = "18px";
    panel.style.borderRadius = "18px";
    panel.style.background = "#15101d";
    panel.style.textAlign = "left";

    loggedIn.appendChild(panel);
  }

  panel.innerHTML = `
    <h2>
      👑 Panel administratora
    </h2>

    <p style="color:#918899">
      Tylko administrator może zarządzać filmami.
    </p>

    <button
      class="primary full"
      id="adminAddMovieButton">
      ＋ Dodaj film
    </button>

    <h3 style="margin-top:25px">
      Twoje filmy
    </h3>

    <div id="adminMovieList">
      ${db.customMovies.length
        ? db.customMovies.map(movie => `
          <div
            style="
              padding:12px;
              margin-top:10px;
              border-radius:14px;
              background:#201725;
            ">

            <strong>
              ${escapeHTML(movie.title)}
            </strong>

            <p style="
              color:#918899;
              margin:5px 0 10px;
            ">
              ${escapeHTML(movie.category)}
            </p>

            <button
              class="secondary"
              data-admin-delete="${escapeHTML(movie.id)}">
              🗑️ Usuń
            </button>

          </div>
        `).join("")
        : `
          <p style="color:#918899">
            Nie dodano jeszcze żadnych filmów.
          </p>
        `
      }
    </div>
  `;

  $("adminAddMovieButton")
    ?.addEventListener(
      "click",
      openAdd
    );

  panel
    .querySelectorAll(
      "[data-admin-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => deleteMovie(
          button.dataset.adminDelete
        )
      );

    });
}


/* =========================================================
   KOMENTARZE
   ========================================================= */

function getComments(movieId) {
  if (!Array.isArray(db.comments[movieId])) {
    db.comments[movieId] = [];
  }

  return db.comments[movieId];
}


function addComment() {
  const user = currentUser();

  if (!user) {
    toast("Zaloguj się, aby komentować.");
    setTimeout(openLogin, 600);
    return;
  }

  if (!currentMovie) return;

  const input =
    $("filmCommentInput");

  if (!input) return;

  const text =
    input.value.trim();

  if (!text) {
    toast("Wpisz komentarz.");
    return;
  }

  if (text.length > 500) {
    toast(
      "Komentarz może mieć maksymalnie 500 znaków."
    );

    return;
  }

  const comment = {
    id: randomId("comment"),
    userId: user.id,
    userName: user.name,
    text,
    date: Date.now()
  };

  const comments =
    getComments(currentMovie.id);

  comments.push(comment);

  saveDB();

  input.value = "";

  renderComments();

  toast("Komentarz dodany 💬");
}


function deleteComment(commentId) {
  const user = currentUser();

  if (!user) return;

  const comments =
    getComments(currentMovie.id);

  const comment =
    comments.find(
      item => item.id === commentId
    );

  if (!comment) return;

  if (
    comment.userId !== user.id &&
    !isAdmin()
  ) {
    toast("Nie możesz usunąć tego komentarza.");
    return;
  }

  db.comments[currentMovie.id] =
    comments.filter(
      item => item.id !== commentId
    );

  saveDB();

  renderComments();

  toast("Komentarz usunięty.");
}


function renderComments() {
  if (!currentMovie) return;

  let section =
    $("commentsSection");

  if (!section) {
    section =
      document.createElement("section");

    section.id = "commentsSection";

    section.style.marginTop = "35px";

    $("movieScreen")
      ?.querySelector(".screen-content")
      ?.appendChild(section);
  }

  const comments =
    getComments(currentMovie.id);

  section.innerHTML = `
    <h3>
      💬 Komentarze
    </h3>

    ${
      isLoggedIn()
        ? `
          <textarea
            id="filmCommentInput"
            maxlength="500"
            placeholder="Napisz komentarz..."></textarea>

          <button
            class="primary full"
            id="addCommentButton">
            Dodaj komentarz
          </button>
        `
        : `
          <p>
            Zaloguj się, aby dodać komentarz.
          </p>
        `
    }

    <div style="margin-top:20px">

      ${
        comments.length
          ? comments
              .slice()
              .reverse()
              .map(comment => {

                const canDelete =
                  isAdmin() ||
                  currentUser()?.id ===
                  comment.userId;

                return `
                  <div
                    style="
                      padding:15px;
                      margin-bottom:10px;
                      border-radius:16px;
                      background:#15101d;
                    ">

                    <strong>
                      ${escapeHTML(comment.userName)}
                    </strong>

                    <p style="
                      margin:7px 0;
                      color:#aaa1b4;
                    ">
                      ${escapeHTML(comment.text)}
                    </p>

                    <small style="
                      color:#706878;
                    ">
                      ${new Date(comment.date)
                        .toLocaleDateString("pl-PL")}
                    </small>

                    ${
                      canDelete
                        ? `
                          <button
                            data-delete-comment="${escapeHTML(comment.id)}"
                            style="
                              float:right;
                              background:none;
                              color:#b99aca;
                            ">
                            Usuń
                          </button>
                        `
                        : ""
                    }

                  </div>
                `;
              })
              .join("")
          : `
            <p>
              Brak komentarzy. Bądź pierwszy!
            </p>
          `
      }

    </div>
  `;

  $("addCommentButton")
    ?.addEventListener(
      "click",
      addComment
    );

  section
    .querySelectorAll(
      "[data-delete-comment]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => deleteComment(
          button.dataset.deleteComment
        )
      );

    });
}


/* =========================================================
   NARZĘDZIA ADMINA PRZY FILMIE
   ========================================================= */

function renderAdminMovieTools() {
  let tools =
    $("adminMovieTools");

  if (!isAdmin() || !currentMovie) {
    tools?.remove();
    return;
  }

  if (!tools) {
    tools =
      document.createElement("div");

    tools.id = "adminMovieTools";

    tools.style.marginTop = "25px";
    tools.style.padding = "15px";
    tools.style.borderRadius = "16px";
    tools.style.background = "#201525";

    $("movieScreen")
      ?.querySelector(".screen-content")
      ?.appendChild(tools);
  }

  const custom =
    db.customMovies.some(
      movie => movie.id === currentMovie.id
    );

  tools.innerHTML = custom
    ? `
      <strong>
        👑 Tryb administratora
      </strong>

      <button
        class="secondary full"
        id="deleteCurrentMovieButton"
        style="margin-top:12px">
        🗑️ Usuń ten film
      </button>
    `
    : `
      <strong>
        👑 Film systemowy
      </strong>

      <p style="color:#918899">
        Tego filmu nie można usunąć.
      </p>
    `;

  $("deleteCurrentMovieButton")
    ?.addEventListener(
      "click",
      () => deleteMovie(currentMovie.id)
    );
}


/* =========================================================
   KLIKNIĘCIA W FILMY
   ========================================================= */

function setupMovieClicks() {
  document.addEventListener(
    "click",
    event => {

      const card =
        event.target.closest(
          "[data-movie-id]"
        );

      if (!card) return;

      const id =
        card.dataset.movieId;

      if (id) {
        openMovie(id);
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {

      const card =
        event.target.closest(
          "[data-movie-id]"
        );

      if (!card) return;

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();

        openMovie(
          card.dataset.movieId
        );
      }
    }
  );
}


/* =========================================================
   EVENTY
   ========================================================= */

function setupEvents() {

  $("profileTopButton")
    ?.addEventListener(
      "click",
      openProfile
    );

  $("heroWatch")
    ?.addEventListener(
      "click",
      () => openMovie("action")
    );

  $("continueMore")
    ?.addEventListener(
      "click",
      openLibrary
    );

  $("premiumHomeButton")
    ?.addEventListener(
      "click",
      openPremium
    );


  /* NAV */

  $("navHome")
    ?.addEventListener(
      "click",
      goHome
    );

  $("navSearch")
    ?.addEventListener(
      "click",
      openSearch
    );

  $("navAdd")
    ?.addEventListener(
      "click",
      openAdd
    );

  $("navLibrary")
    ?.addEventListener(
      "click",
      openLibrary
    );

  $("navProfile")
    ?.addEventListener(
      "click",
      openProfile
    );


  /* BACK */

  [
    "movieBack",
    "loginBack",
    "registerBack",
    "profileBack",
    "libraryBack",
    "premiumBack",
    "searchBack",
    "addBack"
  ].forEach(id => {
    $(id)?.addEventListener(
      "click",
      closeScreen
    );
  });


  /* FILM */

  $("playMovieButton")
    ?.addEventListener(
      "click",
      playMovie
    );

  $("favoriteButton")
    ?.addEventListener(
      "click",
      toggleFavorite
    );


  /* VIDEO */

  $("videoPlayer")
    ?.addEventListener(
      "timeupdate",
      () => {

        if (
          $("videoPlayer").currentTime % 5 <
          .5
        ) {
          saveProgress();
        }

      }
    );

  $("videoPlayer")
    ?.addEventListener(
      "pause",
      saveProgress
    );

  $("videoPlayer")
    ?.addEventListener(
      "ended",
      () => {

        if (!currentMovie) return;

        const user =
          currentUser();

        if (!user) return;

        if (db.progress[user.id]) {
          delete db.progress[user.id][
            currentMovie.id
          ];
        }

        saveDB();
      }
    );


  /* LOGOWANIE */

  $("loginButton")
    ?.addEventListener(
      "click",
      login
    );

  $("registerButton")
    ?.addEventListener(
      "click",
      openRegister
    );

  $("forgotButton")
    ?.addEventListener(
      "click",
      forgotPassword
    );


  /* REJESTRACJA */

  $("createAccountButton")
    ?.addEventListener(
      "click",
      createAccount
    );

  $("goLoginButton")
    ?.addEventListener(
      "click",
      openLogin
    );


  /* PROFIL */

  $("profileLogin")
    ?.addEventListener(
      "click",
      openLogin
    );

  $("profileLibrary")
    ?.addEventListener(
      "click",
      openLibrary
    );

  $("profilePremium")
    ?.addEventListener(
      "click",
      openPremium
    );

  $("profileReset")
    ?.addEventListener(
      "click",
      forgotPassword
    );

  $("profileLogout")
    ?.addEventListener(
      "click",
      logout
    );


  /* KATEGORIE */

  document
    .querySelectorAll(
      "[data-category]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => filterMovies(
          button.dataset.category
        )
      );

    });


  /* OCENY */

  document
    .querySelectorAll(
      "[data-rating]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => rateMovie(
          Number(button.dataset.rating)
        )
      );

    });


  /* BIBLIOTEKA */

  document
    .querySelectorAll(
      "[data-library]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => showLibrary(
          button.dataset.library
        )
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
        () => buyPlan(
          button.dataset.buy,
          Number(button.dataset.days)
        )
      );

    });


  /* BONY */

  document
    .querySelectorAll(
      "[data-voucher]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => activateVoucher(
          button.dataset.voucher
        )
      );

    });


  /* SZUKANIE */

  $("searchInput")
    ?.addEventListener(
      "input",
      searchMovies
    );


  /* DODAWANIE */

  $("addMovieButton")
    ?.addEventListener(
      "click",
      addMovie
    );
}


/* =========================================================
   KLAWIATURA
   ========================================================= */

function setupFormKeyboard() {

  $("loginPassword")
    ?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          login();
        }

      }
    );


  $("registerPassword")
    ?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          createAccount();
        }

      }
    );


  $("searchInput")
    ?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Escape") {
          closeScreen();
        }

      }
    );
}


/* =========================================================
   BLOKADA ZOOMU
   ========================================================= */

document.addEventListener(
  "dblclick",
  event => event.preventDefault(),
  {
    passive: false
  }
);

document.addEventListener(
  "gesturestart",
  event => event.preventDefault(),
  {
    passive: false
  }
);

document.addEventListener(
  "gesturechange",
  event => event.preventDefault(),
  {
    passive: false
  }
);

document.addEventListener(
  "gestureend",
  event => event.preventDefault(),
  {
    passive: false
  }
);


/* =========================================================
   START
   ========================================================= */

function initFilmApp() {

  console.log(
    "FILMAPP uruchomiony"
  );

  setupEvents();
  setupMovieClicks();
  setupFormKeyboard();

  renderMovies();
  updateProfile();
  updateAdminUI();

  const user = currentUser();

  if (user) {
    ensureUserData(user);
    updatePremium();
  }
}


/* =========================================================
   START APLIKACJI
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initFilmApp,
    {
      once: true
    }
  );

} else {

  initFilmApp();

}
