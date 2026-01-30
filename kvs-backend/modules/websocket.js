// websocket.js
const WebSocket = require('ws')

const simulationRegistry = require("../simulation/simulationRegistry")
const { Store, Stations } = require("../models/database")

let wss;

// storeId => Set<WebSocket>
const rooms = new Map();

const initialiseWebSocket = (server) => {
    wss = new WebSocket.Server({ server })
    console.log("Websocket server running")

    wss.on('connection', (ws) => {
        
        ws.on('message', async (raw) => {
            try {
                const message = JSON.parse(raw);

                if (message.type === "JOIN") {
                    const { storeId, kvsNum } = message;

                    if (!rooms.has(storeId)) {
                        rooms.set(storeId, new Set());
                    }

                    rooms.get(storeId).add(ws);
                    ws.storeId = storeId;
                    ws.kvsNum = kvsNum;

                    if (kvsNum !== "APP") {
                        console.log(`[WS] Store ${storeId} KVS ${kvsNum} connected.`);
                    };

                    try {
                        const store = await Store.findOne({ where: { id: storeId } });
                        if (!store) {
                            console.error(`[SE] Store ${storeId} not found.`);
                            return;
                        }

                        const kvs = await Stations.findOne({ where: { name: kvsNum, StoreId: storeId } });
                        if (!kvs) {
                            if (kvsNum !== "APP") {
                                console.error(`[SE] KVS with name ${kvsNum} could not be found`)
                            }
                            return;
                        }

                        const businessDayStart = store.currentBusinessDay;
                        const endTime = store.simulationEndTime ?? null;

                        const sim = simulationRegistry.ensureRunning({
                            storeId,
                            businessDayStart,
                            endTime
                        });

                        sim.onClientConnected()
                    } catch (err) {
                        console.error("[SE] Error starting simulation:", err);
                    }
                }

                if (ws.storeId) {
                    simulationRegistry.get(ws.storeId)?.markActive();
                }
            } catch (err) {
                console.error("WS message parse error", err);
            }
        });

        ws.on("close", () => {
            if (ws.storeId && rooms.has(ws.storeId)) {
                rooms.get(ws.storeId).delete(ws);
                if (rooms.get(ws.storeId).size === 0) {
                    rooms.delete(ws.storeId);
                }

                if (ws.kvsNum !== "APP") {
                    const sim = simulationRegistry.get(ws.storeId);
                    sim?.onClientDisconnected();    
                }
            }
        });
    });

    
}

const broadcastToRestaurant = (storeId, message) => {
    const clients = rooms.get(storeId);
    if (!clients) return;

    for (const ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}

module.exports = {
    initialiseWebSocket,
    broadcastToRestaurant
}