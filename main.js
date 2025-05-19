console.log();

//import "/weather.css"
//import { getWeather } from "/weather";
import axios from "axios"

// https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&timeformat=unixtime&timezone=Europe%2FBerlin&models=meteofrance_seamless

//export function getWeather(lat, lon, timezone);

function getWeather(lat, lon, timezone) {
    return axios.get(
      "https://api.open-meteo.com/v1/forecast?current=temperature_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&timeformat=unixtime", {
            params: {
                latitude: lat, 
                longitude: lon, 
                timezone,
            },
        }
    )
    .then(({data}) => {
        return {
            current: parseCurrentWeather(data),
            daily: parseDailyWeather(data),
            hourly: parseHourlyWeather(data)
        }
    })
}

function parseCurrentWeather({ current, daily }) {
    const { 
        temperature_2m: currentTemp, 
        wind_speed_10m: windSpeed, 
        weather_code: iconCode,
    } = current

    const {
        temperature_2m_max: [maxTemp],
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFeelsLike],
        apparent_temperature_min: [minFeelsLike],
        precipitation_sum: [precip],
    } = daily

    return {
        currentTemp: Math.round(currentTemp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100,
        iconCode,
    }
}

function parseDailyWeather({ daily }) {
  return daily.time.map((time, index) => {
      return {
          timestamp: time * 1000,
          iconCode: daily.weather_code[index],
          maxTemp: Math.round(daily.temperature_2m_max[index]),

      }
  })
}

function parseHourlyWeather({ hourly, current }) {
  return hourly.time.map((time, index) => {
      return {
          timestamp: time * 1000,
          iconCode: hourly.weather_code[index],
          temp: Math.round(hourly.temperature_2m[index]),
          feelsLike: Math.round(hourly.apparent_temperature[index]),
          windSpeed: Math.round(hourly.wind_speed_10m[index]),
          precip: Math.round(hourly.precipitation[index] * 100) / 100,
      }
  }).filter(({ timestamp }) => timestamp >= current.time * 1000)
}

//--------------------------------------------------------------

getWeather(48.85, 2.3499994, Intl.DateTimeFormat().resolvedOptions().timeZone)
  .then(renderWeather)
  .catch(e => {
    console.error(e);
    alert("Problem encountered getting your weather data")
  })

function renderWeather({ current, daily, hourly }) {
  renderCurrentWeather(current);
  renderDailyWeather(daily);
  renderHourlyWeather(hourly);
}

function setValue(selector, value, { item = document } = {}) {
  if (parent = item.querySelector(`[data-${selector}]`)) {
    return parent.textContent = value;
  };
}

//----------------------------------------------------------------------------------

const icon_map  = new Map();

addMapping([0, 1], "sun");
addMapping([2], "cloud-sun");
addMapping([3], "cloud");
addMapping([45, 48], "smog");
addMapping([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], "cloud-showers-heavy");
addMapping([71, 73, 75, 77,85, 86], "snowflake");
addMapping([95, 96, 99], "cloud-bolt");

function addMapping(values, icon) {
  values.forEach(value => {
    icon_map.set(value, icon);
  });
}

function getIconUrl(iconCode) {
  return `${icon_map.get(iconCode)}.svg`;;
}

const currentIcon = document.querySelector("[data-current-icon]");

function renderCurrentWeather(current) {
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp);
  setValue("current-high", current.highTemp);
  setValue("current-low", current.lowTemp);
  setValue("current-fl-high", current.highFeelsLike);
  setValue("current-fl-low", current.lowFeelsLike);
  setValue("current-wind", current.windSpeed);
  setValue("current-precip", current.precip);
}

const Day_Formatter = new Intl.DateTimeFormat(undefined, { weekday:
  "long" });
  const dailySection = document.querySelector("[data-day-section]");
  const dayCardTemplate = document.getElementById("day-card-template");
  
function renderDailyWeather(daily) {
  dailySection.innerHTML = "";
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true);
    setValue("temp", day.maxTemp, { item: element});
    setValue("date", Day_Formatter.format(day.timestamp), { item: 
    element });
    element.querySelector("[data-icon]").src = getIconUrl(day.iconCode);
    dailySection.append(element);
   });
}

const Hour_Formatter = new Intl.DateTimeFormat(undefined, { hour:
  "numeric" });
  const hourlySection = document.querySelector("[data-hour-section]");
  const hourRowTemplate = document.getElementById("hour-row-template");
    
function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = "";
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true);
    setValue("temp", hour.temp, { item: element});
    setValue("fl-temp", hour.feelsLike, { item: element});
    setValue("wind", hour.windSpeed, { item: element});
    setValue("precip", hour.precip, { item: element});
    setValue("day", Day_Formatter.format(hour.timestamp), { item: 
      element});
    setValue("time", Hour_Formatter.format(hour.timestamp), { item: 
    element});
    element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode);
    hourlySection.append(element);
  });
}

//-------------------------------------------------------------------------------

console.log("End of Code");
console.log();

// References
// Enes Gür (2024) Create a Basic Weather App: HTML, CSS, JS Guide,  Weatherstack. Available at: https://blog.weatherstack.com/blog/how-to-create-a-simple-weather-app-with-html-css-and-js/ (Accessed: 3 February 2025). 
// Fetch (2025) Fetch: Living Standard, Fetch Spec. Available at: https://fetch.spec.whatwg.org/ (Accessed: 31 January 2025).
// Kolja Nolte (no date) How to fix Node.js’ v23 ‘ExperimentalWarning’ CLI bug. Available at: https://blog.kolja-nolte.com/fixes/node-js-experimentalwarning-bug-fix/ (Accessed: 4 February 2025).
// Moutard, R. (2024) Error handling, past and future. From try/catch to outcome pattern, how the philosophy around errors and exceptions is changing., Medium. Available at: https://medium.com/@raphael.moutard/error-handling-past-and-future-782001d645af (Accessed: 2 February 2025).
// Nathan Sebhastian (2023) How to Use Async/Await in JavaScript – Explained with Code Examples, Free Code Camp. Available at: https://www.freecodecamp.org/news/javascript-async-await/ (Accessed: 2 February 2025).
// Open-Meteo (2022) Weather Forecast API, Open-Meteo.com. Available at: https://open-meteo.com/en/docs (Accessed: 6 February 2025).
// WDS (2023) How To Build A Weather App In JavaScript Without Needing A Server - YouTube, Youtubube. Available at: https://www.youtube.com/watch?v=w0VEOghdMpQ (Accessed: 6 February 2025).