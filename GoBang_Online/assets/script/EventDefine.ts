/**
*@author  Qiu
*@description 事件定义类
*/
export default class EventDefine {
    /**匹配成功事件 */
    static EVENT_MATCH_OVER: string = "EVENT_MATCH_OVER";
    /**下棋子事件 */
    static EVENT_PUT: string  = "EVENT_PUT";
    /**连接服务器成功 */
    static EVENT_NETWORK_CONNECT: string = "EVENT_NETWORK_CONNECT";
    /**同步未完成棋局 */
    static EVENT_SYNC: string = "EVENT_SYNC";
}