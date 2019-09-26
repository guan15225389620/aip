var models = require('../models');
var model = exports.model = models.tag;
var util = require('util');


//保存
exports.save = function (m, callback) {
    m.save(callback);
};

//添加
exports.insert = function (m, callback) {
    model.create(m).then(function (ret) {
        callback(null,ret)
    }).catch(function (err) {
        callback(err)
    });
}

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

exports.findBySQL = function (sql, callback) {
    models.sequelize_db.query(sql).spread(callback);