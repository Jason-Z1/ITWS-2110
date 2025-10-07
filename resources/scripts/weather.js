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
			const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Troy,US&units=imperial&appid=${encodeURIComponent(API_KEY)}`);
			if (!resp.ok) {
				const body = await resp.json().catch(() => ({}));
				throw new Error(body.message || `HTTP ${resp.status}`);
			}
			const data = await resp.json();
			loc.textContent = `${data.name}, ${data.sys && data.sys.country}`;
			temp.textContent = data.main && Math.round(data.main.temp) + '°F';
			cond.textContent = data.weather && data.weather[0] && capitalize(data.weather[0].description);

			if (data.weather && data.weather[0] && data.weather[0].icon) {
				const iconCode = data.weather[0].icon;
				icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
				icon.style.display = '';
			}

			status.textContent = '';
		} catch (err) {
			status.textContent = 'Error: ' + err.message;
			icon.style.display = 'none';
			temp.textContent = '--°F';
			cond.textContent = '--';
		}
	}

	function capitalize(s) {
		if (!s) return s;
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	load();
});
