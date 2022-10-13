const API_KEY = 'a9fa31006d3ec59a7888dead8b265f57';

function processResponse(result) {
    return {
        weather: result.weather[0].main,
        weather_description: result.weather[0].description,
        temp: result.main.temp,
        feels_like_temp: result.main.feels_like,
        temp_min: result.main.temp_min,
        temp_max: result.main.temp_max,
        coords: result.coord,
        humidity: result.main.humidity,
        wind: result.wind,
    };
}

async function getWeatherForCity(city) {
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`);
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

printForecast('Ballarat');
