const { CronJob } = require("cron");
const dlt = require("./dlt");

const dltJob = new CronJob("*/5 * * * *", async () => {
    const success = await dlt.syncLatest();

    if (success) {
        dltJob.stop();
    }
}, null, null, null, null, true);

dltJob.start();

// dlt.syncHistory();
