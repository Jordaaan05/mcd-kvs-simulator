/* 
    Station modification page
*/

import React, { act, useEffect, useState } from 'react';
import { useAuth } from '../../authContext';
import DashNav from '../dash-nav';
import '../../css/dashboard.css'
import api from '../../modules/api';

import fetchStation from '../../modules/fetch/fetchStations';
import fetchCurrentBusinessDay from '../../modules/fetch/fetchCurrentBusinessDay';
import { averageTimestampDifferenceLastHour } from '../../kvs-displays/modules/calculateAverageTimes'

function DashStations({ handlePageChange, activePage }) {
    const [stations, setStations] = useState([])
    const [currentBusinessDay, setCurrentBusinessDay] = useState()
    const [rollingHourTimes, setRollingHourTimes] = useState({})
    const [activeOrders, setActiveOrders] = useState({})
    const [loading, setLoading] = useState(true)


    const { isAuthenticated } = useAuth()
    if (!isAuthenticated()) {
        handlePageChange('login')
    }

    useEffect(() => {
        const fetchInitialData = async () => {
            const stationData = await fetchStation()
            setStations(stationData)
            const businessDayData = await fetchCurrentBusinessDay()
            setCurrentBusinessDay(businessDayData)
        }
        fetchInitialData()
    }, [])

    useEffect(() => {
        const fetchRollingHourTimes = async () => {
            try {
                const times = {};
                const activeOrders = {};
                for (const station of stations) {
                    try {
                        const rollingTime = await getRollingHourTime(station);
                        times[station.name] = rollingTime;                        
                    } catch (error) {
                        console.error(`Failed to fetch rolling hour time for ${station.name}:`, error);
                        times[station.name] = 'Error';
                    }

                    try {
                        const activeOrdersPerStation = await getCurrentActiveOrders(station)
                        activeOrders[station.name] = activeOrdersPerStation
                    } catch (error) {
                        console.error(`Failed to fetch active orders for ${station.name}:`, error)
                        activeOrders[station.name] = 'Error';
                    }
                }
                setRollingHourTimes(times);
                setActiveOrders(activeOrders)
            } catch (error) {
                console.error('Failed to fetch rolling hour times:', error);
            } finally {
                setLoading(false);  // Set loading to false after attempt to fetch data
            }
        };
    
        if (stations.length > 0) {
            fetchRollingHourTimes();
            
            const intervalId = setInterval(fetchRollingHourTimes, 10000); // Rerun every 10 seconds
    
            return () => clearInterval(intervalId);
        }
    }, [stations]);

    const getRollingHourTime = async (station) => {
        let businessDayData = currentBusinessDay;
    
        if (!businessDayData) {
            businessDayData = await fetchCurrentBusinessDay();
            setCurrentBusinessDay(businessDayData);
        }
    
        try {
            const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/day/${businessDayData}/station/${station.name}`);
            const currentDayServedOrders = response.data || [];
            if (currentDayServedOrders.length === 0) {
                return '0'; // No orders found
            }
    
            const rollingHourTime = averageTimestampDifferenceLastHour(currentDayServedOrders, station.name, businessDayData) || 0;
            return rollingHourTime;
        } catch (error) {
            console.error(`Error fetching orders for station: ${station.name}`, error);
            return '0'; // Return an error message if the API call fails
        }
    };

    const getCurrentActiveOrders = async (station) => {
        let businessDayData = currentBusinessDay;
    
        if (!businessDayData) {
            businessDayData = await fetchCurrentBusinessDay();
            setCurrentBusinessDay(businessDayData);
        }

        try {
            const response = await api.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/day/${businessDayData}/station/${station.name}/new`);
            const currentDayActiveOrders = response.data || []
            console.log("Active orders for station:", station.name, currentDayActiveOrders, currentDayActiveOrders.length)

            if (currentDayActiveOrders.length === 0) {
                return '0'
            }

            return String(currentDayActiveOrders.length)
        } catch (error) {
            console.error(`Error fetching orders for station: ${station.name}`, error)
            return '0'
        }
    }

    console.log(activeOrders)
    return (
        <div className='dashboard stations'>
            <DashNav handlePageChange={handlePageChange} activePage={activePage} />
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"></link>
            
            <div className='container'>
                <div className='row'>
                    <div className='col-12'>
                        <h1>Stations</h1>
                        <p>You can view a preview of station information here, modify information, and access the displays directly.</p>
                        <br />
                    </div>
                </div>
                <table className='table' style={{backgroundColor: "#f8f9fa", border:"2px solid"}}>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Rolling Hour Time</th>
                        <th>Number of Orders</th>
                        <th>Actions</th>
                    </tr>
                {stations.map((station) => (
                    <tr>
                        <td>{station.id}</td>
                        <td>{station.displayName}</td>
                        <td>{station.status}</td>
                        <td>{loading ? 'Loading...' : rollingHourTimes[station.name] || '0'}</td>
                        <td>{loading ? 'Loading...' : activeOrders[station.name]}</td>
                        <td>
                            <button className='modify-button' style={{marginRight: "5px"}}onClick={() => handlePageChange(station.name.toLowerCase())}>Access</button>
                        </td>
                    </tr>
                ))}
                </table>
            </div>
        </div>
    )
}

export default DashStations