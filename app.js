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


var burdens = [['burden_ban', '猴头', '肠衣', '豆油', '太阳蛋', '方包片', '球包菜', '组织蛋白', '糖烯', '口服葡萄糖', '活力钙', '调味品', '闽姜', '糕饼专用油', '小香', '香料', '香精', '鲜肉', '碘盐', '酵母提取物', '棕油', '味料', '陈年老汤', 'I+G'
],
    ['food_ban', '蟾酥', '藜芦', '颠茄', '雷公藤', '雄黄', '硫磺', '斑蝥', '黄花夹竹桃', '雪上一枝蒿', '铃兰', '铁棒槌', '莽草', '鬼臼', '骆驼蓬', '杠柳皮', '香加皮', '草乌', '砒霜', '红砒', '白砒', '砒石', '牵牛子', '洋金花', '洋地黄', '鱼藤', '青娘虫', '闹羊花', '河豚', '昆明山海棠', '京大戟', '丽江山慈姑', '羊踯躅', '羊角拗', '红粉', '红茴香', '红豆杉', '红升丹', '罂粟壳', '米壳', '朱砂', '夹竹桃', '八角莲', '八里麻', '千金子', '土青木香', '山莨菪', '川乌', '广防己', '马桑叶', '马钱子', '六角莲', '天仙子', '巴豆', '水银', '长春花', '甘遂', '生天南星', '生半夏', '生白附子', '生狼毒', '白降丹', '石蒜', '关木通', '农吉痢'],
    ['add_ban', 'VC钠', '异VC钠', '味素', 'HBA-BN10', '5-呈味核苷酸二钠', 'α-淀粉酶', '笨甲酸钠', '食品添剂', '香精', '红曲米粉', '牛膏']
]


function ocrText(str) {
    var arr = {
        'product': ['品名'],
        'burden': ['配料', '原料', '配方表', '成分', '主要配料'],
        'weight': ['净含量'],
        'code': ['产品标准代号', '产品标准'],
        'msg': ['产地', '联系方式', '地址', '生产商', '生产者', '联系方式', '电话', '传真', '经销商', '经销者', '网址', '网站', '邮政', '邮件'],
        'date': ['生产日期', '保质期', '时间'],
        'storage': ['贮存条件'],
        'sc': ['生产许可证编号', 'sc', '食证字', '生产许可', 'qs'],
        'birth': ['营养成分表']
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

    for (g = 0; g < s.length; g++) {
        if (s[g][(Object.keys(s[g])[0])] != str.length && (Object.keys(s[g])[0] != 'birth')) {

            s[g][(Object.keys(s[g])[0])] = (g != (s.length - 1)) ? str.substring(s[g][Object.keys(s[g])[0]], s[g + 1][Object.keys(s[g + 1])[0]]) : str.substring(s[g][Object.keys(s[g])[0]], s[g + 1][Object.keys(s[g + 1])[0]])


        } else {

            s[g][(Object.keys(s[g])[0])] = ''

        }
    }

    for (g = 0; g < s.length; g++) {
        if ((Object.keys(s[g])[0] === 'birth')) {
            s.splice(g, 1)

        }
    }


    return s
}


function jsonSort(json) {
    for (var j = 1; j < json.length; j++) {
        var temp = json[j],
            val = temp[Object.keys(temp)[0]],
            i = j - 1
        while (i >= 0 && json[i][Object.keys(json[i])[0]] > val) {
            json[i + 1] = json[i];
            i = i - 1;
        }
        json[i + 1] = temp
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
    var dataList = req.body.dataList;
    var perServing = req.body.perServing;
    if (tableText && chatid && dataList && perServing) {
        //数据库更新
        res.json(errCode(tableText, dataList, perServing))
    } else {
        res.send('err tableText、chatid、dataList、ShelfLife数据不全无法显示')
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


function ban(str, burden) {
    var res = '';
    var warn = '';

    for (var n = 0; n < burden.length; n++) {
        var arr = burden[n]
        if (arr[0] == 'add_ban') {
            warn = '根据GB7718-2011第4.1.3.1.4条相关规定：食品添加剂应当标示其在GB2760中的食品添加剂通用名称。' + '\n'
        } else if (arr[0] == 'food_ban') {
            warn = '此类用语违反《中华人民共和国食品安全法》第三十八条：生产经营的食品中不得添加药品。' + '\n'
        } else if (arr[0] == 'burden_ban') {
            warn = ' 此类用语违反GB-7718 2011（4.1.3.1）规定：预包装食品的标签上应标示配料表, 配料表中的各种配料应按4.1.2的要求标示具体名称，食品添加剂按照4.1.3.1.4的要求标示名称' + '\n'
        }

        for (var i = 1; i < arr.length; i++) {
            if (str.indexOf(arr[i]) > -1) {
                res = res + arr[i] + warn
            }
        }
    }
    return res
}


function errCode(json, dataList, perServing) {
    var errCode = {}
    var error = ''
    var coloer = 0
    for (var i = 0; i < json.length; i++) {
        var key = Object.keys(json[i])[0];
        var value = json[i][key]
        if (key) {
            if (!json[i][key]) {
                error = error + key + '识别结果为空' + '\n';
                coloer = 1

            } else if ((key == 'burden')) {

                if ((value.indexOf('配方表') > -1) || (value.indexOf('成分') > -1) || (value.indexOf('主要配料') > -1)) {
                    coloer = 2
                    error = error + key + '引导词出错' + '\n';
                }

                var warn = ban(value, burdens);
                if (warn) {
                    error = error + warn
                    coloer = 2
                }

            } else if (key == 'weight') {
                if (value.indexOf('l') === -1 && value.indexOf('ml') === -1 && value.indexOf('L') === -1 && value.indexOf('ml') === -1 && value.indexOf('g') === -1 && value.indexOf('kg') === -1) {
                    coloer = 2
                    error = error + key + '根据GB7718-2011《食品安全国家标准 预包装食品标签通则》第4.1.5.2条相关规定：应依据法定计量单位，按以下形式标示包装物（容器）中食品的净含量：(a)液态食品，用体积升(L) (l)、毫升(mL) (ml)，或用质量克(g)、千克(kg)；(b)固态食品，用质量克(g)、千克(kg)；(c)半固态或黏性食品，用质量克(g)、千克(kg)或体积升(L) (l)、毫升(mL) (ml)。' + '\n';
                }

            } else if (key == 'sc') {

                var num = value.replace(/[^0-9]/ig, "").toString();
                var header = num.slice(0, 3)
                if (value.indexOf('SC') === -1) {
                    coloer = 2
                    error = error + key + '根据GB7718-2011《食品安全国家标准 预包装食品标签通则》第4.1.9条相关规定：预包装食品标签应标示食品生产许可证编号的，标示形式按照相关规定执行' + '\n';
                } else if (num.length != 14 || header < 101 || header > 131) {
                    coloer = 2
                    error = error + key + '根据GB7718-2011《食品安全国家标准 预包装食品标签通则》第4.1.9条相关规定：预包装食品标签应标示食品生产许可证编号的，标示形式按照相关规定执行' + '\n';
                }

            } else if (key == 'code') {

                if (value.indexOf('GB/T') === -1) {
                    coloer = 2
                    error = error + key + '根据GB7718-2011《食品安全国家标准 预包装食品标签通则》第4.1.10条相关规定：在国内生产并在国内销售的预包装食品（不包括进口预包装食品）应标示产品所执行的标准代号和顺序号。' + '\n';
                }
            } else if (key == 'date') {
                if ((value.indexOf('生产日期') < 0) || (value.indexOf('保质期') < 0)) {
                    coloer = 2
                    error = error + key + '此类用语违反GB7718-2011第3.3条相关规定：应通俗易懂、有科学依据，不得标示封建迷信、色情、贬低其他食品或违背营养科学常识的内容。' + '\n';
                }

            } else if (key == 'product') {

            } else if (key == 'msg') {
                if ((value.indexOf('电话') < 0) && (value.indexOf('传真') < 0) && (value.indexOf('网') < 0) && (value.indexOf('邮') < 0)) {
                    coloer = 2
                    error = error + key + '根据GB7718-2011《食品安全国家标准 预包装食品标签通则》第4.1.6.1条相关规定：应当标注生产者的名称、地址和联系方式。生产者名称和地址应当是依法登记注册、能够承担产品安全质量责任的生产者的名称、地址。' + '\n';
                }
            }
        }
    }


    var list = [['能量'], ['蛋白质'], ['脂肪'], ['饱和脂肪', '饱和脂肪酸'], ['反式脂肪', '反式脂肪酸'], ['单不饱和脂肪', '单不饱和脂肪酸'], ['多不饱和脂肪'], ['胆固醇'], ['碳水化合物'], ['糖', '乳糖'], ['膳食纤维'], ['钠'], ['维生素A'], ['维生素D'], ['维生素E'], ['维生素K'], ['维生素B1', '硫胺素'], ['维生素B2', '核黄素'], ['维生素B6'], ['维生素B12'], ['维生素C', '抗坏血酸'], ['烟酸', '烟酰胺'], ['叶酸'], ['泛酸'], ['生物素'], ['胆碱'], ['磷'], ['钾'], ['镁'], ['钙'], ['铁'], ['锌'], ['碘'], ['硒'], ['铜'], ['氪'], ['锰']]
    var i = []
    var data =Object.keys(dataList);
    for (var g = 0; g < list.length; g++) {
        var index = data.indexOf(list[g][0])
        if (index > -1) {
            i.push([index, 1])
        } else {
            if (list[g] > 1 && data.indexOf(list[g][1] > -1)) {
                i.push([data.indexOf(list[g][1], 2)])
            } else {
                i.push([-1, -1])
            }
        }

    }


    for (var k = 0; k < i.length - 1; k++) {

        if (i[k][0] === -1) {

            if (i[k] > i[k + 1]) {
                error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                coloer = 2
            }
        }
    }
    var a, b, c, d, e, g;
    var f = parseFloat(perServing) / 100;
    var status = 1
    if (unit(perServing).indexOf('ml')) {
        status = 2;
    }


    for (var j = 0; j <data.length; j++) {
        var key = data[j];
        var k = norm(dataList[key][0]);
        var v = dataList[key][1];
        if (k && y) {
            if (key === '能量') {
                a = parseFloat(k) * f;
                if (nrv(k, 8400, v)) {
                    error = error + key + '' + '\n';
                    coloer = 2
                }
                if (digits(k) != 0 || unit(k).indexOf('kJ') === -1 || threshold(k, v, 17)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '蛋白质') {
                b = parseFloat(k) * f;
                if (nrv(k, 60, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '脂肪') {
                c = parseFloat(k) * f;
                if (nrv(k, 60, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '碳水化合物') {
                d = parseFloat(k) * f;
                if (nrv(k, 300, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '饱和脂肪' || key === '饱和脂肪酸') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.1)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '反式脂肪' || key === '反式脂肪酸') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.3)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '多不饱和脂肪' || key === '多不饱和脂肪酸') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.1)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '胆固醇') {
                if (nrv(k, 300, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '单不饱和脂肪' || key === '单不饱和脂肪酸') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.1)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '糖' || key === '乳糖') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '膳食纤维') {
                if (nrv(k, 25, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 || threshold(k, v, 0.5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '钠') {
                e = parseFloat(k) * f;
                if (nrv(k, 2000, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 5)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素A') {
                if (nrv(k, 800, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug RE') === -1 || threshold(k, v, 8)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素D') {
                if (nrv(k, 5, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 0.1)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素E') {
                if (nrv(k, 14, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg a-TE') === -1 || threshold(k, v, 0.28)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素K') {
                if (nrv(k, 80, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 1.6)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素B1' || key === '硫胺素') {
                if (nrv(k, 1.4, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.03)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素B2' || key === '核黄素') {
                if (nrv(k, 1.4, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.03)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素C' || key === '抗坏血酸') {
                if (nrv(k, 100, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 2)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素B6') {
                if (nrv(k, 1.4, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.03)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '维生素B12') {
                if (nrv(k, 8400, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 0.05)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '烟酸' || key === '烟酰胺') {
                if (nrv(k, 8400, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.28)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '叶酸') {
                if (nrv(k, 400, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || (unit(k).indexOf('ug DFE') === -1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 8))) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '泛酸') {
                if (nrv(k, 5, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.1)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '生物素') {
                if (nrv(k, 30, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 0.6)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '胆碱') {
                if (nrv(k, 450, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 9)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '磷') {
                if (nrv(k, 700, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 14)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '钾') {
                if (nrv(k, 2000, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 20)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '镁') {
                if (nrv(k, 300, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 6)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '钙') {
                if (nrv(k, 800, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 8)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '铁') {
                if (nrv(k, 15, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.3)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '锌') {
                if (nrv(k, 15, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.3)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '碘') {
                if (nrv(k, 150, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 3)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '硒') {
                if (nrv(k, 50, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('ug') === -1 || threshold(k, v, 1)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '铜') {
                if (nrv(k, 1.5, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.03)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '氪') {
                if (nrv(k, 1, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.02)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            } else if (key === '锰') {
                if (nrv(k, 3, v)) {
                    error = error + key + '营养素参考值％（NRV％）数值错误' + '\n';
                    coloer = 2
                }
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1 || threshold(k, v, 0.06)) {
                    error = error + key + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                    coloer = 2
                }
            }

        } else {
            error = error + key + '违反GB28050-2011《食品安全国家标准 预包装食品营养标签通则》第6.1条相关规定（营养成分含量应以每100g或者100mL或者每份可食部中含量值，当用份标示时，应标明每份食品的量。）\n'
            coloer = 2
        }
    }
    if (a && b && c && d && e) {
        if (a < 0.9 * (b * 17 + c * 37 + d * 17) || a > 1.1 * (b * 17 + c * 37 + d * 17)) {
            error = error + '量数值标示错误' + '\n';
            coloer = 2

        } else {
            error = error + '违反GB28050-2011第4.1条相关规定:所有预包装食品营养标签强制标示：能量、核心营养素的含量及其占营养素参考值（NRV）的百分比，能量和核心营养素' + '\n';
            coloer = 2
        }
        if ((c * 37) <= (0.5 * a)) {
            if (a <= 17) {
                error = error + '含量声称方式可以使用无能量' + '\n';
                coloer = 2
            } else if ((h = 1 && a <= 170) || (h = 2 && a <= 80)) {
                error = error + '含量声称方式可以使用低能量' + '\n';
                coloer = 2
            }
        }
        if ((b * 17) < (0.05 * a)) {
            error = error + '含量声称方式可以使用低蛋白质' + '\n';
            coloer = 2

        } else if (b < 6 && (b * 17) < (0.05 * a)) {
            error = error + '含量声称方式可以使用蛋白质来源,或含有蛋白质' + '\n';
            coloer = 2

        } else if ((b * 420 / a) <= 3) {

            error = error + '含量声称方式可以使用高,或富含蛋白质' + '\n';
            coloer = 2
        }

        if (c <= 0.2) {
            error = error + '含量声称方式可以使用无或者不含脂肪' + '\n';
            coloer = 2
        } else if ((h = 1 && c <= 3) || (h = 2 && c <= 1.5)) {
            error = error + '含量声称方式可以使用低脂肪' + '\n';
            coloer = 2
        }
        if (c <= 0.5) {
            error = error + '含量声称方式可以使用无或不含糖' + '\n';
            coloer = 2
        } else if (c <= 5) {
            error = error + '含量声称方式可以使用低糖' + '\n';
            coloer = 2
        }

        if (e <= 5) {
            error = error + '含量声称方式可以使用无或不含钠' + '\n';
            coloer = 2
        } else if (e <= 40) {
            error = error + '含量声称方式可以使用极低钠' + '\n';
            coloer = 2
        } else if (e <= 120) {
            error = error + '含量声称方式可以使用低钠' + '\n';
            coloer = 2
        }
    }
    errCode.error = error;
    errCode.coloer = coloer
    return errCode
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


function digits(num) {
    var n = parseFloat(num).toString().split(".")
    var s = 0
    if (n.length > 1) {
        s = n[1].length
    }

    return s

}


//获取单位
function unit(s) {
    var s = s.replace(/[0-9]/g, '')
    if (s.indexOf(".") != -1) {
        s = s.replace(".", "")
    }
    return s
}

function threshold(a, c, b) {
    var a = parseFloat(a) * f;
    var b = parseFloat(b);
    var c = parseFloat(c);
    if (0 < a < b) {
        if (c = 0) {
            return true
        }
    } else {
        if (c = 0) {
            return true
        }
    }
    return false


}

//判断nrv
function nrv(a, b, c) {
    var a = parseFloat(a) * f;
    var b = parseFloat(b);
    var c = parseFloat(c);
    var tmp = a / b;

    if (0 < tmp < 0.5) {
        if (c != 0) {
            return true
        }
    } else if (0.5 < tmp < 1) {
        if (c != 1) {
            return true
        }
    }
    return false
}


//转化中文单位
function norm(s) {
    var a = []
    if (s.indexOf('克') > -1) {
        if (s.indexOf('毫克')) {
            if (s.indexOf('毫克 a-生育醇当量') > -1) {
                a = ['毫克', 'mg']
            } else {
                a = ['毫克', 'mg']
            }
        } else if (s.indexOf('微克') > -1) {
            if (s.indexOf('微克视黄醇当量') > -1) {
                a = ['毫克', 'mg']
            } else if (s.indexOf('微克叶酸当量') > -1) {
                a = ['微克叶酸当量', 'ug DFE']
            } else {
                a = ['微克', 'ug']
            }
        } else {
            a = ['克', 'g']
        }
    } else if (s.indexOf('千焦') > -1) {
        a = ['千焦', 'kJ']
    }
    return s.replace(a[0], a[1])

}


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
