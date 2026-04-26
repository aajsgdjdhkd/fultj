const WebSocket = require('ws');

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: port });

let clients = [];
let clientCount = 0;

console.log(`聊天室服务端已启动，端口: ${port}`);

server.on('connection', function connection(ws) {
    clientCount++;
    const clientId = clientCount;
    const clientName = '用户' + clientId;
    
    clients.push({
        id: clientId,
        name: clientName,
        ws: ws
    });
    
    //广播新用户加入
    broadcast('【系统】' + clientName + ' 加入了聊天室', null);
    broadcastOnlineCount();
    
    console.log(clientName + '已连接，当前在线: ' + clients.length);
    
    ws.on('message', function message(data) {
        const msg = data.toString();
        console.log(clientName + ': ' + msg);
        broadcast(clientName + ': ' + msg, ws);
    });
    
    ws.on('close', function close() {
        clients = clients.filter(function(c) {
            return c.ws !== ws;
        });
        
        broadcast('【系统】' + clientName + ' 离开了聊天室', null);
        broadcastOnlineCount();
        console.log(clientName + '已断开，当前在线: ' + clients.length);
    });
    
    ws.on('error', function error(err) {
        console.log('错误: ' + err.message);
    });
});

function broadcast(message, senderWs) {
    clients.forEach(function(client) {
        if (client.ws !== senderWs) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        }
    });
}

function broadcastOnlineCount() {
    const msg = '【系统】当前在线人数: ' + clients.length;
    clients.forEach(function(client) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(msg);
        }
    });
}