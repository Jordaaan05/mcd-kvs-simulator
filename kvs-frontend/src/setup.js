/*
    React page containing all setup options for the program. Unlike the admin page, this needs to be simplistic to use.
*/

import React, { useState } from 'react'
import axios from 'axios'
import './css/Setup.css'

import runSetup from './setup-modules/runAllSetup'

function Setup({ handlePageChange }) {
    const [isLoading, setIsLoading] = useState(false)


    const actionRunSetup = async () => {
        setIsLoading(true)
        await runSetup()
        setIsLoading(false)
    }

    const openNewBusinessDay = async () => {
        const newBusinessDay = new Date();

        await axios.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/store`, {
        businessDate: newBusinessDay
        })

        console.log(`New day: ${newBusinessDay.getDate()}-${newBusinessDay.getMonth()}-${newBusinessDay.getFullYear()} opened successfully.`)
    }

    const setupComplete = async () => {
        await axios.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/settings`, {  
            name: 'Setup-Complete',
            value: 'true'
        })
        handlePageChange('home')
    }

    return (
        <div className='settings'>
            <h1>Run Setup</h1>
            <br></br>
            <button 
                onClick={actionRunSetup}
                className={isLoading ? 'button-loading' : ''}
                disabled={isLoading}
            >
                <b>1.</b> Populate the Database from File
            </button>
            <br></br> {/* this is horible please change to css at some point xo */}
            <br></br>
            <button onClick={() => handlePageChange('settings')}><b>2.</b> Modify settings to your desires</button>
            <br></br>
            <br></br>
            <button onClick={openNewBusinessDay}><b>3.</b> Open your first day</button>
            <br></br>
            <br></br>
            <button onClick={setupComplete}><b>4.</b> Good to go!</button>
        </div>
    )
}

export default Setup