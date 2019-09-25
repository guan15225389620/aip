module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('tag', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        product: DataTypes.JSONB,
        address: DataTypes.JSONB,
        burden:DataTypes.JSONB,
        place: DataTypes.JSONB,
        sc: DataTypes.JSONB,
        tel: DataTypes.JSONB,
        code: DataTypes.JSONB,
        Storage: DataTypes.JSONB,
        wt_net: DataTypes.JSONB,
        pd_date: DataTypes.JSONB,
        EXP:DataTypes.JSONB,
        nutrition:DataTypes.JSONB,
        create_date: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
    });
    return m;
};