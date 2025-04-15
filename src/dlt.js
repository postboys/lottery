const axios = require("axios");
const { executeQuery } = require("./mysql");
const { isLotteryDay, isToday } = require("./util");

class DLT {
    async syncLatest() {
        if (!isLotteryDay(new Date())) {
            console.log("今天不是大乐透开奖日");
            return true;
        }

        const persistentData = await this.#findLatestPersistentData();

        if (isToday(persistentData.time)) {
            console.log("今日数据已同步");
            return true;
        }

        const latestData = await this.#getLatestData();

        if (!isToday(latestData.time)) {
            console.log("服务器返回数据不是今天数据");
            return false;
        }

        const { period, result, time, url } = latestData;

        if (!period || !result || !time || !url) {
            console.log("数据不完整");
            return false;
        }

        await this.#create(period, result, time, url);

        if (process.env.NODE_ENV === "production") {
            await this.#notify(period, url);
        }
        else {
            console.log("消息发送成功");
        }
        console.log("数据同步完成");
        return true;
    }

    async syncHistory() {
        const list = await this.#getHistoryList();
        for (const item of list) {
            await this.#create(item.period, item.result, item.time, item.url);
            console.log(`同步历史数据: ${item.period}`);
        }
    }

    async #findLatestPersistentData() {
        const query = "SELECT * FROM dlt ORDER BY period DESC LIMIT 1";
        const result = await executeQuery(query);
        return result[0] ?? null;
    }

    async #create(period, result, time, url) {
        const query = "INSERT INTO dlt (period, result, time, url) VALUES (?, ?, ?, ?)";
        await executeQuery(query, [period, result, time, url]);
    }

    async #getLatestData() {
        const url = "https://webapi.sporttery.cn/gateway/lottery/getDigitalDrawInfoV1.qry?param=85,0&isVerify=1";
        const { data: { value: { dlt } } } = await axios.get(url);
        return {
            period: dlt.lotteryDrawNum,
            result: dlt.lotteryDrawResult,
            time: new Date(dlt.lotteryDrawTime),
            url: dlt.drawPdfUrl,
        };
    }

    async #getHistoryList() {
        const url = "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=30&isVerify=1&pageNo=1";
        const { data: { value: { list } } } = await axios.get(url);

        return list.map((item) => {
            return {
                period: item.lotteryDrawNum,
                result: item.lotteryDrawResult,
                time: new Date(item.lotteryDrawTime),
                url: item.drawPdfUrl,
            };
        });
    }

    async #notify(period, resultUrl) {
        const url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5eaae123-d524-47c0-a932-3a1e5e850818";
        const data = {
            msgtype: "news",
            news: {
                articles: [
                    {
                        description: "点击查看开奖详情",
                        picurl: "https://static.sporttery.cn/res_1_0/tcw/upload/202205/logo_dlt.png",
                        title: `大乐透第${period}期已开奖`,
                        url: resultUrl,
                    },
                ],
            },
        };
        await axios.post(url, data);
    }
}

module.exports = new DLT();
