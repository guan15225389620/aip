var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var path = require("path");
var image = require("imageinfo");
var formidable = require("formidable");
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

// var image = fs.readFileSync(__dirname + '/51566358844_.pic_hd.jpg');

function ban(str,arr){
    for(var i =0;i<arr.length;i++){
        console.log(arr[i])
    }

}


const food_ban = ['猴头' , '肠衣' , '豆油' , '太阳蛋' , '方包片' , '球包菜' , '组织蛋白' , '糖烯' , '口服葡萄糖' , '活力钙' , '调味品' , '闽姜' , '糕饼专用油' , '小香' , '香料' , '香精' , '鲜肉' , '碘盐' , '酵母提取物' , '棕油' , '味料' , '陈年老汤' , 'I+G']
const burden_ban = []
const add_ban = []
function ocrText(str) {
    var arr = {
        'product': ['品名'],
        'burden': ['配料', '原料','配方表','成分','主要配料'],
        'weight': ['净含量'],
        'code': ['产品标准代号', '产品标准'],
        'msg': ['产地', '联系方式', '地址', '生产商', '生产者', '联系方式', '电话', '传真', '经销商', '经销者', '网址', '网站', '邮政', '邮件'],
        'date': ['生产日期', '保质期', '时间'],
        'storage': ['贮存条件'],
        'sc': ['生产许可证编号', 'sc', '食证字', '生产许可','qs'],
        'birth':['营养成分表']
    }

    var ocr = []


    var key = Object.keys(arr)

    for (var k in key) {
        var index = str.length;
        var item = {}
        for (j = 0; j < arr[(key[k])].length; j++) {

            var i = str.indexOf(arr[(key[k])][j])
            if (i < index && i != -1) {
                index = i
            }
        }
        item[(key[k])] = index
        ocr.push(item)
    }
    var s = jsonSort(ocr);

console.log(s)
     for (g = 0; g < s.length; g++) {
        if ( s[g][(Object.keys(s[g])[0])] != str.length && (Object.keys(s[g])[0] != 'birth')) {

            s[g][(Object.keys(s[g])[0])] = (g != (s.length-1))? str.substring(s[g][Object.keys(s[g])[0]],s[g+1][Object.keys(s[g+1])[0]]): str.substring(s[g][Object.keys(s[g])[0]],s[g+1][Object.keys(s[g+1])[0]])


        }else {

                s[g][(Object.keys(s[g])[0])] = ''

        }
    }

    for (g = 0; g < s.length; g++) {
        if((Object.keys(s[g])[0] === 'birth')){
            s.splice(g,1)

        }
    }


    return s
}



var json = [{product: 1}, {burden: 15}, {weight: 0}, {code: 50}, {msg: 130}, {date: 97}, {storage: 0}, {sc: 73}]

function jsonSort(json) {

    for (var j = 1; j < json.length; j++) {
        var temp = json[j],
            val =  temp[Object.keys(temp)[0]],
            i = j - 1
        while (i >= 0 && json[i][Object.keys(json[i])[0]] > val) {
            json[i + 1] =  json[i];
            i = i - 1;
        }
        json[i+1] = temp
    }
return json
}




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

app.post('/getOcrText', function (req, res) {
    var ocrtext = req.body.ocrText;
    var chatid = req.body.chatid;

    if (ocrText && chatid) {
        var ocr = ocrText(ocrtext)

        res.json(ocr)
    } else {
        res.send('err')
    }
})


app.post('/updateOcrText', function (req, res) {
    var tableText = req.body.tableText;
    var chatid = req.body.chatid;

    if (tableText && chatid) {
        //数据库更新
        res.json(errCode(tableText))
    } else {
        res.send('err')
    }
})


app.post("/upload", (req, res) => {
    var form = new formidable.IncomingForm();//既处理表单，又处理文件上传
    let uploadDir = path.join(__dirname, "library/upload/" + req.headers.chatid);
    form.uploadDir = uploadDir;//本地文件夹目录路径

    form.parse(req, (err, fields, files) => {
        var file = files.fileName
        var oldname = file.path
        var extname = path.extname(file.name);
        var newname = uploadDir + '/' + GenNonDuplicateID(1) + extname;
        fs.rename(oldname, newname, function (err) {
            if (err) {
                throw  Error("改名失败");
                res.json({ocr: -1})
            } else {
                ocr(newname, function (result) {
                    if (result != 'err') {
                        res.json({ocr: result})
                    } else {
                        res.json({ocr: -1})
                    }

                })
            }
        });
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
            console.error('>> getChatId err : ', model, err)
            res.json({chatid: -1})
        } else {
            var folder = path.join(__dirname, "library/upload/" + chatid);

            fs.mkdir(folder, {recursive: true}, (err) => {
                if (err) {
                    throw err
                    res.json({chatid: -1})
                } else {

                    res.json({chatid: model.chatid})
                }

            });


        }
    })

})


// ocr(image, function (date) {
//     console.log(date)
// })

 function errCode(json){
        var errCode = {}
        var error = ''
        var coloer = 0
         for(var i =0 ;i<json.length;i++){
            if(Object.keys(json[i])[0]){
                if(!json[i][Object.keys(json[i])[0]]){
                error = error + Object.keys(json[i])[0] + '识别结果为空' + '\n';
                coloer = 1
              
            }else if ((Object.keys(json[i])[0] == 'burden')){
                    if((json[i][Object.keys(json[i])[0]].indexOf('配方表')>-1) || (json[i][Object.keys(json[i])[0]].indexOf('成分')>-1) || (json[i][Object.keys(json[i])[0]].indexOf('主要配料')>-1)){
                        coloer = 2
                        error = error + Object.keys(json[i])[0] + '引导词出错' + '\n';
                    }
                }else if ((Object.keys(json[i])[0] == 'weight')){
        
        
                }else if ((Object.keys(json[i])[0] == 'sc')){
                    console.log(json[i][Object.keys(json[i])[0]].indexOf('qs'))
                    if((json[i][Object.keys(json[i])[0]].indexOf('qs')>-1)){
                        coloer = 2
                        error = error + Object.keys(json[i])[0] + 'qs标注不正确 违反了 GB-7718 2011 （4.1.9）条款' + '\n';
                    }
        
                }else if ((Object.keys(json[i])[0] == 'code')){
                   // DB-' , 'DSS、QB(/T)、GB(/T)、GB/7、GB/(T)、GB/:、13738(.)2
                   if((json[i][Object.keys(json[i])[0]].indexOf('DB-')>-1) ||(json[i][Object.keys(json[i])[0]].indexOf('DSS')>-1) ||(json[i][Object.keys(json[i])[0]].indexOf('QB/')>-1) || (json[i][Object.keys(json[i])[0]].indexOf('GB/')>-1)){
                    coloer = 2
                    error = error + Object.keys(json[i])[0] + '标准书写错误 违反了 GB-7718 2011 （4.1.10）条款' + '\n';
                }
                }else if ((Object.keys(json[i])[0] == 'date')){
                    if((json[i][Object.keys(json[i])[0]].indexOf('生产日期')<0) || (json[i][Object.keys(json[i])[0]].indexOf('保质期')<0)){
                        coloer = 2
                        error = error + Object.keys(json[i])[0] + '未标注生产日期或保质期 违反了 GB-7718 2011 （4.1.7.1）条款' + '\n';
                    }
        
                }else if ((Object.keys(json[i])[0] == 'product')){
        
        
                }else if ((Object.keys(json[i])[0] == 'msg')){
                    if((json[i][Object.keys(json[i])[0]].indexOf('电话')<0) && (json[i][Object.keys(json[i])[0]].indexOf('传真')< 0) && (json[i][Object.keys(json[i])[0]].indexOf('网')<0) &&(json[i][Object.keys(json[i])[0]].indexOf('邮')<0)){
                        coloer = 2
                        error = error + Object.keys(json[i])[0] + '违反了 GB-7718 2011 （4.1.6.2）条款' + '\n';
                    }
                }
            }
         }
         errCode.error = error;
         errCode.coloer = coloer
        return  errCode
     }


function ocr(image, callback) {
    var base64Img = new Buffer(image).toString('base64');
    client.generalBasic(base64Img).then(function (result) {
        var model = {}
        var rt = result.words_result

        if (result.error_code) {
            callback('err')
        } else {
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
                    console.log(rt[i + 1])
                    // model.nutrition = e
                }
            })
            callback(model)
        }

    }).catch(function (err) {
        // 如果发生网络错误
        callback('err')
        console.log(err, 'timeout');
    });
}

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
