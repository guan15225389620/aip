var models = require('../models/distinguish');
var model = exports.model = models.distinguish;
var util = require('util');

//保存
exports.save = function (m, callback) {
    m.save(callback);
};

//删除
exports.remove = function (id, callback) {
    model.remove({_id: id}, callback);
}

//修改
exports.update = function (id, doc, callback) {
    model.update({_id: id}, doc, callback);
}

//查询
exports.find = function (field, where, sort, limit, callback) {
    model.find(where, field).sort(sort).limit(limit).lean().exec(callback);
}

//查询All
exports.findAll = function (field, where, callback) {
    model.find(where, field).exec(callback);
};

exports.findAllByPrimary = function (field, where, callback) {
    model.find(where, field).read('primary').exec(callback);
};