/* app.js */

const movies = {
  featured: {
    title: "Twój świat filmów",
    description: "Odkrywaj nowe historie, oglądaj ulubione produkcje i korzystaj z biblioteki FilmApp."
  },

  fight: {
    title: "Ostatnia walka",
    description: "Pełna emocji historia zawodnika, który dostaje ostatnią szansę na powrót na szczyt."
  },

  horror: {
    title: "Noc bez końca",
    description: "Grupa przyjaciół odkrywa miejsce, z którego nie da się łatwo wydostać."
  },

  action: {
    title: "Ostatnia misja",
    description: "Agent dostaje zadanie, które zmieni jego życie. Tym razem nie ma miejsca na błąd."
  }
};

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
}

function openMovie(id) {
  const movie = movies[id];

  document.getElementById("movieTitle").textContent = movie.title;
  document.getElementById("movieDescription").textContent = movie.description;

  showScreen("movieScreen");
}

function openProfile() {
  showScreen("profileScreen");
}

function openLibrary() {
  showScreen("libraryScreen");
}

function openPremium() {
  showScreen("premiumScreen");
}

function openSearch() {
  showScreen("searchScreen");
}

function openAdd() {
  showScreen("addScreen");
}

function goHome() {
  closeScreen();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function filterMovies(category) {
  alert("Wybrano kategorię: " + category);
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

  const found = Object.values(movies).filter(movie =>
    movie.title.toLowerCase().includes(query)
  );

  if (found.length === 0) {
    results.innerHTML = "<p>Nie znaleziono filmu.</p>";
    return;
  }

  results.innerHTML = found.map(movie => `
    <div class="plan" onclick="openMovieByTitle('${movie.title}')">
      <h3>${movie.title}</h3>
      <p>${movie.description}</p>
    </div>
  `).join("");
}

function openMovieByTitle(title) {
  const movie = Object.values(movies).find(m => m.title === title);

  if (!movie) return;

  document.getElementById("movieTitle").textContent = movie.title;
  document.getElementById("movieDescription").textContent = movie.description;

  showScreen("movieScreen");
}

function rate(number) {
  alert("Twoja ocena: " + number + "/10");
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Wpisz e-mail i hasło.");
    return;
  }

  alert("Logowanie zostanie podłączone do prawdziwego systemu kont.");
}

function register() {
  alert("Rejestracja zostanie podłączona w kolejnym etapie.");
}

function forgotPassword() {
  const email = prompt("Podaj adres e-mail:");

  if (!email) return;

  alert(
    "Jeżeli konto z tym adresem istnieje, otrzymasz wiadomość z linkiem do resetowania hasła."
  );
}

function logout() {
  alert("Wylogowano.");
  closeScreen();
}

function activateVoucher(type) {
  const id = type === "4k"
    ? "premium4kCode"
    : "premiumCode";

  const code = document.getElementById(id).value.trim();

  if (!code) {
    alert("Wpisz kod bonu.");
    return;
  }

  alert(
    "Kod został przyjęty. Prawdziwa walidacja bonów zostanie podłączona do bezpiecznego backendu."
  );
}
