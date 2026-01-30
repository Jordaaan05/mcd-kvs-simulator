/*
    Import the settings from file into the database
*/
import { defaultSettings } from "../default_store/defaultSettings"
import api from "../modules/api"
import fetchSettings from "../modules/fetch/fetchSettings"

const importSettings = async () => {
    const currentSettings = await fetchSettings() || []

    for (let defaultSetting of defaultSettings) {
        if (!defaultSetting.value || !defaultSetting.name) {
            continue
        }

        const settingExists = currentSettings.find(setting => setting.name === defaultSetting.name)
        if (!settingExists) {
            await api.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/settings`, {
                name: defaultSetting.name,
                value: defaultSetting.value
            })
            console.log('Setting added successfully')
        } else {
            console.log('Setting already exists... skipping')
        }
    }
    return
}

export default importSettings