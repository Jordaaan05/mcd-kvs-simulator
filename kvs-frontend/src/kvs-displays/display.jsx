import React, {useEffect, useState, useMemo, useRef } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/BasicKVS.css';
import toggleStationStatus from './modules/toggleStationStatus';
import { averageTimestampDifferenceLast24Hours, averageTimestampDifferenceLastHour } from './modules/calculateAverageTimes';
import fetchStation from '../modules/fetch/fetchStations';
import fetchCurrentBusinessDay from '../modules/fetch/fetchCurrentBusinessDay';
import get24HrTime from './modules/get24hTime';
import renderRecalledOrder from '../modules/render/renderRecalledOrder';
import applySortRules from '../modules/sort/applySortRules';
import { displays } from '../default_store/displaysConfig';

function Display({ stationName: routeId, config: propConfig }) {
    const [orders, setOrders] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [servedOrders, setServedOrders] = useState([]);
    const [currentStation, setCurrentStation] = useState(null);
    const [currentBusinessDay, setCurrentBusinessDay] = useState(null);
    const [plusOrders, setPlusOrders] = useState(false);
    const [recallMode, setRecallMode] = useState(false);
    const [recalledOrder, setRecalledOrder] = useState(0);
    const [recallStateValue, setRecallStateValue] = useState(0);
    const wsRef = useRef(null);
    const sortConfigVersionRef = useRef(0); // force recompute on station change
    
    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders`);
            const filtered = res.data
                .filter(order => !order.served?.[stationName])
                .filter(order => order.sendToKVS?.includes(stationName));
            setPlusOrders(filtered.length > (columns * 2));
            setOrders(filtered);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchRecentServedOrders = async () => {
        try {
            const res = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/day/${currentBusinessDay}/station/${stationName}`);
            setServedOrders(res.data || []);
        } catch (err) {
            console.error('Error fetching recent served orders:', err);
        }
    };

    useEffect(() => {
        let mounted = true;
        const fetchInitial = async () => {
            await fetchOrders();
            const station = await fetchStation(routeId);
            if (!mounted) return;
            setCurrentStation(station);
            // bump sortConfigVersion so new config recomputed
            sortConfigVersionRef.current++;
            const businessDay = await fetchCurrentBusinessDay();
            if (!mounted) return;
            setCurrentBusinessDay(businessDay);
        };
        fetchInitial();

        try {
            const ws = new WebSocket(`ws://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`);
            ws.onmessage = async (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'NEW_ORDER') {
                        if (message.data[1].includes(routeId)) {
                            const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/${message.data[0]}`);
                            setOrders(prev => {
                                const updated = [...prev, response.data];
                                setPlusOrders(updated.length > (config.columns * 2));
                                return updated;
                            });
                        }
                    }
                } catch (err) {
                    console.error('WS message parse/error', err);
                }
            };
            wsRef.current = ws;
        } catch (err) {
            console.warn('WebSocket init failed', err);
        }

        return () => {
            mounted = false;
            try { if (wsRef.current) wsRef.current.close(); } catch (err) {}
        };
    }, [routeId]);

    // update time formatting every second
    useEffect(() => {
        const interval = setInterval(() => {
            setOrders(prev => prev.map(o => ({ ...o, formattedTime: formatTimeToSeconds(o.createdAt) })));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // fetch recent orders when business day known
    useEffect(() => {
        if (!currentBusinessDay) return;
        fetchRecentServedOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBusinessDay]);

    const config = propConfig ?? (routeId ? displays[routeId] : undefined);

    if (!config) {
        return <div style={{ padding: 20 }}>Display config not found for {routeId || 'unknown'}</div>;
    }

    const {
        stationName = config.stationName,
        columns = config.columns ?? 2,
        itemsPerCard = config.itemsPerCard ?? 12,
        highlightLimit = config.highlightLimit ?? (columns * 2 - 1),
        footerOrangeTime = config.orangeTime ?? 30,
        footerRedTime = config.redTime ?? 60,
    } = config;

    const recallLastOrder = () => {
        if (recallMode) {
            setRecallMode(false);
            setRecallStateValue(0);
        } else {
            setRecallMode(true);
            setRecalledOrder(0);
            setRecallStateValue(1);
        }
    };

    const serveOrder = async (order) => {
        if (!order) return;
        try {
            const { id } = order;
            const servedTimestamp = new Date();
            const res = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/${id}`);
            const orderToUpdate = res.data;
            const updatedOrder = {
                ...orderToUpdate,
                served: {
                    ...orderToUpdate.served,
                    [stationName]: servedTimestamp
                }
            };
            await axios.put(`http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}/orders/${id}`, updatedOrder);
            await fetchOrders();
            await fetchRecentServedOrders();
            setActiveIndex(0);
        } catch (err) {
            console.error(`Error serving order with ID ${order.id}:`, err);
        }
    };

    // prev / next
    const selectPreviousOrder = () => {
        if (recallMode) {
            setRecalledOrder(prev => (prev < servedOrders.length - 1 ? prev + 1 : servedOrders.length - 1));
            return;
        }
        setActiveIndex(prev => {
            const displayLimit = highlightLimit;
            const maxIndex = Math.min(displayLimit, orders.length - 1);
            return prev > 0 ? prev - 1 : maxIndex;
        });
    };

    const selectNextOrder = () => {
        if (recallMode) {
            setRecalledOrder(prev => (prev > 0 ? prev - 1 : 0));
            return;
        }
        setActiveIndex(prev => {
            const displayLimit = highlightLimit;
            const maxIndex = Math.min(displayLimit, orders.length - 1);
            return prev < maxIndex ? prev + 1 : 0;
        });
    };

    const handleStationToggle = async () => {
        await toggleStationStatus(currentStation);
        const stationData = await fetchStation(stationName);
        setCurrentStation(stationData);
        sortConfigVersionRef.current++;
        fetchRecentServedOrders();
    }

    // utilities
    const formatTimeToSeconds = (timestamp) => {
        const now = new Date();
        const difference = Math.floor((now - new Date(timestamp)) / 1000);
        return `${difference}`;
    };

    const getOrderFooterStyle = (timestamp) => {
        const now = new Date();
        const difference = Math.floor((now - new Date(timestamp)) / 1000);
        if (difference >= footerRedTime) return { backgroundColor: 'red' };
        if (difference >= footerOrangeTime) return { backgroundColor: 'orange' };
        return { backgroundColor: 'grey' };
    };

    const getOrderBorderStyle = (index) => (index === activeIndex ? 'active-card' : '');

    // render
    return (
        <div className="App kvs-background">
            <div className={`orders-container columns-${columns}`}>
                {orders.slice(0, (columns * 2 - recallStateValue)).flatMap((order, orderIndex) => {
                    const cards = [];
                    const numCards = Math.ceil(order.Items.length / itemsPerCard);

                    for (let i = 0; i < order.Items.length; i += itemsPerCard) {
                        const cardClass = 
                            numCards === 1 ? 'order-card-single' : 
                            i === 0 ? 'order-card-left' : 
                            i + itemsPerCard >= order.Items.length ? 'order-card-right' : 
                            'order-card-centre';

                        const renderHeader = cardClass === 'order-card-single' || cardClass === 'order-card-left';
                        const renderFooterText = cardClass === 'order-card-single' || cardClass === 'order-card-left';

                        const filteredItems = config.transformItems
                            ? config.transformItems(
                                    order.Items.slice(i, i + itemsPerCard),
                                    { order, i, itemsPerCard, stationName }
                                )
                            : applySortRules(
                                    order.Items.slice(i, i + itemsPerCard),
                                    null,
                                    { order, i, itemsPerCard, stationName }
                                );


                        // active flag
                        const isActive = orderIndex === activeIndex;

                        cards.push(
                            <div className={`order-card ${cardClass} ${getOrderBorderStyle(orderIndex)}`} key={`${order.id}-${i}`}>
                                <div className="order-header">
                                    {renderHeader && (
                                        <div className="order-header-contents">
                                            <span className="eat-in-take-out">{order.eatInTakeOut}</span>
                                            <span className="order-location">{order.location}</span>
                                            <span className="order-id">{order.registerNumber}-{order.orderNumber || '00'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="order-items">
                                    <ul>
                                        {filteredItems.map((item, itemIndex) => (
                                            <li key={itemIndex}>{item.OrderItems?.amount ?? ''} {item.display}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="order-footer" style={getOrderFooterStyle(order.createdAt)}>
                                    {renderFooterText && (
                                        <div className='order-footer-text'>
                                            {config.showmfy && <span className="order-mfySide">Side {order.mfySide}</span>}
                                            {!config.showmfy && <span className="order-mfySide"> </span>}
                                            <span className="order-status">{order.status}</span>
                                            <span className="order-location">{order.location}</span>
                                            <span className="order-timestamp">{order.formattedTime || formatTimeToSeconds(order.createdAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                    return cards;
                })}

                {recallMode && renderRecalledOrder(servedOrders, recalledOrder, itemsPerCard, columns)}

                <div className="station-statistics">
                    <span className='station-stats'>
                        All / {currentStation?.displayName} <span className={`station-status ${currentStation?.status}`}>{currentStation?.status}</span>
                        {currentStation && ` ${averageTimestampDifferenceLastHour(servedOrders, stationName, currentBusinessDay)}/${averageTimestampDifferenceLast24Hours(servedOrders, stationName, currentBusinessDay)}`}
                    </span>
                </div>

                {plusOrders && (
                    <div className='plus-orders'>
                        <span className='num-plus-orders'>{Math.max(0, orders.length - (columns * 2 - recallStateValue))} More orders &gt;&gt;</span>
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
    )
}

export default Display;