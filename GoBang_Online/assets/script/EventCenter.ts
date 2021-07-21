/**观察者模式*/
export default class EventCenter {
    private static events: Map<string,Array<EventHandler>> = new Map<string,Array<EventHandler>>();

    /**注册事件
     * eventName 事件名
     * callBack 事件回调
     * target 注册者
     */
    static registEvent(eventName: string,callBack: Function,target:object): void{
        if (eventName == undefined || callBack == undefined || target == undefined){
            throw Error("regist event error");
        }
        if (EventCenter.events[eventName] == undefined){
            EventCenter.events[eventName] = new Array<EventHandler>();
        }

        let handler = new EventHandler(target, callBack);

        EventCenter.events[eventName].push(handler);
    }

    /**触发事件
     * eventName 事件名
     * param 参数
     */
    static postEvent(eventName: string,param?: any): void{
        let handlers = EventCenter.events[eventName];
        if (handlers == undefined){ //没有人注册该事件
            return;
        }
        console.log("post Event:",eventName,param);

        //遍历所有注册的该事件
        for (let i = 0;i < handlers.lenght;i ++){
            let handler = handlers[i];
            if (handler){
                try {
                    handler.function.call(handler.target,param);
                }catch(e){ //注册的事件有错的话catch
                    console.log(e.message);
                    console.log(e.stack.toString());
                }
            }
        }
    }

}

/**记录事件和*/
class EventHandler {
    target: object;
    function: Function;
    constructor(target: object,func: Function){
        this.target = target;
        this.function = func;
    }
}
