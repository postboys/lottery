const mysql = require("mysql2/promise");

const config = {
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
};

const executeQuery = async (query, params) => {
    const connection = await mysql.createConnection(config);
    try {
        const result = await connection.query(query, params);
        return result[0]; // 输出查询结果
    }
    finally {
        connection.destroy();
    }
};

module.exports = { executeQuery };
