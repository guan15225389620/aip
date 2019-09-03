module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('propaganda', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        ban_word: DataTypes.STRING,
        adding: DataTypes.STRING,
        adding_date: {type: DataTypes.DATE}
    }
    return m;
};