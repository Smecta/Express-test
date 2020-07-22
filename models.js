//引用mongoose模块 （npm i mongoose)
const mongoose = require('mongoose')
//使用mongoose来链接数据库
mongoose.connect('mongodb://localhost:27017/express-test', { 
    useNewUrlParser: true , 
    useUnifiedTopology: true, 
    useCreateIndex: true,//限制创造用户ID唯一性
})
//建立模型 定义Product产品表
// const Product = mongoose.model('Product', new mongoose.Schema({
//     title:String,
// }))

const ProductSchema = new mongoose.Schema({
    title:String,
})
const Product = mongoose.model('Product', ProductSchema)



const UserSchema = new mongoose.Schema({
    // unique 表示字段是唯一的，加唯一键的索引
    username: {type: String, unique: true},
    password: {
        // npm i bcrypt 用户注册需要将密码散列加密 同步方法 hashSync方法传入两个值，一个是返回值，一个是加密强度
        type: String, 
        set(val){ //set是个function 接收一个val也就是原来的明文密码
            // 请求bcrypt 散列包，用散列的方法 hashSync 传递两个参数 第一个是值散列，第二个是散列的强度
            return require('bcrypt').hashSync(val, 10)
        }
    },
}) 
const User = mongoose.model('User', UserSchema)

// User.db.dropCollection('users') // 删除 users集合 
// 这里users 是mongodb 默认创建的集合名字
module.exports = { Product,User }

//数据库插入数据insertMany 表示插入多条
// Product.insertMany([
//     {title: '产品1'},
//     {title: '产品2'},
//     {title: '产品3'},
//     ])