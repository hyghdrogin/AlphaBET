import bcrypt from "bcrypt";
import config from "../../config";
/** @type {import('sequelize-cli').Migration} */

const password = config.SEED_PASSWORD;
const hash = bcrypt.hashSync(password, 10);
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [{
      id: "e1bc7da3-61fe-4ece-bbd7-7bd1a5b9dcce",
      firstName: "Emmanuel",
      lastName: "Omopariola",
      email: "hyghdrogin@alphabet.com",
      phone: 2349072668695,
      username: "hyghdrogin",
      password: hash,
      dob: "10/11/2022",
      balance: 0.00,
      location: "Lagos, Nigeria",
      role: "admin",
      active: true,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "c03e1a6b-58d1-4f05-9931-f8449ed62bce",
      firstName: "AlphaBET",
      lastName: "Admin",
      email: "admin@alphabet.com",
      phone: 2349025742238,
      username: "admin",
      password: hash,
      dob: "10/11/2022",
      balance: 0.00,
      location: "Lagos, Nigeria",
      role: "admin",
      active: true,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
