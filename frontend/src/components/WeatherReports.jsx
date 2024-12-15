import React, { useEffect, useState } from 'react';
import './WeatherReport.css';
import humidity_icon from '../assets/humidity.png';
import wind_icon from '../assets/wind.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import snow_icon from '../assets/snow.png';
import rain_icon from '../assets/rain.png';
import drizzle_icon from '../assets/drizzle.png';

const WeatherReport = () => {
    const [reports, setReports] = useState([]);
    const [error, setError] = useState('');
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

    useEffect(() => {
        const fetchReports = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Unauthorized access. Please log in to view weather reports.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/weather/reports', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token in headers
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError('Unauthorized access. Please log in again.');
                    } else {
                        setError('Failed to fetch weather reports. Please try again later.');
                    }
                    return;
                }

                const data = await response.json();
                setReports(data); // Populate weather reports
                setError(''); // Clear any existing error messages
            } catch (err) {
                setError('Network error. Please try again later.');
                console.error('Error fetching weather reports:', err);
            }
        };

        fetchReports();
    }, []);

    return (
        <div className="weather-report">
            <h1>Your Weather Reports</h1>
            {error && <p className="error-message">{error}</p>}
            {!error && reports.length > 0 ? (
                <div className="reports-container">
                    {reports.map((report, index) => (
                        <div key={index} className="report-card">
                            <img
                                src={allIcon[report.weatherCode] || clear_icon}
                                alt="Weather Icon"
                                className="report-icon"
                            />
                            <div className="report-details">
                                <p className="temperature">{report.temperature}°C</p>
                                <p className="location">{report.location}</p>
                                <div className="data-row">
                                    <img src={humidity_icon} alt="Humidity" />
                                    <span>{report.humidity}% Humidity</span>
                                </div>
                                <div className="data-row">
                                    <img src={wind_icon} alt="Wind Speed" />
                                    <span>{report.windspeed} km/h Wind Speed</span>
                                </div>
                                <p className="timestamp">
                                    {new Date(report.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !error && <p>No weather reports available for you.</p>
            )}
        </div>
    );
};

export default WeatherReport;
