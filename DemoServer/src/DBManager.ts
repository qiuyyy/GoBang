import { Collection, Db } from "mongodb";
import { MongoClient , MongoError } from "mongodb";
import Singleton from "./Singleton";

/**
*@author  Qiu
*@description 数据库 单例
*/
export default class DBManager extends Singleton<DBManager>{

    db: Db; //存储数据库连接

    userCollection: Collection; //user集合

    /**建立与数据库连接 */
    connectDB() {
        //相对于MongoDB,服务器就是客户端了
        let dburl = "mongodb://localhost:27017";
        MongoClient.connect(dburl,(error: MongoError, db: MongoClient)=>{
            if (error) {
                console.log("Error!",error);
                return;
            } 
            console.log("连接数据库成功!")

            this.db = db.db("GoBang");
            this.userCollection = this.db.collection("user");
    
            // /**进行查询 */
            // let goBangDB = db.db("GoBang");
            // //查询user集合里的所有文档
            // goBangDB.collection("user").find({}).toArray((error: MongoError, result) => {
            //     if (error) {
            //         console.log("Error!",error);
            //         return;
            //     }
            //     console.log("查询结果:",result);
                
            //     //用完数据库后记得关掉连接
            //     db.close();
            // }); 
        });
    }

    /**获取数据库 */
    static getDb(): Db {
        return DBManager.getInstance(DBManager).db;
    }

    /**获取用户集合 */
    static getUserCollection(): Collection {
        return DBManager.getInstance(DBManager).userCollection;
    }
    
}