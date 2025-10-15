const openWeatherApiKey = "673f8101da2d70f1b6a996bd4212c898";
const newsApiKey = "0EN8qctLqdAHTWbtBzuObVXziQLEN9NsEiHMwnsh";

const weatherDataDiv = document.getElementById("weatherData");
const forecastDataDiv = document.getElementById("forecastData");
const newsDataDiv = document.getElementById("newsData");
const form = document.getElementById("locationForm");
const cityInput = document.getElementById("cityInput");

let globalDailyForecast = {};

async function fetchWeather(location) {
  try {
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("City not found");
    const weatherData = await weatherResponse.json();

    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=imperial`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error("Forecast data not available");
    const forecastData = await forecastResponse.json();

    displayWeather(weatherData);
    displayForecast(forecastData.list);
  } catch (error) {
    weatherDataDiv.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    forecastDataDiv.innerHTML = "";
  }
}
function displayWeather(data) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  const timezoneOffset = data.timezone / 3600;

  weatherDataDiv.innerHTML = `
    <div class="d-flex align-items-center mb-3">
      <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon" />
      <div class="ms-3">
        <h2>${data.name}, ${data.sys.country}</h2>
        <p class="mb-0 text-capitalize">${data.weather[0].description}</p>
        <h3>${data.main.temp.toFixed(1)} °F</h3>
      </div>
    </div>
    <p><strong>Feels like:</strong> ${data.main.feels_like.toFixed(1)} °F</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.wind.speed} mph</p>
    <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
    <p><strong>Coordinates:</strong> ${data.coord.lat.toFixed(4)}, ${data.coord.lon.toFixed(4)}</p>
    <p><strong>Timezone:</strong> UTC${timezoneOffset >= 0 ? "+" : ""}${timezoneOffset.toFixed(1)} hours</p>
    <p><strong>Sunrise:</strong> ${sunrise}</p>
    <p><strong>Sunset:</strong> ${sunset}</p>
  `;
}
function displayForecast(forecastList) {
  forecastDataDiv.innerHTML = "";
  globalDailyForecast = {};
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!globalDailyForecast[date]) globalDailyForecast[date] = [];
    globalDailyForecast[date].push(item);
  });

  const sortedDates = Object.keys(globalDailyForecast).sort();
  let today = (new Date()).toISOString().split("T")[0];
  let days = sortedDates.filter(d => d !== today).slice(0, 5);
  if (days.length < 5) days = sortedDates.slice(0, 5);

  days.forEach(dateStr => {
    const items = globalDailyForecast[dateStr];
    let minTemp = Math.min(...items.map(i => i.main.temp_min));
    let maxTemp = Math.max(...items.map(i => i.main.temp_max));
    let noonEntry = items.find(i => i.dt_txt.includes("12:00:00")) || items[0];
    let icon = noonEntry.weather[0].icon;
    let desc = noonEntry.weather[0].description;
    let dt = noonEntry.dt;
    const dateObj = new Date(dt * 1000);
    const weekday = dateObj.toLocaleDateString(undefined, { weekday: "short" });
    const monthDay = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `
      <div class="forecast-date">${weekday}, ${monthDay}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" title="${desc}" class="forecast-icon" />
      <div class="forecast-temp">${minTemp.toFixed(0)}° / ${maxTemp.toFixed(0)}°</div>
      <div class="forecast-desc text-capitalize">${desc}</div>
    `;
    card.dataset.date = dateStr;
    card.onclick = () => showForecastModal(dateStr);
    forecastDataDiv.appendChild(card);
  });
}
function showForecastModal(dateStr) {
  const items = globalDailyForecast[dateStr];
  if (!items) return;
  const modalBody = document.getElementById("forecastModalBody");
  modalBody.innerHTML = `
    <h5>${new Date(items[0].dt * 1000).toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    })}</h5>
    <div class="row">
      ${items.map(i => `
        <div class="col-md-4 col-6 mb-2">
          <div class="p-2 rounded bg-light-subtle text-dark">
            <strong>${i.dt_txt.split(" ")[1].substring(0,5)}</strong><br>
            <img src="<https://openweathermap.org/img/wn/${i.weather>[0].icon}.png" style="width:32px">
            <div>${i.weather[0].description}</div>
            <div>Temp: ${i.main.temp.toFixed(1)}°F</div>
            <div>Feels like: ${i.main.feels_like.toFixed(1)}°F</div>
            <div>Humidity: ${i.main.humidity}%</div>
            <div>Wind: ${i.wind.speed} mph</div>
            <div>Pressure: ${i.main.pressure} hPa</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
  let modal = new bootstrap.Modal(document.getElementById('forecastModal'));
  modal.show();
}
// News
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
form.addEventListener("submit", e => {
  e.preventDefault();
  const location = cityInput.value.trim();
  if (location) { fetchWeather(location); }
});
fetchNews();