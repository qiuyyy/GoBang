/**
*@author  Qiu
*@description 消息体定义
*/
export default class GameMessageBase {
    type: GameMessageType;
}

export enum GameMessageType {
    /**打招呼 */
    Hello,
    /**匹配 */
    Match,
    /**下棋子 */
    C2S_Put,
    /**服务端向客户端发送消息--配对成功 */
    S2C_MatchOver,
    /** */
}

/**下棋子消息 */
export class GameMessagePut extends GameMessageBase {
    type: number;
    uid: number;
    i: number;
    j: number;

    constructor(uid: number,i: number,j:number) {
        super();
        this.uid = uid;
        this.i = i;
        this.j = j;
    }
}

/**配对成功消息 */
export class GameMessageMatchOver extends GameMessageBase {
    type: GameMessageType = GameMessageType.S2C_MatchOver;
    //uid最好是服务器来下发的
    myUid: number; //自己的uid
    otherUid: number; //对手的uid
    myChessType: number; //自己的棋子颜色
}