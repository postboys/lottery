const dlt = require('./dlt')

const start = async () => {
  await dlt.sync()
  console.log('Done')
}

if (process.env.NODE_ENV === 'development') {
  start()
}

exports.start = start
