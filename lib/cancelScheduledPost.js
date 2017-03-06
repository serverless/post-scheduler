const postGithubComment = require('./github/postGithubComment')
const validateUser = require('./github/validateUser')
const deleteItem = require('./dynamo/deleteItem')
const messages = require('./messages')
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

module.exports = function cancelScheduledPost (userName, issueNumber) {

  return validateUser(userName).then((userIsCollaborator) => {
    if (!userIsCollaborator) {
      errMsg = '[401] ${userName} not authorized to unschedule posts.'
      console.log(errMsg)
      return new Error(errMsg)
    }
    return deleteItem(SCHEDULED_POSTS_TABLE, issueNumber).then(() => {
      console.log('new delete')
      // post comment back to github
      return postGithubComment(issueNumber, messages.removedMsg()).then(() => {
        console.log('new post comment from cancel')
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
