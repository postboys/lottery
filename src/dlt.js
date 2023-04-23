const axios = require('axios')
const { executeQuery } = require('./mysql')
const tencentcloud = require('./tencent.cloud')

class DLT {
  async sync () {
    const { drawPdfUrl, lotteryDrawNum, lotteryDrawResult, lotteryDrawTime } = await this.#getLotteryData()
    const data = await this.findByPeriod(lotteryDrawNum)

    if (data) {
      // 防止多次触发
      await this.#setRetryTriggerStatus(false)
      return
    }

    const period = lotteryDrawNum
    const result = lotteryDrawResult
    const time = lotteryDrawTime
    const url = drawPdfUrl

    if (!period || !result || !time || !url) {
      await this.#setRetryTriggerStatus(true)
      return
    }

    await this.create(period, result, time, url)
    await this.#notify(period, url)
    await this.#setRetryTriggerStatus(false)
  }

  async findByPeriod (period) {
    const query = 'SELECT * FROM dlt WHERE period = ?'
    const result = await executeQuery(query, [period])
    return result[0] ?? null
  }

  async create (period, result, time, url) {
    const query = 'INSERT INTO dlt (period, result, time, url) VALUES (?, ?, ?, ?)'
    await executeQuery(query, [period, result, time, url])
  }

  async #getLotteryData () {
    const url = 'https://webapi.sporttery.cn/gateway/lottery/getDigitalDrawInfoV1.qry?param=85,0&isVerify=1'
    const { data: { value: { dlt } } } = await axios.get(url)
    return dlt
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
