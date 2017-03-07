const crypto = require('crypto')
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

module.exports = function validateGithubWebhook(event) {
  const calculatedSignature = signRequestBody(GITHUB_WEBHOOK_SECRET, event.body)
  const signature = event.headers['X-Hub-Signature']
  const githubEvent = event.headers['X-GitHub-Event']
  const deliveryId = event.headers['X-GitHub-Delivery']

  // Validate webtoken exists
  if (!GITHUB_WEBHOOK_SECRET || typeof GITHUB_WEBHOOK_SECRET !== 'string') {
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
  if (!deliveryId) {
    return new Error('[401] No X-Github-Delivery found on request')
  }

  // Validate webhook secret from Github
  if (signature !== calculatedSignature) {
    return new Error('[401] X-Hub-Signature incorrect. Github webhook token doesn\'t match')
  }

  return true
}
