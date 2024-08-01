/* 
    Page for modification of settings.
*/

import React, { useState, useEffect } from "react";
import fetchSettings from "./modules/fetch/fetchSettings";
import axios from "axios";
import './css/Setup.css'

function Settings({ handlePageChange }) {
    const [settings, setSettings] = useState([])
    const [setupComplete, setSetupComplete] = useState(false)

    useEffect(() => {
        const fetchInitialData = async () => {
            const currentSettings = await fetchSettings();
            setSettings(currentSettings)

            for (let setting of currentSettings) {
                if (setting.name === "Setup-Complete") {
                    setSetupComplete(true)
                }
            }
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
        "Rush-Period": "Rush Period",
        "Drive-Enabled": "Drive Thru Enabled?",
        "Station-Lock": "Station Lock",
    };
    
    const settingOptions = {
        "Order Generator Enabled?": ["Off", "On"],
        "Store Size": ["Food Court", "Small", "Medium", "Large"],
        "Order Arrival Rate": ["Off", "Slow", "Typical", "Peak", "Max"],
        "Average Order Size": ["Off", "1", "2", "3"],
        "Rush Period": ["Off", "Breakfast", "Lunch", "Dinner", "Friday Night"],
        "Drive Thru Enabled?": ["Off", "On"],
        "Station Lock": ["Off", "Kitchen", "Front Counter"],
    };

    const settingTooltip = {
        "Order Generator Enabled?": {
            "Off": ["The Order Generator is not creating any orders. "],
            "On": ["The Order Generator is now generating orders to your set specifications."]
        },

        "Store Size": {
            "Food Court": ["Smallest store size. Low arrival rates for orders.", "1 MFY side, 1 FC side, 1 McCafe side. No support for Drive Thru."],
            "Small": ["Small store size, with a slow but steady order arrival rate.", "2 MFY Sides, 1 FC Side, 1 McCafe Side and has a Drive Thru."],
            "Medium": ["Medium store size, with busy rush periods and steady in between periods.", "3 MFY Sides, 2 FC Sides, 2 McCafe Sides, Drive Thru."],
            "Large": ["Large store size, with extremely busy rush periods, and busy in between periods", "4 MFY Sides, 2 FC Sides, 2 McCafe Sides, Drive Thru."]
        },

        "Order Arrival Rate": {
            "Off": ["Bases the order arrival rate off of store size and the current time.", "Note that for all order arrival rates, the selected store size is taken into account.", "Also note that this setting is ignored if a rush period is selected below."],
            "Slow": ["Standard arrival rates for early morning/after dinner."],
            "Typical": ["Typical arrival rates for a pre-rush period"],
            "Peak": ["Standard rush hour level of order arrival."],
            "Max": ["Maximum possible level of order arrival that the store can support."]
        },

        "Average Order Size": {
            "Off": ["Controls the number of sandwiches per order on average.", "Currently set to 'Off', so the order generator will manage the arrival rate."],
            "1": ["Average of 1 sandwich per order."],
            "2": ["Average of 2 sandwiches per order."],
            "3": ["Average of 3 sandwiches per order."]
        },

        "Rush Period": {
            "Off": ["By selecting a rush period here you lock the generator into generating orders for a certain time period.", "Currently set to 'Off', so your system time will be used to generate orders."],
            "Breakfast": ["Simulates the Breakfast rush period"],
            "Lunch": ["Simulates the Lunch rush period"],
            "Dinner": ["Simulates a typical weeknight dinner rush."],
            "Friday Night": ["Simulates a typical friday night dinner rush, being one of the busiest hours of the week."]
        },
        
        "Drive Thru Enabled?": {
            "Off": ["The Drive Thru system is disabled, even if your selected store size supports it."],
            "On": ["The Drive Thru system is enabled, but only if the selected store size supports it."]
        },

        "Station Lock": {
            "Off": ["By selecting a different option, you can lock to a specific station, so that a singular area of the store is simulated", "Currently set to 'Off', so all areas of the store will be simulated."],
            "Kitchen": ["Locks the entire program into simulating only the first side of the MFY line.", "All other order-based settings will still apply."],
            "Front Counter": ["Locks the entire program into simulating only the first Front Counter side.", "All other order-based settings will still apply."]
        } 
    }

    return (
        <div className="App">
            <div className="settings">
                <h1>Settings</h1>

                {settings.map(setting => {
                    const displayName = settingNameMapping[setting.name];
                    const options = settingOptions[displayName];
                    const tooltip = settingTooltip[displayName];

                    if (!displayName || !options) {
                        return null;
                    }

                    const tooltipLines = tooltip[setting.value] || []

                    return (
                        <div key={setting.id} className="button-group">
                            <br />
                            <div className="row-heading">
                                <label>{displayName}</label>
                            </div>
                            <div className="button-row">
                                {options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={setting.value === option ? 'active' : ''}
                                        disabled={setting.value === option}
                                        onClick={() => handleSettingUpdate(setting.id, option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {tooltipLines && (
                                <div className="row-tooltip">
                                    {tooltipLines.map((line, index) => (
                                        <div className="tooltip-line">
                                            <label key={index}>{line}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <br />
                        </div>
                    );
                })}
                {setupComplete ? (
                    <button onClick={() => handlePageChange('home')}>Back to home</button>
                ) : (
                    <button onClick={() => handlePageChange('setup')}>Back to setup</button>
                )}
            </div>
        </div>
    )
}

export default Settings