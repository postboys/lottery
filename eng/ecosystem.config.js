const secrets = JSON.parse(process.env.SECRETS ?? null);

module.exports = {
    apps: [
        {
            name: process.env.APP_ENV,
            script: "lib/main.js",
            env: { ...secrets },

            cron_restart: "00 22 * * 1,3,6",
            stop_exit_codes: [0],
            time: true,
        },
    ],
};
