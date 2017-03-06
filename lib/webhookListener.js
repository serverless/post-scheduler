const axios = require('axios')
const moment = require('moment-timezone')
const validateGithubWebhook = require('./github/validateGithubWebhook')
const validateUser = require('./github/validateUser')
const getPullRequestData = require('./github/getPullRequestData')
const postGithubComment = require('./github/postGithubComment')
const putItem = require('./dynamo/putItem')
const cancelScheduledPost = require('./cancelScheduledPost')
const messages = require('./messages')
const TIMEZONE = process.env.TIMEZONE
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

module.exports = (event, context, callback) => {
  var errMsg
  const body = JSON.parse(event.body)

  const isValidRequest = validateGithubWebhook(event)
  if (isValidRequest instanceof Error) {
    console.log(`Validation Error:`, isValidRequest)
    return callback(isValidRequest)
  }

  // Return early on Github 'ping' events for webhook test
  if (body.action === 'ping') {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        pong: true,
      })
    })
  }

  // Check if it's a PR or Issue
  const isPullRequest = body.pull_request || body.issue && body.issue.pull_request
  if (!body.issue && !isPullRequest) {
    // Exiting early event not an issue or PR
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: 'event is not an Issue or PR',
      })
    })
  }

  // Check for scheduled message
  if (body.comment && body.comment.body && body.comment.body.match(/schedule\((\d\d.*)\)/g)) {
    const isScheduled = body.comment.body.match(/schedule\((\d\d.*)\)/g)
    const issueTitle = body.issue.title
    const issueNumber = body.issue.number
    const userId = body.comment.user.id
    const userName = body.comment.user.login

    if (event.headers['X-GitHub-Event'] === 'issue_comment' && body.action === 'deleted') {
      /* Handle schedule cancellation! */
      return cancelScheduledPost(userName, issueNumber).then((response) => {
        console.log(`Post ${issueNumber} has been unscheduled`)
        return callback(response)
      }).catch((e) => {
        console.log(e)
        return callback(e)
      })
    }

    // Handle scheduling post
    const time = isScheduled[0].replace('schedule(', '').replace(')', '')
    // format Time to match timezone
    const timeLocalized = moment.tz(time.toUpperCase(), "MM-DD-YYYY h:mm A", TIMEZONE)
    const unixTime = timeLocalized.unix()

    if (!unixTime || isNaN(unixTime)) {
      errMsg = `[401] Date format incorrect. Must match format: schedule(mm/dd/yyyy h:mm A). Example: schedule(03/01/2017 at 7:00pm)`
      return callback(new Error(errMsg))
    }

    /* Schedule the Post! */

    // check if userName is a collaborators and able to schedule posts
    validateUser(userName).then((userIsCollaborator) => {
      if (!userIsCollaborator) {
        errMsg = '[401] ${userName} not authorized to schedule posts. They must be a Collaborator'
        console.log(errMsg)
        return callback(new Error(errMsg))
      }
      getPullRequestData(body.issue.pull_request.url).then((response) => {
        return {
          number: issueNumber,
          title: issueTitle,
          time: unixTime,
          sha: response.head.sha,
          userName: userName,
          userId: userId,
        }
      }).then((item) => {
        console.log('Save scheduled item in Dynamo', item)
        putItem(SCHEDULED_POSTS_TABLE, item).then(() => {
          const msg = messages.scheduledMsg(time, body.comment.html_url)
          postGithubComment(issueNumber, msg).then(() => {
            return callback(null, {
               statusCode: 200,
               body: JSON.stringify({
                 message: 'success',
               })
            })
          })
        })
      })
    }).catch((e) => {
      return callback(e)
    })
  }

  console.log('No schedule requested')
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Not a schedule request. No schedule(mm/dd/yyyy h:mm A) message found',
    })
  })
}
