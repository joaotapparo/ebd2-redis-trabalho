import mysql, { ConnectionOptions } from "mysql2";
import dotenv from "dotenv";
import Redis from "ioredis";
dotenv.config();

// configurações de acesso ao banco de dados
const access: ConnectionOptions = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// cria a conexão com o banco de dados
export const conn = mysql.createConnection(access);
// cria a conexão com o redis
export const redis = new Redis();
