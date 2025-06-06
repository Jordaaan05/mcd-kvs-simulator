import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/BasicKVS.css';
import toggleStationStatus from '../modules/toggleStationStatus'
import { averageTimestampDifferenceLast24Hours, averageTimestampDifferenceLastHour } from '../modules/calculateAverageTimes';
import fetchStation from '../../modules/fetch/fetchStations';
import fetchCurrentBusinessDay from '../../modules/fetch/fetchCurrentBusinessDay';
import get24HrTime from '../modules/get24hTime';
import renderRecalledOrder from '../../modules/render/renderRecalledOrder'

function MFY4() {
  const [orders, setOrders] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [servedOrders, setServedOrders] = useState([]);
  const [currentStation, setCurrentStation] = useState([])
  const [currentBusinessDay, setCurrentBusinessDay] = useState();
  const [plusOrders, setPlusOrders] = useState(false)
  const [recallMode, setRecallMode] = useState(false)
  const [recalledOrder, setRecalledOrder] = useState(0)
  const columns = 2; 
  const itemsPerCard = 12;
  const stationName = "MFY4"


  useEffect(() => {
    const fetchInitialData = async () => {
      fetchOrders();
      const stationData = await fetchStation(stationName);
      setCurrentStation(stationData);
      const businessDayData = await fetchCurrentBusinessDay();
      setCurrentBusinessDay(businessDayData)
    };

    fetchInitialData();
    /*const interval = setInterval(fetchOrders, 1000); // Update every second
    return () => clearInterval(interval);*/

    const ws = new WebSocket(`ws:/${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`)

    ws.onmessage= async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "NEW_ORDER") {
        if (message.data[1].includes(stationName)) {
          const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/${message.data[0]}`) // where message.data is the ID of the new order.
          setOrders(prevOrders => {
            const updatedOrders = [...prevOrders, response.data];
            setPlusOrders(updatedOrders.length > (columns * 2));
            return updatedOrders
          });
        }
      }
    }

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    // Update timestamp every second
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          formattedTime: formatTimeToSeconds(order.createdAt),
        }))
      );
    }, 1000);
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [orders]);

  useEffect(() => {
    if (currentBusinessDay) {
      fetchRecentServedOrders()
    }// eslint-disable-next-line
  }, [currentBusinessDay])

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders`);
      const filteredOrders = response.data.filter(order => !order.served?.MFY4).filter(order => order.sendToKVS.includes(stationName)); // Skip orders with servedTime
      setPlusOrders(filteredOrders.length > (columns * 2))
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchRecentServedOrders = async () => {
    try {
      const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/day/${currentBusinessDay}/station/${stationName}`);
      const orders = response.data
      setServedOrders(orders);
    } catch (error) {
      console.error('Error fetching recent served orders:', error);
    }
  };

  const recallLastOrder = () => {
    if (recallMode) {
      setRecallMode(false)
    } else {
      if (servedOrders.length > 0) {
        setRecallMode(true)
        setRecalledOrder(0)
      }
    }
  }

  const serveOrder = async (order) => {
    if (!order) return;
    const { id } = order;
    const servedTimestamp = new Date();

    const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/${id}`)
    const orderToUpdate = response.data
    const updatedOrder = {
      ...orderToUpdate,
      served: {
        ...orderToUpdate.served,
        MFY4: servedTimestamp,
      },
    };
    await axios.put(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/${id}`, updatedOrder);

    fetchOrders();
    fetchRecentServedOrders();
    setActiveIndex(0); // Reset active index after serving
  };
  
  const selectPreviousOrder = () => {
    if (recallMode) {
      setRecalledOrder(prevIndex => (prevIndex < servedOrders.length - 1 ? prevIndex + 1 : servedOrders.length - 1));
    } else {
    setActiveIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : orders.length - 1));
    }
  };
  
  const selectNextOrder = () => {
    if (recallMode) {
      setRecalledOrder(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else {
    setActiveIndex(prevIndex => (prevIndex < orders.length - 1 ? prevIndex + 1 : 0));
    }
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
    if (difference >= 60) return { backgroundColor: 'red' };
    if (difference >= 30) return { backgroundColor: 'orange' };
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
        {orders.slice(0,(columns*2)).flatMap((order, orderIndex) => {
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

            const filteredItems = order.Items.slice(i, i + itemsPerCard).filter(item => 
                item.Categories.some(category => 
                    category.name === 'Breakfast' || 
                    category.name === 'Beef' ||
                    category.name === 'Chicken'
                )
            ).sort((a, b) => {
                const categoryA = a.Categories.find(category => 
                    category.name === 'Breakfast' || 
                    category.name === 'Beef' ||
                    category.name === 'Chicken'
                );
                const categoryB = b.Categories.find(category => 
                    category.name === 'Breakfast' || 
                    category.name === 'Beef' ||
                    category.name === 'Chicken'
                );
                
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
                    <span className="eat-in-take-out">{order.eatInTakeOut}</span>
                    <span className="order-location">{order.location}</span>
                    <span className="order-id">{order.registerNumber}-{order.orderNumber || "00"}</span>
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
                    <span className='order-mfySide'> </span>
                    <span className='order-status'>{order.status}</span>
                    <span className='order-location'>{order.orderLocation}</span>
                    <span className='order-timestamp'>{order.formattedTime || formatTimeToSeconds(order.createdAt)}</span>
                  </div>
                  )}
                </div>
              </div>
            )
          }
          return cards;
        })}

        {recallMode && renderRecalledOrder(servedOrders, recalledOrder, itemsPerCard, columns)}

        <div className='station-statistics'>
          <span className='station-stats'>All / {currentStation.displayName} <span className={`station-status ${currentStation.status}`}>{currentStation.status}</span> {averageTimestampDifferenceLastHour(servedOrders, stationName, currentBusinessDay)}/{averageTimestampDifferenceLast24Hours(servedOrders, stationName, currentBusinessDay)}</span>
        </div>

        {plusOrders && (
          <div className='plus-orders'>
            <span className='num-plus-orders'>{orders.length - (columns * 2)} More orders &gt;&gt;</span>
          </div>
        )}

        <div className='time'>
          <span className='current-time'>{get24HrTime()}</span>
        </div>

        <div className="order-actions">
          <button onClick={() => serveOrder(orders[activeIndex])} className='serve-button'>Serve</button>
          <button onClick={selectPreviousOrder} className='prev-next-button'>Prev</button>
          <button onClick={selectNextOrder} className='prev-next-button'>Next</button>
          <button onClick={recallLastOrder} className='recall-button'>Recall</button>
          <button onClick={handleStationToggle} className='on-off-button'>Side ON/OFF</button>
        </div>
      </div>
    </div>
  );
}

export default MFY4;