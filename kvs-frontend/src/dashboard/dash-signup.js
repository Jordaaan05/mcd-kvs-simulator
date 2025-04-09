/* 
    Manager Dashboard Signup page.
*/

import React, { useState } from "react"
import { useAuth } from "../authContext"

function DashSignup({ handlePageChange }) {
    const { register } = useAuth()
    const [newUsername, setNewUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newStoreName, setNewStoreName] = useState('')

    const { isAuthenticated } = useAuth()
    if (isAuthenticated()) {
        handlePageChange('home')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await register(newUsername, newPassword, 'user' ,newStoreName) // user is the role TEMP
            handlePageChange('dashhome')
        } catch (error) {
            console.error('Registration failed:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
            />
            <input 
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Store Name"
            />
            <button type="submit">Sign Up</button>
        </form>
    )
}

export default DashSignup