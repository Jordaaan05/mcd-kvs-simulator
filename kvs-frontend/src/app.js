import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useParams, useNavigate, Route, Routes } from 'react-router-dom';
import MFY1 from './kvs-displays/MFY/MFY1';
import MFY2 from './kvs-displays/MFY/MFY2';
import MFY3 from './kvs-displays/MFY/MFY3';
import MFY4 from './kvs-displays/MFY/MFY4';
import FC1 from './kvs-displays/FC/FC1';
import FC2 from './kvs-displays/FC/FC2';
/*import DT from './DT';
import DTPark from './DTPark';
import Cafe1 from './Cafe1';
import Cafe2 from './Cafe2'; */
import DRINKS1 from './kvs-displays/DRINKS/DRINKS1';
import GRILL1 from './kvs-displays/GRILL/GRILL1';
import GenericDisplay from './kvs-displays/display';
import AdminPage from './Admin';
import DayOpen from './dayopen';
import Setup from './setup';
import Settings from './settings';
import DashLogin from './dashboard/dash-login';
import DashSignup from './dashboard/dash-signup';
import DashHome from './dashboard/dashhome';
import DashStations from './dashboard/modify/dash-stations'
import DashManager from './dashboard/dash-manager';
import axios from 'axios';
import './css/App.css';

import { AuthProvider } from './authContext'; 
import { ErrorProvider } from './modules/error-display/errorContext'
import ErrorDisplay from './modules/error-display/errorDisplay'

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

    // when the active page is not home, the order generator should be active if it is toggled on.

    const handlePageChange = (page) => {
      sessionStorage.setItem('originalPage', page); // Set into localStorage here to persist the data across sessions, useful for allocating devices to certain displays. Use localStorage for a proper deployment.
      setActivePage(page);
    };

    useEffect(() => {
      const ws = new WebSocket(`ws://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`)

      ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'STORE_INFO_UPDATED') {
              setActivePage('day_open');
  
              setTimeout(() => {
                const savedOriginalPage = sessionStorage.getItem('originalPage');
                setActivePage(savedOriginalPage || 'home');
              }, 60000) // redirects to the day open page for 60 seconds.
          }

          if (message.type === "SETUP-COMPLETE") {
              setSetupComplete(true)
          }
      }

      ws.onclose = () => {
          console.log("WebSocket connection closed")
      }

      return () => {
          ws.close()
      }
    }, [activePage])

    useEffect(() => {
        const initaliseSettings = async () => {
            const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/settings`)
            const data = response.data
            for (let setting of data) {
                if (setting.name === "Setup-Complete") {
                    setSetupComplete(true)
                }
            }
        }
        initaliseSettings()
    })

    const renderPage = () => {
      switch (activePage) {
        case 'mfy1':
          return <MFY1 />;
        case 'mfy2':
          return <MFY2 />;
        case 'mfy3':
          return <MFY3 />;
        case 'mfy4':
          //return <MFY4 />;
          return <GenericDisplay stationName={activePage.toUpperCase()} />
        case 'fc1':
          return <FC1 />;
        case 'fc2':
          return <FC2 />;
        case 'drinks1':
          return <DRINKS1 />
        case 'grill1':
          //return <GRILL1 />
          return <GenericDisplay stationName={activePage.toUpperCase()} />
        case 'admin':
          return <AdminPage />;
        case 'day_open':
          return <DayOpen />
        case 'setup':
          return <Setup handlePageChange={handlePageChange}/>
        case 'settings':
          return <Settings handlePageChange={handlePageChange} activePage={activePage}/>
        case 'login':
          return <DashLogin handlePageChange={handlePageChange}/>
        case 'signup':
          return <DashSignup handlePageChange={handlePageChange}/>
        case 'dashhome':
          return <DashHome handlePageChange={handlePageChange} activePage={activePage}/>
        case 'dashstations':
          return <DashStations handlePageChange={handlePageChange} activePage={activePage}/>
        case 'dashmanager':
          return <DashManager handlePageChange={handlePageChange} activePage={activePage}/>
        default:
          if (setupComplete){
            return <DashHome handlePageChange={handlePageChange} activePage={activePage}/>
          } else {
            return <Setup handlePageChange={handlePageChange}/>
          }
          
      }
    };
  
    return (
      <AuthProvider>
          <ErrorProvider>
              <ErrorDisplay currentPage={activePage} />
              <Router>
                  <UrlHandler setActivePage={setActivePage} />
                  <Routes>
                      <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                  <div className="App">
                      {renderPage()}
                  </div>
              </Router>
          </ErrorProvider>
      </AuthProvider>
    );
  };

export default App;


/* Rest of the cases: 
        
        
        
       
        case 'dt':
          return <DT />;
        case 'dtpark':
          return <DTPark />;
        case 'cafe1':
          return <Cafe1 />;
        case 'cafe2':
          return <Cafe2 />;
*/