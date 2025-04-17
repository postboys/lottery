import { ConnectionOptions } from "mysql2";

export default {
    mysql: {
        host: process.env.DATABASE_HOST ?? "localhost",
        port: process.env.DATABASE_PORT ?? 3306,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
    } as ConnectionOptions,
};
