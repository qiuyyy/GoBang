import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";
import GameMessageBase, { GameMessageC2S_Login, GameMessageC2S_Register, GameMessageS2C_Login, GameMessageS2C_Register, GameMessageType } from "./GameMessageBase";
import WSClient from "./WSClient";

/**
*@author  Qiu
*@description 登陆注册面板
*/
const {ccclass, property} = cc._decorator;

@ccclass
export default class Gate extends cc.Component {
    /**返回的提示信息 */
    @property(cc.Label)
    lbCallBack: cc.Label = null;

    /**用户名输入框 */
    @property(cc.EditBox)
    ebUserName: cc.EditBox = null;

    /**密码输入框 */
    @property(cc.EditBox)
    ebPassWord: cc.EditBox = null;

    status: number = 0; //记录当前操作 0--登录 1--注册

    onLoad() {
        this.lbCallBack.getComponent(cc.Label).string = "请输入账号密码";
        
        EventCenter.registEvent(EventDefine.EVENT_NETWORK_CONNECT,this.onConnectServer,this);
        EventCenter.registEvent(GameMessageType.S2C_Register.toString(),this.onRegistCallback,this);
        EventCenter.registEvent(GameMessageType.S2C_Login.toString(),this.onLoginCallback,this);

    }
    
    onDestroy() {
        //注销事件
        EventCenter.removeEvent(EventDefine.EVENT_NETWORK_CONNECT,this.onConnectServer,this);
        EventCenter.removeEvent(GameMessageType.S2C_Register.toString(),this.onRegistCallback,this);
        EventCenter.removeEvent(GameMessageType.S2C_Login.toString(),this.onLoginCallback,this);
    }

    /**点击注册 */
    onClickRegist() {
        this.status = 1;
        //先和服务端建立连接,再发送用户名和密码
        WSClient.getInstance().connect();
    }

    /**点击登陆 */
    onClickLogin() {
        this.status = 0;
        //先和服务端建立连接,再发送用户名和密码
        WSClient.getInstance().connect();
    }
    
    /**连接服务器成功注册事件 */
    onConnectServer() {
        if (this.status == 1) {
            this.register();
        } else if (this.status == 0) {
            this.login();
        }
    }
    
    /**注册 */
    register() {
        //将用户名和密码告诉服务端
        let username = this.ebUserName.string;
        let password = this.ebPassWord.string;

        let msg = new GameMessageC2S_Register(username,password);
        WSClient.getInstance().sendMessage(msg);
    }

    /**注册返回事件 */
    onRegistCallback(msg: GameMessageS2C_Register) {
        if (msg.code == 0) { //注册成功了
            this.lbCallBack.getComponent(cc.Label).string = "注册成功";
        } else {
            this.lbCallBack.getComponent(cc.Label).string = "用户名重复了"; //目前只有这一个失败原因
        }
    }

    /**登录 */
    login() {
        //将用户名和密码告诉服务端
        let username = this.ebUserName.string;
        let password = this.ebPassWord.string;

        let msg = new GameMessageC2S_Login(username,password);
        WSClient.getInstance().sendMessage(msg);
    }

    /**登录返回事件 */
    onLoginCallback(msg: GameMessageS2C_Login) {
        if (msg.code == 0) { //登录成功
            this.lbCallBack.getComponent(cc.Label).string = "登录成功";
        } else {
            this.lbCallBack.getComponent(cc.Label).string = "用户名密码错误";
        }
    }
}