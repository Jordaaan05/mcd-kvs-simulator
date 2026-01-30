/*
    Import the settings from file into the database
*/
import { defaultCategories } from "../default_store/categories"
import { menuItems } from "../default_store/menuItems"
import api from "../modules/api"

import fetchCategories from "../modules/fetch/fetchCategories"
import fetchItems from "../order-router/fetch-modules/fetchItems"

let categories = await fetchCategories() || []
let items = await fetchItems() || []

const importCategoriesAssignItems = async () => {
    for (let defaultCategory of defaultCategories) {
        if (categories.find(category => category.name === defaultCategory.name)) {
          console.log("Already Exists")
          continue;
        } else {
          await addCategory(defaultCategory)
          categories = await fetchCategories()
        }
    }

    for (let menuItem of menuItems) {
        if (!categories.find(category => category.name === menuItem.category)) {
          console.log(`Category ${menuItem.category} not found... aborting import!`)
          return
        }
  
        if (!menuItem.display) {
          menuItem.display = menuItem.name
        }
  
        const itemExists = items.find(item => item.name === menuItem.name);
        if (!itemExists) {
          await addItem(menuItem);
          items = await fetchItems()
        }
    }
    return
}

const addCategory = async (category) => {
    try {
        await api.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/categories`, {
            name: category.name,
            sortID: category.sortID
        });
        console.log('Category added successfully');
      } catch (error) {
        console.error('Error adding category:', error)
      }
}

const addItem = async (item) => {
    try {
        await api.post(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/options`, {
            name: item.name,
            category: item.category, // Adjust as per your backend schema
            price: item.price, // Adjust as per your backend schema
            display: item.display
        });
        console.log('Item added successfully');
      } catch (error) {
        console.error('Error adding item:', error);
      }
}

export default importCategoriesAssignItems