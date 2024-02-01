$(document).ready(function () {
  $("#searchForm").submit(function (event) {
    event.preventDefault();
    const city = $("#cityInput").val().trim();
    getWeather(city);
  });

  $("#searchHistory").on("click", ".historyItem", function () {
    const city = $(this).text().trim();
    getWeather(city);
  });

  const initialSearchHistory =
    JSON.parse(localStorage.getItem("searchHistory")) || [];
  updateSearchHistoryUI(initialSearchHistory);
});

function getWeather(city) {
  const apiKey = "d7493286fcf76a64c72d0da725a8e97e";
  const base_url = "https://api.openweathermap.org/data/2.5/weather";
  const forecast_url = "https://api.openweathermap.org/data/2.5/forecast";
  const params = { q: city, appid: apiKey, units: "imperial" }; // Use 'imperial' for Fahrenheit

  $.get(base_url, params)
    .done(function (currentWeatherData) {
      displayCurrentWeather(currentWeatherData);
      addToSearchHistory(city);
    })
    .fail(handleError);

  $.get(forecast_url, params)
    .done(function (forecastData) {
      displayFiveDayForecast(forecastData);
    })
    .fail(handleError);
}

function displayCurrentWeather(currentWeatherData) {
  const currentDate = new Date().toLocaleDateString();
  const weatherIcon = getWeatherIconUrl(currentWeatherData.weather[0].icon);

  const currentWeatherHTML = `
      <h2>${currentWeatherData.name} (${currentDate}) <img src="${weatherIcon}" alt="${currentWeatherData.weather[0].description}"></h2>
      <p>Date: ${currentDate}</p>
      <p>Temperature: ${currentWeatherData.main.temp} °F</p>
      <p>Humidity: ${currentWeatherData.main.humidity} %</p>
      <p>Wind Speed: ${currentWeatherData.wind.speed} mph</p>
    `;

  $("#currentWeather").html(currentWeatherHTML);
}

function displayFiveDayForecast(forecastData) {
  const today = new Date();
  const fiveDaysFromToday = new Date();
  fiveDaysFromToday.setDate(today.getDate() + 5);

  const filteredForecast = forecastData.list.filter((entry) => {
    const entryDate = new Date(entry.dt_txt);
    return (
      entryDate >= today &&
      entryDate < fiveDaysFromToday &&
      entryDate.getHours() === 12
    );
  });

  const forecastHTML = filteredForecast.map(displayForecastItem).join("");

  $("#forecast").html(forecastHTML);
}

function displayForecastItem(entry) {
  const forecastIcon = getWeatherIconUrl(entry.weather[0].icon);
  const forecastDate = new Date(entry.dt_txt).toLocaleDateString();

  return `
      <div class="forecastItem">
        <p>Date: ${forecastDate}</p>
        <img src="${forecastIcon}" alt="${entry.weather[0].description}">
        <p>Temperature: ${entry.main.temp} °F</p>
        <p>Humidity: ${entry.main.humidity} %</p>
        <p>Wind Speed: ${entry.wind.speed} mph</p>
      </div>
    `;
}

function addToSearchHistory(city) {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

  if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    updateSearchHistoryUI(searchHistory);
  }
}

function updateSearchHistoryUI(searchHistory) {
  $("#searchHistory").empty();

  searchHistory.forEach((city) => {
    const historyItem = $('<div class="historyItem">').text(city);
    $("#searchHistory").append(historyItem);
  });
}

function handleError(error) {
  console.error("Error fetching data:", error);
}

function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/w/${iconCode}.png`;
}
