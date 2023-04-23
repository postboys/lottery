const axios = require('axios')
const { executeQuery } = require('./mysql')
const tencentcloud = require('./tencent.cloud')

const isToday = (date) => {
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
}

const isNotLotteryDay = (date) => {
  const day = date.getDay()
  return day !== 1 && day !== 3 && day !== 6
}

class DLT {
  async sync () {
    if (isNotLotteryDay(new Date())) {
      return this.#setRetryTriggerStatus(false)
    }

    const [latestData, persistentData] = await Promise.all([
      this.#getLatestData(),
      this.#findLatestPersistentData()
    ])

    if (!isToday(latestData.time)) {
      return this.#setRetryTriggerStatus(true)
    }

    if (latestData.period === persistentData.period) {
      return this.#setRetryTriggerStatus(false)
    }

    const { period, result, time, url } = latestData

    if (!period || !result || !time || !url) {
      return this.#setRetryTriggerStatus(true)
    }

    await this.#create(period, result, time, url)
    await this.#notify(period, url)
    await this.#setRetryTriggerStatus(false)
  }

  async #findLatestPersistentData () {
    const query = 'SELECT * FROM dlt ORDER BY period DESC LIMIT 1'
    const result = await executeQuery(query)
    return result[0] ?? null
  }

  async #create (period, result, time, url) {
    const query = 'INSERT INTO dlt (period, result, time, url) VALUES (?, ?, ?, ?)'
    await executeQuery(query, [period, result, time, url])
  }

  async #getLatestData () {
    const url = 'https://webapi.sporttery.cn/gateway/lottery/getDigitalDrawInfoV1.qry?param=85,0&isVerify=1'
    const { data: { value: { dlt } } } = await axios.get(url)
    return {
      period: dlt.lotteryDrawNum,
      result: dlt.lotteryDrawResult,
      time: new Date(dlt.lotteryDrawTime),
      url: dlt.drawPdfUrl
    }
  }

  async #notify (period, resultUrl) {
    const url = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=5eaae123-d524-47c0-a932-3a1e5e850818'
    const data = {
      msgtype: 'news',
      news: {
        articles: [{
          title: `大乐透第${period}期已开奖`,
          description: '点击查看开奖详情',
          url: resultUrl,
          picurl: 'https://static.sporttery.cn/res_1_0/tcw/upload/202205/logo_dlt.png'
        }]
      }
    }
    await axios.post(url, data)
  }

  async #setRetryTriggerStatus (enable) {
    const params = {
      Enable: enable ? 'OPEN' : 'CLOSE',
      FunctionName: 'lottery',
      TriggerName: 'dlt-retry',
      Type: 'timer',
      Qualifier: '$DEFAULT',
      Namespace: 'chore'
    }
    await tencentcloud.scfUpdateTriggerStatus(params)
  }
}

module.exports = new DLT()
