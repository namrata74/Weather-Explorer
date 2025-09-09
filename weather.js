// It looks like a sample API key was included in the HTML file,
// so we'll use that as a placeholder. You can replace this with your actual key.
const apiKey = 'da5cc509bc967933cf9f957a7a06eb9b';

// Base URLs for the OpenWeatherMap API
const currentWeatherBaseUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;
const forecastWeatherBaseUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric`;

// Get DOM elements
const searchButton = document.querySelector('.search-bar button');
const searchInput = document.querySelector('.search-bar input');
const weatherInfo = document.querySelector('.weather-info');
const forecastContainer = document.querySelector('.forecast');
const body = document.body;

// Helper function to update the body background class based on weather condition
const updateBackground = (condition) => {
  const weatherClass = condition.toLowerCase();
  body.className = ''; // Remove all classes
  if (body.classList.contains('clear')) {
    body.classList.remove('clear');
  } else if (body.classList.contains('cloudy')) {
    body.classList.remove('cloudy');
  } else if (body.classList.contains('rainy')) {
    body.classList.remove('rainy');
  } else if (body.classList.contains('snowy')) {
    body.classList.remove('snowy');
  } else {
    body.classList.add('default-bg');
  }

  // Set new class
  if (weatherClass.includes('clear')) {
    body.classList.add('clear');
  } else if (weatherClass.includes('cloud')) {
    body.classList.add('cloudy');
  } else if (weatherClass.includes('rain') || weatherClass.includes('drizzle')) {
    body.classList.add('rainy');
  } else if (weatherClass.includes('snow')) {
    body.classList.add('snowy');
  } else {
    body.classList.add('default-bg');
  }
};

// Function to fetch weather data from the API
const fetchWeatherData = async (city) => {
  if (!city) {
    return;
  }

  try {
    // Fetch current weather data
    const currentWeatherResponse = await fetch(`${currentWeatherBaseUrl}&q=${city}`);
    const currentWeatherData = await currentWeatherResponse.json();

    if (!currentWeatherResponse.ok) {
      throw new Error(currentWeatherData.message || 'City not found.');
    }

    // Display current weather
    displayCurrentWeather(currentWeatherData);

    // Fetch 5-day forecast data
    const forecastWeatherResponse = await fetch(`${forecastWeatherBaseUrl}&q=${city}`);
    const forecastWeatherData = await forecastWeatherResponse.json();

    if (!forecastWeatherResponse.ok) {
      throw new Error(forecastWeatherData.message || 'Forecast not found.');
    }

    // Display 4-day forecast
    displayForecast(forecastWeatherData);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    weatherInfo.innerHTML = `
      <h2>City not found</h2>
      <p>Please try a different city.</p>
      <p></p>
    `;
    forecastContainer.innerHTML = '';
    updateBackground('default');
  }
};

// Function to display the current weather
const displayCurrentWeather = (data) => {
  const { name, main, weather } = data;
  weatherInfo.innerHTML = `
    <h2>${name}</h2>
    <p>Temperature: ${Math.round(main.temp)}°C</p>
    <p>${weather[0].description}</p>
  `;
  updateBackground(weather[0].main);
};

// Function to display the 4-day forecast
const displayForecast = (data) => {
  // Clear previous forecast
  forecastContainer.innerHTML = '';

  // Filter the forecast list to get one entry per day (around noon)
  const dailyForecasts = data.list.filter((item, index) => {
    return item.dt_txt.includes("12:00:00");
  });

  // Take the next 4 days
  const futureForecasts = dailyForecasts.slice(0, 4);

  futureForecasts.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const temp = Math.round(day.main.temp);
    const condition = day.weather[0].main;

    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');

    let iconClass = '';
    if (condition.includes('Clear')) {
      iconClass = 'sun';
    } else if (condition.includes('Cloud')) {
      iconClass = 'cloud';
    } else if (condition.includes('Rain')) {
      iconClass = 'cloud-rain';
    } else if (condition.includes('Snow')) {
      iconClass = 'snow';
    } else {
      iconClass = 'cloud';
    }

    dayDiv.innerHTML = `
      <p>${dayName}</p>
      <div class="icon ${iconClass}"></div>
      <p>${temp}°C</p>
    `;
    forecastContainer.appendChild(dayDiv);
  });
};

// Event listener for the search button
searchButton.addEventListener('click', () => {
  const city = searchInput.value;
  fetchWeatherData(city);
});

// Allow searching by pressing Enter key
searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    searchButton.click();
  }
});

// Initial weather fetch for a default city
window.onload = () => {
  fetchWeatherData('London');
};
