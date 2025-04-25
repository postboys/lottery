const SECRET_ENV_VARS = JSON.parse(process.env.SECRETS ?? null);
const APP_ENV = process.env.APP_ENV ?? "lottery-staging";

module.exports = {
    apps: [
        {
            name: APP_ENV,
            script: "lib/main.js",
            env: {
                ...SECRET_ENV_VARS,

                DATABASE_NAME: APP_ENV,
                DATABASE_USERNAME: APP_ENV,
            },

            cron_restart: "00 22 * * 1,3,6",
            stop_exit_codes: [0],
            time: true,
        },
    ],
};
