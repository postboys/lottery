const mysql = require("mysql2/promise");
const { getDatabaseCredential } = require("./vault");
const config = require("./config");

const getMysqlConfig = async () => {
    const credential = await getDatabaseCredential(config.mysql.database);

    return {
        ...config.mysql,
        password: credential.password,
        user: credential.username,
    };
};

const executeQuery = async (query, params) => {
    const config = await getMysqlConfig();
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
