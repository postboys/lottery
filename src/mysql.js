const mysql = require("mysql2/promise");

const config = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

const executeQuery = async (query, params) => {
  try {
    const connection = await mysql.createConnection(config);
    const result = await connection.query(query, params);
    connection.destroy();
    return result[0]; // 输出查询结果
  }
  catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  executeQuery,
};
