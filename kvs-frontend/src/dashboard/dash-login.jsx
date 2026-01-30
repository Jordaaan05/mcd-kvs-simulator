/*
    Manager Dashboard login page.
*/

import React, { useState, useEffect } from "react"
import { useAuth } from "../authContext"
import { useError } from "../modules/error-display/errorContext"
import api from "../modules/api"

function DashLogin({ handlePageChange, fetchSetupStatus }) {
    const { login, isAuthenticated } = useAuth()
    const { addError } = useError()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (isAuthenticated()) {
            fetchSetupStatus();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(username, password);
            await fetchSetupStatus();
        } catch (error) {
            addError("Incorrect Username or Password")
            console.error('Login failed:', error);
        }
    }

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button type="submit">Login</button>
            </form>
            <span className="signup-text">Don't have an account? <span className="signup-text-button" onClick={() => handlePageChange('signup')}>Sign Up</span></span>
        </div>
    )
}

export default DashLogin