var express = require('express');
var bodyParser = require('body-parser');
var request = require('request')
var fs = require('fs')
var models = require('./library/models/datebase');
var app = express();
var tagModel = require('./library/db/tag.js');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({extended: true}));
var AipOcr = require('./src/index').ocr;
var fs = require('fs');
var http = require('http');


var APP_ID = "16705811";
var API_KEY = "hCPrFHK1Wjz39PoXgxdvlOs1";
var SECRET_KEY = "VMejCjXNP3qbioZ8OrBwvqpz9cKWiv5a";

var client = new AipOcr(APP_ID, API_KEY, SECRET_KEY);

var image = fs.readFileSync(__dirname + '/51566358844_.pic_hd.jpg');

// var app = http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
//     var base64Img = new Buffer(image).toString('base64');
//     client.generalBasic(base64Img).then(function (result) {
//         res.end(JSON.stringify(result));
//     });
// });

app.get('/get_date', function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    var base64Img = new Buffer(image).toString('base64');
    client.generalBasic(base64Img).then(function (result) {
        var rt = JSON.stringify(result.words_result)
        // tagModel.
        var product = new RegExp('产品名称', 'g');
        var burden = new RegExp('配料', 'g');
        var code = new RegExp('产品标准', 'g');
        var badwordreg = new RegExp('生产许可证', 'g');
        var pd_date = new RegExp('生产日期', 'g');
        var EXP = new RegExp('保质期', 'g');
        var place = new RegExp('产地', 'g');
        var address = new RegExp('地址', 'g');
        var tel = new RegExp('电话', 'g');
        var wt_net = new RegExp('净含量', 'g');
        var nutrition = new RegExp('营养成分', 'g');
        console.log(rt);
        result.words_result.forEach(function (e) {
            if (product.test(e.words)) {
                console.log(e)
            }else if (burden.test(e.words)){

            }else if (code.test(e.words)){

            }else if (badwordreg.test(e.words)){

            }else if (pd_date.test(e.words)){

            }else if (EXP.test(e.words)){

            }else if (place.test(e.words)){

            }else if (tel.test(e.words)){

            }else if (wt_net.test(e.words)){

            }else if (address.test(e.words)){

            }else if (nutrition.test(e.words)){

            }
        })
        var auditwordreg = new RegExp('产品', 'ig');
        res.json(200)
        console.log(rt);
    }).catch(function (err) {
        // 如果发生网络错误
        console.log(err);
    });
    ;

})
models.sequelize.sync().then(function () {
});
var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server running at http://%s:%s", host, port)
});