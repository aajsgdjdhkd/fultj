const net = require('net');

let clients = [];
let clientCount = 0;

const server = net.createServer((socket) => {
    clientCount++;
    const clientId = clientCount;
    const clientName = '用户' + clientId;
    
    clients.push({
        id: clientId,
        name: clientName,
        socket: socket
    });
    
    console.log(`${clientName} 已连接，当前在线: ${clients.length}`);
    
    //广播加入消息
    broadcast(`【系统】${clientName} 加入了聊天室`);
    broadcastOnlineCount();
    
    socket.on('data', (data) => {
        const message = data.toString().trim();
        console.log(`${clientName}: ${message}`);
        broadcast(`${clientName}: ${message}`, socket);
    });
    
    socket.on('close', () => {
        clients = clients.filter(c => c.socket !== socket);
        broadcast(`【系统】${clientName} 离开了聊天室`);
        broadcastOnlineCount();
        console.log(`${clientName} 已断开，当前在线: ${clients.length}`);
    });
    
    socket.on('error', (err) => {
        console.log(`错误: ${err.message}`);
    });
});

function broadcast(message, senderSocket = null) {
    clients.forEach(client => {
        if (client.socket !== senderSocket) {
            client.socket.write(message + '\n');
        }
    });
}

function broadcastOnlineCount() {
    broadcast(`【系统】当前在线人数: ${clients.length}`);
}

server.listen(8888, '0.0.0.0', () => {
    console.log('聊天室服务端已启动，端口: 8888');
    console.log('本机IP地址:');
    
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (let name in interfaces) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`  http://${iface.address}:8888`);
            }
        }
    }
});