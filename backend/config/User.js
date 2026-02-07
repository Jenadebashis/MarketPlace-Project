import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'buyer' // Matches your SQL 'buyer' or 'seller'
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at' // Maps JavaScript 'createdAt' to SQL 'created_at'
    }
}, {
    tableName: 'users', // Forces Sequelize to use your existing table
    timestamps: true,
    updatedAt: false    // Since your SQL doesn't have an updated_at column
});

export default User;