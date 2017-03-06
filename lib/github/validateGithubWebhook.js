const crypto = require('crypto')

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

module.exports = function validateGithubWebhook(event) {
  const webhookToken = process.env.GITHUB_WEBHOOK_SECRET
  const calculatedSignature = signRequestBody(webhookToken, event.body)
  const signature = event.headers['X-Hub-Signature']
  const githubEvent = event.headers['X-GitHub-Event']
  const id = event.headers['X-GitHub-Delivery']

  // Validate webtoken exists
  if (!webhookToken || typeof webhookToken !== 'string') {
    return new Error('[401] must provide a \'GITHUB_WEBHOOK_SECRET\' env variable')
  }

  // Validate signed request from Github
  if (!signature) {
    return new Error('[401] No X-Hub-Signature found on request')
  }

  // Validate event from Github
  if (!githubEvent) {
    return new Error('[422] No X-Github-Event found on request')
  }

  // Validate delivery id from Github
  if (!id) {
    return new Error('[401] No X-Github-Delivery found on request')
  }

  // Validate webhook secret from Github
  if (signature !== calculatedSignature) {
    return new Error('[401] X-Hub-Signature incorrect. Github webhook token doesn\'t match')
  }

  return true
}
