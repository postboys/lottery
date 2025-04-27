import AxiosFactory from "axios";
import { executeQuery } from "./mysql";
import { isLotteryDay, isToday } from "./util";

const axios = AxiosFactory.create({ baseURL: "https://webapi.sporttery.cn/gateway/lottery" });
export interface DLTData {
    period: string;
    result: string;
    time: Date;
    url: string;
}

export default class DLT {
    async syncLatest() {
        if (!isLotteryDay(new Date())) {
            console.log("今天不是大乐透开奖日");
            return true;
        }

        const existsData = await this.#findLatestExistsData();

        if (existsData && isToday(existsData.time)) {
            console.log("今日数据已同步");
            return true;
        }

        const latestData = await this.#getLatestData();

        const { period, result, time, url } = latestData;

        if (!period || !result || !time || !url) {
            console.log("数据不完整");
            return false;
        }

        if (!isToday(time)) {
            console.log("服务器返回数据不是今天数据");
            return false;
        }

        const data = { period, result, time, url };
        await this.#create(data);

        if (process.env.NODE_ENV === "production") {
            await this.#notify(data);
            console.log("消息发送成功");
        }
        else {
            console.log("跳过消息发送");
        }
        console.log("数据同步完成");
        return true;
    }

    async syncHistory() {
        const list = await this.#getHistoryList();
        for (const item of list) {
            await this.#create(item);
            console.log(`同步历史数据: ${item.period}`);
        }
    }

    async #findLatestExistsData() {
        const query = "SELECT * FROM dlt ORDER BY period DESC LIMIT 1";
        const result = await executeQuery<DLTData[]>(query);
        return result.at(0);
    }

    async #create(dlt: DLTData) {
        const query = "INSERT INTO dlt (period, result, time, url) VALUES (?, ?, ?, ?)";
        await executeQuery(query, [dlt.period, dlt.result, dlt.time, dlt.url]);
    }

    async #getLatestData() {
        const { data: { value: { dlt } } } = await axios.get<{
            value: {
                dlt: {
                    lotteryDrawNum?: string;
                    lotteryDrawResult?: string;
                    lotteryDrawTime?: string;
                    drawPdfUrl?: string;
                };
            };
        }>("getDigitalDrawInfoV1.qry?param=85,0&isVerify=1");
        return {
            period: dlt.lotteryDrawNum,
            result: dlt.lotteryDrawResult,
            time: dlt.lotteryDrawTime ? new Date(dlt.lotteryDrawTime) : null,
            url: dlt.drawPdfUrl,
        };
    }

    async #getHistoryList() {
        const { data: { value: { list } } } = await axios.get<{
            value: {
                list: {
                    lotteryDrawNum: string;
                    lotteryDrawResult: string;
                    lotteryDrawTime: string;
                    drawPdfUrl: string;
                }[];
            };
        }>("getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=30&isVerify=1&pageNo=1");

        return list.map((item) => {
            return {
                period: item.lotteryDrawNum,
                result: item.lotteryDrawResult,
                time: new Date(item.lotteryDrawTime),
                url: item.drawPdfUrl,
            };
        });
    }

    async #notify(dlt: DLTData) {
        const url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5eaae123-d524-47c0-a932-3a1e5e850818";
        const data = {
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
        await axios.post(url, data);
    }
}
