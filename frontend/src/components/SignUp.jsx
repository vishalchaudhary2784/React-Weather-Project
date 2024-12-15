import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import './Weather.css';

const SignUp = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password }),
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/');
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (err) {
            setError('Network error occurred');
        }
    };

    return (
        // <div className="signUpPage">
        //     <form onSubmit={handleSubmit}>
        //         <input id="fullName" type="text" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
        //         <input id="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        //         <input id="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        //         <input id="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
        //         {error && <p style={{ color: 'red' }}>{error}</p>}
        //         <button type="submit">Sign Up</button>
        //     </form>
        // </div>

        <div className="signUpPage">
                    <div className="d-flex justify-content-center align-items-center min-vh-100">
                        <div className="card shadow-lg p-4" style={{ width: "400px" }}>
                            <div className="text-center">
                                <h2 className="main-head">Weather App</h2>
                            </div>
                            <h5 className=" mb-2">Create an Account</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">
                                        Full Name
                                    </label>
                                    <input
                                        className="form-control"
                                        id="fullName" 
                                        type="text" 
                                        placeholder="Full Name"
                                        value={formData.fullName} 
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        Email Address
                                    </label>
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
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="Create a password"
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        required
                                    />
                                </div>
                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                <button type="submit" className="btn btn-primary w-100">
                                    Sign Up
                                </button>
                                <div className="text-center mt-3">
                                    <p className="mb-0">
                                        Already have an account?{" "}
                                        <Link to="/" className="text-primary">
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
    );
};

export default SignUp;
