var path = require('path');
// 引入操作数据库的模块
var Sequelize = exports.Sequelize = require('sequelize');

// 数据库配置
sequelize = exports.sequelize_db   = new Sequelize('tz', 'admin', '123456',  {
    host: 'localhost',    //数据库地址,默认本机
    port:'5432',
    dialect: 'postgres',
    pool: {   //连接池设置
        max: 5, //最大连接数
        min: 0, //最小连接数
        idle: 10000
    },
});
console.log('init postgres done');
exports.tags = sequelize.import(path.join(__dirname, 'tag.js'));
