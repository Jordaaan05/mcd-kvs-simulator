/* 
    Page for modification of settings.
*/

import React, { useState, useEffect } from "react";
import fetchSettings from "./modules/fetch/fetchSettings";
import axios from "axios";
import './css/Setup.css'

function Settings({ handlePageChange }) {
    const [settings, setSettings] = useState([])

    useEffect(() => {
        const fetchInitialData = async () => {
            const currentSettings = await fetchSettings();
            setSettings(currentSettings)
        }

        fetchInitialData()
    }, [])
    
    const handleSettingUpdate = async (id, value) => {
        const updatedSettings = settings.map(setting => 
            setting.id === id ? { ...setting, value } : setting
        )

        setSettings(updatedSettings)
        await axios.put(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/settings/${id}`, { value })
    }
    
    const settingNameMapping = {
        "Generator-Enabled": "Order Generator Enabled?",
        "Store-Size": "Store Size",
        "Order-Arrival-Rate": "Order Arrival Rate",
        "Average-Order-Size": "Average Order Size",
        "Rush-Period": "Rush Period"
    };
    
    const settingOptions = {
        "Order Generator Enabled?": ["Off", "On"],
        "Store Size": ["Food court", "Small", "Medium", "Large"],
        "Order Arrival Rate": ["Off", "Slow", "Typical", "Peak", "Max"],
        "Average Order Size": ["Off", "1", "2", "3"],
        "Rush Period": ["Off", "Breakfast", "Lunch", "Dinner", "Friday Night"]
    };

    return (
        <div className="settings">
            <h1>Settings</h1>

            {settings.map(setting => {
                const displayName = settingNameMapping[setting.name];
                const options = settingOptions[displayName];

                if (!displayName || !options) {
                    return null;
                }

                return (
                    <div key={setting.id}>
                        <div className="row-heading">
                            <label>{displayName}</label>
                        </div>
                        <div className="button-row">
                            {options.map(option => (
                                <button
                                    key={option}
                                    className={setting.value === option ? 'active' : ''}
                                    disabled={setting.value === option}
                                    onClick={() => handleSettingUpdate(setting.id, option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        {displayName === "Order Arrival Rate" && (
                            <div className="row-tooltip">
                                <label>'Off' bases the arrival rate off of store size.</label>
                            </div>
                        )}
                        {displayName === "Average Order Size" && (
                            <div className="row-tooltip">
                                <label>Controls the number of sandwiches per order on average. 'Off' lets the order generator manage this.</label>
                            </div>
                        )}
                        {displayName === "Rush Period" && (
                            <div className="row-tooltip">
                                <label>'Off' in this case uses your timezone to generate orders.</label> 
                                <br />
                                <label>By selecting a rush period here you lock the generator into generating orders for a certain time period.</label>
                            </div>
                        )}
                        <br />
                    </div>
                );
            })}

            <button onClick={() => handlePageChange('setup')}>Back to setup</button>
        </div>
    )
}

export default Settings