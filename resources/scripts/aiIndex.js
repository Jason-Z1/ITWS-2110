// ===== ADD YOUR API KEYS HERE =====
const OPENWEATHER_API_KEY = '673f8101da2d70f1b6a996bd4212c898';
const THENEWSAPI_KEY = '0EN8qctLqdAHTWbtBzuObVXziQLEN9NsEiHMwnsh';

// ========== Weather Logic ==========
document.getElementById('weather-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const city = document.getElementById('city-input').value.trim();
    if (!city) return;

    const weatherRes = document.getElementById('weather-result');
    weatherRes.innerHTML = `<div class="text-muted">Loading...</div>`;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('City not found.');
        const data = await resp.json();
        weatherRes.innerHTML = `
            <h5>${data.name}, ${data.sys.country}</h5>
            <div><strong>${data.weather[0].description}</strong></div>
            <div>🌡️ Temp: ${Math.round(data.main.temp)}&deg;C (feels like ${Math.round(data.main.feels_like)}&deg;C)</div>
            <div>💧 Humidity: ${data.main.humidity}%</div>
            <div>💨 Wind: ${data.wind.speed} m/s</div>
        `;
    } catch (err) {
        weatherRes.innerHTML = `<div class="text-danger">${err.message}</div>`;
    }
});

// ========== News Logic ==========
async function loadNews() {
    const newsContainer = document.getElementById('news-list');
    newsContainer.innerHTML = `<div class="text-muted">Loading news...</div>`;
    try {
        const url = `https://api.thenewsapi.com/v1/news/top?api_token=${THENEWSAPI_KEY}&locale=us&language=en&limit=5`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Failed to fetch news.');
        const data = await resp.json();
        if (data.data && data.data.length) {
            newsContainer.innerHTML = data.data.map(article =>
                `<div class="headline d-flex align-items-start">
                    <img src="${article.image_url || ''}" alt="" width="80" onerror="this.style.display='none'">
                    <div>
                        <a href="${article.url}" target="_blank"><strong>${article.title}</strong></a>
                        <div class="text-muted mb-1" style="font-size:0.95em;">${article.source} - ${new Date(article.published_at).toLocaleString()}</div>
                        <div>${article.description || article.snippet || ''}</div>
                    </div>
                </div>`
            ).join('');
        } else {
            newsContainer.innerHTML = `<div class="text-warning">No news found.</div>`;
        }
    } catch (err) {
        newsContainer.innerHTML = `<div class="text-danger">${err.message}</div>`;
    }
}
loadNews();
