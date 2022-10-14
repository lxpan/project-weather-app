const API_KEY = 'a9fa31006d3ec59a7888dead8b265f57';

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

function degreesToCardinal(windDir) {
    const compassSectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

    let index = windDir % 360;
    index = Math.ceil(index / 45.0);
    const compassDirection = compassSectors[index];
    return compassDirection;
}

function displayTemperature(kelvin, unit) {
    function KelvinToCelsius() {
        if (typeof kelvin === 'number') {
            const celsius = kelvin - 273.15;
            return celsius.toPrecision(4);
        }
        throw new Error('Temperature is not a number!');
    }

    function KelvinToFahrenheit() {
        if (typeof kelvin === 'number') {
            const fahrenheit = 1.8 * (kelvin - 273) + 32;
            return fahrenheit.toPrecision(4);
        }
        throw new Error('Temperature is not a number!');
    }

    if (unit === 'C') {
        return `${KelvinToCelsius(kelvin)}\u00B0C`;
    }
    if (unit === 'F') {
        return `${KelvinToFahrenheit(kelvin)}\u00B0F`;
    }
}

async function getWeatherForCity(city) {
    const processResponse = (result) => ({
        city,
        country_code: result.sys.country,
        weather: result.weather[0].main,
        weather_description: result.weather[0].description,
        temp: result.main.temp,
        feels_like_temp: result.main.feels_like,
        temp_min: result.main.temp_min,
        temp_max: result.main.temp_max,
        coords: result.coord,
        humidity: result.main.humidity,
        wind: result.wind,
        rain: result.rain['1h'],
    });

    try {
        const response = await fetch(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`
        );
        const data = await response.json();
        console.log(data);
        // const data = MOCK_DATA;

        return processResponse(data);
    } catch (error) {
        console.log(`Error: ${error}, retrieving forecast for ${city}`);
    }
    return 'Error';
}

function displayForecast(data, tempUnit) {
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

    const displayCurrentTemperature = () => {
        // temperature
        const temp = document.querySelector('.temp');
        const descriptor = document.querySelector('.descriptor');
        temp.textContent = displayTemperature(data.temp, 'C');
        descriptor.textContent = `Feels like ${displayTemperature(
            data.feels_like_temp,
            'C'
        )}. ${capitaliseString(data.weather_description)}.`;
    };

    const displayWind = () => {
        const wind = document.querySelector('.wind');
        wind.textContent = `${data.wind.speed} m/s ${degreesToCardinal(
            data.wind.deg
        )}`;
    }

    const displayRain = () => {
        const rainDiv = document.querySelector('.rain');
        rainDiv.textContent = `Rain ${data.rain} mm, Humidity: ${data.humidity}%`;
    }

    displayLocation();
    displayCurrentTemperature();
    displayWind();
    displayRain();
}

const printForecast = async (city) => {
    const forecast = await getWeatherForCity(city);
    displayForecast(forecast);
    console.log(forecast);
};

// printForecast('Ballarat');

const cityButton = document.getElementById('getCityButton');

cityButton.addEventListener('click', () => {
    const city = document.getElementById('cityBox');
    printForecast(city.value);
});

printForecast('Ballarat');
