/**
*@author  Qiu
*@description 单例基类
*/
export default class Singleton<T> {
    private static _instance = null;

    //c: {new(): T} 代表传进来的参数c有构造函数
    public static getInstance<T>(c: {new(): T}): T {
        //可以用this是因为该方法也是static
        //而且最好使用this,如果用Singleton那所有的单例类都会是同一个_instance
        if (this._instance == null) {
           this._instance = new c(); 
        } 
        return this._instance;
    }
}