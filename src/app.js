import http from 'http';
import express from 'express';
import cors from 'cors';
import io from 'socket.io';
import config from '../config/config.json';
import path from 'path';

// setup server
const app = express();
const server = http.createServer(app);

const socketIo = io(server);

// Allow CORS
app.use(cors());

// Render a API index page
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/update', function (req, res) {
  res.send(req.params);
})

// Start listening
server.listen(process.env.PORT || config.port);
console.log(`** Super Cart Client Live Started on port ${config.port} **`);

// Setup socket.io
socketIo.on('connection', socket => {
  
  
  if (socket.handshake.query.cart) {
    socket.cart = socket.handshake.query.cart
    socket.join(socket.cart);

    socket.broadcast.to(socket.cart).emit('server:message',socket.id);   
  }

  
  socket.on('client:item_update', data => {
    var cart = data.cart;
    console.log(`${socket.id} got update for cart: ${data.cart}`);

    socket.broadcast.to(socket.cart).emit('server:cart_update',data);
    
  });

  socket.on('client:carts_update', data => {
    var userId = data.userId;
    console.log(`${socket.id} got update for carts from user: ${userId}`);

    socket.broadcast.emit('server:carts_update',data);
    
  });

  socket.on('disconnect', data => {
    if (socket.cart) {
      socket.leave(socket.cart);
      console.log(`${socket.id} left cart: ${socket.cart}`);    
    }

  });
});
// Setup socket.io

export default app;
