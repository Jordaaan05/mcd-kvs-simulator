/* 
    Renders the recalled order.
*/

const MFYStationNames = ["MFY1", "MFY2", "MFY3", "MFY4"]
const FCStationNames = ["FC1", "FC2"]
const CAFEStationNames = ["CAFE1", "CAFE2"]

const formatTimeToSeconds = (timestamp) => {
    const now = new Date();
    const difference = Math.floor((now - new Date(timestamp)) / 1000);
    return `${difference}`;
  };

const renderRecalledOrder = (servedOrders, recalledOrder, itemsPerCard, columns, stationName="MFY1") => {
    const order = servedOrders[recalledOrder]

    if (!order) return null;


    const cards = [];
    const numCards = Math.ceil(order.Items.length / itemsPerCard)

    const renderSideNumber = MFYStationNames.some(station => order.sendToKVS.includes(station)) && FCStationNames.includes(stationName)

    for (let i = 0; i < order.Items.length; i += itemsPerCard) {          
        const cardClass = 
        numCards === 1 ? 'order-card-single' :
        i === 0 ? 'order-card-left' :
        i + itemsPerCard >= order.Items.length ? 'order-card-right' :
        'order-card-centre';
        
        const renderHeader = cardClass === 'order-card-single' || cardClass === 'order-card-left'

        const renderFooterText = cardClass === 'order-card-left' || cardClass === 'order-card-single'
        
        let filteredItems

        if (MFYStationNames.includes(stationName)) {
            filteredItems = order.Items.slice(i, i + itemsPerCard).filter(item => 
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
        }

        if (FCStationNames.includes(stationName)) {
            filteredItems = order.Items.slice(i, i + itemsPerCard).sort((a, b) => {
                // Assuming each item has only one category for simplicity. If an item can have multiple categories, adjust accordingly.
                const categoryA = a.Categories[0];
                const categoryB = b.Categories[0];
            
                if (categoryA.sortID !== categoryB.sortID) {
                    return categoryA.sortID - categoryB.sortID;
                } else {
                    return a.ID - b.ID;
                }
            });
        }

        if (CAFEStationNames.includes(stationName)) {
            filteredItems = order.Items.slice(i, i + itemsPerCard).filter(item => 
                item.Categories.some(category => 
                    category.name === 'McCafe' 
                )
            ).sort((a, b) => {
                const categoryA = a.Categories.find(category => 
                    category.name === 'McCafe' 
                );
                const categoryB = b.Categories.find(category => 
                    category.name === 'McCafe' 
                );
                
                if (categoryA.sortID !== categoryB.sortID) {
                    return categoryA.sortID - categoryB.sortID;
                } else {
                    return a.ID - b.ID;
                }
            });
        }

        if (stationName === "DRINKS1") {
            filteredItems = order.Items.slice(i, i + itemsPerCard).filter(item => 
                item.Categories.some(category => 
                    category.name === 'Drinks' || 
                    category.name === 'Deserts' 
                )
            ).sort((a, b) => {
                const categoryA = a.Categories.find(category => 
                    category.name === 'Drinks' || 
                    category.name === 'Deserts' 
                );
                const categoryB = b.Categories.find(category => 
                    category.name === 'Drinks' || 
                    category.name === 'Deserts' 
                );
                
                if (categoryA.sortID !== categoryB.sortID) {
                    return categoryA.sortID - categoryB.sortID;
                } else {
                    return a.ID - b.ID;
                }
            });
        }

        if (stationName === "GRILL1") {
            filteredItems = order.Items.slice(i, i + itemsPerCard).filter(item => 
                item.Categories.some(category => 
                    category.name === 'Beef'
                )
            ).sort((a, b) => {
                const categoryA = a.Categories.find(category => 
                    category.name === 'Beef' 
                );
                const categoryB = b.Categories.find(category => 
                    category.name === 'Beef' 
                );
                
                if (categoryA.sortID !== categoryB.sortID) {
                    return categoryA.sortID - categoryB.sortID;
                } else {
                    return a.ID - b.ID;
                }
            });
        }
        cards.push(
        <div className={`order-card-recall-${columns} ${cardClass}`} key={`${order.id}-${i}`}>
            <div className="order-header">
            {renderHeader && (
                <div className='order-header-contents'>
                <span className="eat-in-take-out">{order.eatInTakeOut}</span>
                <span className="order-location">{order.location}</span>
                <span className="order-id">{order.registerNumber}-{order.orderNumber || "00"}</span>
            </div>
            )}
            </div>
            <div className="order-items-recall">
            <ul>
                {filteredItems.map((item, itemIndex) => (
                <li key={itemIndex}>{item.OrderItems.amount} {item.display}</li>
                ))}
            </ul>
            </div>
            <div className="order-footer" style={{backgroundColor: 'blueviolet'}}>
            {renderFooterText && (
                <div className='order-footer-text'>
                {renderSideNumber && (
                    <span className='order-mfySide'>Side {order.mfySide}</span>
                )}
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
}

export default renderRecalledOrder