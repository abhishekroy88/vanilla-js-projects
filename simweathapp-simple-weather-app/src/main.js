const getLocationBtn = document.querySelector(".get-location-btn");
const locationHeading = document.querySelector(".location");

const tempHeadings = document.querySelector(".temp-section").children;
const minTempHeading = document.querySelector(".min-temp");
const currTempHeading = document.querySelector(".curr-temp");
const maxTempHeading = document.querySelector(".max-temp");

const weatherIconImage = document.querySelector(".weather-icon");

const ERROR_UNSUPPORTED = "Browser does not support geolocation.";
const ERROR_UNABLE = "Unable to retrieve location.";
const API_ENDPOINT =
  "https://fcc-weather-api.freecodecamp.repl.co/api/current?";
const CELSIUS_SYM = "&#x2103;";
const FAHRENHEIT_SYM = "&#x2109;";
const CELSIUS_CLASS = "celsius";

getLocationBtn.addEventListener("mousedown", fetchLocationAndWeather);

function fetchLocationAndWeather() {
  if (!navigator.geolocation) {
    console.log(ERROR_UNSUPPORTED);
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }

  function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url = API_ENDPOINT + `lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => displayWeather(data))
      .catch((err) => console.log(err.message));
  }

  function displayWeather(data) {
    locationHeading.innerHTML = `${data.name}, ${data.sys.country}`;

    for (let heading of tempHeadings) {
      heading.innerHTML = "";

      const headingSpan = document.createElement("span");
      headingSpan.classList.add(CELSIUS_CLASS);

      switch (heading) {
        case minTempHeading:
          headingSpan.innerHTML = data.main.temp_min;
          break;
        case currTempHeading:
          headingSpan.innerHTML = data.main.feels_like;
          break;
        case maxTempHeading:
          headingSpan.innerHTML = data.main.temp_max;
          break;
        default:
          console.log("Something went wrong.");
      }

      const unitToggler = document.createElement("button");
      unitToggler.innerHTML = CELSIUS_SYM;
      unitToggler.classList.add("unit-toggler");
      unitToggler.addEventListener("click", toggleUnit);

      heading.appendChild(headingSpan);
      heading.appendChild(unitToggler);

      weatherIconImage.setAttribute("src", data.weather[0].icon);
    }
  }

  function error() {
    console.log(ERROR_UNABLE);
  }
}

function toggleUnit(e) {
  const children = e.target.parentNode.children;
  const childSpan = children[0];
  const childBtn = children[1];

  let valToConvert = Number(childSpan.innerHTML);
  let resultVal = null;
  let resultUnit = null;

  if (childSpan.classList.contains(CELSIUS_CLASS)) {
    resultVal = convertCelToFah(valToConvert).toFixed(2);
    resultUnit = FAHRENHEIT_SYM;
  } else {
    resultVal = convertFahToCel(valToConvert).toFixed(2);
    resultUnit = CELSIUS_SYM;
  }

  childSpan.classList.toggle(CELSIUS_CLASS);
  childSpan.innerHTML = resultVal;
  childBtn.innerHTML = resultUnit;
}

function convertCelToFah(val) {
  return (val * 9) / 5 + 32;
}

function convertFahToCel(val) {
  return ((val - 32) * 5) / 9;
}
