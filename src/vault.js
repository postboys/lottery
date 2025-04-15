const AxiosFactory = require("axios");
const config = require("./config");

const axios = AxiosFactory.create({ baseURL: config.vault.addr });
axios.interceptors.request.use(async (config) => {
    if (!config.url.endsWith("/v1/auth/approle/login")) {
        config.headers["X-Vault-Token"] = await loginWithAppRole();
    }

    return config;
});

const authToken = { token: null, expiresAt: 0 };
const loginWithAppRole = async () => {
    if (authToken.expiresAt < Date.now()) {
        const response = await axios.post("/v1/auth/approle/login", {
            role_id: config.vault.roleId,
            secret_id: config.vault.secretId,
        });
        authToken.token = response.data.auth.client_token;
        authToken.expiresAt = Date.now() + (response.data.auth.lease_duration - 10) * 1000;
    }

    return authToken.token;
};

const creds = {};
const getDatabaseCredential = async (db) => {
    if (!creds[db] || creds[db].expiresAt < Date.now()) {
        const response = await axios.get(`/v1/database/creds/${db}`);

        creds[db] = {
            username: response.data.data.username,
            password: response.data.data.password,
            expiresAt: Date.now() + (response.data.lease_duration - 10) * 1000,
        };
    }

    return creds[db];
};

module.exports = { getDatabaseCredential };
