/**
*@author  Qiu
*@description 客户端类
*/
import { Db } from 'mongodb';
import { Md5 } from 'ts-md5';
import { v1 } from 'uuid';
import WebSocket = require ('ws');
import ClientManager from './ClientManager';
import DBManager from './DBManager';
import GameMessageBase, { GameMessageC2S_Register, GameMessageS2C_Register, GameMessageType } from './GameMessageBase';

export default class Client {
    ws: WebSocket;

    pairClient: Client;

    constructor(socket: WebSocket) {
        this.ws = socket;

        //需要绑定当前类bing(this),不然onMessage里的this就代表了socket而不是Client对象
        socket.on('message',this.onMessage.bind(this));
    }

    /**客户端发来消息 */
    onMessage(data: WebSocket.Data) {
        let msg = JSON.parse(data as string) as GameMessageBase;

        if (msg.type == GameMessageType.Hello) {
            console.log(msg);
        }else if (msg.type == GameMessageType.Match) {
            ClientManager.getInstance().match(this);
        }else if (msg.type == GameMessageType.C2S_Put) {
            //直接向两个客户端转发
            this.send(msg);
            this.pairClient.send(msg);
        } else if (msg.type == GameMessageType.C2S_Register) {
            //要访问数据库
            let register = msg as GameMessageC2S_Register;
            //判断有没有重复的用户名
            DBManager.getUserCollection().find({username : register.username}).toArray((err , res: []) => {
                let callback = new GameMessageS2C_Register();
                if (res.length > 0) { //有该用户名
                    //给客户端回执
                    callback.code = 1;
                    this.send(callback);
                } else { //没有重名用户,就可以向数据库里写数据了
                    let uid = v1(); //生成一个唯一的标识符
                    let username = register.username;
                    let password = Md5.hashAsciiStr(register.password); //加密密码

                    let doc = {uid: uid,username: username,password: password};
                    //将文档存进数据库
                    DBManager.getUserCollection().insertOne(doc,(err,res) => {
                        if (err) {
                            throw err;
                        }
                        //给客户端回执
                        callback.code = 0;
                        this.send(callback);
                    });
                }
            });
        }
        
    }

    /**向客户端发送消息 */
    send(msg: GameMessageBase) {
        this.ws.send(JSON.stringify(msg));
    }
}