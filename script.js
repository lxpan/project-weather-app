const API_KEY = 'a9fa31006d3ec59a7888dead8b265f57';

function KelvinToCelsius(kelvin) {
    if (typeof kelvin === 'number') {
        const celsius = kelvin - 273.15;
        return celsius.toPrecision(4);
    }
    throw new Error('Temperature is not a number!');
}

function KelvinToFahrenheit(kelvin) {
    if (typeof kelvin === 'number') {
        const fahrenheit = 1.8 * (kelvin - 273) + 32;
        return fahrenheit.toPrecision(4);
    }
    throw new Error('Temperature is not a number!');
}

async function getWeatherForCity(city) {
    const processResponse = (result) => ({
        city,
        weather: result.weather[0].main,
        weather_description: result.weather[0].description,
        temp: result.main.temp,
        temp_celsius: KelvinToCelsius(result.main.temp),
        temp_fahrenheit: KelvinToFahrenheit(result.main.temp),
        feels_like_temp: result.main.feels_like,
        temp_min: result.main.temp_min,
        temp_max: result.main.temp_max,
        coords: result.coord,
        humidity: result.main.humidity,
        wind: result.wind,
    });

    try {
        const response = await fetch(
            `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`
        );
        const data = await response.json();
        console.log(data);
        return processResponse(data);
    } catch (error) {
        console.log(`Error: ${error}, retrieving forecast for ${city}`);
    }
    return 'Error';
}

const printForecast = async (city) => {
    const forecast = await getWeatherForCity(city);
    console.log(forecast);
};

// printForecast('Ballarat');

const cityButton = document.getElementById('getCityButton');

cityButton.addEventListener('click', () => {
    const city = document.getElementById('cityBox');
    printForecast(city.value);
});
