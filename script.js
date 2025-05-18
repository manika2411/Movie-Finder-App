const API_KEY = 'cf75f8e4';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const movieDetailsDiv = document.getElementById('movieDetails');
const spinner = document.getElementById('spinner');
const paginationDiv = document.getElementById('pagination');
const favoritesDiv = document.getElementById('favorites');

let currentPage = 1;
let currentSearchTerm = '';

// Load favorites on start
document.addEventListener('DOMContentLoaded', () => {
  showFavorites();
});

searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    currentSearchTerm = searchTerm;
    currentPage = 1;
    searchMovies(currentSearchTerm, currentPage);
  }
});

async function searchMovies(query, page) {
  showSpinner(true);
  try {
    const response = await fetch(`https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${API_KEY}`);
    const data = await response.json();
    if (data.Response === 'True') {
      displayMovies(data.Search);
      setupPagination(data.totalResults);
    } else {
      resultsDiv.innerHTML = `<p>No movies found. Please try again.</p>`;
      paginationDiv.innerHTML = '';
    }
  } catch (error) {
    resultsDiv.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
  }
  showSpinner(false);
}

function displayMovies(movies) {
  resultsDiv.innerHTML = '';
  movies.forEach(movie => {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');
    movieItem.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p class="movie-year">${movie.Year}</p>
      <button onclick="fetchMovieDetails('${movie.imdbID}')">Details</button>
      <button onclick="addToFavorites('${movie.imdbID}')">❤️</button>
    `;
    resultsDiv.appendChild(movieItem);
  });
}

function setupPagination(totalResults) {
  paginationDiv.innerHTML = '';
  const totalPages = Math.ceil(totalResults / 10);
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.style.fontWeight = 'bold';
    btn.addEventListener('click', () => {
      currentPage = i;
      searchMovies(currentSearchTerm, currentPage);
    });
    paginationDiv.appendChild(btn);
  }
}

async function fetchMovieDetails(id) {
  showSpinner(true);
  movieDetailsDiv.style.display = 'block'; 
  try {
    const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
    const movie = await response.json();
    movieDetailsDiv.innerHTML = `
      <h2>${movie.Title}</h2>
      <p><strong>Genre:</strong> ${movie.Genre}</p>
      <p><strong>Director:</strong> ${movie.Director}</p>
      <p><strong>Plot:</strong> ${movie.Plot}</p>
      <p><strong>Cast:</strong> ${movie.Actors}</p>
    `;
    // Automatically scroll to description section
    movieDetailsDiv.scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    movieDetailsDiv.innerHTML = `<p>Could not load movie details.</p>`;
  }
  showSpinner(false);
}

function showSpinner(show) {
  spinner.classList.toggle('hidden', !show);
}

async function addToFavorites(id) {
  const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`);
  const movie = await response.json();
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.find(m => m.imdbID === id)) {
    favorites.push(movie);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showFavorites();
  }
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritesDiv.innerHTML = '';
  favorites.forEach(movie => {
    const div = document.createElement('div');
    div.classList.add('movie-item');
    div.innerHTML = `
      <img src="${movie.Poster !== "N/A" ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <button onclick="removeFavorite('${movie.imdbID}')">❌ Remove</button>
    `;
    favoritesDiv.appendChild(div);
  });
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(m => m.imdbID !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  showFavorites();
}