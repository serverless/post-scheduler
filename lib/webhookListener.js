const validateGithubWebhook = require('./github/validateGithubWebhook')
const validateUser = require('./github/validateUser')
const getPullRequestData = require('./github/getPullRequestData')
const postGithubComment = require('./github/postGithubComment')
const putItem = require('./dynamo/putItem')
const cancelScheduledPost = require('./cancelScheduledPost')
const getUnixTimestamp = require('./utils/formatTime')
const messages = require('./utils/messages')
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

module.exports = (event, context, callback) => {
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

    /* Handle schedule cancellation! */
    if (event.headers['X-GitHub-Event'] === 'issue_comment' && body.action === 'deleted') {
      return cancelScheduledPost(userName, issueNumber).then((response) => {
        console.log(`Post ${issueNumber} has been unscheduled`)
        return callback(response)
      }).catch((e) => {
        console.log(e)
        return callback(e)
      })
    }

    /* Schedule the Post! */
    const time = isScheduled[0].replace('schedule(', '').replace(')', '')
    const unixTime = getUnixTimestamp(time.toUpperCase())
    if (!unixTime || isNaN(unixTime)) {
      return callback(new Error(`[401] Date format incorrect. Must match format: schedule(mm/dd/yyyy h:mm A). Example: schedule(03/01/2017 at 7:00pm)`))
    }
    // check if userName is a github collaborator & able to schedule posts
    validateUser(userName).then((userIsCollaborator) => {
      if (!userIsCollaborator) {
        console.log('post not authed message')
        return postGithubComment(issueNumber, messages.notAuthorizedMsg(userName)).then(() => {
          return callback(new Error('[401] ${userName} not authorized to schedule posts. They must be a Collaborator'))
        })
      }
      getPullRequestData(issueNumber).then((response) => {
        return {
          number: issueNumber,
          title: issueTitle,
          time: unixTime,
          sha: response.head.sha,
          branchName: response.head.ref,
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
