import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './SignIn.css';

const SignIn = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError(data.error || 'Sign-in failed');
            }
        } catch (err) {
            setError('Network error occurred');
        }
    };

    return (

        <div className="signInPage">
            <div className="signin-container d-flex justify-content-center align-items-center">
                <div className="signin-card">
                    <div className="text-center">
                        <h2 className="main-head">Weather App</h2>
                    </div>
                    <h2 className="signin-title">Sign In</h2>
                    <form className="signin-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <button type="submit" className="btn btn-primary btn-block mt-4">
                            Sign In
                        </button>
                    </form>
                    <div className="signup-link text-center mt-4">
                        Don't have an account? <Link to={"/signup"}>Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>



    );
};

export default SignIn;
