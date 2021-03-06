/* Application level configuration objects to be exported
 * from here
 */

import dotenv from "dotenv";
dotenv.config();

export const {
  // App
  NODE_ENV = "development",

  // Database
  DATABASE_TYPE = "postgres",
  DATABASE_HOST = "localhost",
  DATABASE_PORT = 5432,
  DATABASE_USERNAME = "postgres",
  DATABASE_PASSWORD = "password",
  DATABASE_NAME = "app",

  // App Data
  CLIENT_ID = "",
  CLIENT_SECRET = "",
} = process.env;

export const APP_PORT = parseInt(process.env.APP_PORT || "5000");
