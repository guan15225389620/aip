module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('preselection', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        subject: DataTypes.STRING,
        content: DataTypes.STRING
    });
    return m;
};