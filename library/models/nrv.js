module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('nrv', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        content: DataTypes.STRING,
        nrv: DataTypes.Number
    });
    return m;
};