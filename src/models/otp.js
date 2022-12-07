const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define("Otps", {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    token: {
      type: DataTypes.INTEGER,
    },
    expired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });
  return Otp;
};
