const OPENWEATHER_KEY = "673f8101da2d70f1b6a996bd4212c898";     
const THENEWSAPI_KEY  = "0EN8qctLqdAHTWbtBzuObVXziQLEN9NsEiHMwnsh";     

// Fixed city info 
const CITY = "Troy";
const STATE = "NY";
const COUNTRY = "US";
const UNITS = "imperial"; // for F and MPH

function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Helper for day name (Mon, Tue, etc.)
function formatDay(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

// Build a small weather icon URL
function iconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// Fetch current weather (OpenWeather Current Weather Data)
function getCurrentWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${STATE},${COUNTRY}&units=${UNITS}&appid=${OPENWEATHER_KEY}`;

  $.getJSON(url)
    .done((data) => {
      const temp = Math.round(data.main.temp);
      const feels = Math.round(data.main.feels_like);
      const humidity = data.main.humidity;
      const pressure = data.main.pressure;
      const wind = Math.round(data.wind.speed);
      const desc = data.weather && data.weather[0] ? data.weather[0].description : "";
      const icon = data.weather && data.weather[0] ? data.weather[0].icon : "01d";
      const updated = formatTime(data.dt);

      // Update the DOM
      $("#current-temp").text(`${temp}°`);
      $("#current-desc").text(desc);
      $("#current-feels").text(`${feels}°`);
      $("#current-humidity").text(`${humidity}%`);
      $("#current-pressure").text(`${pressure} hPa`);
      $("#current-wind").text(`${wind} mph`);
      $("#current-icon").attr("src", iconUrl(icon));
      $("#current-icon").attr("alt", desc || "Weather icon");
      $("#current-updated").text(`Updated: ${updated}`);
    })
    .fail((xhr) => {
      console.error("Current weather error", xhr);
      $("#current-desc").text("Failed to load weather.");
    });
}

// Fetch 5-day forecast (3-hour steps) and pick one entry per day around midday
function getForecast() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${STATE},${COUNTRY}&units=${UNITS}&appid=${OPENWEATHER_KEY}`;

  $.getJSON(url)
    .done((data) => {
      // Group by date (YYYY-MM-DD)
      const byDate = {};
      data.list.forEach(item => {
        const dateStr = item.dt_txt.split(" ")[0]; // 'YYYY-MM-DD'
        if (!byDate[dateStr]) byDate[dateStr] = [];
        byDate[dateStr].push(item);
      });

      // Pick up to 5 upcoming days, choosing the entry closest to 12:00
      const days = Object.keys(byDate).slice(0, 5);
      const forecastHtml = days.map(dateStr => {
        const entries = byDate[dateStr];
        // Choose the entry closest to noon (12:00:00)
        let pick = entries[0];
        let bestDiff = Infinity;
        entries.forEach(e => {
          const hour = new Date(e.dt_txt.replace(" ", "T") + "Z").getUTCHours();
          const diff = Math.abs(12 - hour);
          if (diff < bestDiff) {
            bestDiff = diff;
            pick = e;
          }
        });

        const ts = pick.dt;
        const day = formatDay(ts);
        const temp = Math.round(pick.main.temp);
        const icon = pick.weather && pick.weather[0] ? pick.weather[0].icon : "01d";
        const desc = pick.weather && pick.weather[0] ? pick.weather[0].description : "";

        return `
          <div class="col-6 col-sm-4 col-md-2-5 col-lg-2">
            <div class="card text-center h-100 shadow-sm forecast-card">
              <div class="card-body p-2">
                <div class="fw-semibold">${day}</div>
                <img class="weather-icon-sm" src="${iconUrl(icon)}" alt="${desc}" />
                <div class="h5 mb-0">${temp}°</div>
                <div class="small text-capitalize text-muted">${desc}</div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      $("#forecast-list").html(forecastHtml);
    })
    .fail((xhr) => {
      console.error("Forecast error", xhr);
      $("#forecast-list").html(`<div class="col-12"><div class="alert alert-danger">Failed to load forecast.</div></div>`);
    });
}

// Fetch news from TheNewsAPI (Top news in US)
function getNews() {
  const url = `https://api.thenewsapi.com/v1/news/top?api_token=${THENEWSAPI_KEY}&locale=us&limit=6`;

  $.getJSON(url)
    .done((res) => {
      const articles = res.data || [];
      if (!articles.length) {
        $("#news-list").html('<div class="col-12"><div class="alert alert-warning">No news found.</div></div>');
        return;
      }

      const newsHtml = articles.map((a) => {
        const title = a.title || "Untitled";
        const source = a.source || "Unknown";
        const link = a.url || "#";
        const image = a.image_url || "";
        const published = a.published_at ? new Date(a.published_at).toLocaleString() : "";
        const summary = a.description || "";

        return `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
              ${image ? `<img src="${image}" class="card-img-top news-img" alt="news image" />` : ""}
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${title}</h5>
                <p class="card-text small text-muted mb-2">${source} • ${published}</p>
                <p class="card-text">${summary || ""}</p>
                <a href="${link}" class="mt-auto btn btn-outline-primary" target="_blank" rel="noopener">Read more</a>
              </div>
            </div>
          </div>
        `;
      }).join("");

      $("#news-list").html(newsHtml);
    })
    .fail((xhr) => {
      console.error("News error", xhr);
      $("#news-list").html(`<div class="col-12"><div class="alert alert-danger">Failed to load news.</div></div>`);
    });
}

$(function() {
  // Kick off the page
  if (!OPENWEATHER_KEY || !THENEWSAPI_KEY) {
    console.warn("Add your API keys in app.js to fetch live data.");
  }
  getCurrentWeather();
  getForecast();
  getNews();
});