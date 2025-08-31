const searchBtn = document.querySelector("button");
const searchInput = document.querySelector("input");
const cityHeading = document.querySelector(".weather-info h2");
const tempPara = document.querySelector(".weather-info p:nth-child(2)");
const descPara = document.querySelector(".weather-info p:nth-child(3)");

const apiKey = 'da5cc509bc967933cf9f957a7a06eb9b'; // Replace with your API key
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=`;

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city !== "") {
    getWeatherData(city);
  } else {
    cityHeading.textContent = "Please enter a city";
    tempPara.textContent = "";
    descPara.textContent = "";
  }
});

function getWeatherData(city) {
  fetch(`${apiUrl}${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod === "404") {
        cityHeading.textContent = "City not found";
        tempPara.textContent = "";
        descPara.textContent = "Please try another city";
      } else {
        cityHeading.textContent = data.name;
        tempPara.textContent = `Temperature: ${data.main.temp}°C`;

        // Replace "overcast clouds" with just "Cloudy"
        let description = data.weather[0].description;
        if (description.toLowerCase() === "overcast clouds") {
          description = "Cloudy";
        }
        descPara.textContent = description;

        // Fetch 4-day forecast
        getForecastData(city);
      }
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
    });
}

/* ------------------------- */
/* EXTRA FUNCTIONS ADDED     */
/* ------------------------- */

// Fetch 4-day forecast
function getForecastData(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const forecastGrid = document.querySelector(".forecast-grid");
      if (!forecastGrid) return;

      forecastGrid.innerHTML = ""; // Clear old forecast

      // Pick one forecast per day at 12:00
      const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 4);

      dailyData.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(item.main.temp);
        const condition = item.weather[0].main;
        const iconClass = getIconClass(condition);

        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        dayDiv.innerHTML = `
          <p>${date}</p>
          <div class="icon ${iconClass}"></div>
          <p>${temp}°C</p>
        `;
        forecastGrid.appendChild(dayDiv);
      });
    })
    .catch(error => console.error("Error fetching forecast:", error));
}

// Choose icon class for forecast
function getIconClass(condition) {
  switch (condition.toLowerCase()) {
    case "rain": return "cloud-rain";
    case "clouds": return "cloud";
    case "clear": return "sun";
    case "snow": return "snow";
    default: return "cloud-sun";
  }
}

