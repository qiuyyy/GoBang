/**
*@author  Qiu
*@description 消息体定义
*/
export default class GameMessageBase {
    type: GameMessageType;
}

/**客户端发往服务端数据定义 */
export class GameMessageC2S extends GameMessageBase {

}

/**服务端发往客户端数据定义 */
export class GameMessageS2C extends GameMessageBase {
    /**是否执行成功 0--成功 其他数--报错 */
    code: number;
}

export enum GameMessageType {
    /**客户端向服务端发起注册 */
    C2S_Register,
    /**客户端向服务端发起登录 */
    C2S_Login,
    /**打招呼 */
    Hello,
    /**下棋子 */
    C2S_Put,
    /**客户端向服务端请求匹配 */
    C2S_Match,
    /**服务端向客户端发送消息--配对成功 */
    S2C_MatchOver,
    /**注册返回 */
    S2C_Register,
    /**登录返回 */
    S2C_Login
}

/**匹配请求消息 */
export class GameMessageC2S_Match extends GameMessageBase {
    type: GameMessageType = GameMessageType.C2S_Match;
}

/**下棋子消息 */
export class GameMessagePut extends GameMessageBase {
    type: GameMessageType = GameMessageType.C2S_Put;
    uid: string;
    i: number;
    j: number;

    constructor(uid: string,i: number,j:number) {
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
    myUid: string; //自己的uid
    otherUid: string; //对手的uid
    myChessType: number; //自己的棋子颜色
}

/**注册请求 */
export class GameMessageC2S_Register extends GameMessageC2S {
    type: GameMessageType = GameMessageType.C2S_Register;

    //注意要将作用域写出来,这样才算定义
    constructor(public username: string, public password: string) {
        super();

        //写了public就相当于加上了如下代码
        // this.username = username;
        // this.password = password;
    }
}

/**注册回执 */
export class GameMessageS2C_Register extends GameMessageS2C {
    type:GameMessageType = GameMessageType.S2C_Register;
    //只需告诉客户端成功没有,已经在父类定义了code
}

/**登录请求 */
export class GameMessageC2S_Login extends GameMessageC2S {
    type: GameMessageType = GameMessageType.C2S_Login;

    //注意要将作用域写出来,这样才算定义
    constructor(public username: string, public password: string) {
        super();

        //写了public就相当于加上了如下代码
        // this.username = username;
        // this.password = password;
    }
}

/**登录回执 */
export class GameMessageS2C_Login extends GameMessageS2C {
    type:GameMessageType = GameMessageType.S2C_Login;
    uid: string;
}