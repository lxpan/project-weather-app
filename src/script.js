import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import beaufort from 'beaufort-scale';
import './style.css';


const API_KEY = 'a9fa31006d3ec59a7888dead8b265f57';

const opt = {
    tempUnit: 'C',
    forecast: null,
    city: null,
};

const MOCK_DATA = {
    coord: {
        lon: 143.8496,
        lat: -37.5662,
    },
    weather: [
        {
            id: 500,
            main: 'Rain',
            description: 'light rain',
            icon: '10d',
        },
    ],
    base: 'stations',
    main: {
        temp: 283.7,
        feels_like: 283.13,
        temp_min: 283.7,
        temp_max: 283.7,
        pressure: 1010,
        humidity: 89,
        sea_level: 1010,
        grnd_level: 958,
    },
    visibility: 10000,
    wind: {
        speed: 5.53,
        deg: 269,
        gust: 12.37,
    },
    rain: {
        '1h': 0.46,
    },
    clouds: {
        all: 98,
    },
    dt: 1665716871,
    sys: {
        country: 'AU',
        sunrise: 1665690094,
        sunset: 1665736774,
    },
    timezone: 39600,
    id: 2177091,
    name: 'Ballarat',
    cod: 200,
};

function toggleUnits() {
    if (opt.tempUnit === 'F') {
        opt.tempUnit = 'C';
    } else if (opt.tempUnit === 'C') {
        opt.tempUnit = 'F';
    }
}

function degreesToCardinal(windDir) {
    const compassSectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];

    let index = windDir % 360;
    index = Math.round(index / 45);
    const compassDirection = compassSectors[index];
    return compassDirection;
}

function displayTemperature(kelvin, unit) {
    function KelvinToCelsius() {
        if (typeof kelvin === 'number') {
            const celsius = kelvin - 273.15;
            // return celsius.toPrecision(3);
            return Math.round(celsius);
        }
        throw new Error('Temperature is not a number!');
    }

    function KelvinToFahrenheit() {
        if (typeof kelvin === 'number') {
            const fahrenheit = 1.8 * (kelvin - 273) + 32;
            // return fahrenheit.toPrecision(4);
            return Math.round(fahrenheit);
        }
        throw new Error('Temperature is not a number!');
    }

    if (unit === 'C') {
        return `${KelvinToCelsius(kelvin)}\u00B0C`;
    }
    if (unit === 'F') {
        return `${KelvinToFahrenheit(kelvin)}\u00B0F`;
    }

    return new Error('No matching unit specified.');
}

async function getWeatherForCity(city) {
    const convertUTCtoLocalTime = (utc) => {
        const timestamp = `${utc} UTC`;
        const date = new Date(timestamp);
        const localTimestamp = date.toString();
        return localTimestamp;
    }

    const processResponse = (result) => ({
        city,
        country_code: result.sys.country,
        weather: result.weather[0].main,
        weather_description: result.weather[0].description,
        weather_icon: result.weather[0].icon,
        temp: result.main.temp,
        feels_like_temp: result.main.feels_like,
        temp_min: result.main.temp_min,
        temp_max: result.main.temp_max,
        coords: result.coord,
        humidity: result.humidity ? result.humidity : result.main.humidity,
        wind: result.wind,
        rain: result.rain ? result.rain['1h'] : null,
        time: (result.dt_txt) ? convertUTCtoLocalTime(result.dt_txt) : null,
    });

    try {
        const response = await fetch(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`
        );
        const data = await response.json();

        const responseFiveDay = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}&units=metric`
        );
        const fiveDayData = await responseFiveDay.json();
        const fiveDayDataProcessed = fiveDayData.list.map((row) => processResponse(row));
        
        // const data = MOCK_DATA;

        return [processResponse(data), fiveDayDataProcessed];
    } catch (error) {
        console.log(`Error: ${error}, retrieving forecast for ${city}`);
    }
    return 'Error';
}

function displayForecast(data, extended) {
    const capitaliseString = (str) => {
        if (typeof str === 'string') {
            const capitalise = str.charAt(0).toUpperCase() + str.slice(1);
            return capitalise;
        }
        throw new Error('Not a string!');
    };

    const displayLocation = () => {
        const location = document.querySelector('.location');
        const geocode = document.querySelector('.geocode');
        location.textContent = `${data.city}, ${data.country_code}`;
        geocode.textContent = `${data.coords.lat}, ${data.coords.lon}`;
    };

    const displayAtAGlance = () => {
        const mainTemp = document.querySelector('.main-temp');
        const weatherIcon = document.querySelector('.weather-icon');
        const iconCode = data.weather_icon;
        mainTemp.textContent = displayTemperature(data.temp, opt.tempUnit);
        weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    const displayCurrentTemperature = () => {
        // temperature
        const temp = document.querySelector('.temp');
        const descriptor = document.querySelector('.descriptor');

        const tempRange = ['temp_min', 'temp_max'].map((field) =>
            displayTemperature(data[field], opt.tempUnit)
        );

        temp.textContent = `${tempRange[0]} - ${tempRange[1]}`;
        descriptor.textContent = `Feels like ${displayTemperature(
            data.feels_like_temp,
            opt.tempUnit
        )}. ${capitaliseString(data.weather_description)}. ${(beaufort(data.wind.speed)).desc}.`;
    };

    const displayWind = () => {
        const wind = document.querySelector('.wind');
        wind.textContent = `${data.wind.speed} m/s ${degreesToCardinal(
            data.wind.deg
        )}`;
    };

    const displayRain = () => {
        const rainDiv = document.querySelector('.rain');
        if (data.rain) {
            rainDiv.textContent = `Rain ${data.rain} mm, Humidity: ${data.humidity}%`;
        } else {
            rainDiv.textContent = `Humidity: ${data.humidity}%`;
        }
    };

    const displayExtendedForecast = () => {
        const extendedForecastDiv = document.querySelector('.extended-forecast');
        const fiveDayForecasts = extended.filter((row) => row.time.includes('11:00:00'));

        fiveDayForecasts.forEach((day) => {
            const forecastDate = new Date(day.time);
            const options = { weekday: 'long'};
            const fullDayName = new Intl.DateTimeFormat('en-US', options).format(forecastDate);

            const dayForecastDiv = document.createElement('div');
            dayForecastDiv.classList.add('extended-forecast__dayForecastDiv');
            const dayName = document.createElement('div');
            const dayTemp = document.createElement('div');
            const dayIcon = document.createElement('img');

            // Only show first three letters of day - e.g. 'Mon', 'Tue', 'Wed';
            dayName.textContent = `${fullDayName.slice(0,3)} ${forecastDate.toLocaleDateString().slice(0,2)}`;
            dayName.classList.add('extended-forecast__dayName');

            dayTemp.textContent = `${Math.round(day.temp)}\u00B0C`;
            dayTemp.classList.add('extended-forecast__dayTemperature');

            dayIcon.src = `http://openweathermap.org/img/wn/${day.weather_icon}@2x.png`;

            dayForecastDiv.append(dayName, dayTemp, dayIcon);
            extendedForecastDiv.appendChild(dayForecastDiv);
        });
    }

    displayLocation();
    displayAtAGlance();
    displayCurrentTemperature();
    displayWind();
    displayRain();
    displayExtendedForecast();
}

function displayMap(data) {
    const layer = 'precipitation_new';
    // WeatherMap 1.0
    const mapURL = `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${API_KEY}`;
    // WeatherMap 2.0

    const { lon } = data.coords;
    const { lat } = data.coords;

    const map = new Map({
        target: 'map',
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
        ],
        view: new View({
            center: fromLonLat([lon, lat]),
            zoom: 10,
        }),
    });

    const precipLayer = new TileLayer({
        source: new XYZ({
            url: mapURL,
        }),
    });
    map.addLayer(precipLayer);
}

const printForecast = async (city) => {
    opt.forecast = await getWeatherForCity(city);
    console.log(opt.forecast);
    displayForecast(opt.forecast[0], opt.forecast[1]);
    // temporarily hide map
    // displayMap(opt.forecast);
};

function resetForecastDisplay() {
    const extendedForecasts = document.querySelector('.extended-forecast');
    extendedForecasts.innerHTML = '';
}

function loadCityForecast() {
    resetForecastDisplay();
    opt.city = document.getElementById('cityBox').value;
    printForecast(opt.city);
}

const cityButton = document.getElementById('getCityButton');
cityButton.addEventListener('click', loadCityForecast);

printForecast('Ballarat');
