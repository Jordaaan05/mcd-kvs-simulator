/*
    Homepage for the manager dashboard
*/

import React, { useEffect, useState } from 'react';
import { useAuth } from '../authContext';
import DashNav from './dash-nav';
import '../css/dashboard.css'

import fetchCategories from '../modules/fetch/fetchCategories';
import fetchOptions from '../modules/fetch/fetchOptions'
import fetchStation from '../modules/fetch/fetchStations';

function DashHome({ handlePageChange, activePage }) {
    const [stations, setStations] = useState([])
    const [menu, setMenu] = useState([])
    const [categories, setCategories] = useState([])

    useEffect(() => {
        const fetchInitialData = async () => {
            const categoryData = await fetchCategories()
            setCategories(categoryData)
            const menuData = await fetchOptions()
            setMenu(menuData)
            const stationData = await fetchStation()
            setStations(stationData)
        }
        fetchInitialData()
    }, [])
    
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated()) {
        handlePageChange('login')
    }
    
    return (
        <div className='dashboard'>
            <DashNav handlePageChange={handlePageChange} activePage={activePage} />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"></link>
            <br />

            <div className='container'>
                <div className='row'>
                    <div className='col-12'>
                        <h2>Manager Dashboard</h2>
                        <p>This is the manager dashboard for the KVS Simulator. Use the navigation bar and the options below to modify the data.</p>
                    </div>
                </div>
            </div>

            <div className='container' style={{backgroundColor: "#f8f9fa", border: "2px solid", padding: "10px"}}>
                <div className='row'>
                    <div className='col-md-3 text-center'>
                        <h3>Stations</h3>
                        <p>{stations.length}</p>
                        <button onClick={() => handlePageChange('dashstations')}>Modify</button>
                    </div>
                    <div className='col-md-3 text-center'>
                        <h3>Menu Items</h3>
                        <p>{menu.length}</p>
                        <button onClick={() => handlePageChange('stations')}>Modify</button>
                    </div>
                    <div className='col-md-3 text-center'>
                        <h3>Categories</h3>
                        <p>{categories.length}</p>
                        <button onClick={() => handlePageChange('stations')}>Modify</button>
                    </div>
                    <div className='col-md-3 text-center'>
                        <h3>Manager</h3>
                        <p><i>Options</i></p>
                        <button onClick={() => handlePageChange('dashmanager')}>Modify</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashHome