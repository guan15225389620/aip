var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var path = require("path");
var formidable = require("formidable");
var image = require("imageinfo");

var models = require('./library/models/index');
var app = express();
var tagModel = require('./library/db/tag.js');
var loginModel = require('./library/db/login.js');
var chatModel = require('./library/db/chat.js');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({extended: true}));
var AipOcr = require('./src/index').ocr;
var fs = require('fs');
var http = require('http');
app.use(express.static('upload'))

var APP_ID = "16705811";
var API_KEY = "hCPrFHK1Wjz39PoXgxdvlOs1";
var SECRET_KEY = "VMejCjXNP3qbioZ8OrBwvqpz9cKWiv5a";
const appid = 'wx1cb6c6220c4d9926';
const secret = 'fe31ac5dd73208e7e80a98bf026300ba';
var client = new AipOcr(APP_ID, API_KEY, SECRET_KEY);

var image = fs.readFileSync(__dirname + '/51566358844_.pic_hd.jpg');

// tagModel.
var product = new RegExp('产品名称', 'g');
var burden = new RegExp('配料', 'g');
var code = new RegExp('产品标准', 'g');
var sc = new RegExp('生产许可证', 'g');
var pd_date = new RegExp('生产日期', 'g');
var EXP = new RegExp('保质期', 'g');
var place = new RegExp('产地', 'g');
var address = new RegExp('地址', 'g');
var tel = new RegExp('电话', 'g');
var wt_net = new RegExp('净含量', 'g');
var energy = new RegExp('能量', 'g');
var protein = new RegExp('蛋白质', 'g');
var fat = new RegExp('脂肪', 'g');
var na = new RegExp('钠', 'g');
var cbd = new RegExp('碳水化合物', 'g');


// var app = http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
//     var base64Img = new Buffer(image).toString('base64');
//     client.generalBasic(base64Img).then(function (result) {
//         res.end(JSON.stringify(result));
//     });
// });
app.get('/healthz', function (req, res) {
    res.send('OK')
})

app.post("/upload", (req, res) => {
    var form = new formidable.IncomingForm();//既处理表单，又处理文件上传
    let uploadDir = path.join(__dirname, "library/upload/");
    form.uploadDir = uploadDir;//本地文件夹目录路径

    form.parse(req, (err, fields, files) => {
        let oldPath = files.cover.path;//图片的本地路径
        console.log(files.cover.name)//图片传过来的名字
        let newPath = path.join(path.dirname(oldPath), files.cover.name);
        var downUrl = "http://localhost:" + listenNumber + "/upload/" + files.cover.name;//这里是想传回图片的链接
        fs.rename(oldPath, newPath, () => {
            res.json({downUrl: downUrl})
        })
    })
})
app.post("/login", (req, res) => {
    var code = req.body.code;
    // var code = 'oEFuB4vx3jZioXLU20lUYc2cRmL8'
    var opt = {
        method: 'GET',
        url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code'
    };
    request(opt, function (err, result, body) {
        if (!err) {
            var openid = JSON.parse(body).openid
            if (typeof (openid) === "undefined") {
                res.json({returnid: -1})
            } else {
                var model = {
                    openid: openid
                }
                models.sequelize_db.query("SELECT id FROM login WHERE openid = ?", {replacements: [openid]}).spread(function (tasks) {
                    if (tasks.length > 0) {
                        console.log(tasks, 'tasks')
                        res.json({returnid: tasks[0].id})
                    } else {
                        loginModel.insert(model, function (err, ret) {
                            if (err) {
                                console.error('>> loginModel err : ', model.openid)
                                res.json({returnid: -1})
                            } else {
                                res.json({returnid: ret.id})
                            }
                        })
                    }
                })
            }


        } else {
            res.json({err_code: err})
        }
    })

})

app.post("/getChatId", (req, res) => {
    var loginid = req.body.code;
    var chatid = GenNonDuplicateID(2);

    var model = {
        chatid: chatid,
        loginid: loginid
    }
    chatModel.insert(model, function (err, ret) {
        if (err) {
            console.error('>> getChatId err : ', model ,err )
            res.json({chatid: -1})
        } else {
            res.json({chatid: model.chatid})
        }
    })

})

app.get('/get_date', function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    var base64Img = new Buffer(image).toString('base64');
    client.generalBasic(base64Img).then(function (result) {
        var model = {}
        var rt = result.words_result
        rt.forEach(function (e, i) {
            if (product.test(e.words)) {
                model.product = e
            } else if (burden.test(e.words)) {
                model.burden = e
            } else if (code.test(e.words)) {
                model.code = e
            } else if (sc.test(e.words)) {
                model.badwordreg = e
            } else if (pd_date.test(e.words)) {
                model.pd_date = e
            } else if (EXP.test(e.words)) {
                model.EXP = e
            } else if (place.test(e.words)) {
                model.place = e
            } else if (tel.test(e.words)) {
                model.tel = e
            } else if (wt_net.test(e.words)) {
                model.wt_net = e
            } else if (address.test(e.words)) {
                model.address = e
            } else if (energy.test(e.words) || protein.test(e.words) || fat.test(e.words) || na.test(e.words) || cbd.test(e.words)) {

                console.log(e, i)
                console.log(rt[i + 1], i)
                // model.nutrition = e
            }
        })
        console.log(model)
        tagModel.insert(model, function (err) {
            if (err) {
                console.error('>> tagModel err : ', err)
            }
        })

    }).catch(function (err) {
        // 如果发生网络错误
        console.log(err, 'timeout');
    });

})


// 生成不重复的ID
function GenNonDuplicateID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
}

// test()


function test() {
    var base64Img = new Buffer(image).toString('base64');
    client.generalBasic(base64Img).then(function (result) {
        var model = {}
        var rt = result.words_result
        rt.forEach(function (e, i) {
            if (product.test(e.words)) {
                model.product = e
            } else if (burden.test(e.words)) {
                model.burden = e
            } else if (code.test(e.words)) {
                model.code = e
            } else if (sc.test(e.words)) {
                model.badwordreg = e
            } else if (pd_date.test(e.words)) {
                model.pd_date = e
            } else if (EXP.test(e.words)) {
                model.EXP = e
            } else if (place.test(e.words)) {
                model.place = e
            } else if (tel.test(e.words)) {
                model.tel = e
            } else if (wt_net.test(e.words)) {
                model.wt_net = e
            } else if (address.test(e.words)) {
                model.address = e
            } else if (energy.test(e.words) || protein.test(e.words) || fat.test(e.words) || na.test(e.words) || cbd.test(e.words)) {

                console.log(e, i)
                console.log(rt[i + 1], i)
                // model.nutrition = e
            }
        })
        console.log(model)
        tagModel.insert(model, function (err) {
            if (err) {
                console.error('>> url err : ', model.url)
            }
            callback();
        })

    }).catch(function (err) {
        // 如果发生网络错误
        console.log(err, 'timeout');
    });
}

models.sequelize_db.sync().then(function () {
});
var server = app.listen(3003, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running at http://%s:%s", host, port)
});