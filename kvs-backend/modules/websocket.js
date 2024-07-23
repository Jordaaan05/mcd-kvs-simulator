const WebSocket = require('ws')

let wss;

const initialiseWebSocket = (server) => {
    wss = new WebSocket.Server({ server })
    console.log("Websocket server running")

    wss.on('connection', (ws) => {
        console.log('Client connected');
    
        ws.on('message', (message) => {
            console.log('Received message:', message)
        })

        ws.on('close', () => {
          console.log('Client disconnected')
        });
    });
}

const broadcastMessage = (message) => {
    if (wss) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
            }
        })
    }
}

module.exports = {
    initialiseWebSocket,
    broadcastMessage
}