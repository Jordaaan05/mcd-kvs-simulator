/*
    Manager Dashboard login page.
*/

import React, { useState } from "react"
import { useAuth } from "../authContext"
import { useError } from "../modules/error-display/errorContext"

function DashLogin({ handlePageChange }) {
    const { login } = useAuth()
    const { addError } = useError()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const { isAuthenticated } = useAuth()
    if (isAuthenticated()) {
        handlePageChange('home')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(username, password);
            handlePageChange('dashhome')
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