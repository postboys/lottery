import AxiosFactory from "axios";
import { setTimeout } from "timers/promises";
import config from "./config";
import { executeQuery } from "./mysql";
import { DLTData, DLTEntity, ILotteryService } from "./types";
import { isToday, notify } from "./util";

export default class DLTService implements ILotteryService {
    private http = AxiosFactory.create({ baseURL: "https://webapi.sporttery.cn/gateway/lottery" });

    async sync(): Promise<DLTEntity | null> {
        if (config.dlt.isDrawDateTime()) {
            const data = await this.#getLatestData();

            if (isToday(data.time)) {
                await this.#create(data);
                await this.#sendNotification(data);
                console.log("大乐透开奖数据已更新", data.period, data.result, data.time.toLocaleDateString());
                return data;
            }
            else {
                console.log("开奖数据不在今天内", data.time.toLocaleDateString());
                await setTimeout(config.dlt.checkInterval);
                return this.sync();
            }
        }

        console.log("当前时间不在开奖时间内");
        return null;
    }

    async syncHistory(periods = 15): Promise<DLTEntity[]> {
        const records = await this.#getHistoryData(periods);

        for (const item of records) {
            await this.#create(item);
        }

        return records;
    }

    async check(numbers: number[], fromPeriod?: number) {
        let sql = "SELECT * FROM dlt";

        if (fromPeriod) {
            sql += ` WHERE period >= '${fromPeriod.toString()}'`;
        }

        sql += " ORDER BY period DESC LIMIT 15";

        const data = await executeQuery<DLTEntity[]>(sql);
        const arr1 = numbers.slice(0, 5).map(v => v.toString().padStart(2, "0"));
        const arr2 = numbers.slice(5).map(v => v.toString().padStart(2, "0"));

        for (const item of data) {
            const result = item.result.split(" ");
            const arr3 = result.slice(0, 5);
            const arr4 = result.slice(5);

            const arr5 = arr1.filter(v => arr3.includes(v));
            const arr6 = arr2.filter(v => arr4.includes(v));

            const rewards = config.dlt.rule[arr6.length]?.[arr5.length];
            if (rewards) {
                console.log(item.time.toLocaleDateString(), item.period, arr5, arr6, rewards);
            }
        }
    }

    async #create(dlt: DLTEntity) {
        const query = "INSERT IGNORE INTO dlt (period, result, time, url) VALUES (?, ?, ?, ?)";
        await executeQuery(query, [dlt.period, dlt.result, dlt.time, dlt.url]);
    }

    async #getLatestData(): Promise<DLTEntity> {
        const url = "getDigitalDrawInfoV1.qry?param=85,0&isVerify=1";
        const result = await this.http.get<{ value: { dlt: DLTData } }>(url);

        return this.#formatDLTData(result.data.value.dlt);
    }

    async #getHistoryData(periods: number) {
        const url = `getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=${periods.toString()}&isVerify=1&pageNo=1`;
        const result = await this.http.get<{ value: { list: DLTData[] } }>(url);

        return result.data.value.list.map(item => this.#formatDLTData(item));
    }

    #formatDLTData(data: DLTData): DLTEntity {
        return {
            period: data.lotteryDrawNum,
            result: data.lotteryDrawResult,
            time: new Date(data.lotteryDrawTime),
            url: data.drawPdfUrl,
        };
    }

    async #sendNotification(dlt: DLTEntity) {
        const message = {
            msgtype: "news",
            news: {
                articles: [
                    {
                        description: "点击查看开奖详情",
                        picurl: "https://static.sporttery.cn/res_1_0/tcw/upload/202205/logo_dlt.png",
                        title: `大乐透第${dlt.period}期已开奖`,
                        url: dlt.url,
                    },
                ],
            },
        };

        await notify(message);
    }
}
