import http from 'http';
import {Server} from 'socket.io';
import express from 'express';
import path from 'node:path';

async function main(){
    const app = express();
    app.use(express.static(path.resolve('./public')));
    
    const server = http.createServer(app);
    const io = new Server();


    io.attach(server);

    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);
        
        socket.on('user:message', (message) => {
            console.log('Received message:', message);
            socket.broadcast.emit('server:message', message);
        });

        socket.on('user:typing', () => {
            socket.broadcast.emit('server:typing', { userId: socket.id });
        });
    })
    
    server.listen(9000, () => {
        console.log(`Server is listening on port 9000`);
    })
}

main();