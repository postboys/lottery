import { CronJob } from "cron";
import DLT from "./dlt";

const dlt = new DLT();

const sync = () => {
    const dltJob = new CronJob("*/5 * * * *", async () => {
        const success = await dlt.syncLatest();

        if (success) {
            dltJob.stop()?.catch((error: unknown) => {
                console.log(error);
            });
        }
    }, null, null, null, null, true);
    dltJob.start();
};

sync();

// dlt.syncHistory().catch((e: unknown) => {
//     console.log(e);
// });
