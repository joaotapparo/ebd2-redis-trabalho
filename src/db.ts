import mysql, { ConnectionOptions } from "mysql2";
import dotenv from "dotenv";
import Redis from "ioredis";
dotenv.config();

const access: ConnectionOptions = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export const conn = mysql.createConnection(access);
export const redis = new Redis();
