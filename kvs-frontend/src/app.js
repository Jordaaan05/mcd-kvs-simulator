import React, { useState } from 'react';
import MFY1 from './kvs-displays/MFY/MFY1';
import MFY2 from './kvs-displays/MFY/MFY2';
import MFY3 from './kvs-displays/MFY/MFY3';
import MFY4 from './kvs-displays/MFY/MFY4';
import FC1 from './kvs-displays/FC/FC1';
/*import FC2 from './FC2';
import DT from './DT';
import DTPark from './DTPark';
import Cafe1 from './Cafe1';
import Cafe2 from './Cafe2'; */
import AdminPage from './Admin';
import './css/App.css';

const App = () => {
    const [activePage, setActivePage] = useState('home');
  
    const renderPage = () => {
      switch (activePage) {
        case 'mfy1':
          return <MFY1 />;
        case 'mfy2':
          return <MFY2 />;
        case 'mfy3':
          return <MFY3 />;
        case 'mfy4':
          return <MFY4 />;
        case 'fc1':
          return <FC1 />;
        case 'admin':
          return <AdminPage />;
        default:
          return (
            <div>
              <h1>KVS Simulator</h1>
              <h2>Please select the active display required below.</h2>
              <div className="button-container">
                <button onClick={() => setActivePage('mfy1')}>MFY Side 1</button>
                <button onClick={() => setActivePage('mfy2')}>MFY Side 2</button>
                <button onClick={() => setActivePage('mfy3')}>MFY Side 3</button>
                <button onClick={() => setActivePage('mfy4')}>MFY Side 4</button>
                <button onClick={() => setActivePage('fc1')}>FC Side 1</button>
                <button onClick={() => setActivePage('fc2')}>FC Side 2</button>
                <button onClick={() => setActivePage('dt')}>DT</button>
                <button onClick={() => setActivePage('dtpark')}>DT PARK</button>
                <button onClick={() => setActivePage('cafe1')}>McCafe Side 1</button>
                <button onClick={() => setActivePage('cafe2')}>McCafe Side 2</button>
                <button onClick={() => setActivePage('admin')}>Admin Page</button>
              </div>
            </div>
          );
      }
    };
  
    return <div className="App">{renderPage()}</div>;
  };

export default App;


/* Rest of the cases: 
        
        
        
        case 'fc2':
          return <FC2 />;
        case 'dt':
          return <DT />;
        case 'dtpark':
          return <DTPark />;
        case 'cafe1':
          return <Cafe1 />;
        case 'cafe2':
          return <Cafe2 />;
*/