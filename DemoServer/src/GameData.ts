import Client from "./Client";
import GameManager from "./GameManager";
import { GameMessageMatchOver, GameMessagePut } from "./GameMessageBase";

/**
*@author  Qiu
*@description 游戏数据
*/
export default class GameData {

    /**存放棋局玩家 */
    clients: Client[] = []; 

    /**棋盘数据 存放棋子信息数据 */
    tableData: GameChess[][];

    /**玩家对应的棋子颜色 */
    chessTypeMap: Map<string, GameChessType> = new Map<string, GameChessType>();

    lastChess: GameChess;

    /**掉线玩家的uid */
    disconnectUid: string;
    
    constructor(client_0: Client,client_1: Client) {
        //棋盘数据
        this.tableData = [];
        for (let i = 0;i <= 14;i ++) {
            this.tableData[i] = [];
            for (let j = 0;j <= 14;j ++) {
                let chessData = new GameChess();
                this.tableData[i][j] = chessData;
            }
        }

         //匹配成功,绑定匹配信息
         client_0.pairClient = client_1;
         client_1.pairClient = client_0;
 
         // //向客户端发送匹配成功消息
         // let msg = new GameMessageBase();
         // msg.type = GameMessageType.S2C_MatchOver;
         // client.send(msg);
         // pair.send(msg);
 
         // let uid0 = 1000;
         // let uid1 = 1001;
         // 不用手动填uid了,直接获取注册时uuid生成的uid
 
 
         //第一份消息
         let msg0 = new GameMessageMatchOver();
         msg0.myUid= client_1.uid;
         msg0.myChessType = 1;
         msg0.otherUid = client_0.uid;
         client_1.send(msg0);
 
         //第二份消息
         let msg1 = new GameMessageMatchOver();
         msg1.myUid= client_0.uid;
         msg1.myChessType = 2;
         msg1.otherUid = client_1.uid;
         client_0.send(msg1);

         this.addClient(client_0, GameChessType.White);
         this.addClient(client_1, GameChessType.Black);
    } 

    /**添加玩家 */
    addClient(client: Client,chessType: GameChessType) {
        this.clients.push(client);
        client.gameData = this;
        this.chessTypeMap.set(client.uid, chessType);
    }

    /**下棋子时 */
    onPut(msg: GameMessagePut) {
        //分发数据
        for (let i = 0;i < this.clients.length;i ++) {
            let client = this.clients[i];
            client.send(msg);
        }
        //记录棋盘信息
        let chess = this.tableData[msg.i][msg.j];
        chess.chessType = msg.chessType;
        if (this.lastChess) {
            this.lastChess.isLastPutChess = false;
        }
        this.lastChess = chess;
        this.lastChess.isLastPutChess = true;
    }

    /**掉线时 */
    disconnect(client: Client) {
        for (let i = 0;i < this.clients.length;i ++) {
            let c = this.clients[i];
            if (c == client) {
                this.clients.splice(i,1);
                break;
            }
        }

        this.chessTypeMap.delete(client.uid);
        this.disconnectUid = client.uid;
        client.gameData = null; //消除引用

        if (this.clients.length == 0) { //两个人都掉线了
            //直接移除这局游戏
            GameManager.getInstance(GameManager).removeGame(this);
        }
    }

    /**重新连接 */
    reconnect(client: Client) {
        this.addClient(client,this.getMyChessType());
    }

    /**获取棋子颜色 */
    getMyChessType(): GameChessType {
        let pairChessType = this.chessTypeMap.get(this.clients[0].uid);
        return pairChessType == GameChessType.White ? GameChessType.Black : GameChessType.White;
    }
}

/**棋子数据 */
export class GameChess {
    /**棋子类型 */
    chessType: GameChessType = GameChessType.None;
    /**是否显示红点 */
    isLastPutChess: boolean = false;
    //不需要位置么? 不需要,棋子是存放在对应位置的数组里
}

/**棋子类型枚举 */
export enum GameChessType {
    None,
    White,
    Black
}