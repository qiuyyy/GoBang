import { GameChessType } from "./GameData";

/**
*@author  Qiu
*@description 玩家类 数据层
*/
export default class GamePlayer {

    /**玩家id */
    uid: string;
    /**用户名 */
    username: string;
    /**是否是两个玩家中的自己 */
    isSelfPlayer:boolean;
    /**执棋颜色 */
    chessType:GameChessType;
}