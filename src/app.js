const { CronJob } = require("cron");
const dlt = require("./dlt");

const dltJob = new CronJob("*/5 * * * *", async () => {
  const success = await dlt.sync();

  // 执行成功，或到了第二天就停止同步
  if (success) {
    dltJob.stop();
  }
});

dltJob.start();
