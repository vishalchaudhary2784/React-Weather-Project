import React, { useEffect, useState } from "react";
import Weather from "./Weather";
import WeatherReport from "./WeatherReports";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
    const [isWeatherDivOpen, setIsWeatherDivOpen] = useState(false);
    const [userName, setUserName] = useState("Guest");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin"); // Redirect to sign-in if not authenticated
        } else {
            fetchUserName(token);
        }
    }, [navigate]);

    const fetchUserName = async (token) => {
        try {
            const response = await fetch("http://localhost:5000/api/protected", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUserName(data.user.fullName); // Use fullName from the JWT payload
            } else {
                setUserName("Guest");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleWeatherToggle = (event) => {
        event.preventDefault(); // Prevent default link behavior
        setIsWeatherDivOpen((prev) => !prev); // Toggle the state
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    return (
        <div className="container mt-4">
            <nav className="d-flex align-items-center mb-3">
                <ul className="list-inline ml-auto">
                    <li className="list-inline-item">
                        <span>Welcome, {userName}</span>
                    </li>
                    <li className="list-inline-item">
                        <a href="#" onClick={handleWeatherToggle}>
                            Weather Report
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <button className="btn btn-link" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="row">
                <div className="col-md-4">
                    <Weather />
                </div>
                <div className="col-md-8">
                    {isWeatherDivOpen && (
                        <div className="weather-report open">
                            <WeatherReport />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
