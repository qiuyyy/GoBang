import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";
import GameMessageBase, { GameMessageMatchOver, GameMessageType } from "./GameMessageBase";

/**
*@author  Qiu
*@description websocket客户端 单例 连接传数据
*/
const {ccclass, property} = cc._decorator;

@ccclass
export default class WSClient extends cc.Component {

    private static _instance: WSClient = null;

    
    static getInstance(): WSClient {
        return this._instance;
    }

    ws: WebSocket;
    
    onLoad() {
        WSClient._instance = this;
    }

    start() {
        
    }

    /**连接服务器 */
    connect() {
        console.log("client try to connect server");

        //cocos自带websocket 直接用
        //连接地址：ws:// + 本机ip + 端口号 
        //为啥要加ws://? 王八的屁股，规定。
        let ws = new WebSocket("ws://127.0.0.1:8080");

        //客户端和服务器连接上后,发送匹配请求
        ws.onopen = (ev:Event) => {
            ws.send(JSON.stringify({type:GameMessageType.Match}));
            //抛出连接服务器成功事件
            EventCenter.postEvent(EventDefine.EVENT_NETWORK_CONNECT);
        }

        //收到消息后回调
        ws.onmessage = (ev:MessageEvent) => {
            console.log("on message",ev);
            //将收到消息事件抛出去
            let msg = JSON.parse(ev.data) as GameMessageBase;

            if (msg.type == GameMessageType.S2C_MatchOver) {
                EventCenter.postEvent(EventDefine.EVENT_MATCH_OVER,msg);
            } else if (msg.type == GameMessageType.C2S_Put) {
                EventCenter.postEvent(EventDefine.EVENT_PUT,msg);
            } else if (msg.type ==GameMessageType.S2C_Register) {
                //直接将type作为响应事件函数名
                EventCenter.postEvent(msg.type.toString(),msg);
            } else if (msg.type ==GameMessageType.S2C_Login) {
                //直接将type作为响应事件函数名
                EventCenter.postEvent(msg.type.toString(),msg);
            }
        }

        this.ws = ws;
    }

    /**发消息 */
    sendMessage(msg: GameMessageBase) {
        this.ws.send(JSON.stringify(msg));
    }
}