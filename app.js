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
    description: "Zwykła podróż zamienia się w serię kompletnie absurdalnych wydarzeń.",
    poster: "poster6",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  }
];

let currentMovie = null;

let state = JSON.parse(localStorage.getItem("filmapp_state")) || {
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

function saveState() {
  localStorage.setItem("filmapp_state", JSON.stringify(state));
}

function allMovies() {
  return [...movies, ...state.customMovies];
}

function toast(message) {
  const element = document.getElementById("toast");

  element.textContent = message;
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, 2500);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");
}

function closeScreen() {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  const video = document.getElementById("videoPlayer");

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


/* FILMY */

function createMovieCard(movie) {
  return `
    <article class="movie-card"
             onclick="openMovie('${movie.id}')">

      <div class="poster ${movie.poster}">
        <span class="quality">${movie.quality}</span>
        <span class="poster-title">${movie.title}</span>
        <span class="play">▶</span>
      </div>

      <h3>${movie.title}</h3>

      <p>
        ⭐ ${movie.rating} · ${movie.duration}
      </p>

    </article>
  `;
}

function renderMovies() {
  const list = allMovies();

  const movieRow = document.getElementById("movieRow");
  const topRow = document.getElementById("topRow");
  const continueRow = document.getElementById("continueRow");

  movieRow.innerHTML = list
    .slice(0, 6)
    .map(createMovieCard)
    .join("");

  topRow.innerHTML = [...list]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
    .map(createMovieCard)
    .join("");

  const continueMovies = list.filter(movie =>
    state.history.includes(movie.id)
  );

  if (continueMovies.length) {
    continueRow.innerHTML = continueMovies
      .map(createMovieCard)
      .join("");
  } else {
    continueRow.innerHTML = list
      .slice(0, 3)
      .map(createMovieCard)
      .join("");
  }
}

function openMovie(id) {
  currentMovie = allMovies().find(movie => movie.id === id);

  if (!currentMovie) {
    toast("Nie znaleziono filmu.");
    return;
  }

  document.getElementById("movieTitle").textContent =
    currentMovie.title;

  document.getElementById("movieDescription").textContent =
    currentMovie.description;

  document.getElementById("movieCategory").textContent =
    currentMovie.category;

  document.getElementById("movieQuality").textContent =
    currentMovie.quality;

  document.getElementById("movieRating").textContent =
    `⭐ ${currentMovie.rating}`;

  document.getElementById("movieDuration").textContent =
    currentMovie.duration;

  const video = document.getElementById("videoPlayer");

  video.src = currentMovie.video || "";

  if (!state.history.includes(currentMovie.id)) {
    state.history.unshift(currentMovie.id);
    saveState();
    renderMovies();
  }

  showScreen("movieScreen");
}

function playMovie() {
  const video = document.getElementById("videoPlayer");

  if (!video.src) {
    toast("Ten film nie ma jeszcze pliku wideo.");
    return;
  }

  video.play().catch(() => {
    toast("Kliknij przycisk odtwarzania filmu.");
  });
}


/* BIBLIOTEKA */

function toggleFavorite() {
  if (!currentMovie) return;

  const index = state.favorites.indexOf(currentMovie.id);

  if (index === -1) {
    state.favorites.push(currentMovie.id);
    toast("Dodano do biblioteki ❤️");
  } else {
    state.favorites.splice(index, 1);
    toast("Usunięto z biblioteki.");
  }

  saveState();
}

function openLibrary() {
  showScreen("libraryScreen");
  showLibrary("favorites");
}

function showLibrary(type) {
  const container = document.getElementById("libraryMovies");

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
        <p>Dodane filmy pojawią się tutaj.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = selected
    .map(movie => `
      <div class="library-item"
           onclick="openMovie('${movie.id}')">

        <div class="mini-poster ${movie.poster}"></div>

        <div>
          <h3>${movie.title}</h3>
          <p>${movie.category}</p>
          <p>⭐ ${movie.rating} · ${movie.duration}</p>
        </div>

      </div>
    `)
    .join("");
}


/* OCENY */

function rateMovie(number) {
  if (!currentMovie) return;

  state.ratings[currentMovie.id] = number;

  saveState();

  toast(`Ocena ${number}/10 została zapisana ⭐`);
}


/* KATEGORIE */

function filterMovies(category) {
  if (category === "Wszystkie") {
    renderMovies();
    goHome();
    return;
  }

  const filtered = allMovies()
    .filter(movie => movie.category === category);

  const movieRow = document.getElementById("movieRow");

  movieRow.innerHTML = filtered.length
    ? filtered.map(createMovieCard).join("")
    : `<p>Brak filmów w tej kategorii.</p>`;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* SZUKANIE */

function openSearch() {
  showScreen("searchScreen");

  setTimeout(() => {
    document.getElementById("searchInput").focus();
  }, 300);
}

function searchMovies() {
  const query = document
    .getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();

  const results = document.getElementById("searchResults");

  if (!query) {
    results.innerHTML = "";
    return;
  }

  const found = allMovies()
    .filter(movie =>
      movie.title.toLowerCase().includes(query) ||
      movie.category.toLowerCase().includes(query)
    );

  if (!found.length) {
    results.innerHTML = `
      <div class="result">
        Nie znaleziono filmu.
      </div>
    `;

    return;
  }

  results.innerHTML = found.map(movie => `
    <div class="result"
         onclick="openMovie('${movie.id}')">

      <strong>${movie.title}</strong>

      <p>
        ${movie.category} · ⭐ ${movie.rating} · ${movie.duration}
      </p>

    </div>
  `).join("");
}


/* KONTO */

function openProfile() {
  updateProfile();
  showScreen("profileScreen");
}

function openLogin() {
  showScreen("loginScreen");
}

function register() {
  showScreen("registerScreen");
}

function createAccount() {
  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  if (!name || !email || !password) {
    toast("Wypełnij wszystkie pola.");
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

  toast("Konto utworzone 🎉");

  setTimeout(() => {
    openProfile();
  }, 500);
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    toast("Wpisz e-mail i hasło.");
    return;
  }

  state.user = {
    name: email.split("@")[0],
    email
  };

  saveState();

  toast("Zalogowano pomyślnie 👋");

  setTimeout(() => {
    openProfile();
  }, 500);
}

function forgotPassword() {
  const email = prompt("Podaj adres e-mail:");

  if (!email) return;

  toast("Jeżeli konto istnieje, wysłaliśmy link resetujący.");
}

function logout() {
  state.user = null;
  saveState();

  toast("Wylogowano.");

  setTimeout(() => {
    closeScreen();
  }, 500);
}

function updateProfile() {
  const loggedOut = document.getElementById("profileLoggedOut");
  const loggedIn = document.getElementById("profileLoggedIn");

  if (state.user) {
    document.getElementById("profileName").textContent =
      state.user.name;

    document.getElementById("profileEmail").textContent =
      state.user.email;

    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");
  } else {
    document.getElementById("profileName").textContent =
      "Gość";

    document.getElementById("profileEmail").textContent =
      "Nie jesteś zalogowany";

    loggedOut.classList.remove("hidden");
    loggedIn.classList.add("hidden");
  }
}


/* PREMIUM */

function openPremium() {
  updatePremium();
  showScreen("premiumScreen");
}

function updatePremium() {
  const element = document.getElementById("currentPlan");

  if (state.premium.plan === "Free") {
    element.innerHTML = "";
    return;
  }

  if (state.premium.expires === null) {
    element.innerHTML = `
      <div class="plan-status">
        💎 <strong>${state.premium.plan}</strong><br>
        Aktywny bezterminowo
      </div>
    `;
    return;
  }

  const date = new Date(state.premium.expires);

  element.innerHTML = `
    <div class="plan-status">
      💎 <strong>${state.premium.plan}</strong><br>
      Aktywny do: ${date.toLocaleDateString("pl-PL")}
    </div>
  `;
}

function buyPlan(plan, days) {
  if (!state.user) {
    toast("Najpierw utwórz konto lub zaloguj się.");
    setTimeout(openLogin, 700);
    return;
  }

  /*
    DEMO:
    Ten przycisk aktywuje pakiet lokalnie.
    Prawdziwa płatność wymaga podłączenia
    operatora płatności i bezpiecznego backendu.
  */

  if (days === 0) {
    state.premium = {
      plan,
      expires: null
    };
  } else {
    state.premium = {
      plan,
      expires: Date.now() + days * 24 * 60 * 60 * 1000
    };
  }

  saveState();
  updatePremium();

  toast(`${plan} został aktywowany 💎`);
}


/* BONY */

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
  let input;

  if (type === "premium") {
    input = document.getElementById("premiumCode");
  }

  if (type === "4k") {
    input = document.getElementById("premium4kCode");
  }

  if (type === "lifetime") {
    input = document.getElementById("lifetimeCode");
  }

  const code = input.value.trim().toUpperCase();

  if (!code) {
    toast("Wpisz kod bonu.");
    return;
  }

  if (!state.user) {
    toast("Najpierw zaloguj się.");
    return;
  }

  const voucher = voucherCodes[code];

  if (!voucher) {
    toast("Nieprawidłowy kod.");
    return;
  }

  const used = JSON.parse(
    localStorage.getItem("filmapp_used_vouchers") || "[]"
  );

  if (used.includes(code)) {
    toast("Ten bon został już wykorzystany.");
    return;
  }

  if (
    (type === "premium" && voucher.plan !== "Premium") ||
    (type === "4k" && voucher.plan !== "Premium 4K") ||
    (type === "lifetime" && voucher.plan !== "Premium na zawsze")
  ) {
    toast("Ten kod nie pasuje do tego pakietu.");
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
      expires: Date.now() +
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

  toast("Bon aktywowany 🎉");
}


/* DODAWANIE FILMÓW */

function openAdd() {
  showScreen("addScreen");
}

function addMovie() {
  const title = document.getElementById("addTitle").value.trim();
  const description =
    document.getElementById("addDescription").value.trim();

  const category =
    document.getElementById("addCategory").value.trim() || "Inne";

  const duration =
    document.getElementById("addDuration").value.trim() || "—";

  const quality =
    document.getElementById("addQuality").value.trim() || "HD";

  const video =
    document.getElementById("addVideo").value.trim();

  if (!title || !description) {
    toast("Podaj tytuł i opis filmu.");
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

  toast("Film został dodany 🎬");

  setTimeout(() => {
    closeScreen();
  }, 500);
}


/* OCHRONA PRZED PODWÓJNYM TAPNIĘCIEM / ZOOMEM */

document.addEventListener(
  "dblclick",
  function(event) {
    event.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "gesturestart",
  function(event) {
    event.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "gesturechange",
  function(event) {
    event.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  "gestureend",
  function(event) {
    event.preventDefault();
  },
  { passive: false }
);


/* START */

renderMovies();
updateProfile();
