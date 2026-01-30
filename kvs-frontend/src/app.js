import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useParams, useNavigate, Route, Routes } from 'react-router-dom';
import GenericDisplay from './kvs-displays/display';
import DayOpen from './dayopen';
import Setup from './setup';
import Settings from './settings';
import DashLogin from './dashboard/dash-login';
import DashSignup from './dashboard/dash-signup';
import DashHome from './dashboard/dashhome';
import DashStations from './dashboard/modify/dash-stations'
import DashManager from './dashboard/dash-manager';
import DashItems from './dashboard/modify/dash-items';
import './css/App.css';

import { useAuth } from './authContext'; 
import { ErrorProvider } from './modules/error-display/errorContext'
import ErrorDisplay from './modules/error-display/errorDisplay'
import api from "./modules/api"

// Read URL and update activepage
const UrlHandler = ({ setActivePage }) => {
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (params.stationId) {
            const page = params.stationId.toLowerCase();
            setActivePage(page);

            navigate('/', { replace: true });
        }
    }, [params.stationId, setActivePage, navigate]);

    return null;
}

const App = () => {
    const [activePage, setActivePage] = useState('home');
    const [setupComplete, setSetupComplete] = useState(false);
    const { isAuthenticated } = useAuth();

    // when the active page is not home, the order generator should be active if it is toggled on.

    const handlePageChange = (page) => {
      sessionStorage.setItem('originalPage', page); // Set into localStorage here to persist the data across sessions, useful for allocating devices to certain displays. Use localStorage for a proper deployment.
      setActivePage(page);
    };

    const fetchSetupStatus = async () => {
        try {
            const response = await api.get("/settings");
            const setup = response.data.find(s => s.name === "Setup-Complete")?.value === "true";
            setSetupComplete(setup)
            handlePageChange(setup ? 'dashhome' : 'setup');
        } catch (err) {
            console.warn("Failed to fetch settings", err);
            handlePageChange('setup')
        }
    }

    useEffect(() => {
        if (isAuthenticated()) {
            fetchSetupStatus();
        } else { 
            handlePageChange('login');
        }
    }, [])

    useEffect(() => {
        const ws = new WebSocket(`ws://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`)

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: "JOIN",
                storeId: sessionStorage.getItem("storeId"),
                kvsNum: "APP"
            }))
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'STORE_INFO_UPDATED') {
                setActivePage('day_open');
    
                setTimeout(() => {
                    const savedOriginalPage = sessionStorage.getItem('originalPage');
                    setActivePage(savedOriginalPage || 'dashhome');
                }, 60000) // redirects to the day open page for 60 seconds.
            }

            if (message.type === "SETUP-COMPLETE") {
                setSetupComplete(true)
            }
        }

        return () => ws.close();
    }, [activePage])

    useEffect(() => {
        if (!isAuthenticated()) {
            setActivePage('login');
            return;
        };

        const initaliseSettings = async () => {
            try { 
                const response = await api.get("/settings");
                const data = response.data
                for (let setting of data) {
                    if (setting.name === "Setup-Complete") {
                        setSetupComplete(true)
                    }
                }
            } catch (err) {
                console.error("Failed to load settings", err)
            }
        }
        initaliseSettings()
    }, [])

    const renderPage = () => {
      switch (activePage) {
        case 'mfy1':
        case 'mfy2':
        case 'mfy3':
        case 'mfy4':
        case 'fc1':
        case 'fc2':
        case 'drinks1':
        case 'grill1': 
        case 'cafe1':
        case 'cafe2': 
        case 'dt1':
        case 'dt2':
        case 'dt3': 
            return <GenericDisplay stationName={activePage.toUpperCase()} />

        case 'day_open': return <DayOpen />
        case 'setup': return <Setup handlePageChange={handlePageChange}/>
        case 'settings': return <Settings handlePageChange={handlePageChange} activePage={activePage}/>
        case 'login': return <DashLogin handlePageChange={handlePageChange} fetchSetupStatus={fetchSetupStatus}/>
        case 'signup': return <DashSignup handlePageChange={handlePageChange} fetchSetupStatus={fetchSetupStatus}/>
        case 'dashhome': return <DashHome handlePageChange={handlePageChange} activePage={activePage}/>
        case 'dashstations': return <DashStations handlePageChange={handlePageChange} activePage={activePage}/>
        case 'dashitems': return <DashItems handlePageChange={handlePageChange} activePage={activePage} />
        case 'dashmanager': return <DashManager handlePageChange={handlePageChange} activePage={activePage}/>
       default:
            if (!isAuthenticated()) {
                return <DashLogin handlePageChange={handlePageChange}/>
            } else if (!setupComplete) {
                return <Setup handlePageChange={handlePageChange}/>
            } else {
                return <DashHome handlePageChange={handlePageChange} activePage={activePage}/>
            }
      }
    };
  
    return (
        <ErrorProvider>
            <ErrorDisplay currentPage={activePage} />
            <Router>
                <UrlHandler setActivePage={setActivePage} />
                <div className="App">
                    {renderPage()}
                </div>
            </Router>
        </ErrorProvider>
    );
  };

export default App;