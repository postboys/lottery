const SECRET_ENV_VARS = JSON.parse(process.env.SECRETS ?? null);
const APP_ENV = process.env.APP_ENV;
const NODE_ENV = APP_ENV?.split("-").pop();

module.exports = {
    apps: [
        {
            name: APP_ENV,
            script: "lib/main.js",
            env: {
                NODE_ENV,
                DATABASE_NAME: APP_ENV,
                DATABASE_USER: APP_ENV,

                ...SECRET_ENV_VARS,
            },

            time: true,
        },
    ],
};
