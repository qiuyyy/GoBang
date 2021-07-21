/**创建websocket服务器 */
import * as WebSocket from 'ws';
import * as http from 'http';

/**用来监听端口 */
let ws = new WebSocket.Server({port:7080});

//建立连接之后回调
ws.on('connection',(socket: WebSocket, request: http.IncomingMessage) => {
    //ws是类似管理者，只负责监听接口状态
    //socket是服务者，是与客户端对接的websocket

    console.log("server get connection");

    //让服务端给客户端发送一句话
    socket.send("hello client, I'm server!");

    //接受方收到消息回调
    socket.on("message",(data: WebSocket.Data) => {
        console.log("message is receive",data);
    })
})