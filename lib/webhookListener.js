const crypto = require('crypto')
const axios = require('axios')
const moment = require('moment')
const validateUser = require('./validateUser')
const getPullRequestData = require('./getPullRequestData')
const saveScheduledPost = require('./saveScheduledPost')
const postGithubComment = require('./postGithubComment')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = (event, context, callback) => {
  var errMsg
  const body = JSON.parse(event.body)
  const headers = event.headers
  const signature = headers['X-Hub-Signature']
  const githubEvent = headers['X-GitHub-Event']
  const id = headers['X-GitHub-Delivery']
  const webhookToken = process.env.GITHUB_WEBHOOK_SECRET
  const calculatedSignature = signRequestBody(webhookToken, event.body)

  // Return early on Github 'ping' events for webhook test
  if (body.action === 'ping') {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        pong: true,
      })
    })
  }

  // Validate webtoken exists
  if (!webhookToken || typeof webhookToken !== 'string') {
    errMsg = '[401] must provide a \'GITHUB_WEBHOOK_SECRET\' env variable'
    return callback(new Error(errMsg))
  }

  // Validate signed request from Github
  if (!signature) {
    errMsg = '[401] No X-Hub-Signature found on request'
    return callback(new Error(errMsg))
  }

  // Validate event from Github
  if (!githubEvent) {
    errMsg = '[422] No X-Github-Event found on request'
    return callback(new Error(errMsg))
  }

  // Validate delivery id from Github
  if (!id) {
    errMsg = '[401] No X-Github-Delivery found on request'
    return callback(new Error(errMsg))
  }

  if (signature !== calculatedSignature) {
    errMsg = '[401] X-Hub-Signature incorrect. Github webhook token doesn\'t match'
    return callback(new Error(errMsg))
  }

  // Check if it's a PR or Issue
  const isPullRequest = body.pull_request || body.issue && body.issue.pull_request
  if (!body.issue && !isPullRequest) {
    console.log('Exiting early event not an issue or PR', githubEvent)
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'event is not an Issue or PR',
      })
    })
  }

  // Validation success. Begin processing event

  // Check for scheduled message
  if (body.comment && body.issue) {
    const isScheduled = body.comment.body.match(/schedule\((.*)\)/g)
    if (!isScheduled) {
      console.log('Exiting early. No schedule requested')
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Not a schedule request',
        })
      })
    }
    const time = isScheduled[0].replace('schedule(', '').replace(')', '')
    const t = time.toUpperCase()
    const momentObj = moment(t, ["MM-DD-YYYY h:mm A"])
    const unixTime = momentObj.unix()
    const userName = body.comment.user.login
    // console.log('time', time)
    // console.log('post at', momentObj.format("MM-DD-YYYY HH:mm"));
    // console.log('unixTime', unixTime)
    // check if userName is a collaborators and able to schedule posts
    validateUser(userName).then((isAuthed) => {
      console.log('is collllllllab', isAuthed)
      const prAPI= body.issue.pull_request.url

      getPullRequestData(prAPI).then((response) => {
        return {
          number: body.issue.number,
          time: unixTime,
          sha: response.head.sha
        }
      }).then((data) => {
        console.log('save scheduled item in DB', data)

         saveScheduledPost(data, function(err, rt) {
           const msg = `Alrighty! The post is scheduled.`
           postGithubComment(body.issue.number, msg).then(() => {
             console.log('added automatic message back to github')

             return callback(null, {
               statusCode: 200,
               body: JSON.stringify({
                 message: 'success',
               })
             })
           })
         })

      })
    })
  }
}

// Validate webhook secret
function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}
