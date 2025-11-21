import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import models from "../models";

dotenv.config();

const { DATABASE_URL } = process.env;

export const db = new Sequelize(DATABASE_URL as string, {
  models: Object.values(models),
  logging: false,
  timezone: "+00:00", // ✅ CRÍTICO: Siempre UTC para consistencia
  native: false,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
