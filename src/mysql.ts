import mysql from "mysql2/promise";
import config from "./config";

export const executeQuery = async <T>(query: string, params?: unknown[]): Promise<T> => {
    const connection = await mysql.createConnection(config.mysql);
    try {
        const [result] = await connection.query(query, params); // Destructure to get the result
        return result as T; // 输出查询结果
    }
    finally {
        connection.destroy();
    }
};
