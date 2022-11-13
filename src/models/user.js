const {
  Model
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // eslint-disable-next-line valid-jsdoc
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    dob: DataTypes.STRING,
    phone: DataTypes.STRING,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: "User",
  });
  return User;
};
