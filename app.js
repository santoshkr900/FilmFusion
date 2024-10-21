const API_KEY = "8d7c0bd886326dd286d17e4b1752c714";
const imagePath = "https://image.tmdb.org/t/p/w1280";
const input = document.querySelector(".search input");
const btn = document.querySelector(".search button");
const mainGridTitle = document.querySelector(".favourites h1");
const mainGrid = document.querySelector(".favourites .movies-grid");
const trendingGrid = document.querySelector(".trending .movies-grid");
const popupContainer = document.querySelector(".popup-container");

// Get favorites from localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem("favourites")) || [];
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  localStorage.setItem("favourites", JSON.stringify(favorites));
}

// Check if a movie is in favorites
function isFavorite(movieId) {
  const favorites = getFavorites();
  return favorites.some((movie) => movie.id === movieId);
}

// Toggle favorite movie in localStorage
function toggleFavorite(movie) {
  let favorites = getFavorites();
  if (isFavorite(movie.id)) {
    // Remove from favorites
    favorites = favorites.filter((fav) => fav.id !== movie.id);
  } else {
    // Add to favorites
    favorites.push(movie);
  }
  saveFavorites(favorites);
  renderFavoriteMovies(); // Update the favorites section
}

// Render favorite movies in the "My Favourite Movies" section
function renderFavoriteMovies() {
  const favorites = getFavorites();
  mainGrid.innerHTML =
    favorites.length === 0
      ? `<p>No favorite movies yet.</p>`
      : favorites
          .map(
            (movie) => `
      <div class="card" data-id="${movie.id}">
        <div class="img">
          <img src="${imagePath + movie.poster_path}" alt="" />
        </div>
        <div class="info">
          <h2>${movie.title}</h2>
          <div class="single-info">
            <span>Rating :</span>
            <span>${movie.vote_average} / 10</span>
          </div>
          <div class="single-info">
            <span>Release Date :</span>
            <span>${movie.release_date}</span>
          </div>
        </div>
        <div class="single-info">
          <span>Remove from favourites :</span>
          <span class="heart-icon change-color">&#9829;</span>
        </div>
      </div>
    `
          )
          .join("");

  // Add event listeners to the heart icons to remove movies
  const favoriteCards = document.querySelectorAll(".favourites .heart-icon");
  favoriteCards.forEach((icon) => {
    icon.addEventListener("click", (event) => {
      const card = event.target.closest(".card");
      const movieId = parseInt(card.getAttribute("data-id"));
      const movie = getFavorites().find((m) => m.id === movieId);
      toggleFavorite(movie); // Remove from favorites
    });
  });

  // Add event listeners to the cards themselves to open the popup
  const favoriteMovieCards = document.querySelectorAll(".favourites .card");
  favoriteMovieCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      // Prevent opening the popup when clicking the heart icon
      if (!event.target.classList.contains("heart-icon")) {
        showPopUp(card); // Open the popup
      }
    });
  });
}

// Fetch movie data by search term
async function getMovieBySearch(search_term) {
  const resp = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${search_term}`
  );
  let respData = await resp.json();
  return respData.results;
}

// Add searched movies to the DOM
async function addSearchMoviestoDOM() {
  const search_term = input.value;
  const data = await getMovieBySearch(search_term);
  mainGridTitle.innerText = "Search Results...";
  let resultArr = data.map((m) => {
    return `
    <div class="card" data-id="${m.id}">
            <div class="img">
              <img src="${imagePath + m.poster_path}" alt="" />
            </div>
            <div class="info">
              <h2>${m.title}</h2>
              <div class="single-info">
                <span>Rating :</span>
                <span>${m.vote_average} / 10</span>
              </div>
              <div class="single-info">
                <span>Release Date :</span>
                <span>${m.release_date}</span>
              </div>
            </div>
            <div class="single-info">
              <span>Add to favourites :</span>
              <span class="heart-icon ${
                isFavorite(m.id) ? "change-color" : ""
              }">&#9829;</span>
            </div>
          </div>
    `;
  });
  mainGrid.innerHTML = resultArr.join(" ");
  const cards = document.querySelectorAll(".card");
  addClickEffectToCards(cards);
}

// Add click effect to the movie cards and heart icons
function addClickEffectToCards(cards) {
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      showPopUp(card);
    });

    const heartIcon = card.querySelector(".heart-icon");
    heartIcon.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering the card click event
      const movieId = parseInt(card.getAttribute("data-id"));
      const movie = getFavorites().find((m) => m.id === movieId) || {
        id: movieId,
        title: card.querySelector("h2").textContent,
        poster_path: card
          .querySelector("img")
          .getAttribute("src")
          .replace(imagePath, ""),
        vote_average: card
          .querySelectorAll(".single-info span")[1]
          .textContent.split(" /")[0],
        release_date: card.querySelectorAll(".single-info span")[3].textContent,
      };
      toggleFavorite(movie); // Add/remove from favorites
      heartIcon.classList.toggle("change-color"); // Change heart color
    });
  });
}

btn.addEventListener("click", addSearchMoviestoDOM);

// Fetch movie data by ID
async function getMovieById(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
}

// Fetch movie trailer by ID
async function getMovieTrailerById(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.results[0].key;
}

// Show movie details in a popup
async function showPopUp(card) {
  popupContainer.classList.add("show-popup");
  const movieId = card.getAttribute("data-id");
  const movie = await getMovieById(movieId);
  const key = await getMovieTrailerById(movieId);

  // Check if the movie is already in favourites
  const isMovieFavorite = isFavorite(movie.id);

  popupContainer.style.background = `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)),
    url(${imagePath + movie.poster_path})`;

  popupContainer.innerHTML = `
    <span class="x-icon">&#10006;</span>
    <div class="content">
      <div class="left">
        <div class="poster-img">
          <img src="${imagePath + movie.poster_path}" alt="" />
        </div>
        <div class="single-info">
          <span>${
            isMovieFavorite ? "Remove from favourites" : "Add to favourites"
          } :</span>
          <span class="heart-icon ${
            isMovieFavorite ? "change-color" : ""
          }">&#9829;</span>
        </div>
      </div>
      <div class="right">
        <h1>${movie.title}</h1>
        <h3>${movie.tagline}</h3>
        <div class="single-info-container">
          <div class="single-info">
            <span>Languages :</span>
            <span>${movie.spoken_languages[0].name}</span>
          </div>
          <div class="single-info">
            <span>Length :</span>
            <span>${movie.runtime} Minutes</span>
          </div>
          <div class="single-info">
            <span>Rating :</span>
            <span>${movie.vote_average} / 10</span>
          </div>
          <div class="single-info">
            <span>Budget :</span>
            <span>$ ${movie.budget}</span>
          </div>
          <div class="single-info">
            <span>Release Date :</span>
            <span>${movie.release_date}</span>
          </div>
        </div>
        <div class="genres">
          <h2>Genres</h2>
          <ul>
            ${movie.genres.map((e) => `<li>${e.name}</li>`).join("")}
          </ul>
        </div>
        <div class="overview">
          <h2>Overview</h2>
          <p>${movie.overview}</p>
        </div>
        <div class="trailer">
          <h2>Trailer</h2>
          <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    </div>
    `;

  // Close the popup when clicking the "x" icon
  const x_icon = document.querySelector(".x-icon");
  x_icon.addEventListener("click", () => {
    popupContainer.classList.remove("show-popup");
  });

  // Handle the heart icon click inside the popup to add/remove from favourites
  const heart_icon = document.querySelector(".popup-container .heart-icon");
  heart_icon.addEventListener("click", () => {
    toggleFavorite(movie); // Toggle the favorite status

    // Dynamically update the text and heart color based on the new favorite status
    const isNowFavorite = isFavorite(movie.id);
    heart_icon.classList.toggle("change-color", isNowFavorite);
    document.querySelector(
      ".popup-container .single-info span:first-child"
    ).textContent = isNowFavorite
      ? "Remove from favourites :"
      : "Add to favourites :";
  });
}

// Fetch trending movies
async function getTrendingMovies() {
  const resp = await fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`
  );
  let respData = await resp.json();
  return respData.results;
}

// Add trending movies to the DOM
async function addTrendingMoviestoDOM() {
  const data = await getTrendingMovies();
  const displayMovies = data.slice(0, 5);
  let resultArr = displayMovies.map((m) => {
    return `
    <div class="card" data-id="${m.id}">
            <div class="img">
              <img src="${imagePath + m.poster_path}" alt="" />
            </div>
            <div class="info">
              <h2>${m.title || m.name}</h2>
              <div class="single-info">
                <span>Rating :</span>
                <span>${m.vote_average} / 10</span>
              </div>
              <div class="single-info">
                <span>Release Date :</span>
                <span>${m.release_date || m.first_air_date}</span>
              </div>
              <div class="single-info">
                <span>Add to favourites :</span>
                <span class="heart-icon ${
                  isFavorite(m.id) ? "change-color" : ""
                }">&#9829;</span>
              </div>
            </div>
          </div>
    `;
  });
  trendingGrid.innerHTML = resultArr.join(" ");
  const cards = document.querySelectorAll(".card");
  addClickEffectToCards(cards);
}

addTrendingMoviestoDOM();
renderFavoriteMovies(); // Render favorites on page load
