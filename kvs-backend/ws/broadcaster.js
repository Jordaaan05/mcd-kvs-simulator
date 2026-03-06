// broadcaster.js

const WebSocket = require("ws");
const { getClients } = require("./roomRegistry")

const broadcastToRestaurant = (StoreId, message) => {
    const clients = getClients(String(StoreId));
    if (!clients) return;
    for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
};

module.exports = {
    broadcastToRestaurant
}