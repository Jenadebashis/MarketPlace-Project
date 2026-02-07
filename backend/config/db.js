import 'dotenv/config';
import { Sequelize } from "sequelize";


// console.log("Connecting to DB:", process.env.PG_DATABASE);
// console.log("Password Length:", process.env.PG_PASSWORD ? process.env.PG_PASSWORD.length : "UNDEFINED");
const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
  host: process.env.PG_HOST,
  dialect: 'postgres',
  port: process.env.PG_PORT,
  logging: false
});

export default sequelize;