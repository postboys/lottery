const axios = require("axios");
const { executeQuery } = require("./mysql");
const { isLotteryDay, isToday } = require("./util");

class DLT {
  async sync() {
    if (!isLotteryDay(new Date())) {
      console.log("今天不是大乐透开奖日");
      return;
    }

    const persistentData = await this.#findLatestPersistentData();

    if (isToday(persistentData.time)) {
      console.log("今日数据已同步");
      return;
    }

    const latestData = await this.#getLatestData();

    if (!isToday(latestData.time)) {
      console.log("服务器返回数据不是今天数据");
      return;
    }

    if (latestData.period === persistentData.period) {
      console.log("今日数据已同步");
      return;
    }

    const { period, result, time, url } = latestData;

    if (!period || !result || !time || !url) {
      console.log("数据不完整");
    }

    await this.#create(period, result, time, url);

    if (process.env.NODE_ENV === "production") {
      await this.#notify(period, url);
    }
    else {
      console.log("消息发送成功");
    }
    console.log("数据同步完成");
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

  async #notify(period, resultUrl) {
    const url = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5eaae123-d524-47c0-a932-3a1e5e850818";
    const data = {
      msgtype: "news",
      news: {
        articles: [{
          title: `大乐透第${period}期已开奖`,
          description: "点击查看开奖详情",
          url: resultUrl,
          picurl: "https://static.sporttery.cn/res_1_0/tcw/upload/202205/logo_dlt.png",
        }],
      },
    };
    await axios.post(url, data);
  }
}

module.exports = new DLT();
