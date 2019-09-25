module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('chat', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        chatid:DataTypes.INTEGER,
        openid: DataTypes.STRING,
        ocr: {type: DataTypes.JSON}
    })
    return m;
};