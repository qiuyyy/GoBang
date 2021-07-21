/**
*@author  Qiu
*@description 服务器入口文件
*/
import WebSocket = require ('ws');
import * as http from 'http';
import Client from './src/Client';
import ClientManager from './src/ClientManager';
import DBManager from './src/DBManager';


//先连接数据库再开启服务器更好一点
//再优化就是将开启服务器放到连数据库的回调里,先这样吧
DBManager.getInstance(DBManager).connectDB();

//开启服务器连接
let ws = new WebSocket.Server({port: 8080});
ws.on("connection", (scoket: WebSocket,request: http.IncomingMessage)=>{
    console.log("Server get new Connection");

    //当有一个客户端连接进来就创建一个客户端类,来保管socket连接
    let client = new Client(scoket);
    ClientManager.getInstance().addClient(client);
} )

//打印当前时间戳
console.log(`ServerStart ${new Date().getTime()}`);