// websocket.js
const WebSocket = require('ws')

const simulationRegistry = require("../simulation/simulationRegistry");
const { Store, Stations } = require("../models/database");
const { addClientToRoom, removeClientFromRoom } = require("./broadcaster");

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

                    addClientToRoom(storeId, ws)
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
            if (ws.storeId) {
                const isEmpty = removeClientFromRoom(ws.storeId, ws)
                if (ws.kvsNum !== "APP" && isEmpty) {
                    const sim = simulationRegistry.get(ws.storeId);
                    sim?.onClientDisconnected();    
                }
            }
        });
    });

    
}

module.exports = {
    initialiseWebSocket
}