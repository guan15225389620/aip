







app.get('/get_data', function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
    var base64Img = new Buffer(image).toString('base64');
    client.generalBasic(base64Img).then(function (result) {
        var rt = result.words_result
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
        var model = {}
        console.log(result)
        rt.forEach(function (e) {
            if (product.test(e.words)) {
                model.product = e
            }else if (burden.test(e.words)){
                model.burden = e
            }else if (code.test(e.words)){
                model.code = e
            }else if (badwordreg.test(e.words)){
                model.badwordreg = e
            }else if (pd_date.test(e.words)){
                model.pd_date = e
            }else if (EXP.test(e.words)){
                model.EXP = e
            }else if (place.test(e.words)){
                model.place = e
            }else if (tel.test(e.words)){
                model.tel = e
            }else if (wt_net.test(e.words)){
                model.wt_net = e
            }else if (address.test(e.words)){
                model.address = e
            }else if (nutrition.test(e.words)){
                model.nutrition = e
            }
        })

        // tagModel.insert(model, function (err) {
        //     if (err) {
        //         console.error('>> url err : ', model.url)
        //     }
        //     callback();
        // })

    }).catch(function (err) {
        // 如果发生网络错误
        console.log(err,'timeout');
    });
    ;

})

app.get('/update_data', function (req, res) {


})

app.get('/healthz', function (req, res) {
    res.send('OK')
})
