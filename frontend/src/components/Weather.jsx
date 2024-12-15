import React, { useRef, useState } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import humidity_icon from '../assets/humidity.png';
import cloud_icon from '../assets/cloud.png';
import snow_icon from '../assets/snow.png';
import rain_icon from '../assets/rain.png';
import drizzle_icon from '../assets/drizzle.png';
import wind_icon from '../assets/wind.png';

const Weather = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token'); // Fetch the JWT token from localStorage
    const allIcon = {
        "113": clear_icon,
        "116": cloud_icon,
        "119": cloud_icon,
        "122": cloud_icon,
        "185": drizzle_icon,
        "284": drizzle_icon,
        "281": drizzle_icon,
        "266": drizzle_icon,
        "263": drizzle_icon,
        "227": snow_icon,
        "299": rain_icon,
        "176": rain_icon,
        "311": rain_icon,
        "308": rain_icon,
        "305": rain_icon,
        "302": rain_icon,
    };

    const search = async (city) => {
        if (!city.trim()) {
            setError("Please enter a city name.");
            return;
        }

        if (!token) {
            setError("Unauthorized access. Please sign in.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/weather?city=${city}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Pass the JWT token for authentication
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Unauthorized access. Please sign in again.");
                } else {
                    setError("Failed to fetch weather data. Please try again later.");
                }
                setWeatherData(null);
                return;
            }

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setWeatherData(null);
                return;
            }

            const iconCode = data.weatherCode?.toString();
            const icon = allIcon[iconCode] || clear_icon;

            setWeatherData({
                humidity: data.humidity,
                windspeed: data.windspeed,
                temperature: data.temperature,
                location: data.location,
                icon,
            });
            setError(null); // Clear any previous error messages
        } catch (error) {
            setError("An error occurred while fetching weather data.");
            setWeatherData(null);
            console.error("Error in fetching weather data:", error);
        }
    };

    return (
        <div className='weather'>
            <div className="search-bar">
                <input ref={inputRef} type="text" placeholder='Enter city name...' />
                <img src={search_icon} alt="Search" onClick={() => search(inputRef.current.value)} />
            </div>
            {error && <p className="error-message">{error}</p>}
            {weatherData ? (
                <>
                    <img src={weatherData.icon} alt="Weather Icon" className='weather-icon' />
                    <p className='temp'>{weatherData.temperature}°C</p>
                    <p className='location-w'>{weatherData.location}</p>
                    <div className="weather-data">
                        <div className="col">
                            <img src={humidity_icon} alt="Humidity" />
                            <div>
                                <p>{weatherData.humidity}%</p>
                                <span>Humidity</span>
                            </div>
                        </div>
                        <div className="col">
                            <img src={wind_icon} alt="Wind Speed" />
                            <div>
                                <p>{weatherData.windspeed} km/h</p>
                                <span>Wind Speed</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p className="no-data-message">No weather data available. Search for a city to get started.</p>
            )}
        </div>
    );
};

export default Weather;
