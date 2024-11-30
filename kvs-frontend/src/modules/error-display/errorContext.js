/* 
    Handles logic for storing errors
*/

import React, { createContext, useState, useContext } from "react";

const ErrorContext = createContext()

export const useError = () => useContext(ErrorContext)

export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState(JSON.parse(localStorage.getItem('errors')) || [])

    const addError = (message) => {
        setErrors(prevErrors => {
            const newErrors = [...prevErrors, message]
            localStorage.setItem('errors', JSON.stringify(newErrors))
            return newErrors
        })
    }

    const clearErrors = () => {
        setErrors([])
        localStorage.removeItem('errors')
    }

    return (
        <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
           {children} 
        </ErrorContext.Provider>
    )
}