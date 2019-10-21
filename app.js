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
    if (tableText && chatid && dataList) {
        //数据库更新


        res.json(errCode(tableText, dataList))
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


function ban(str, burden) {
    var res = '';
    var warn = '';

    for (var n = 0; n < burden.length; n++) {
        var arr = burden[n]
        if (arr[0] == 'add_ban') {
            warn = ' 未标示GB 2760中的通用名称,违反GB-7718 2011（4.1.3.1.4）' + '\n'
        } else if (arr[0] == 'food_ban') {
            warn = ' 非食品原料出现在配料表中,违反《食品安全法》第三十八条' + '\n'
        } else if (arr[0] == 'burden_ban') {
            warn = '  不符合相关国家标准规定的名称,违反GB-7718 2011（4.1.3.1）' + '\n'
        }

        for (var i = 1; i < arr.length; i++) {
            if (str.indexOf(arr[i]) > -1) {
                res = res + arr[i] + warn
            }
        }
    }
    return res
}


function errCode(json, dataList) {
    var errCode = {}
    var error = ''
    var coloer = 0
    console.log(json, '<<')
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
                    error = error + key + '计量单位大小写书写不规范 违反了 GB-7718 2011（4.1.5.2）' + '\n';
                }

            } else if (key == 'sc') {

                var num = value.replace(/[^0-9]/ig, "").toString();
                var header = num.slice(0, 3)
                if (value.indexOf('SC') === -1) {
                    coloer = 2
                    error = error + key + 'QS/SC标注不正确 违反了 GB-7718 2011 （4.1.9）' + '\n';
                } else if (num.length != 14 || header < 101 || header > 131) {
                    coloer = 2
                    error = error + key + '生产许可证编号错误或过期 违反了 GB-7718 2011 （4.1.9）' + '\n';
                }

            } else if (key == 'code') {

                if (value.indexOf('GB/T') === -1) {
                    coloer = 2
                    error = error + key + '标准书写错误 违反了 GB-7718 2011 （4.1.10）' + '\n';
                }
            } else if (key == 'date') {
                if ((value.indexOf('生产日期') < 0) || (value.indexOf('保质期') < 0)) {
                    coloer = 2
                    error = error + key + '未标注生产日期或保质期 违反了 GB-7718 2011 （4.1.7.1）' + '\n';
                }

            } else if (key == 'product') {

            } else if (key == 'msg') {
                if ((value.indexOf('电话') < 0) && (value.indexOf('传真') < 0) && (value.indexOf('网') < 0) && (value.indexOf('邮') < 0)) {
                    coloer = 2
                    error = error + key + '违反了 GB-7718 2011 （4.1.6.2）' + '\n';
                }
            }
        }
    }

    var data = Object.keys(dataList)
    if (data.indexOf('能量') === -1 || data.indexOf('蛋白质') === -1 || data.indexOf('脂肪') === -1 || data.indexOf('碳水化合物') === -1 || data.indexOf('钠') === -1) {
        error = error + '违反GB28050-2011第4.1条相关规定:所有预包装食品营养标签强制标示：能量、核心营养素的含量及其占营养素参考值（NRV）的百分比，能量和核心营养素' + '\n';
        coloer = 2
    }


    var list = [['能量'], ['蛋白质'], ['脂肪'], ['饱和脂肪', '饱和脂肪酸'], ['反式脂肪', '反式脂肪酸'], ['单不饱和脂肪', '单不饱和脂肪酸'], ['多不饱和脂肪'], ['胆固醇'], ['碳水化合物'], ['糖', '乳糖'], ['膳食纤维'], ['钠'], ['维生素A'], ['维生素D'], ['维生素E'], ['维生素K'], ['维生素B1', '硫胺素'], ['维生素B2', '核黄素'], ['维生素B6'], ['维生素B12'], ['维生素C', '抗坏血酸']['烟酸', '烟酰胺'], ['叶酸'], ['泛酸'], ['生物素'], ['胆碱']['磷'], ['钾'], ['镁'], ['钙'], ['铁']['锌'], ['碘'], ['硒'], ['铜'], ['氪']['锰']]

    var i = []

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

        if (i[k] === -1) {
            error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
            coloer = 2
        } else if (i[k] > i[k + 1]) {
            error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
            coloer = 2
        }
    }


    for (var j = 0; j < Object.keys(dataList).length; j++) {
        var key = Object.keys(dataList)[j]
        var k = parseInt(dataList[key][0]);
        var v = parseInt(dataList[key][1]);
        if (k && y) {
            if (key === '能量') {
                if (digits(k) != 0 || unit(k).indexOf('kJ') === -1 ) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '蛋白质') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 ) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '脂肪') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 ) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '碳水化合物') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 ) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '钠') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 ) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '饱和脂肪' || key === '饱和脂肪酸') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1 ) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '反式脂肪' || key === '反式脂肪酸') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '多不饱和脂肪') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '胆固醇') {
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '碳水化合物') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '糖' || key === '乳糖') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '膳食纤维') {
                if (digits(k) != 1 || unit(k).indexOf('g') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '钠') {
                if (digits(k) != 1 || unit(k).indexOf('mg') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素A') {
                if (digits(k) != 1 || unit(k).indexOf('ugRE') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素D') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素E') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素K') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素B1' || key === '硫胺素') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素B2' || key === '核黄素') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素C' || key === '抗坏血酸') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素B6') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '维生素B12') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '烟酸' || key === '烟酰胺') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '叶酸') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '泛酸') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '生物素') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '胆碱') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '磷') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '钾') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '镁') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '钙') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '铁') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '锌') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '碘') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '硒') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '铜') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '氪') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            } else if (key === '锰') {
                if (digits(k) != 1 || unit(k).indexOf('kJ') === -1) {
                    error = error + '违反GB28050-2011第6.2条相关规定:所有预包装食品营养标签强制标示能量和各营养素名称、顺序、单位、修约间隔、“0”界限值应符合规定，当不标识某营养成分时，依序上移' + '\n';
                }
            }
        } else {
            error = error + '违反GB28050-2011《食品安全国家标准 预包装食品营养标签通则》第6.1条相关规定（营养成分含量应以每100g或者100mL或者每份可食部中含量值，当用份标示时，应标明每份食品的量。）\n'
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
function unit(s) {
    var s = s.replace(/[0-9]/g, '')
    if(s.indexOf(".") != -1){
        s = s.replace(".","")
    }
    return s
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
