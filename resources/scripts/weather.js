document.addEventListener('DOMContentLoaded', () => {
	const status = document.getElementById('status');
	const loc = document.getElementById('loc');
	const temp = document.getElementById('temp');
	const cond = document.getElementById('cond');
	const icon = document.getElementById('icon');

	// Direct client-side fetch: paste your free API key below
	const API_KEY = '673f8101da2d70f1b6a996bd4212c898';

	async function load() {
		status.textContent = 'Loading weather for Troy, NY...';
		try {
			const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Troy,US&units=imperial&appid=${API_KEY}`);

			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

			const data = await resp.json();

			loc.textContent = `${data.name}, ${data.sys.country}`;
			temp.textContent = `${Math.round(data.main.temp)}°F`;
			cond.textContent = capitalize(data.weather[0].description);

			// Add new info dynamically
			const extraInfo = document.createElement("div");
			extraInfo.innerHTML = `
            <p><strong>Feels like:</strong> ${Math.round(data.main.feels_like)}°F</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind:</strong> ${Math.round(data.wind.speed)} mph</p>
            <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
            <p><strong>Clouds:</strong> ${data.clouds.all}%</p>
        `;
			document.querySelector(".card-body").appendChild(extraInfo);

			// Display icon
			const iconCode = data.weather[0].icon;
			icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
			icon.style.display = '';

			status.textContent = '';
		} catch (err) {
			status.textContent = 'Error: ' + err.message;
		}

	}


	function capitalize(s) {
		if (!s) return s;
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	load();
});
