let weather = {
    apikey: "2f0ad3953411bdfb6c2964fa864b71d0",
    cities: ["New York", "London", "Tokyo", "Paris", "Sydney", "Los Angeles", "Berlin", "Moscow", "Rio de Janeiro", "Dubai"],

    fetchRandomLocationWeather: function() {
        const randomIndex = Math.floor(Math.random() * this.cities.length);
        const randomCity = this.cities[randomIndex];
        this.fetchWeather(randomCity);
    },

    fetchWeather: function(city) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + this.apikey)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Weather data not found');
                }
                return response.json();
            })
            .then(data => this.displayWeather(data))
            .catch(error => {
                console.error('Error fetching the weather data:', error);
                alert('Failed to fetch weather data. Please try again later.');
            });
    },

    fetchForecast: function(city) {
        fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=" + this.apikey)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Forecast data not found');
                }
                return response.json();
            })
            .then(data => this.displayForecast(data))
            .catch(error => {
                console.error('Error fetching the forecast data:', error);
                alert('Failed to fetch forecast data. Please try again later.');
            });
    },

    displayWeather: function(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;
        document.querySelector(".city").innerText = "Weather in " + name;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind speed: " + speed + " km/h";
        document.querySelector(".weather").classList.remove("loading");
        document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + name + "')";
    },

    displayForecast: function(data) {
        const forecastContainer = document.querySelector(".forecast-container");
        forecastContainer.innerHTML = "";

        const forecastDays = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

        forecastDays.forEach(forecast => {
            const { dt_txt } = forecast;
            const { icon, description } = forecast.weather[0];
            const { temp, humidity } = forecast.main;
            const dayElement = document.createElement("div");
            dayElement.classList.add("forecast-day");
            dayElement.innerHTML = `
                <h3>${new Date(dt_txt).toLocaleDateString(undefined, { weekday: 'long' })}</h3>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
                <p>${description}</p>
                <p>${temp}°C</p>
                <p>Humidity: ${humidity}%</p>
            `;
            forecastContainer.appendChild(dayElement);
        });
        document.querySelector(".forecast").style.display = "block";
    },

    search: function() {
        const city = document.querySelector(".searchbar").value;
        if (city.trim() !== '') {
            this.fetchWeather(city);
            document.querySelector(".forecast").style.display = "none"; // Hide forecast when new search happens
        } else {
            alert('Please enter a city name.');
        }
    },

    fetchLocationWeather: function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    fetch("https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=" + this.apikey)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Weather data not found');
                            }
                            return response.json();
                        })
                        .then(data => {
                            const cityName = data.name;
                            this.displayWeather(data);
                            this.fetchForecast(cityName);
                        })
                        .catch(error => {
                            console.error('Error fetching the weather data:', error);
                            alert('Failed to fetch weather data. Please try again later.');
                        });
                },
                error => {
                    console.error('Error getting location:', error);
                    alert('Failed to get your location. Please try again later.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }
};

document.querySelector(".search button").addEventListener("click", function() {
    weather.search();
});

document.querySelector(".searchbar").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        weather.search();
    }
});

document.querySelector("#locationBtn").addEventListener("click", function() {
    weather.fetchLocationWeather();
});

document.querySelector("#forecastBtn").addEventListener("click", function() {
    const city = document.querySelector(".city").innerText.split("Weather in ")[1];
    if (city) {
        weather.fetchForecast(city);
    } else {
        alert('Please fetch weather for a city first.');
    }
});

document.querySelector("#closeForecastBtn").addEventListener("click", function() {
    document.querySelector(".forecast").style.display = "none";
});

weather.fetchRandomLocationWeather();
