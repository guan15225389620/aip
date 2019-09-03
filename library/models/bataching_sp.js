module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('bataching_sp', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        adding: DataTypes.STRING,
        tips:DataTypes.STRING,
        adding_date: {type: DataTypes.DATE}
    });
    return m;
};