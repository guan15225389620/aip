module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('tag', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        product: DataTypes.STRING,
        address: DataTypes.STRING,
        burden:DataTypes.STRING,
        place: DataTypes.STRING,
        sc: DataTypes.STRING,
        tel: DataTypes.STRING,
        code: DataTypes.STRING,
        Storage: DataTypes.STRING,
        wt_net: DataTypes.STRING,
        pd_date: DataTypes.STRING,
        EXP:DataTypes.STRING,
        nutrition:DataTypes.STRING,
        create_date: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
    });
    return m;
};