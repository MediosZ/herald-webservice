const qiniu = require('qiniu')
const config = require('./sdk.json')
const crypto = require('crypto')

exports.getUptoken = () => {
  let { access, secret, bucket } = config.qiniu
  let key = new Buffer(crypto.randomBytes(16)).toString('hex')
  let mac = new qiniu.auth.digest.Mac(access, secret)
  let uptoken = new qiniu.rs.PutPolicy({
    scope: bucket + ':' + key,
    saveKey: key,
    returnBody: `{"url":"http://static.myseu.cn/${key}"}`
  }).uploadToken(mac)

  return uptoken
}
