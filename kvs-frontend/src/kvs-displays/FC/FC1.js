import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/FC.css';
import toggleStationStatus from '../modules/toggleStationStatus'
import { averageTimestampDifferenceLastHour, averageTimestampDifferenceLast24Hours } from '../modules/calculateAverageTimes';
import fetchStation from '../modules/fetch/fetchStations';
import fetchCurrentBusinessDay from '../modules/fetch/fetchCurrentBusinessDay';

function FC1() {
  const [orders, setOrders] = useState([]);
  const columns = 4; // Set the number of columns here
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerCard = 12; // Max number of items per card
  const [servedOrders, setServedOrders] = useState([]);
  const [currentStation, setCurrentStation] = useState([])
  const [currentBusinessDay, setCurrentBusinessDay] = useState();
  const stationName = "FC1"


  useEffect(() => {
    const fetchInitialData = async () => {
      fetchOrders();
      const stationData = await fetchStation(stationName);
      setCurrentStation(stationData);
      const businessDayData = await fetchCurrentBusinessDay();
      setCurrentBusinessDay(businessDayData)
      fetchRecentServedOrders();
    };

    fetchInitialData();
    const interval = setInterval(fetchOrders, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/orders');
      const filteredOrders = response.data.filter(order => !order.served?.FC1); // Skip orders with servedTime
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchRecentServedOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/orders');

      const recentServedOrders = response.data.filter(order => {
        if (order.served?.FC1) {
          const servedTimestamp = new Date(order.served.FC1).getTime();
          const now = new Date().getTime();
          const hoursDifference = (now - servedTimestamp) / (1000 * 60 * 60); // Convert difference to hours
          return hoursDifference <= 24; // Include orders served within the last 24 hours
        }
        return false; // Only include orders with servedTime
      });

      setServedOrders(recentServedOrders);
    } catch (error) {
      console.error('Error fetching recent served orders:', error);
    }
  };

  const serveOrder = async (order) => {
    if (!order) return;
    const { id } = order;
    const servedTimestamp = new Date();

    const orderToUpdate = orders.find(order => order.id === id);
    const updatedOrder = {
      ...orderToUpdate,
      served: {
        ...orderToUpdate.served,
        FC1: servedTimestamp,
      },
    };
    await axios.put(`http://localhost:5000/orders/${id}`, updatedOrder);

    fetchOrders();
    fetchRecentServedOrders();
    setActiveIndex(0); // Reset active index after serving
  };
  
  const selectPreviousOrder = () => {
    setActiveIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : orders.length - 1));
  };
  
  const selectNextOrder = () => {
    setActiveIndex(prevIndex => (prevIndex < orders.length - 1 ? prevIndex + 1 : 0));
  };
  
  const handleStationToggle = async () => {
    await toggleStationStatus(currentStation);
    const stationData = await fetchStation(stationName);
    setCurrentStation(stationData);
    fetchRecentServedOrders();
  }

  const formatTimeToSeconds = (timestamp) => {
    const now = new Date();
    const difference = Math.floor((now - new Date(timestamp)) / 1000);
    return `${difference}`;
  };

  const getOrderFooterStyle = (timestamp) => {
    const now = new Date();
    const difference = Math.floor((now - new Date(timestamp)) / 1000);
    if (difference >= 120) return { backgroundColor: 'red' };
    if (difference >= 60) return { backgroundColor: 'orange' };
    return { backgroundColor: 'grey' };
  };

  const getOrderBorderStyle = (index) => {
    if (index === activeIndex) {
      return 'active-card';
    };
  };
 
  return (
    <div className="App kvs-background">
      <div className={`orders-container columns-${columns}`}>
        {orders.flatMap((order, orderIndex) => {
          const cards = [];
          const numCards = Math.ceil(order.Items.length / itemsPerCard)

          for (let i = 0; i < order.Items.length; i += itemsPerCard) {          
            const cardClass = 
              numCards === 1 ? 'order-card-single' :
              i === 0 ? 'order-card-left' :
              i + itemsPerCard >= order.Items.length ? 'order-card-right' :
              'order-card-centre';
            
            const renderHeader = cardClass === 'order-card-single' || cardClass === 'order-card-left'

            const renderFooterText = cardClass === 'order-card-left' || cardClass === 'order-card-single'

            const filteredItems = order.Items.slice(i, i + itemsPerCard).sort((a, b) => {
                // Assuming each item has only one category for simplicity. If an item can have multiple categories, adjust accordingly.
                const categoryA = a.Categories[0];
                const categoryB = b.Categories[0];
            
                if (categoryA.sortID !== categoryB.sortID) {
                    return categoryA.sortID - categoryB.sortID;
                } else {
                    return a.ID - b.ID;
                }
            });

            cards.push(
              <div className={`order-card ${cardClass} ${getOrderBorderStyle(orderIndex)}`} key={`${order.id}-${i}`}>
                <div className="order-header">
                  {renderHeader && (
                    <div className='order-header-contents'>
                      <span className="order-id">{order.orderNumber}</span>
                      <span className="order-location">{order.location}</span>
                    </div>
                  )}
                </div>
                <div className="order-items">
                  <ul>
                    {filteredItems.map((item, itemIndex) => (
                      <li key={itemIndex}>{item.OrderItems.amount} {item.display}</li>
                    ))}
                  </ul>
                </div>
                <div className="order-footer" style={getOrderFooterStyle(order.createdAt)}>
                  {renderFooterText && (
                    <div className='order-footer-text'>
                      <span className='order-status'>{order.status}</span>
                      <span className='order-mfySide'>Side {order.mfySide}</span>
                      <span className='order-timestamp'>{formatTimeToSeconds(order.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          }
          
          return cards;
        })}

        <div className='station-statistics'>
          <span className='station-stats'>All / {currentStation.displayName} <span className={`station-status ${currentStation.status}`}>{currentStation.status}</span> {averageTimestampDifferenceLastHour(servedOrders, stationName, currentBusinessDay)}/{averageTimestampDifferenceLast24Hours(servedOrders, stationName, currentBusinessDay)}</span>
        </div>

        <div className="order-actions">
          <button onClick={() => serveOrder(orders[activeIndex])}>Serve</button>
          <button onClick={selectPreviousOrder}>Prev</button>
          <button onClick={selectNextOrder}>Next</button>
          <button onClick={handleStationToggle}>Side ON/OFF</button>
        </div>
      </div>
    </div>
  );
}

export default FC1;