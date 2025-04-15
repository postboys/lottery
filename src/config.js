module.exports = {
    vault: {
        addr: process.env.VAULT_ADDR ?? "http://localhost:9200",
        roleId: process.env.VAULT_ROLE_ID,
        secretId: process.env.VAULT_SECRET_ID,
    },
    mysql: {
        host: process.env.DATABASE_HOST ?? "localhost",
        port: process.env.DATABASE_PORT ?? 3306,
        database: process.env.DATABASE_NAME,
    },
};
