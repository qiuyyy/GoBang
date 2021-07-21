"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**创建websocket服务器 */
var WebSocket = __importStar(require("ws"));
/**用来监听端口 */
var ws = new WebSocket.Server({ port: 8080 });
//建立连接之后回调
ws.on('connection', function (socket, request) {
    //ws是类似管理者，只负责监听接口状态
    //socket是服务者，是与客户端对接的websocket
    console.log("server get connection");
    //让服务端给客户端发送一句话
    socket.send("hello client, I'm server!");
    //接受方收到消息回调
    socket.on("message", function (data) {
        console.log("message is receive", data);
    });
});
