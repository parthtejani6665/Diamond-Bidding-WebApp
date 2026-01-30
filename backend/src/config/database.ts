import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_LOGGING,
} = process.env;

const database = DB_NAME || "diamond_bidding";
const username = DB_USER || "postgres";
const password = DB_PASSWORD ?? "";

export const sequelize = new Sequelize({
  database,
  username,
  password: String(password),
  host: DB_HOST || "localhost",
  port: DB_PORT ? Number(DB_PORT) : 5432,
  dialect: "postgres",
  logging: DB_LOGGING === "true" ? console.log : false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

