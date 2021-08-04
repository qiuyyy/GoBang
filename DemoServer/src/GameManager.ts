import Client from "./Client";
import GameData from "./GameData";
import { GameMessageS2C_Login, GameMessageSync } from "./GameMessageBase";
import Singleton from "./Singleton";

/**
*@author  Qiu
*@description 游戏管理者 单例 存储游戏数据
*/
export default class GameManager extends Singleton<GameManager>{

    /**存放所有棋局的游戏数据 */
    allGames: GameData[] = [];
    
    /**添加棋局 */
    addGame(client_0: Client,client_1: Client) {
       let gameData = new GameData(client_0,client_1);
       this.allGames.push(gameData);
    }

    /**移除棋局 */
    removeGame(gameData: GameData) {
        let idx = this.allGames.indexOf(gameData);
        if (idx != -1) {
            this.allGames.splice(idx,1);
        }
    }

    /**检查是否有正在进行的棋局 */
    checkIsInGame(uid: string,callback: GameMessageS2C_Login,client) {
        for (let i = 0;i < this.allGames.length;i ++) {
            let gameData = this.allGames[i];
            if (gameData.disconnectUid == uid) { //有正在进行的棋局
                //棋局信息
                let sync = new GameMessageSync();
                sync.myUid = uid,
                sync.otherUid = gameData.clients[0].uid;
                sync.myChessType = gameData.getMyChessType();
                sync.tableData = gameData.tableData;
                callback.sync = sync;
                gameData.reconnect(client);
            }
        }

    }
}