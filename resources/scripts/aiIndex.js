const openWeatherApiKey = "YOUR_OPENWEATHER_API_KEY_HERE";
const newsApiKey = "YOUR_THENEWSAPI_API_KEY_HERE";

const weatherDataDiv = document.getElementById("weatherData");
const newsDataDiv = document.getElementById("newsData");
const form = document.getElementById("locationForm");
const cityInput = document.getElementById("cityInput");

// Fetch weather data from OpenWeather
async function fetchWeather(location) {
  try {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    weatherDataDiv.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
  }
}

// Display weather data on the page
function displayWeather(data) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  weatherDataDiv.innerHTML = `
    <div class="d-flex align-items-center mb-3">
      <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon" />
      <div class="ms-3">
        <h2>${data.name}, ${data.sys.country}</h2>
        <p class="mb-0">${data.weather[0].description}</p>
        <h3>${data.main.temp.toFixed(1)} °C</h3>
      </div>
    </div>
    <p>Feels like: ${data.main.feels_like.toFixed(1)} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

// Fetch news from TheNewsAPI
async function fetchNews() {
  try {
    let url = `https://newsapi.org/v2/top-headlines?country=us&category=general&pageSize=5&apiKey=${newsApiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load news");

    const data = await response.json();
    displayNews(data.articles);
  } catch (error) {
    newsDataDiv.innerHTML = `<p class="text-danger">${error.message}</p>`;
  }
}

// Display news articles on the page
function displayNews(articles) {
  newsDataDiv.innerHTML = "";
  articles.forEach(article => {
    const articleEl = document.createElement("div");
    articleEl.classList.add("news-article");

    articleEl.innerHTML = `
      <a href="${article.url}" target="_blank" class="news-title">${article.title}</a>
      <p class="news-description">${article.description || ""}</p>
    `;

    newsDataDiv.appendChild(articleEl);
  });
}

// Form submission handler
form.addEventListener("submit", e => {
  e.preventDefault();
  const location = cityInput.value.trim();
  if (location) {
    fetchWeather(location);
  }
});

// Initial load: fetch news immediately
fetchNews();
