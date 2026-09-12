"use strict";
/*
  FILMAPP
  Wersja demonstracyjna.
  UWAGA:
  Konto, płatności i bony są tutaj lokalne.
  Prawdziwa aplikacja będzie wymagała backendu,
  bazy danych i operatora płatności.
*/
/* =========================
   DANE FILMÓW
========================= */
const movies = [
  {
    id: "fight",
    title: "Ostatnia walka",
    category: "Sport / Walki",
    rating: 8.7,
    duration: "1h 48min",
    quality: "4K",
    description:
      "Zawodnik dostaje ostatnią szansę na powrót na szczyt.",
    poster: "poster1",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },
  {
    id: "horror",
    title: "Noc bez końca",
    category: "Horror",
    rating: 8.1,
    duration: "1h 36min",
    quality: "HD",
    description:
      "Grupa przyjaciół odkrywa miejsce, z którego nie da się łatwo wydostać.",
    poster: "poster2",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },
  {
    id: "action",
    title: "Ostatnia misja",
    category: "Akcja",
    rating: 9.0,
    duration: "2h 04min",
    quality: "4K",
    description:
      "Agent otrzymuje zadanie, które zmieni całe jego życie.",
    poster: "poster3",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },
  {
    id: "space",
    title: "Poza gwiazdami",
    category: "Sci-Fi",
    rating: 8.9,
    duration: "2h 12min",
    quality: "4K",
    description:
      "Załoga statku kosmicznego odkrywa coś, czego nie powinno być w kosmosie.",
    poster: "poster4",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },
  {
    id: "shadow",
    title: "Cień miasta",
    category: "Thriller",
    rating: 8.5,
    duration: "1h 55min",
    quality: "4K",
    description:
      "Tajemnicze wydarzenia prowadzą detektywa do ukrytej prawdy.",
    poster: "poster5",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  },
  {
    id: "comedy",
    title: "Nieplanowana podróż",
    category: "Komedia",
    rating: 7.9,
    duration: "1h 42min",
    quality: "HD",
    description:
      "Zwykła podróż zamienia się w serię absurdalnych wydarzeń.",
    poster: "poster6",
    video:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  }
];
/* =========================
   STAN
========================= */
let state;
try {
  state = JSON.parse(
    localStorage.getItem("filmapp_state")
  );
} catch {
  state = null;
}
if (!state) {
  state = {
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
}
let currentMovie = null;
/* =========================
   ZAPIS
========================= */
function saveState() {
  localStorage.setItem(
    "filmapp_state",
    JSON.stringify(state)
  );
}
/* =========================
   POMOCNICZE
========================= */
function allMovies() {
  return [
    ...movies,
    ...(Array.isArray(state.customMovies)
      ? state.customMovies
      : [])
  ];
}
function $(id) {
  return document.getElementById(id);
}
function toast(message) {
  const element = $("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}
/* =========================
   EKRANY
========================= */
function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.add("hidden");
    });
  const screen = $(id);
  if (screen) {
    screen.classList.remove("hidden");
    screen.scrollTop = 0;
  }
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
}
function goHome() {
  closeScreen();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
/* =========================
   KARTY FILMÓW
========================= */
function createMovieCard(movie) {
  return `
    <article
      class="movie-card"
      data-movie-id="${movie.id}">
      <div class="poster ${movie.poster}">
        <span class="quality">
          ${movie.quality}
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
        ⭐ ${movie.rating} · ${movie.duration}
      </p>
    </article>
  `;
}
function renderMovies(list = allMovies()) {
  $("movieRow").innerHTML = list
    .slice(0, 10)
    .map(createMovieCard)
    .join("");
  $("topRow").innerHTML = [...allMovies()]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
    .map(createMovieCard)
    .join("");
  const continueMovies = state.history
    .map(id =>
      allMovies().find(movie => movie.id === id)
    )
    .filter(Boolean);
  if (continueMovies.length) {
    $("continueRow").innerHTML =
      continueMovies
        .map(createMovieCard)
        .join("");
  } else {
    $("continueRow").innerHTML =
      allMovies()
        .slice(0, 5)
        .map(createMovieCard)
        .join("");
  }
}
/* =========================
   OTWIERANIE FILMU
========================= */
function openMovie(id) {
  const movie = allMovies()
    .find(item => item.id === id);
  if (!movie) {
    toast("Nie znaleziono filmu.");
    return;
  }
  currentMovie = movie;
  $("movieTitle").textContent =
    movie.title;
  $("movieDescription").textContent =
    movie.description;
  $("movieCategory").textContent =
    movie.category;
  $("movieQuality").textContent =
    movie.quality;
  $("movieRating").textContent =
    `⭐ ${movie.rating}`;
  $("movieDuration").textContent =
    movie.duration;
  const video = $("videoPlayer");
  video.pause();
  video.src = movie.video || "";
  video.load();
  if (!state.history.includes(movie.id)) {
    state.history.unshift(movie.id);
    if (state.history.length > 30) {
      state.history.pop();
    }
    saveState();
  }
  updateFavoriteButton();
  showScreen("movieScreen");
}
function playMovie() {
  if (!currentMovie) {
    return;
  }
  const video = $("videoPlayer");
  if (!video.src) {
    toast("Ten film nie ma jeszcze filmu wideo.");
    return;
  }
  video.play().catch(() => {
    toast("Nie udało się rozpocząć odtwarzania.");
  });
}
/* =========================
   BIBLIOTEKA
========================= */
function toggleFavorite() {
  if (!currentMovie) {
    return;
  }
  const index =
    state.favorites.indexOf(currentMovie.id);
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
  if (!currentMovie) {
    return;
  }
  const exists =
    state.favorites.includes(currentMovie.id);
  $("favoriteButton").textContent =
    exists
      ? "♥ W bibliotece"
      : "♡ Biblioteka";
}
function openLibrary() {
  showScreen("libraryScreen");
  showLibrary("favorites");
}
function showLibrary(type) {
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
    .map(id =>
      allMovies().find(movie => movie.id === id)
    )
    .filter(Boolean);
  if (!selected.length) {
    $("libraryMovies").innerHTML = `
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
  $("libraryMovies").innerHTML =
    selected
      .map(movie => `
        <div
          class="library-item"
          data-movie-id="${movie.id}">
          <div class="mini-poster ${movie.poster}"></div>
          <div>
            <h3>
              ${escapeHTML(movie.title)}
            </h3>
            <p>
              ${escapeHTML(movie.category)}
            </p>
            <p>
              ⭐ ${movie.rating} · ${movie.duration}
            </p>
          </div>
        </div>
      `)
      .join("");
}
/* =========================
   OCENY
========================= */
function rateMovie(number) {
  if (!currentMovie) {
    return;
  }
  state.ratings[currentMovie.id] =
    number;
  saveState();
  toast(
    `Twoja ocena: ${number}/10 ⭐`
  );
}
/* =========================
   KATEGORIE
========================= */
function filterMovies(category) {
  if (category === "Wszystkie") {
    renderMovies();
    goHome();
    return;
  }
  const filtered =
    allMovies()
      .filter(movie =>
        movie.category === category
      );
  $("movieRow").innerHTML =
    filtered.length
      ? filtered.map(createMovieCard).join("")
      : "<p>Brak filmów w tej kategorii.</p>";
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
/* =========================
   SZUKANIE
========================= */
function openSearch() {
  showScreen("searchScreen");
  setTimeout(() => {
    $("searchInput").focus();
  }, 300);
}
function searchMovies() {
  const query =
    $("searchInput")
      .value
      .toLowerCase()
      .trim();
  if (!query) {
    $("searchResults").innerHTML = "";
    return;
  }
  const results =
    allMovies()
      .filter(movie =>
        movie.title
          .toLowerCase()
          .includes(query) ||
        movie.category
          .toLowerCase()
          .includes(query)
      );
  if (!results.length) {
    $("searchResults").innerHTML = `
      <div class="result">
        Nie znaleziono filmu.
      </div>
    `;
    return;
  }
  $("searchResults").innerHTML =
    results
      .map(movie => `
        <div
          class="result"
          data-movie-id="${movie.id}">
          <strong>
            ${escapeHTML(movie.title)}
          </strong>
          <p>
            ${escapeHTML(movie.category)}
            · ⭐ ${movie.rating}
            · ${movie.duration}
          </p>
        </div>
      `)
      .join("");
}
/* =========================
   PROFIL
========================= */
function openProfile() {
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
function createAccount() {
  const name =
    $("registerName").value.trim();
  const email =
    $("registerEmail").value.trim();
  const password =
    $("registerPassword").value;
  if (!name || !email || !password) {
    toast("Wypełnij wszystkie pola.");
    return;
  }
  if (!email.includes("@")) {
    toast("Podaj prawidłowy e-mail.");
    return;
  }
  if (password.length < 8) {
    toast(
      "Hasło musi mieć minimum 8 znaków."
    );
    return;
  }
  state.user = {
    name,
    email
  };
  saveState();
  $("registerPassword").value = "";
  toast("Konto zostało utworzone 🎉");
  setTimeout(() => {
    openProfile();
  }, 500);
}
function login() {
  const email =
    $("loginEmail").value.trim();
  const password =
    $("loginPassword").value;
  if (!email || !password) {
    toast(
      "Wpisz e-mail i hasło."
    );
    return;
  }
  state.user = {
    name: email.split("@")[0],
    email
  };
  saveState();
  toast("Zalogowano 👋");
  setTimeout(() => {
    openProfile();
  }, 500);
}
function forgotPassword() {
  const email =
    prompt("Podaj adres e-mail:");
  if (!email) {
    return;
  }
  toast(
    "Link resetujący został wysłany na e-mail."
  );
}
function logout() {
  state.user = null;
  saveState();
  updateProfile();
  toast("Wylogowano.");
  setTimeout(closeScreen, 500);
}
/* =========================
   PREMIUM
========================= */
function openPremium() {
  updatePremium();
  showScreen("premiumScreen");
}
function updatePremium() {
  const element =
    $("currentPlan");
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
        💎 <strong>
        ${escapeHTML(state.premium.plan)}
        </strong><br>
        Aktywny bezterminowo.
      </div>
    `;
    return;
  }
  const date =
    new Date(state.premium.expires);
  element.innerHTML = `
    <div class="plan-status">
      💎 <strong>
      ${escapeHTML(state.premium.plan)}
      </strong><br>
      Aktywny do:
      ${date.toLocaleDateString("pl-PL")}
    </div>
  `;
}
function buyPlan(plan, days) {
  if (!state.user) {
    toast(
      "Najpierw zaloguj się."
    );
    setTimeout(openLogin, 700);
    return;
  }
  /*
    W tej wersji jest tryb DEMO.
    Kliknięcie aktywuje pakiet bez pobierania pieniędzy.
    Prawdziwe płatności podłączymy później
    przez bezpieczny backend.
  */
  if (days === 0) {
    state.premium = {
      plan,
      expires: null
    };
  } else {
    state.premium = {
      plan,
      expires:
        Date.now() +
        days * 24 * 60 * 60 * 1000
    };
  }
  saveState();
  updatePremium();
  toast(
    `${plan} aktywny 💎`
  );
}
/* =========================
   BONY
========================= */
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
  if (!state.user) {
    toast(
      "Najpierw zaloguj się."
    );
    setTimeout(openLogin, 700);
    return;
  }
  let input;
  if (type === "premium") {
    input = $("premiumCode");
  }
  if (type === "4k") {
    input = $("premium4kCode");
  }
  if (type === "lifetime") {
    input = $("lifetimeCode");
  }
  const code =
    input.value
      .trim()
      .toUpperCase();
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
  let used = [];
  try {
    used =
      JSON.parse(
        localStorage.getItem(
          "filmapp_used_vouchers"
        ) || "[]"
      );
  } catch {
    used = [];
  }
  if (used.includes(code)) {
    toast(
      "Ten bon został już wykorzystany."
    );
    return;
  }
  if (
    type === "premium" &&
    voucher.plan !== "Premium"
  ) {
    toast(
      "Ten kod jest przeznaczony dla innego pakietu."
    );
    return;
  }
  if (
    type === "4k" &&
    voucher.plan !== "Premium 4K"
  ) {
    toast(
      "Ten kod jest przeznaczony dla innego pakietu."
    );
    return;
  }
  if (
    type === "lifetime" &&
    voucher.plan !== "Premium na zawsze"
  ) {
    toast(
      "Ten kod jest przeznaczony dla innego pakietu."
    );
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
      expires:
        Date.now() +
        voucher.days * 24 * 60 * 60 * 1000
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
  toast(
    "Bon został aktywowany 🎉"
  );
}
/* =========================
   DODAWANIE FILMU
========================= */
function openAdd() {
  if (!state.user) {
    toast(
      "Zaloguj się, żeby dodawać filmy."
    );
    setTimeout(openLogin, 700);
    return;
  }
  showScreen("addScreen");
}
function addMovie() {
  if (!state.user) {
    toast(
      "Musisz być zalogowany."
    );
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
    toast(
      "Podaj tytuł i opis."
    );
    return;
  }
  const newMovie = {
    id:
      "custom-" +
      Date.now(),
    title,
    category,
    rating: 0,
    duration,
    quality,
    description,
    poster: "poster4",
    video
  };
  state.customMovies.push(
    newMovie
  );
  saveState();
  renderMovies();
  toast(
    "Film został dodany 🎬"
  );
  $("addTitle").value = "";
  $("addDescription").value = "";
  $("addCategory").value = "";
  $("addDuration").value = "";
  $("addQuality").value = "";
  $("addVideo").value = "";
  setTimeout(
    closeScreen,
    600
  );
}
/* =========================
   ESCAPE HTML
========================= */
function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/* =========================
   EVENTY
========================= */
function setupEvents() {
  $("profileTopButton")
    .addEventListener("click", openProfile);
  $("heroWatch")
    .addEventListener(
      "click",
      () => openMovie("action")
    );
  $("continueMore")
    .addEventListener(
      "click",
      openLibrary
    );
  $("premiumHomeButton")
    .addEventListener(
      "click",
      openPremium
    );
  $("navHome")
    .addEventListener("click", goHome);
  $("navSearch")
    .addEventListener(
      "click",
      openSearch
    );
  $("navAdd")
    .addEventListener(
      "click",
      openAdd
    );
  $("navLibrary")
    .addEventListener(
      "click",
      openLibrary
    );
  $("navProfile")
    .addEventListener(
      "click",
      openProfile
    );
  $("movieBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("loginBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("registerBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("profileBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("libraryBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("premiumBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("searchBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("addBack")
    .addEventListener(
      "click",
      closeScreen
    );
  $("playMovieButton")
    .addEventListener(
      "click",
      playMovie
    );
  $("favoriteButton")
    .addEventListener(
      "click",
      toggleFavorite
    );
  $("loginButton")
    .addEventListener(
      "click",
      login
    );
  $("registerButton")
    .addEventListener(
      "click",
      openRegister
    );
  $("forgotButton")
    .addEventListener(
      "click",
      forgotPassword
    );
  $("createAccountButton")
    .addEventListener(
      "click",
      createAccount
    );
  $("goLoginButton")
    .addEventListener(
      "click",
      openLogin
    );
  $("profileLogin")
    .addEventListener(
      "click",
      openLogin
    );
  $("profileLibrary")
    .addEventListener(
      "click",
      openLibrary
    );
  $("profilePremium")
    .addEventListener(
      "click",
      openPremium
    );
  $("profileReset")
    .addEventListener(
      "click",
      forgotPassword
    );
  $("profileLogout")
    .addEventListener(
      "click",
      logout
    );
  document
    .querySelectorAll("[data-category]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          filterMovies(
            button.dataset.category
          )
      );
    });
  document
    .querySelectorAll("[data-rating]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          rateMovie(
            Number(button.dataset.rating)
          )
      );
    });
  document
    .querySelectorAll("[data-library]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          showLibrary(
            button.dataset.library
          )
      );
    });
  document
    .querySelectorAll("[data-buy]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          buyPlan(
            button.dataset.buy,
            Number(button.dataset.days)
          )
      );
    });
  document
    .querySelectorAll("[data-voucher]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () =>
          activateVoucher(
            button.dataset.voucher
          )
      );
    });
  $("searchInput")
    .addEventListener(
      "input",
      searchMovies
    );
  $("addMovieButton")
    .addEventListener(
      "click",
      addMovie
    );
  document.addEventListener(
    "click",
    event => {
      const movieCard =
        event.target.closest(
          "[data-movie-id]"
        );
      if (!movieCard) {
        return;
      }
      openMovie(
        movieCard.dataset.movieId
      );
    }
  );
}
/* =========================
   OCHRONA PRZED ZOOM
========================= */
document.addEventListener(
  "dblclick",
  event => {
    event.preventDefault();
  },
  { passive: false }
);
document.addEventListener(
  "gesturestart",
  event => {
    event.preventDefault();
  },
  { passive: false }
);
document.addEventListener(
  "gesturechange",
  event => {
    event.preventDefault();
  },
  { passive: false }
);
document.addEventListener(
  "gestureend",
  event => {
    event.preventDefault();
  },
  { passive: false }
);
/* =========================
   START
========================= */
document.addEventListener(
  "DOMContentLoaded",
  () => {
    setupEvents();
    renderMovies();
    updateProfile();
    updatePremium();
  }
);
