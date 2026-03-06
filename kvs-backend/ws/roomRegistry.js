/**
 * RoomRegistry - Owns the register of all WS rooms
 */

// storeId => Set<WS>
const rooms = new Map();

const addClient = (StoreId, ws) => {
    if (!rooms.has(StoreId)) {
        rooms.set(StoreId, new Set());
    }
    rooms.get(StoreId).add(ws)
};

const removeClient = (StoreId, ws) => {
    if (!rooms.has(StoreId)) return false;

    const set = rooms.get(StoreId);
    set.delete(ws);

    if (set.size === 0) {
        rooms.delete(StoreId);
        return true; // room is now empty
    }

    return false;
};

const getClients = (StoreId) => {
    return rooms.get(StoreId);
};

module.exports = {
    addClient,
    removeClient,
    getClients
}