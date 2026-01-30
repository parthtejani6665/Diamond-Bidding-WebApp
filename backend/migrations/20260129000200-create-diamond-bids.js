/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("diamond_bids", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      diamond_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      diamond_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      base_diamond_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      base_bid_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      start_date_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("draft", "active", "closed"),
        allowNull: false,
        defaultValue: "draft",
      },
      created_by: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      result_declared: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      winner_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      declared_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("diamond_bids", ["status"]);
    await queryInterface.addIndex("diamond_bids", ["start_date_time", "end_date_time"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("diamond_bids");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_diamond_bids_status";');
  },
};

