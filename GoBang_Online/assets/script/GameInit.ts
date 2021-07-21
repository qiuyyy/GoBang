/**
*@author  Qiu
*@description 游戏初始化 创建棋盘
*/
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameInit extends cc.Component {
    @property(cc.Prefab)
    prefabGameMain: cc.Prefab = null;

    onLoad() {
        let gameMain = cc.instantiate(this.prefabGameMain);
        gameMain.parent = this.node;
    }
}