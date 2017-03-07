const postGithubComment = require('./github/postGithubComment')
const validateUser = require('./github/validateUser')
const deleteItem = require('./dynamo/deleteItem')
const messages = require('./utils/messages')
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

/**
 * Function triggered when scheduled comments are deleted from github UI
 */
module.exports = function cancelScheduledPost (userName, issueNumber) {
  return validateUser(userName).then((userIsCollaborator) => {
    if (!userIsCollaborator) {
      return new Error('[401] ${userName} not authorized to unschedule posts.')
    }
    return deleteItem(SCHEDULED_POSTS_TABLE, issueNumber).then(() => {
      // post comment back to github
      return postGithubComment(issueNumber, messages.removedMsg()).then(() => {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'success. post unscheduled',
          })
        }
      })
    })
  })
}
