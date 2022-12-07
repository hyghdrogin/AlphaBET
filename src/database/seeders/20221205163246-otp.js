/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Otps", [
      {
        id: "d6e0c1e6-2dcb-4b84-95bf-619bd8139b36",
        email: "hyghdrogin@alphabet.com",
        token: 176478,
        expired: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.bulkDelete("Otps", null, {});
  }
};
