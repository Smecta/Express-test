## express-test
### nodejs-express-jwt-mongodb

基于全栈之巅视频笔记

git 更新
``` powershell
git add .
git commit -am "更新说明"
git push -u express-test master

删除方法
git rm -r --cached target              # 删除target文件夹
git commit -m '删除了target'        # 提交,添加操作说明
再push
```

运行命令
``` js
npm i 
nodemon server.js  

```

mongodb mongoose

连接mongodb 

建立模型
mongoose.model() 定义一个模型
第一个参数  模型模型名称 
第二个参数  模型的结构
new mongoose.Schema() 表的结构
    模型字段 

模型查询
一般都是用await 语法 等待 而不是回调函数
使用.insertMany() 方法 添加数据

使用.find() 方法 查数据

数据关联方法

再建立一个模型 
    定义字段
    例子  人 身份证  车 行驶证  那么不可能在这个人底下加这个车，而是 这个车的行驶证有这个人的信息 
    按照属于的关系建立模型 
    那么在行驶证的上面 存入这个模型的 唯一值 就是身份证id
    使用的类型就不是String而是type:mongoose.SchemaTypes.ObjectId, ref:'关联的这个模型名' ref 外键

    如果是多个则外层套一个数组
    [(type:mongoose.SchemaTypes.ObjectId, ref:'关联的这个模型名')]

查数据，改数据
.populate() 查询关联信息 传递相关联字段名称 由id变成关联对象

反向查询

``` js

const CategorySchema = new mongoose.Schma({
    name:{type:String}
},{
    // 增加 虚拟字段 默认是不添加 
    toJSON: {virtuals: true}
})
// 定义虚拟字段posts
CategorySchema.virtual('posts',{
    // 本地键为分类_id
    localField:'_id',
    // 外部是Post模型
    ref:'Post',
    // 外键是Post模型categories
    foreignField:'categories',
    // 表示数据是单条还是数组 false 表示数组
    justOne:false,
})
const Category = mongoose.model('Category',CategorySchema)

// 如果express 使用 加入JSON.stringify() 方法查看
// 也可以使用.lean()表示输出纯粹的json数据

```
 
