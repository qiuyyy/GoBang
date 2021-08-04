/**
*@author  Qiu
*@description 游戏数据 数据层
*/
export default class GameData {
    /**棋盘数据 存放棋子信息数据 */
    tableData: GameChess[][];

    constructor() {
        //初始化
        this.tableData = [];
        for (let i = 0;i <= 14;i ++) {
            this.tableData[i] = [];
            for (let j = 0;j <= 14;j ++) {
                let chessData = new GameChess();
                this.tableData[i][j] = chessData;
            }
        }
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