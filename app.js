"use strict";

/* =========================================================
   FILMAPP
   Poprawiona wersja app.js
   ========================================================= */

/* =========================================================
   FILMY
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
   STAN APLIKACJI
   ========================================================= */

const DEFAULT_STATE = {
  user: null,
  favorites: [],
  history: [],
  ratings: {},
  customMovies: [],
  premium: {
    plan: "Free",
    expires: null
  }
};

let state = loadState();
let currentMovie = null;


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem("filmapp_state");

    if (!saved) {
      return structuredClone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      favorites: Array.isArray(parsed.favorites)
        ? parsed.favorites
        : [],
      history: Array.isArray(parsed.history)
        ? parsed.history
        : [],
      ratings: parsed.ratings || {},
      customMovies: Array.isArray(parsed.customMovies)
        ? parsed.customMovies
        : [],
      premium: {
        ...DEFAULT_STATE.premium,
        ...(parsed.premium || {})
      }
    };
  } catch (error) {
    console.error("Błąd localStorage:", error);
    return structuredClone(DEFAULT_STATE);
  }
}


function saveState() {
  try {
    localStorage.setItem(
      "filmapp_state",
      JSON.stringify(state)
    );
  } catch (error) {
    console.error("Nie można zapisać danych:", error);
    toast("Nie udało się zapisać danych.");
  }
}


/* =========================================================
   POMOCNICZE
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function allMovies() {
  return [
    ...movies,
    ...(Array.isArray(state.customMovies)
      ? state.customMovies
      : [])
  ];
}


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

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.filmappToastTimer);

  window.filmappToastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}


/* =========================================================
   EKRANY
   ========================================================= */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const screen = $(id);

  if (!screen) {
    console.error("Nie znaleziono ekranu:", id);
    return;
  }

  screen.classList.remove("hidden");
  screen.scrollTop = 0;

  document.body.style.overflow = "hidden";
}


function closeScreen() {
  document.querySelectorAll(".screen").forEach(screen => {
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
  document.querySelectorAll(".nav").forEach(nav => {
    nav.classList.remove("active");
  });

  const button = $(id);

  if (button) {
    button.classList.add("active");
  }
}


/* =========================================================
   KARTY FILMÓW
   ========================================================= */

function createMovieCard(movie) {
  const safeId = escapeHTML(movie.id);

  return `
    <article
      class="movie-card"
      data-movie-id="${safeId}"
      role="button"
      tabindex="0"
      aria-label="Otwórz ${escapeHTML(movie.title)}">

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

  const topMovies = [...allMovies()]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 10);

  topRow.innerHTML = topMovies
    .map(createMovieCard)
    .join("");

  const continueMovies = state.history
    .map(id => allMovies().find(movie => movie.id === id))
    .filter(Boolean);

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

function openMovie(id) {
  const movie = allMovies().find(item => item.id === id);

  if (!movie) {
    toast("Nie znaleziono filmu.");
    return;
  }

  currentMovie = movie;

  $("movieTitle").textContent = movie.title;
  $("movieDescription").textContent = movie.description;
  $("movieCategory").textContent = movie.category;
  $("movieQuality").textContent = movie.quality || "HD";
  $("movieRating").textContent =
    `⭐ ${Number(movie.rating || 0).toFixed(1)}`;
  $("movieDuration").textContent = movie.duration || "—";

  const video = $("videoPlayer");

  if (video) {
    video.pause();

    video.removeAttribute("src");

    if (movie.video) {
      video.src = movie.video;
      video.load();
    }
  }

  if (!state.history.includes(movie.id)) {
    state.history.unshift(movie.id);

    if (state.history.length > 30) {
      state.history.length = 30;
    }

    saveState();
  }

  updateFavoriteButton();

  showScreen("movieScreen");
}


function playMovie() {
  if (!currentMovie) {
    toast("Najpierw wybierz film.");
    return;
  }

  const video = $("videoPlayer");

  if (!video || !currentMovie.video) {
    toast("Ten film nie ma dostępnego materiału wideo.");
    return;
  }

  video.play()
    .then(() => {
      toast("Odtwarzanie ▶");
    })
    .catch(error => {
      console.error(error);
      toast("Kliknij ponownie, aby rozpocząć film.");
    });
}


/* =========================================================
   BIBLIOTEKA
   ========================================================= */

function toggleFavorite() {
  if (!currentMovie) {
    return;
  }

  const index = state.favorites.indexOf(currentMovie.id);

  if (index === -1) {
    state.favorites.push(currentMovie.id);
    toast("Dodano do biblioteki ❤️");
  } else {
    state.favorites.splice(index, 1);
    toast("Usunięto z biblioteki.");
  }

  saveState();
  updateFavoriteButton();
}


function updateFavoriteButton() {
  const button = $("favoriteButton");

  if (!button || !currentMovie) {
    return;
  }

  const exists = state.favorites.includes(currentMovie.id);

  button.textContent = exists
    ? "♥ W bibliotece"
    : "♡ Biblioteka";
}


function openLibrary() {
  setActiveNav("navLibrary");
  showScreen("libraryScreen");
  showLibrary("favorites");
}


function showLibrary(type) {
  const container = $("libraryMovies");

  if (!container) {
    return;
  }

  let ids = [];

  if (type === "favorites") {
    ids = state.favorites;
  }

  if (type === "history") {
    ids = state.history;
  }

  if (type === "continue") {
    ids = state.history;
  }

  const selected = ids
    .map(id => allMovies().find(movie => movie.id === id))
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

        <div class="mini-poster ${escapeHTML(movie.poster || "poster1")}"></div>

        <div>
          <h3>${escapeHTML(movie.title)}</h3>

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
   OCENIANIE
   ========================================================= */

function rateMovie(number) {
  if (!currentMovie) {
    return;
  }

  const rating = Math.max(1, Math.min(10, Number(number)));

  state.ratings[currentMovie.id] = rating;

  saveState();

  document
    .querySelectorAll("[data-rating]")
    .forEach(button => {
      const value = Number(button.dataset.rating);

      button.style.opacity = value <= rating ? "1" : ".45";
    });

  toast(`Twoja ocena: ${rating}/10 ⭐`);
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

  const filtered = allMovies()
    .filter(movie => movie.category === category);

  const movieRow = $("movieRow");

  if (!movieRow) {
    return;
  }

  movieRow.innerHTML = filtered.length
    ? filtered.map(createMovieCard).join("")
    : `<p>Brak filmów w kategorii „${escapeHTML(category)}”.</p>`;

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
    const input = $("searchInput");

    if (input) {
      input.focus();
    }
  }, 250);
}


function searchMovies() {
  const input = $("searchInput");
  const resultsContainer = $("searchResults");

  if (!input || !resultsContainer) {
    return;
  }

  const query = input.value
    .toLowerCase()
    .trim();

  if (!query) {
    resultsContainer.innerHTML = "";
    return;
  }

  const results = allMovies().filter(movie =>
    movie.title.toLowerCase().includes(query) ||
    movie.category.toLowerCase().includes(query) ||
    movie.description.toLowerCase().includes(query)
  );

  if (!results.length) {
    resultsContainer.innerHTML = `
      <div class="result">
        Nie znaleziono filmu.
      </div>
    `;

    return;
  }

  resultsContainer.innerHTML = results
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
   PROFIL
   ========================================================= */

function openProfile() {
  setActiveNav("navProfile");
  updateProfile();
  showScreen("profileScreen");
}


function updateProfile() {
  if (state.user) {
    $("profileName").textContent =
      state.user.name;

    $("profileEmail").textContent =
      state.user.email;

    $("profileLoggedOut")
      .classList.add("hidden");

    $("profileLoggedIn")
      .classList.remove("hidden");
  } else {
    $("profileName").textContent =
      "Gość";

    $("profileEmail").textContent =
      "Nie jesteś zalogowany";

    $("profileLoggedOut")
      .classList.remove("hidden");

    $("profileLoggedIn")
      .classList.add("hidden");
  }
}


function openLogin() {
  showScreen("loginScreen");
}


function openRegister() {
  showScreen("registerScreen");
}


/* =========================================================
   REJESTRACJA
   ========================================================= */

function createAccount() {
  const name = $("registerName").value.trim();
  const email = $("registerEmail").value.trim().toLowerCase();
  const password = $("registerPassword").value;

  if (!name || !email || !password) {
    toast("Wypełnij wszystkie pola.");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    toast("Podaj prawidłowy adres e-mail.");
    return;
  }

  if (password.length < 8) {
    toast("Hasło musi mieć minimum 8 znaków.");
    return;
  }

  state.user = {
    name,
    email
  };

  saveState();

  $("registerName").value = "";
  $("registerEmail").value = "";
  $("registerPassword").value = "";

  toast("Konto zostało utworzone 🎉");

  setTimeout(() => {
    openProfile();
  }, 500);
}


/* =========================================================
   LOGOWANIE
   ========================================================= */

function login() {
  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  if (!email || !password) {
    toast("Wpisz e-mail i hasło.");
    return;
  }

  state.user = {
    name: email.split("@")[0],
    email
  };

  saveState();

  $("loginEmail").value = "";
  $("loginPassword").value = "";

  toast("Zalogowano 👋");

  setTimeout(() => {
    openProfile();
  }, 500);
}


/* =========================================================
   RESET HASŁA
   ========================================================= */

function forgotPassword() {
  const email = prompt(
    "Podaj adres e-mail, na który ma zostać wysłany link resetujący:"
  );

  if (!email) {
    return;
  }

  if (!email.includes("@")) {
    toast("Podaj prawidłowy adres e-mail.");
    return;
  }

  /*
    DEMO:
    Tutaj nie wysyłamy prawdziwego e-maila.
    Prawdziwy reset hasła będzie wymagał backendu.
  */

  toast("Link resetujący został wysłany na e-mail 📧");
}


/* =========================================================
   WYLOGOWANIE
   ========================================================= */

function logout() {
  state.user = null;

  saveState();
  updateProfile();

  toast("Wylogowano.");

  setTimeout(() => {
    closeScreen();
    setActiveNav("navHome");
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

  if (!element) {
    return;
  }

  if (state.premium.plan === "Free") {
    element.innerHTML = `
      <div class="plan-status">
        Aktualny plan: <strong>Free</strong>
      </div>
    `;

    return;
  }

  if (state.premium.expires === null) {
    element.innerHTML = `
      <div class="plan-status">
        💎 <strong>${escapeHTML(state.premium.plan)}</strong><br>
        Aktywny bezterminowo.
      </div>
    `;

    return;
  }

  const expires = Number(state.premium.expires);

  if (!Number.isFinite(expires) || expires <= Date.now()) {
    state.premium = {
      plan: "Free",
      expires: null
    };

    saveState();

    element.innerHTML = `
      <div class="plan-status">
        Aktualny plan: <strong>Free</strong>
      </div>
    `;

    return;
  }

  const date = new Date(expires);

  element.innerHTML = `
    <div class="plan-status">
      💎 <strong>${escapeHTML(state.premium.plan)}</strong><br>
      Aktywny do: ${date.toLocaleDateString("pl-PL")}
    </div>
  `;
}


/* =========================================================
   KUPNO PAKIETU
   ========================================================= */

function buyPlan(plan, days) {
  if (!state.user) {
    toast("Najpierw zaloguj się.");
    setTimeout(openLogin, 700);
    return;
  }

  /*
    TRYB DEMO.
    Nie pobiera prawdziwych pieniędzy.
  */

  if (days === 0) {
    state.premium = {
      plan,
      expires: null
    };
  } else {
    state.premium = {
      plan,
      expires: Date.now() + days * 86400000
    };
  }

  saveState();
  updatePremium();

  toast(`${plan} został aktywowany 💎`);
}


/* =========================================================
   BONY
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


function getUsedVouchers() {
  try {
    const used = JSON.parse(
      localStorage.getItem("filmapp_used_vouchers") || "[]"
    );

    return Array.isArray(used) ? used : [];
  } catch {
    return [];
  }
}


function activateVoucher(type) {
  if (!state.user) {
    toast("Najpierw zaloguj się.");
    setTimeout(openLogin, 700);
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

  const code = input.value
    .trim()
    .toUpperCase();

  if (!code) {
    toast("Wpisz kod bonu.");
    return;
  }

  const voucher = voucherCodes[code];

  if (!voucher) {
    toast("Nieprawidłowy kod.");
    return;
  }

  const used = getUsedVouchers();

  if (used.includes(code)) {
    toast("Ten bon został już wykorzystany.");
    return;
  }

  if (
    type === "premium" &&
    voucher.plan !== "Premium"
  ) {
    toast("Ten kod jest przeznaczony dla innego pakietu.");
    return;
  }

  if (
    type === "4k" &&
    voucher.plan !== "Premium 4K"
  ) {
    toast("Ten kod jest przeznaczony dla innego pakietu.");
    return;
  }

  if (
    type === "lifetime" &&
    voucher.plan !== "Premium na zawsze"
  ) {
    toast("Ten kod jest przeznaczony dla innego pakietu.");
    return;
  }

  if (voucher.days === 0) {
    state.premium = {
      plan: voucher.plan,
      expires: null
    };
  } else {
    state.premium = {
      plan: voucher.plan,
      expires: Date.now() + voucher.days * 86400000
    };
  }

  used.push(code);

  localStorage.setItem(
    "filmapp_used_vouchers",
    JSON.stringify(used)
  );

  saveState();

  input.value = "";

  updatePremium();

  toast("Bon został aktywowany 🎉");
}


/* =========================================================
   DODAWANIE FILMU
   ========================================================= */

function openAdd() {
  if (!state.user) {
    toast("Zaloguj się, żeby dodawać filmy.");
    setTimeout(openLogin, 700);
    return;
  }

  showScreen("addScreen");
}


function addMovie() {
  if (!state.user) {
    toast("Musisz być zalogowany.");
    return;
  }

  const title = $("addTitle").value.trim();
  const description = $("addDescription").value.trim();
  const category =
    $("addCategory").value.trim() || "Inne";
  const duration =
    $("addDuration").value.trim() || "—";
  const quality =
    $("addQuality").value.trim() || "HD";
  const video =
    $("addVideo").value.trim();

  if (!title || !description) {
    toast("Podaj tytuł i opis.");
    return;
  }

  if (video && !/^https?:\/\//i.test(video)) {
    toast("Adres filmu musi zaczynać się od http:// lub https://");
    return;
  }

  const newMovie = {
    id: "custom-" + Date.now(),
    title,
    category,
    rating: 0,
    duration,
    quality,
    description,
    poster: "poster4",
    video
  };

  state.customMovies.push(newMovie);

  saveState();
  renderMovies();

  $("addTitle").value = "";
  $("addDescription").value = "";
  $("addCategory").value = "";
  $("addDuration").value = "";
  $("addQuality").value = "";
  $("addVideo").value = "";

  toast("Film został dodany 🎬");

  setTimeout(() => {
    closeScreen();
  }, 600);
}


/* =========================================================
   EVENT DELEGATION
   Dzięki temu kliknięcia w filmy działają również
   po ponownym renderowaniu list.
   ========================================================= */

function setupMovieClicks() {
  document.addEventListener("click", event => {
    const card = event.target.closest("[data-movie-id]");

    if (!card) {
      return;
    }

    const id = card.dataset.movieId;

    if (id) {
      openMovie(id);
    }
  });

  document.addEventListener("keydown", event => {
    const card = event.target.closest("[data-movie-id]");

    if (!card) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMovie(card.dataset.movieId);
    }
  });
}


/* =========================================================
   EVENTY PRZYCISKÓW
   ========================================================= */

function setupEvents() {

  /* GÓRA */

  $("profileTopButton")?.addEventListener(
    "click",
    openProfile
  );


  /* HERO */

  $("heroWatch")?.addEventListener(
    "click",
    () => openMovie("action")
  );


  /* CONTINUE */

  $("continueMore")?.addEventListener(
    "click",
    openLibrary
  );


  /* PREMIUM */

  $("premiumHomeButton")?.addEventListener(
    "click",
    openPremium
  );


  /* DOLNA NAWIGACJA */

  $("navHome")?.addEventListener(
    "click",
    goHome
  );

  $("navSearch")?.addEventListener(
    "click",
    openSearch
  );

  $("navAdd")?.addEventListener(
    "click",
    openAdd
  );

  $("navLibrary")?.addEventListener(
    "click",
    openLibrary
  );

  $("navProfile")?.addEventListener(
    "click",
    openProfile
  );


  /* BACK */

  $("movieBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("loginBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("registerBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("profileBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("libraryBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("premiumBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("searchBack")?.addEventListener(
    "click",
    closeScreen
  );

  $("addBack")?.addEventListener(
    "click",
    closeScreen
  );


  /* FILM */

  $("playMovieButton")?.addEventListener(
    "click",
    playMovie
  );

  $("favoriteButton")?.addEventListener(
    "click",
    toggleFavorite
  );


  /* LOGOWANIE */

  $("loginButton")?.addEventListener(
    "click",
    login
  );

  $("registerButton")?.addEventListener(
    "click",
    openRegister
  );

  $("forgotButton")?.addEventListener(
    "click",
    forgotPassword
  );


  /* REJESTRACJA */

  $("createAccountButton")?.addEventListener(
    "click",
    createAccount
  );

  $("goLoginButton")?.addEventListener(
    "click",
    openLogin
  );


  /* PROFIL */

  $("profileLogin")?.addEventListener(
    "click",
    openLogin
  );

  $("profileLibrary")?.addEventListener(
    "click",
    openLibrary
  );

  $("profilePremium")?.addEventListener(
    "click",
    openPremium
  );

  $("profileReset")?.addEventListener(
    "click",
    forgotPassword
  );

  $("profileLogout")?.addEventListener(
    "click",
    logout
  );


  /* KATEGORIE */

  document
    .querySelectorAll("[data-category]")
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
    .querySelectorAll("[data-rating]")
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
    .querySelectorAll("[data-library]")
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
    .querySelectorAll("[data-buy]")
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
    .querySelectorAll("[data-voucher]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => activateVoucher(
          button.dataset.voucher
        )
      );
    });


  /* SZUKAJ */

  $("searchInput")?.addEventListener(
    "input",
    searchMovies
  );


  /* DODAWANIE */

  $("addMovieButton")?.addEventListener(
    "click",
    addMovie
  );
}


/* =========================================================
   ENTER W FORMULARZACH
   ========================================================= */

function setupFormKeyboard() {
  $("loginPassword")?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        login();
      }
    }
  );

  $("registerPassword")?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        createAccount();
      }
    }
  );

  $("searchInput")?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Escape") {
        closeScreen();
      }
    }
  );
}


/* =========================================================
   BLOKADA ZOOMU / PODWÓJNEGO TAPNIĘCIA
   ========================================================= */

document.addEventListener(
  "dblclick",
  event => {
    event.preventDefault();
  },
  {
    passive: false
  }
);

document.addEventListener(
  "gesturestart",
  event => {
    event.preventDefault();
  },
  {
    passive: false
  }
);

document.addEventListener(
  "gesturechange",
  event => {
    event.preventDefault();
  },
  {
    passive: false
  }
);

document.addEventListener(
  "gestureend",
  event => {
    event.preventDefault();
  },
  {
    passive: false
  }
);


/* =========================================================
   START
   ========================================================= */

function initFilmApp() {
  console.log("FILMAPP uruchomiony");

  setupEvents();
  setupMovieClicks();
  setupFormKeyboard();

  renderMovies();
  updateProfile();
  updatePremium();
}


/*
  Ponieważ app.js jest ładowany na końcu index.html,
  DOM może być już gotowy. Obsługujemy oba przypadki.
*/

if (document.readyState === "loading") {
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
