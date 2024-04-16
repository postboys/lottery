const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

const executeQuery = async (query, params) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query(query, params);
    conn.release();
    return result[0]; // 输出查询结果
  }
  catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  executeQuery,
};
