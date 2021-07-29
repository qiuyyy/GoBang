import Client from "./Client";
import GameMessageBase, { GameMessageMatchOver, GameMessageType } from "./GameMessageBase";

/**
*@author  Qiu
*@description 客户端管理者 单例
*/
export default class ClientManager {
    private static _instance: ClientManager = null;

    /**获取ClientManager单例 */
    static getInstance(): ClientManager {
        if (!ClientManager._instance) {
            ClientManager._instance = new ClientManager();
        }
        return ClientManager._instance;
    }

    /**存放所有客户端类 */
    allClients: Client[] = [];
    /**所有正在匹配的客户端 */
    matchingClients: Client[] = [];

    /**添加客户端 */
    addClient(client: Client) {
        this.allClients.push(client);
    }

    match(client: Client) {
       
        if (this.matchingClients.length == 0) { //没有正在匹配的客户端
            this.matchingClients.push(client);
        } else { //有正在匹配的客户端就直接和当前客户端配对了
            //匹配成功,绑定匹配信息
            let pair = this.matchingClients.shift();
            client.pairClient = pair;
            pair.pairClient = client;

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
            msg0.myUid= pair.uid;
            msg0.myChessType = 1;
            msg0.otherUid = client.uid;
            pair.send(msg0);

            //第二份消息
            let msg1 = new GameMessageMatchOver();
            msg1.myUid= client.uid;
            msg1.myChessType = 2;
            msg1.otherUid = pair.uid;
            client.send(msg1);
        }
    }
}