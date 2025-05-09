import { CronJob } from "cron";
import config from "./config";
import DLTService from "./dlt.service";

const dltCronTime = `${config.dlt.drawMinute.toString()} ${config.dlt.drawHour.toString()} * * ${config.dlt.drawDay.join(",")}`;
const dltJob = new CronJob(dltCronTime, async () => {
    await new DLTService().sync();

    console.log(`Next DLT draw scheduled at ${dltJob.nextDate().toString()}`);
}, null, null, undefined, undefined, true);

dltJob.start();
