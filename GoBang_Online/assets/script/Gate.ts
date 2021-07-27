import EventCenter from "./EventCenter";
import EventDefine from "./EventDefine";
import GameMessageBase, { GameMessageC2S_Register, GameMessageS2C_Register, GameMessageType } from "./GameMessageBase";
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

    onLoad() {
        this.lbCallBack.getComponent(cc.Label).string = "请输入账号密码";
        
        EventCenter.registEvent(EventDefine.EVENT_NETWORK_CONNECT,this.onConnectServer,this);
        EventCenter.registEvent(GameMessageType.S2C_Register.toString(),this.onRegistCallback,this);

    }
    
    onDestroy() {
        //注销事件
        EventCenter.removeEvent(EventDefine.EVENT_NETWORK_CONNECT,this.onConnectServer,this);
    }

    /**点击注册 */
    onClickRegist() {
        //先和服务端建立连接,在发送用户名和密码
        WSClient.getInstance().connect();
    }

    /**点击登陆 */
    onClickLogin() {

    }
    
    /**连接服务器成功注册事件 */
    onConnectServer() {
        this.register();
    }
    
    /**注册 */
    register() {
        
        //将用户名和密码告诉服务端
        let username = this.ebUserName.string;
        let password = this.ebPassWord.string;

        let msg = new GameMessageC2S_Register(username,password);
        WSClient.getInstance().sendMessage(msg);
    }

    //注册返回事假
    onRegistCallback(msg: GameMessageS2C_Register) {
        if (msg.code == 0) { //注册成功了
            this.lbCallBack.getComponent(cc.Label).string = "注册成功";
        } else {
            this.lbCallBack.getComponent(cc.Label).string = "用户名重复了"; //目前只有这一个失败原因
        }
    }

}