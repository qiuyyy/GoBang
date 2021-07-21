import { GameChess, GameChessType } from "./GameData";
import GameMain from "./GameMain";

/**
*@author  Qiu
*@description 棋子
*/
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameChessUI extends cc.Component {
    @property(cc.Node)
    chessWhite: cc.Node = null;

    @property(cc.Node)
    chessBlack: cc.Node = null;

    @property(cc.Node)
    pointRed: cc.Node = null;

    /**主控 */
    gameMain: GameMain = null;

    /**被点击棋子坐标 */
    i: number = 0;
    j: number = 0;

    onLoad() {
        
    }

    /**根据数据刷新自己 */
    refreshWith(chess: GameChess) {
        this.chessWhite.active = chess.chessType == GameChessType.White;
        this.chessBlack.active = chess.chessType == GameChessType.Black;
        this.pointRed.active = chess.isLastPutChess;
    }

    /**棋子被点击时 
     * 告诉主控哪个棋子被点击了 告诉坐标
     * 让主控去控制逻辑
     * */
    onClick() {
        this.gameMain.onClickChess(this.i,this.j);
    }
}