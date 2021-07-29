import Config from "./Config";
import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";
import GameChessUI from "./GameChessUI";
import GameData, { GameChess, GameChessType } from "./GameData";
import { GameMessageMatchOver, GameMessagePut, GameMessageType } from "./GameMessageBase";
import GamePlayer from "./GamePlayer";
import WSClient from "./WSClient";

/**
*@author  Qiu
*@description 游戏主控 逻辑层
** 红点代表刚刚对方落子的位置
** 棋盘坐标以中心点为原点 15x15棋盘
** 初始整个棋盘都摆满了棋子，只是隐藏了，下了哪个显示哪个
*/
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {
    /**棋盘中心点 */
    @property(cc.Node)
    tableCenter: cc.Node = null;

    /**棋子 */
    @property(cc.Prefab)
    prefabChess:cc.Prefab = null;

    /**用来显示是谁的回合 */
    @property(cc.Label)
    lbRound: cc.Label = null

    /**游戏数据 */
    gameData: GameData;

    /**棋子节点数组 */
    allChess: GameChessUI[][];

    /**玩家自己 */
    selfPlayer: GamePlayer;
    /**对手玩家 */
    otherPlayer: GamePlayer;
    /**当前执棋玩家 */
    currentPlayer: GamePlayer;
    /**上一次放置的棋子 用来消掉上次棋子的红点*/
    lastPutChess: GameChessUI = null;

    onLoad() {
        this.gameData = new GameData();
        this.allChess = [];
        //放置所有棋子
        // for (let i = -7;i <= 7;i ++) {
        //     this.allChess[i] = [];
        //     for (let j = -7;j <= 7;j ++) {
        //         let chess = cc.instantiate(this.prefabChess);
        //         chess.x = i * Config.ChessSpaceWidth;
        //         chess.y = j * Config.ChessSpaceHeight;
        //         chess.parent = this.node;

        //         this.allChess[i][j] = chess.getComponent("GameChessUI");
        //     }
        // }
        //数组不能越界,索引不能是负数
        //那不如直接以左下角为原点?
        for (let i = 0;i <= 14;i ++) {
            this.allChess[i] = [];
            for (let j = 0;j <= 14;j ++) {
                let chess = cc.instantiate(this.prefabChess).getComponent("GameChessUI");
                chess.node.x = (i - 7) * Config.ChessSpaceWidth;
                chess.node.y = (j - 7) * Config.ChessSpaceHeight;
                chess.node.parent = this.node;
                chess.i = i;
                chess.j = j;
                chess.gameMain = this;

                this.allChess[i][j] = chess.getComponent("GameChessUI");
            }
        }


        this.refreshTable();

        //玩家最好不要客户端来创建,而是服务端来下发
        // this.createPlayer();

        EventCenter.registEvent(EventDefine.EVENT_MATCH_OVER,this.onMessageMatchOver,this);
        EventCenter.registEvent(EventDefine.EVENT_PUT,this.onMessagePut,this);
    }

    /**刷新棋盘 根据数据刷新界面 */
    refreshTable() {
        for (let i = 0;i <= 14;i ++) {
            for (let j = 0;j <= 14;j ++) {
                let chess = this.allChess[i][j]; //UI
                let data = this.gameData.tableData[i][j]; //数据
                chess.refreshWith(data);
            }
        }
    }

    /**创建玩家 */
    // createPlayer() {
    /**匹配成功后,根据后端信息创建玩家 */
    onMessageMatchOver(msg: GameMessageMatchOver) {
        //创建玩家自己
        let playerSelf = new GamePlayer();
        playerSelf.uid = msg.myUid;
        playerSelf.chessType = msg.myChessType;
        playerSelf.isSelfPlayer = true;
        playerSelf.username = "我";
        this.selfPlayer = playerSelf;

        //对手玩家
        let playerOther = new GamePlayer();
        playerOther.uid = msg.otherUid;
        playerOther.chessType = msg.myChessType == GameChessType.White?GameChessType.Black:GameChessType.White;
        playerOther.isSelfPlayer = false;
        playerOther.username = "敌方";
        this.otherPlayer = playerOther;

        //白棋先下
        if (this.selfPlayer.chessType == GameChessType.White) {
            this.currentPlayer = playerSelf;
        } else {
            this.currentPlayer = this.otherPlayer;
        }
        this.updateRound();
    }

    //轮换下棋
    changePlayer(curPlayerUid: string) {
        if (this.selfPlayer.uid == curPlayerUid) {
            this.currentPlayer = this.otherPlayer;
        }else {
            this.currentPlayer = this.selfPlayer;
        }


        //为防止连点,在下完棋子后会将this.currentPlayer置为null,所以就不能用这种方法换轮换玩家了
        // if (this.currentPlayer == this.selfPlayer) {
        //     this.currentPlayer = this.otherPlayer;
        // } else {
        //     this.currentPlayer = this.selfPlayer;
        // }

        this.updateRound();
    }

    //刷新回合label
    updateRound() {
        this.lbRound.getComponent(cc.Label).string = this.currentPlayer.username + "的回合"; 
    }

    //点击棋子事件
    onClickChess(i: number,j: number) {
        // console.log("====on click chess",i,j);

        if (!this.currentPlayer) return;

        //如果是当前用户下的棋子,就向服务端发送消息
        if (this.currentPlayer.isSelfPlayer) {
            let ws =  WSClient.getInstance();
            ws.sendMessage(new GameMessagePut(this.selfPlayer.uid,i,j));
        }

        this.currentPlayer = null; //防止连点
    }
    
    /**收到下棋子消息 */
    onMessagePut(msg: GameMessagePut) {
        //放棋子
        this.putChess(this.getPlayerByUid(msg.uid).chessType,msg.i,msg.j);
        //交换玩家
        this.changePlayer(msg.uid);

    }

    /**根据Uid获取玩家 */
    getPlayerByUid(uid: string): GamePlayer {
        if (this.selfPlayer.uid == uid) {
            return this.selfPlayer;
        } else if (uid == this.otherPlayer.uid) {
            return this.otherPlayer;
        }
    }

    /**放棋子 
     * @param chess 被放的棋子
    */
    putChess(chessType: GameChessType,i: number,j: number) {
        let chess = this.getChess(i,j);
        let chessData = this.getChessData(i,j);
        chessData.chessType = chessType;
        chessData.isLastPutChess = true;
        chess.refreshWith(chessData);
        
        //消掉之前棋子的红点
        if (this.lastPutChess) {
            let data = this.getChessData(this.lastPutChess.i,this.lastPutChess.j);
            data.isLastPutChess = false;
            this.lastPutChess.refreshWith(data);
        }

        //将刚下的棋子设为上次棋子
        this.lastPutChess = chess;

        this.checkWin(i,j);
    }

    getChessData(i: number,j: number): GameChess {
        return this.gameData.tableData[i][j];
    }

    /**根据坐标获取棋子节点 */
    getChess(i: number,j: number): GameChessUI {
        return this.allChess[i][j];
    }

    /**检查游戏是否结束
     * i,j 新下的棋子的坐标
     */
    checkWin(i: number,j: number) {
        let chessType: GameChessType = this.getChessData(i,j).chessType;
        //四个方向判断
        if (this.checkHorizontral(i,j,chessType)
            || this.checkVertical(i,j,chessType)
            || this.checkObliqueUp(i,j,chessType)
            || this.checkObliqueDown(i,j,chessType)) {
                console.log("win!",this.currentPlayer);
            }
    }

    /**横向判断有没有连城五子 */
    checkHorizontral(posi: number,posj: number,chessType: GameChessType): boolean {
        let total:number = 1; //记录检查到连上了多少个棋子了
        let leftLimitPos = Math.max(posi - 4,0); //能连成五子的左边边界
        let rightLimitPos = Math.min(posi + 4,Config.gridHorizontalCount - 1); //能连成五子的右边边界
        //都从中间开始找起
        for (let i = posi - 1;i >= leftLimitPos;i --) {
            if (this.getChessData(i,posj).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        for (let i = posi + 1;i <= rightLimitPos;i ++) {
            if (this.getChessData(i,posj).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }

        return total >= Config.winChessLineCount;
    }

    /**纵向判断有没有连城五子 */
    checkVertical(posi: number,posj: number,chessType: GameChessType): boolean {
        let total: number = 1; //记录检查到连上了多少个棋子了
        let bottomLimitPos = Math.max(posj - 4,0); //能连成五子的上边边界
        let topLimitPos = Math.min(posj + 4,Config.gridVerticalCount - 1); //能连成五子的下边边界
        //都从中间开始找起
        for (let j = posj - 1;j >= bottomLimitPos;j --) {
            if (this.getChessData(posi,j).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        for (let j = posj + 1;j <= topLimitPos;j ++) {
            if (this.getChessData(posi,j).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        return total >= Config.winChessLineCount;
    }

    /**斜向上判断有没有连城五子 */
    checkObliqueUp(posi: number,posj: number,chessType: GameChessType): boolean {
        let total: number = 1;
        //四边界限
        let leftLimitPos = Math.max(posi - 4,0); //能连成五子的左边边界
        let rightLimitPos = Math.min(posi + 4,Config.gridHorizontalCount - 1); //能连成五子的右边边界
        let bottomLimitPos = Math.max(posj - 4,0); //能连成五子的上边边界
        let topLimitPos = Math.min(posj + 4,Config.gridVerticalCount - 1); //能连成五子的下边边界
        //右上角方向
        for (let i = posi + 1,j = posj + 1;i <= rightLimitPos && j < topLimitPos; i ++,j ++) {
            if (this.getChessData(i,j).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        //左下角方向
        for (let i = posi - 1,j = posj - 1;i >= leftLimitPos && j >= bottomLimitPos; i --,j --) {
            if (this.getChessData(i,j).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        return total >= Config.winChessLineCount;
    }
    
    /**斜向下判断有没有连城五子 */
    checkObliqueDown(posi: number,posj: number,chessType: GameChessType): boolean {
        let total: number = 1;
        //四边界限
        let leftLimitPos = Math.max(posi - 4,0); //能连成五子的左边边界
        let rightLimitPos = Math.min(posi + 4,Config.gridHorizontalCount - 1); //能连成五子的右边边界
        let bottomLimitPos = Math.max(posj - 4,0); //能连成五子的上边边界
        let topLimitPos = Math.min(posj + 4,Config.gridVerticalCount - 1); //能连成五子的下边边界
        //右下角方向
        for (let i = posi + 1,j = posj - 1;i <= rightLimitPos && j >= bottomLimitPos;i ++,j --) {
            if (this.getChessData(i,j).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        //左上角方向
        for (let i = posi - 1,j = posj + 1;i >= leftLimitPos && j <= topLimitPos;i --,j ++ ) {
            if (this.getChessData(i,j).chessType == chessType) {
                total ++;
            }else {
                break;
            }
        }
        return total >= Config.winChessLineCount;
    }
}