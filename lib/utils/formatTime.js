const moment = require('moment-timezone')
const TIMEZONE = process.env.TIMEZONE

function localizeTime(time) {
  return moment.tz(time, "MM-DD-YYYY h:mm A", TIMEZONE)
}

module.exports = function getUnixTimestamp(time) {
  const timeLocalized = localizeTime(time)
  return timeLocalized.unix()
}
