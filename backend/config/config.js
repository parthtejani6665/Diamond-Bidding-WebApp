/* Sequelize CLI configuration */
require("dotenv").config();

const common = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "diamond_bidding",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: common,
  test: common,
  production: common,
};

