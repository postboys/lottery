const { scf } = require('tencentcloud-sdk-nodejs')

class TencentCloud {
  constructor () {
    const credential = {
      secretId: process.env.TENCENT_CLOUD_SECRET_ID,
      secretKey: process.env.TENCENT_CLOUD_SECRET_KEY
    }
    const config = { credential, region: 'ap-beijing' }
    const scfClient = new scf.v20180416.Client(config)

    this.scfUpdateTriggerStatus = scfClient.UpdateTriggerStatus.bind(scfClient)
  }
}

module.exports = new TencentCloud()
