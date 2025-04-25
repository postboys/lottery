module.exports = {
    apps: [
        {
            name: process.env.APP_ENV,
            scripts: "lib/main.js",

            cron_restart: "00 22 * * 1,3,6",
            stop_exit_codes: [0],
            time: true,
        },
    ],
};
