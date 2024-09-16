const apiKey = 'ffa936a86151f3ac603b9d384faa29bd';  

const searchForm = document.getElementById('city-search-form');
const cityInput = document.getElementById('city-input');
const searchHistoryEl = document.getElementById('search-history');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const cityNameEl = document.getElementById('city-name');
const dateEl = document.getElementById('date');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const forecastCardsEl = document.getElementById('forecast-cards');

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Display search history
const renderSearchHistory = () => {
  searchHistoryEl.innerHTML = '';
  searchHistory.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.addEventListener('click', () => fetchWeatherData(city));
    searchHistoryEl.appendChild(li);
  });
};

// Fetch weather data for the searched city
const fetchWeatherData = async (city) => {
  try {
    const geocodeUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(geocodeUrl);
    if (!response.ok) throw new Error('City not found');
    const data = await response.json();
    const { lat, lon } = data.coord;

    // Fetch forecast data using latitude and longitude
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) throw new Error('Forecast data not available');
    const forecastData = await forecastResponse.json();

    // Display current weather
    displayCurrentWeather(forecastData);
    // Display 5-day forecast
    displayForecast(forecastData);

    // Save to localStorage if city is new
    if (!searchHistory.includes(city)) {
      searchHistory.push(city);
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      renderSearchHistory();
    }
  } catch (error) {
    alert(error.message);
  }
};

// Display current weather conditions
const displayCurrentWeather = (data) => {
  const today = data.list[0];
  currentWeatherEl.classList.remove('hidden');
  cityNameEl.textContent = data.city.name;
  dateEl.textContent = new Date(today.dt * 1000).toLocaleDateString();
  weatherIconEl.src = `https://openweathermap.org/img/wn/${today.weather[0].icon}.png`;
  temperatureEl.textContent = today.main.temp;
  humidityEl.textContent = today.main.humidity;
  windSpeedEl.textContent = today.wind.speed;
};

// Display 5-day forecast
const displayForecast = (data) => {
  forecastEl.classList.remove('hidden');
  forecastCardsEl.innerHTML = '';

  // Loop through every 8th item in the list (24 hours apart)
  for (let i = 0; i < data.list.length; i += 8) {
    const day = data.list[i];
    const forecastCard = document.createElement('div');
    forecastCard.classList.add('forecast-card');

    forecastCard.innerHTML = `
      <h4>${new Date(day.dt * 1000).toLocaleDateString()}</h4>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
      <p>Temp: ${day.main.temp} °C</p>
      <p>Wind: ${day.wind.speed} m/s</p>
      <p>Humidity: ${day.main.humidity}%</p>
    `;
    forecastCardsEl.appendChild(forecastCard);
  }
};

// Handle search form submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherData(city);
    cityInput.value = '';
  }
});

// Load search history on page load
renderSearchHistory();
