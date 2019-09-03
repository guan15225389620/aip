module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('distinguish', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        name: DataTypes.STRING,
        content: DataTypes.Boolean,
        allow: DataTypes.STRING,
        wrong	: DataTypes.STRING
    });
    return m;
};