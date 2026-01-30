/* 
    React Context for authentication
*/

import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children })=> {
    const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token')
        if (storedToken) {
            setToken(storedToken)
        }
    }, [])

    const register = async (username, password, role, storeName) => {
        try {
            console.log('creating user...')
            await axios.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/api/auth/register`, { username, password, role, storeName })
            console.log('created user')

            const response = await axios.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/api/auth/login`, { username, password })
            const { token, storeId } = response.data
            setToken(token)
            sessionStorage.setItem('token', token)
            sessionStorage.setItem('storeId', storeId)
        } catch (error) {
            throw new Error('Signup failed');
        }
    }

    const login = async (username, password) => {
        try {
            const response = await axios.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/api/auth/login`, { username, password })
            const { token, storeId } = response.data;
            setToken(token);
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('storeId', storeId);
        } catch (error) {
            throw new Error('Login failed');
        }
    }

    const logout = () => {
        setToken(null);
        sessionStorage.removeItem('token');
    };

    const isAuthenticated = () => !!token

    return (
        <AuthContext.Provider value={{ login, logout, register, isAuthenticated, token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)