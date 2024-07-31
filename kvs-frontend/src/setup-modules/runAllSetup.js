/*
    Run all of the import/setup functions
*/

import importCategoriesAssignItems from "./importCategoriesItems";
import importSettings from "./importSettings";
import importStations from "./importStations";

const runSetup = async () => {
    await importCategoriesAssignItems()
    await importSettings()
    await importStations()
    console.log("All imports completed..")
    return "Done"
}

export default runSetup