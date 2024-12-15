const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkey';

// Connect to MySQL Database
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Middleware
app.use(cors());
app.use(express.json());

// Ensure Users table exists
(async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table ensured');
    } catch (error) {
        console.error('Error ensuring Users table:', error);
    }
})();

// Ensure Weather table exists
(async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Weather (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city VARCHAR(255) NOT NULL,
                humidity INT,
                windspeed INT,
                temperature INT,
                location VARCHAR(255),
                weatherCode INT,
                userId INT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);
        console.log('Weather table ensured');
    } catch (error) {
        console.error('Error ensuring Weather table:', error);
    }
})();

// Signup Endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            `INSERT INTO Users (fullName, email, password) VALUES (?, ?, ?)`,
            [fullName, email, hashedPassword]
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Signin Endpoint
app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT * FROM Users WHERE email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, fullName: user.fullName },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        
        res.json({ token, message: 'Signed in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Weather search Endpoint
app.get('/api/weather', async (req, res) => {
    const city = req.query.city;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.id;
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!city) {
        return res.status(400).json({ error: 'City name is required' });
    }

    try {
        // Fetch new data from WeatherStack API
        const url = `http://api.weatherstack.com/current?access_key=${process.env.WEATHER_API_KEY}&query=${city}`;
        const response = await axios.get(url);
        const data = response.data;

        if (data.error) {
            return res.status(400).json({ error: data.error.info });
        }

        const weatherData = {
            city,
            humidity: data.current.humidity,
            windspeed: data.current.wind_speed,
            temperature: Math.floor(data.current.temperature),
            location: data.location.name,
            weatherCode: data.current.weather_code,
            userId,
        };

        // Save weather data to the database
        await db.execute(
            `INSERT INTO Weather (city, humidity, windspeed, temperature, location, weatherCode, userId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                weatherData.city,
                weatherData.humidity,
                weatherData.windspeed,
                weatherData.temperature,
                weatherData.location,
                weatherData.weatherCode,
                weatherData.userId,
            ]
        );

        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});


// api weather report
app.get('/api/weather/reports', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let userId;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.id; // Extract the user ID from the JWT
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT W.city, W.humidity, W.windspeed, W.temperature, W.location, W.timestamp
             FROM Weather W
             WHERE W.userId = ?
             ORDER BY W.timestamp DESC`,
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching user-specific weather reports:', error);
        res.status(500).json({ error: 'Failed to fetch weather reports' });
    }
});


// Protected Route Example
app.get('/api/protected', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: 'Access granted', user: decoded }); // Include fullName in the response
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
