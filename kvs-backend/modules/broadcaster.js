const WebSocket = require("ws");

const rooms = new Map();

const addClientToRoom = (StoreId, ws) => {
    if (!rooms.has(StoreId)) {
        rooms.set(StoreId, new Set());
    }
    rooms.get(StoreId).add(ws);
};

const removeClientFromRoom = (StoreId, ws) => {
    if (!rooms.has(StoreId)) return;
    rooms.get(StoreId).delete(ws);
    if (rooms.get(StoreId).size === 0) {
        rooms.delete(StoreId);
        return true;
    }
};

const broadcastToRestaurant = (StoreId, message) => {
    const clients = rooms.get(StoreId);
    if (!clients) return;

    for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
};

module.exports = {
    addClientToRoom,
    removeClientFromRoom,
    broadcastToRestaurant
}