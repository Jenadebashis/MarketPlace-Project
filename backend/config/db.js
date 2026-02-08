import 'dotenv/config';
import { Sequelize } from "sequelize";

// Just ONE variable instead of five!
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export default sequelize;