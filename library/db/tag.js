var models = require('../models');
var model = exports.model = models.tag;
var util = require('util');


//添加
exports.insert = function (m, callback) {
    model.create(m).then(function (ret) {
        callback(null,ret)
    }).catch(function (err) {
        callback(err)
    });
}

//删除
exports.delete = function (where, callback) {
    model.destroy({where: where}).then(function (results) {
        callback(null, results);
    });
}

//修改
exports.update = function (m, where, callback) {
    model.update(m, {where: where}).then(function (results) {
        callback(null, results);
    });
}

exports.findAllByPrimary = function (field, where, callback) {
    model.find(where, field).read('primary').exec(callback);
};