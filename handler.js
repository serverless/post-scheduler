const publishScheduledPost = require('./lib/publishScheduledPost')
const githubWebhookListener = require('./lib/webhookListener')

/* Function that listens for github webhook events */
module.exports.githubWebhookListener = githubWebhookListener

/* Function runs every hour and published any scheduled posts */
module.exports.publishScheduledPost = publishScheduledPost
