import React, { useEffect } from "react"
import logo from './media/WcDonalds-Logo.png'
import "./css/dayopen.css"


function DayOpen () {
    useEffect(() => {
        const dots = document.querySelectorAll('.loading-dot')
        let currentIndex = 0

        const interval = setInterval(() => {
            dots.forEach((dot, index) => {
                if (index <= currentIndex) {
                    dot.classList.add('active')
                } else {
                    dot.classList.remove('active')
                }
            })
            currentIndex = (currentIndex + 1) % (dots.length)
        }, 750)

        return () => clearInterval(interval)
    })

    return (
        <div className="dayopen-container">
            <img src={logo} alt="WcDonalds Logo" className="dayopen-logo" />
            <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
            </div>
        </div>
    )
}

export default DayOpen