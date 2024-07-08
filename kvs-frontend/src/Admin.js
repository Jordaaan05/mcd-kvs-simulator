import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Admin.css';
import { menuItems } from './default_store/menuItems';
import { kvsDisplays } from './default_store/kvsDisplays';
import { defaultCategories } from './default_store/categories';

function Admin() {
  const [newOrder, setNewOrder] = useState({ orderNumber: '', location: '', items: [], status: '', mfySide: '', FCSide: '', sendToKVS: '' });
  const [newItem, setNewItem] = useState({ amount: '', name: '', category: '', display: '' });
  const [newCategory, setNewCategory] = useState({ name: '', sortID: '' });
  const [options, setOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stations, setStations] = useState([]);

  const fetchOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/options');
      setOptions(response.data); // Assuming response.data is an array of items from your database
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchStations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stations');
      setStations(response.data);
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

  useEffect(() => {
    // Fetch options from your backend on component mount
    fetchOptions();
    fetchCategories();
  }, []);

  const addItemToOrder = () => {
    if (newItem.name === '') {
      console.log('Skipped empty value');
    } else {
      const item = options.find(option => option.name === newItem.name);
      if (item) {
        const amountToAdd = newItem.amount === '' ? '1' : newItem.amount;
        setNewOrder({ ...newOrder, items: [...newOrder.items, { id: item.id, name: item.name, amount: amountToAdd }] });
        setNewItem({ amount: '', name: '', category: '', display: '' });
        console.log("Added item:", newItem.name);
      }
    }
  };

  const handleAddOrder = async () => {
    const locationToAdd = newOrder.location === '' || newOrder.location === undefined ? 'DT' : newOrder.location;
    const defaultMFY = newOrder.mfySide === '' || newOrder.mfySide === undefined ? '1' : newOrder.mfySide;
    const defaultFC = newOrder.FCSide === '' || newOrder.FCSide === undefined ? '1' : newOrder.FCSide
    const timestamp = new Date()
    
    const kvsToSendTo = await relevantKVS()

    const orderToAdd = {
      ...newOrder,
      location: locationToAdd,
      mfySide: defaultMFY,
      timestamp: timestamp,
      FCSide: defaultFC,
      kvsToSendTo: kvsToSendTo
    };
    
    try {
      await axios.post('http://localhost:5000/orders', orderToAdd)
      console.log('Order added successfully');
      setNewOrder({ orderNumber: '', location: '', items: [], status: '', mfySide: '', FCSide: '', sendToKVS: '' });
      setNewItem({ amount: '', name: '', category: '', display: '' });
    } catch (error) {
      console.error('Error adding order:', error)
    }
  };

  const handleAddItem = async (menuItem) => {
    try {
      if (menuItem) {
        await axios.post('http://localhost:5000/options', {
          name: menuItem.name,
          category: menuItem.category, // Adjust as per your backend schema
          price: menuItem.price, // Adjust as per your backend schema
          display: menuItem.display
        });
      } else {
        await axios.post('http://localhost:5000/options', {
          name: newItem.name,
          category: newItem.category, // Adjust as per your backend schema
          price: newItem.price, // Adjust as per your backend schema
          display: (newItem.display || newItem.name)
        });
      }
      console.log('Item added successfully');
      setNewItem({ amount: '', name: '', category: '', display: '' });
      fetchOptions(); // Refresh options list after adding a new item
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      if (categoryName) {
        await axios.post('http://localhost:5000/categories', {
          name: categoryName.name,
          sortID: categoryName.sortID
        });
      } else {
        await axios.post('http://localhost:5000/categories', {
          name: newCategory.name,
          sortID: newCategory.sortID
        });
      }
        console.log('Category added successfully');
        setNewCategory({ name: '', sortID: '' });
        fetchCategories()
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const generateCategory = async () => {
    for (let defaultCategory of defaultCategories) {
      if (categories.find(category => category.name === defaultCategory.name)) {
        console.log("Already Exists")
        continue;
      } else {
        await handleAddCategory(defaultCategory)
      }
    }
  }

  const assignItemsToCategories = async () => {
    for (let menuItem of menuItems) {
      if (!categories.find(category => category.name === menuItem.category)) {
        console.log(`Category ${menuItem.category} not found... aborting import!`)
        return
      }

      if (!menuItem.display) {
        menuItem.display = menuItem.name
      }

      const itemExists = options.find(option => option.name === menuItem.name);
      if (!itemExists) {
        await handleAddItem(menuItem);
      }
    }
    fetchOptions();
    fetchCategories();
  }

  const relevantKVS = () => {
    // An extremely basic order router
    fetchOptions();

    let kvsToSendTo = [];

    for (let item of newOrder.items) {
      const optionToFind = options.find(items => items.name === item.name)
      optionToFind.Categories.some(category => {
        if (category.name === "Breakfast" || category.name === "Beef" || category.name === "Chicken") {
          if (newOrder.mfySide === "1") {
            kvsToSendTo.push("MFY1")
            return
          } else {
            kvsToSendTo.push("MFY2")
            return
          }
        }
        return true
      })
    }

    return kvsToSendTo
  }

  const importStations = async () => {
    for (let kvsDisplay of kvsDisplays) {
      if (!kvsDisplay.displayName) {
        kvsDisplay.displayName = kvsDisplay.name
      }

      const stationExists = stations.find(station => station.name === kvsDisplay.name)
      if (!stationExists) {
        await axios.post('http://localhost:5000/stations', {
          name: kvsDisplay.name,
          group: kvsDisplay.group,
          displayName: kvsDisplay.displayName
        })
        console.log('Station added successfully');
      } else {
        console.log('Station already exists...')
      }
    }
    fetchStations();
  }

  return (
    <div className="App">
      <h1>Admin Page</h1>
      <div className="order-form">
        <input
          type="text"
          placeholder="Order Number"
          value={newOrder.orderNumber}
          onChange={(e) => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
        />
        <input
          type="text"
          placeholder="Order Location (DT/FC)"
          value={newOrder.location}
          onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
        />
        <input
          type='text'
          placeholder='Item Amount'
          value={newItem.amount}
          onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
        />
        <select
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        >
          <option value="">Select an item</option>
          {options.map((option, index) => (
            <option key={index} value={option.name}>{option.name}</option>
          ))}
        </select>
        <button onClick={addItemToOrder}>Add Item</button>
        <input
          type="text"
          placeholder="MFY Side (1,2..4)"
          value={newOrder.mfySide}
          onChange={(e) => setNewOrder({ ...newOrder, mfySide: e.target.value })}
        />
        <button onClick={handleAddOrder}>Add Order</button>
      </div>
      <div className='order-form-footer'>
        <p>Items in Order</p>
        {newOrder.items.map((item, index) => (
          <li key={index}>{item.amount} {item.name}</li>
        ))}
      </div>
      <div className="add-item-form">
        <h2>Add New Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <select
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category.name}>{category.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Item Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <input
          type="text"
          placeholder='Display Name'
          value={newItem.display}
          onChange={(e) => setNewItem({ ...newItem, display: e.target.display })}
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>
      <div className='add-category-form'>
        <h2>Add new Category</h2>
        <input 
          type='text'
          placeholder='Category Name'
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value})}
        />
        <input 
          type='text'
          placeholder='Category Sorting ID'
          value={newCategory.sortID}
          onChange={(e) => setNewCategory({ ...newCategory, sortID: e.target.value})}
        />
        <button onClick={handleAddCategory}>Add Category</button>
        <br></br>
        <button onClick={generateCategory}>Add all categories</button>
        <button onClick={assignItemsToCategories}>Assign Items to Categories</button>
        <button onClick={importStations}>Import stations from file</button>
      </div>
    </div>
  );
}

export default Admin;