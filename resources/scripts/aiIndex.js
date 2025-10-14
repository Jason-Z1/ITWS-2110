// ===== ADD YOUR API KEYS HERE =====
const openWeatherApiKey = '673f8101da2d70f1b6a996bd4212c898';
const newsApiKey = '0EN8qctLqdAHTWbtBzuObVXziQLEN9NsEiHMwnsh';

const weatherDataDiv = document.getElementById("weatherData");
const forecastDataDiv = document.getElementById("forecastData");
const newsDataDiv = document.getElementById("newsData");
const form = document.getElementById("locationForm");
const cityInput = document.getElementById("cityInput");

// Fetch current weather data
async function fetchWeather(location) {
  try {
    // Get current weather
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("City not found");
    const weatherData = await weatherResponse.json();

    // Get 5-day forecast
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

// Display current weather with detailed city info
function displayWeather(data) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  const timezoneOffset = data.timezone / 3600; // Convert seconds to hours

  weatherDataDiv.innerHTML = `
    <div class="d-flex align-items-center mb-3">
      <img src="${iconUrl}" alt="${data.weather[0].description}" class="weather-icon" />
      <div class="ms-3">
        <h2>${data.name}, ${data.sys.country}</h2>
        <p class="mb-0">${data.weather[0].description}</p>
        <h3>${data.main.temp.toFixed(1)} °F</h3>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <p><strong>Feels like:</strong> ${data.main.feels_like.toFixed(1)} °F</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} mph</p>
        <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
      </div>
      <div class="col-md-6">
        <p><strong>Coordinates:</strong> ${data.coord.lat.toFixed(4)}, ${data.coord.lon.toFixed(4)}</p>
        <p><strong>Timezone:</strong> UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset.toFixed(1)} hours</p>
        <p><strong>Sunrise:</strong> ${sunrise}</p>
        <p><strong>Sunset:</strong> ${sunset}</p>
      </div>
    </div>
  `;
}

// Group forecast data by day and display 5-day forecast
function displayForecast(forecastList) {
  // Group forecast data by day
  const dailyForecast = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dailyForecast[dateStr]) {
      dailyForecast[dateStr] = {
        temps: [],
        feels_like: [],
        humidity: [],
        wind_speed: [],
        weather: [],
        icon: item.weather[0].icon,
        description: item.weather[0].description,
        dt: item.dt
      };
    }
    
    dailyForecast[dateStr].temps.push(item.main.temp);
    dailyForecast[dateStr].feels_like.push(item.main.feels_like);
    dailyForecast[dateStr].humidity.push(item.main.humidity);
    dailyForecast[dateStr].wind_speed.push(item.wind.speed);
    dailyForecast[dateStr].weather.push(item.weather[0].main);
  });
  
  // Convert to array and sort by date
  const forecastArray = Object.keys(dailyForecast).map(dateStr => {
    const data = dailyForecast[dateStr];
    const temps = data.temps;
    return {
      date: dateStr,
      temp_min: Math.min(...temps),
      temp_max: Math.max(...temps),
      feels_like: data.feels_like.reduce((a, b) => a + b, 0) / data.feels_like.length,
      humidity: data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length,
      wind_speed: data.wind_speed.reduce((a, b) => a + b, 0) / data.wind_speed.length,
      weather_main: data.weather[0], // Most common weather condition
      description: data.description,
      icon: data.icon,
      dt: data.dt
    };
  });
  
  forecastArray.sort((a, b) => a.dt - b.dt);
  
  // Get next 5 days (excluding today)
  const nextDays = forecastArray.slice(1, 6);
  
  // Display forecast
  forecastDataDiv.innerHTML = `
    <h4 class="forecast-title">5-Day Forecast</h4>
    <div class="forecast-grid">
      ${nextDays.map(day => {
        const date = new Date(day.dt * 1000);
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
        
        return `
          <div class="forecast-day">
            <div class="forecast-date">${weekday}, ${monthDay}</div>
            <img src="${iconUrl}" alt="${day.description}" class="forecast-icon" />
            <div class="forecast-temp">${day.temp_min.toFixed(0)}°/${day.temp_max.toFixed(0)}°</div>
            <div class="forecast-desc">${day.description}</div>
          </div>
        `;
      }).join('')}
    </div>
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

// Display news articles
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