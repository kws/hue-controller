const path = require('path')

module.exports = {
  hostname: process.env.HUE_HOSTNAME || '<bridge IP here>',
  username: process.env.HUE_USERNAME || '<your access token here>',

  configFile: process.env.CONFIG_FILE || path.join(__dirname,'../settings/config.yml'),
  schedulesFile: process.env.CONFIG_FILE || path.join(__dirname,'../settings/schedules.yml')

}