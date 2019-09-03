module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('medical_ban', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        adding: DataTypes.STRING,
        adding_date: {type: DataTypes.DATE}
    });
    return m;
};