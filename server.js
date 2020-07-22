const { Product, User } = require('./models')

const express = require('express') // 引用express这个模块(npm install express --save)
//实例化express() 为 app
const app = express()

//SECRET 应该写在其他特殊文件里面 不在讨论范围内
const SECRET = "asdaudan13hudnu243"

const jwt = require('jsonwebtoken')
const { cpuUsage } = require('process')
const { compareSync } = require('bcrypt')

// 表示 允许express处理客户端提交过来的json数据
app.use(express.json())

// //引用mongoose模块 （npm i mongoose)
// const mongoose = require('mongoose')
// //使用mongoose来链接数据库
// mongoose.connect('mongodb://localhost:27017/express-test', { useNewUrlParser: true , useUnifiedTopology: true})
// //建立模型 定义Product产品表
// const Product = mongoose.model('Product', new mongoose.Schema({
//     title:String,
// }))

// //mogodb数据库插入数据  insertMany方法 表示插入多条
// // Product.insertMany([
// //     {title: '产品1'},
// //     {title: '产品2'},
// //     {title: '产品3'},
// //     ])

//引入cors包 并执行它，返回require的中间件，直接app.use使用它（解决跨域问题）(npm i cors)
app.use(require('cors')())
//定义public静态文件夹（express静态文件托管）
// app.use('/static', express.static('public'));
app.use('/', express.static('public'));

//定义路由，三个接口
// app.get('/', function(req, res){
//     res.send({ page: 'home' }) //服务端发送一个页面 home
// })
app.get('/about', function(req, res){
    res.send({ page: 'About Us' })
})
app.get('/products', async function(req, res){
    //返回一个数组的三个对象，调整为数据库查询 ，使用Product模型方法find()查询所有数据
    // res.send(await Product.find())
    //find方法 skip 和 limit 结合起来做分页
    // const data = await Product.find().skip(1).limit(2)
    //find 方法 where 加查询条件
    // const data = await Product.find().where({
    //     title: '产品2',
    // });
    //find 方法 sort 表示排序 键是字段，值：1（表示正序）或-1（表示倒序）
    const data = await Product.find().sort({ _id: -1 })
    res.send(data);
})
// 查询产品详情页接口  get 获取数据
app.get('/products/:id', async function(req, res){
    // req 是客户端请求过来的数据，：是代表所有，id 是保存的客户端的请求的内容，params是请求的数据
    // res 是向客户端返回的数据 async 和 await 是异步，如果加到函数，则为异步函数
    const data = await Product.findById(req.params.id)
    res.send(data)
})

// REST Client  vscode 插件扩展， 专门用于在vscode 代码方式 发送各种类型http请求 类似用浏览器 axios库请求接口 

//产品新增 接口  post 提交数据，允许大数据量，更安全
app.post('/products', async function(req, res){
    // req.body 表示客户端用post提交过来的数据，获取客户端通过post到路由提交过来的数据 
    const data = req.body
    // 把数据存入mongodb 使用 create()方法 data 数据放进去
    const product = await Product.create(data)
    // 将这条数据 返回客户端
    res.send(product)
})

// 类似查看详情页的
//产品修改 接口   put 表示覆盖，patch 表示部分修改 
// 步骤：查数据 --> 赋值数据 --> 从客户端获取的修改数据 直接 改数据 --> 返回数据
app.put('/products/:id', async (req, res) => {
    // 查数据是需要异步
    const product = await Product.findById(req.params.id)
    // 赋值不需要异步，所以不加
    product.title = req.body.title
    // 保存也需要异步 加await
    await product.save()
    // 返回也不需要异步也不加
    res.send(product)
});

//删除数据 delete请求方法 删除某一个产品 也需要动态id
// 步骤 跟修改很多相似的
app.delete('/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id)
    // 执行删除这个产品 remove() 是异步操作
    await product.remove()
    // 由于删除了再返回这个数据没有意义。一般会返回一个状态 一个对象
    res.send({
        success: true
    }) 	
});

//注册接口
app.post('/api/register', async(req, res) => {
    // console.log(req.body)
    const user = await User.create({
        // 安全起见，防止和数据库的字段不符合 就再重新赋值一下
        username: req.body.username,
        password: req.body.password,
    })
    res.send(user)
})

//登录接口 登录分两步，第一步先看用户存不存在，第二步密码对不对
app.post('/api/login', async(req, res) => {
    // console.log(req.body)
    const user = await User.findOne({

        username: req.body.username
    })
    // 判断用户不存在直接返回err
    if(!user){
        // 一定要是return 来做中断条件
        // res.status 状态是多少，422 表示客户端提交数据有问题 .send 增加个发送 告诉客户端是什么
        return res.status(422).send({
            message:"用户名不存在！"
        })
    }
    //用户存在
    // require bcrypt 包 使用散列的 compareSync()比较方法 同步方法 两个参数 第一个是明文，第二个是密文 从数据库里取出来的密码 
    // 比较完毕后返回个true false值
    const isPasswordValid = require('bcrypt').compareSync(
        req.body.password, 
        user.password
        )
    //进入判断
    if(!isPasswordValid){
        return res.status(422).send({
            message:'密码无效！'
        })
    }
    //生成token  npm i jsonwebtoken
    // 不用cookie 它有状态的 现在用接口就用jwt 无状态
    // const jwt = require('jsonwebtoken')
    //只传ID 不要传密码 jwt sign()方法 签名 用什么数据去签名 第一个参数 数据是什么对应的用户只需要id就可以了 第二个参数 SECRET （表示 一个密钥 对其他人不可知，写入一个环境变量，不出现在git仓库里，本地存在的隐私数据，全局保持唯一，校验的时候需要用到这个）
    const token = jwt.sign({
        id: String(user._id),
    }, SECRET)
    // 最后 res.send 返回 一个对象，两个值 一个是user 和 token 
    res.send({
        user,
        token: token
    })
})


//express中间键  可复用 就是一个函数 async的 函数 ，next表示下一步
const auth = async(req, res, next) => {
    // 对请求头 数据 进行分割 再弹出 ，去除 Bearer 后面的加密后的token
    const raw = String(req.headers.authorization).split(' ').pop()
    // 解密 对token  verify()方法 验证 会返回一个结果object 或者string  第一个参数raw，第二个是SECRET 使用解构的方式 找到id -->  {id}
    const {id} = jwt.verify(raw, SECRET)
    // 用异步的方式在数据库找到这个id
    req.user = await User.findById(id)
    // 加判断，如果没有用户就不要执行next()
    // 传递给下一步
    next()
}

//个人信息
app.get('/api/profile', auth, async(req, res) => {
    // console.log(String(req.headers.authorization).split(' ').pop())
    // const raw = String(req.headers.authorization).split(' ').pop()
    // const {id} = jwt.verify(raw, SECRET)
    // // const tokenData = jwt.verify(raw, SECRET)
    // // console.log(tokenData)
    // // return res.send("ok")
    // const user = await User.findById(id)
    // res.send 返回这个用户给客户端
    res.send(req.user)
});

app.get('/api/users', async(req, res) => {
    const users = await User.find()
    res.send(users)
});

//app.listen去启动这个服务器 
app.listen(4000, () => {
    console.log('app listening on port 4000!','http://localhost:4000')
});