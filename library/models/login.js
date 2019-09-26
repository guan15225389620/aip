module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('login', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        openid: DataTypes.STRING,
    }, {
        indexes: [
            {
                fields: ['openid']
            }
        ],
        timestamps: false,
        tableName: 'login'
    });
    return m;
};