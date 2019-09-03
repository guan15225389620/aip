module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('GB28050_1', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        content: DataTypes.STRING,
        order	: DataTypes.Number,
        unit: DataTypes.Boolean,
        precision: DataTypes.Number,
        value: DataTypes.Number
    });
    return m;
};