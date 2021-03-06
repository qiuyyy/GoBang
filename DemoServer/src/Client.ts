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
import GameData from './GameData';
import GameManager from './GameManager';
import GameMessageBase, { GameMessageC2S_Login, GameMessageC2S_Register, GameMessagePut, GameMessageS2C_Login, GameMessageS2C_Register, GameMessageType } from './GameMessageBase';

export default class Client {
    ws: WebSocket;

    pairClient: Client; //配对的用户

    uid: string; //当前用户uid

    gameData: GameData;

    constructor(socket: WebSocket) {
        this.ws = socket;

        //需要绑定当前类bing(this),不然onMessage里的this就代表了socket而不是Client对象
        socket.on('message',this.onMessage.bind(this));

        //断线重连
        socket.on("close",this.onClose.bind(this));
    }

    /**客户端发来消息 */
    onMessage(data: WebSocket.Data) {
        console.log("get message from client",data);
        let msg = JSON.parse(data as string) as GameMessageBase;

        if (msg.type == GameMessageType.Hello) {

        }else if (msg.type == GameMessageType.C2S_Match) {
            ClientManager.getInstance().match(this);
        }else if (msg.type == GameMessageType.C2S_Put) {
            this.gameData.onPut(msg as GameMessagePut);
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
        } else if (msg.type == GameMessageType.C2S_Login) {
            let login = msg as GameMessageC2S_Login;
            let password = Md5.hashStr(login.password); //转换为md5
            //查找相同用户名和密码的文档
            DBManager.getUserCollection().findOne({username: login.username,password: password},(err, res) => {
                let callback = new GameMessageS2C_Login();
                console.log("c2s_login error:",err,"res:",res);
                if (res) { //用户名和密码都有匹配的用户,输入正确
                    callback.code = 0;
                    callback.uid = res.uid;
                    this.uid = res.uid;

                    //检查是否有未完成棋局
                    GameManager.getInstance(GameManager).checkIsInGame(res.uid, callback,this)


                } else { //没有匹配用户,输入错误
                    callback.code = 1
                }
                this.send(callback);
            })
        }
        
    }

    //客户端断开连接时
    onClose() {
        ClientManager.getInstance().removeClient(this);

        if (this.gameData) {
            this.gameData.disconnect(this);
        }
    }

    /**向客户端发送消息 */
    send(msg: GameMessageBase) {
        this.ws.send(JSON.stringify(msg));
    }
}