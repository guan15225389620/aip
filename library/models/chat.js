module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('chat', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        chatid:DataTypes.STRING,
        openid: DataTypes.INTEGER,
        loginid: DataTypes.STRING,
        ocr: {type: DataTypes.JSON}
    }, {
        indexes: [
            {
                fields: ['chatid'],
            },{
                fields: ['openid'],
            }
        ],
        timestamps: false,
        tableName: 'chat'
    });
    return m;
};