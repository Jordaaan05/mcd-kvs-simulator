/* 
    Manager Options page
*/


import React, { useEffect, useState } from 'react';
import DashNav from './dash-nav';
import '../css/dashboard.css'

import api from '../modules/api';
import { jwtDecode } from 'jwt-decode';

function DashManager({ handlePageChange, activePage }) {
    const [currentBusinessDay, setCurrentBusinessDay] = useState(0);
    const [dayStatus, setDayStatus] = useState("GREEN")
    
    useEffect(() => {
        fetchBusinessDay()
    }, [])
    
    const fetchBusinessDay = async () => {
        const token = sessionStorage.getItem('token');
        const decoded = jwtDecode(token);
        const storeId = decoded.storeId
        try {
            const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/store/${storeId}`)
            if (response.data) {
                const currentBusinessDate = response.data.currentBusinessDay
                setCurrentBusinessDay(currentBusinessDate)
                if (new Date(currentBusinessDate).getDate() === new Date().getDate()) {
                    setDayStatus("GREEN")
                } else {
                    setDayStatus("RED")
                }
            }
        } catch (error) {
            console.error('Error fetching store information:', error)
        }
    }

    const openNewBusinessDay = async () => {
        const newBusinessDay = new Date();

        const token = sessionStorage.getItem('token');
        const decoded = jwtDecode(token);
        const storeId = decoded.storeId

        const currentDay = new Date(currentBusinessDay)

        if (newBusinessDay.getDate() === currentDay.getDate()) {
            console.log("Business date is already current... Aborting opening new day")
            return
        }
    
        await api.post(`/store/${storeId}`, {
            businessDate: newBusinessDay
        })
    
        console.log(`New day: ${newBusinessDay.getDate()}-${newBusinessDay.getMonth()}-${newBusinessDay.getFullYear()} opened successfully.`)
        setDayStatus("GREEN") // day status okay as day opened successfully
    }

    return (
        <div className='dashboard'>
            <DashNav handlePageChange={handlePageChange} activePage={activePage} />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"></link>
            <br />
            
            <div className='container'>
                <div className='row'>
                    <div className='col-12'>
                        <h2>Manager Options</h2>
                        <p>Use the buttons below to perform manager tasks.</p>
                    </div>
                </div>
            </div>

            <div className='container' style={{backgroundColor: "#f8f9fa", border: "2px solid", padding: "10px"}}>
                <div className='row'>
                    <div className='col-md-3 text-center'>
                        <h3>Day Open</h3>
                        <button onClick={openNewBusinessDay} className={`button ${dayStatus === "RED" ? "button-red" : "button-green"}`}>Modify</button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default DashManager