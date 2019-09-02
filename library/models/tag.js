module.exports = function (sequelize, DataTypes) {
    var m = sequelize.define('tag', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        product: DataTypes.STRING,
        content: DataTypes.JSONB,
        burden: DataTypes.JSONB,
        factory_msg: DataTypes.JSONB,
        sc: DataTypes.STRING,
        date: DataTypes.JSONB,
        code: DataTypes.STRING,
        Storage: DataTypes.STRING,
        net_weight: DataTypes.STRING,
        production_date: {type: DataTypes.DATE},
        create_date: {type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW}
    });
    return m;
};