import Client from "./Client";
import GameManager from "./GameManager";
import GameMessageBase, { GameMessageC2S, GameMessageMatchOver, GameMessageType } from "./GameMessageBase";

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

    /**存放所有在线的客户端类 */
    allClients: Client[] = [];
    /**所有正在匹配的客户端 */
    matchingClients: Client[] = [];

    /**添加客户端 */
    addClient(client: Client) {
        this.allClients.push(client);
    }

    /**移出d当前客户端 */
    removeClient(client: Client) {
        let idx = this.allClients.indexOf(client);
        if (idx != -1) {
            this.allClients.splice(idx,1);
        }

        idx = this.matchingClients.indexOf(client);
        if (idx != -1) {
            this.matchingClients.splice(idx,1);
        }
    }

    match(client: Client) {
       
        if (this.matchingClients.length == 0) { //没有正在匹配的客户端
            this.matchingClients.push(client);
        } else { //有正在匹配的客户端就直接和当前客户端配对了
            //匹配成功,绑定匹配信息
            let pair = this.matchingClients.shift();

            GameManager.getInstance(GameManager).addGame(client,pair);
        }
    }
}