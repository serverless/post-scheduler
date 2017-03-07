const moment = require('moment-timezone')
const scanTable = require('./dynamo/scanTable')
const deleteItem = require('./dynamo/deleteItem')
const getLastestSHA = require('./github/getLatestSHA')
const postComment = require('./github/postGithubComment')
const mergePullRequest = require('./github/mergePullRequest')
const getBranchData = require('./github/getBranchData')
const deleteBranch = require('./github/deleteBranch')
const messages = require('./utils/messages')
const getUnixTimestamp = require('./utils/formatTime')
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

module.exports = (event, context, callback) => {
  // Grab scheduled items from dynamo
  scanTable(SCHEDULED_POSTS_TABLE).then((data) => {
    const timeNow = moment()
    const unixTime = getUnixTimestamp(timeNow)

    data.Items.forEach((post) => {
      if (post.time < unixTime) {
        console.log(`Time to publish: #${post.number} - ${post.title}`)

        // Get latest commit from the PR and use it's SHA
        getLastestSHA(post.number)
        .then(mergePullRequest)
        .then(() => {
          // merged, delete from dynamo
          deleteItem(SCHEDULED_POSTS_TABLE, post.number).then(() => {
            return post.branchName
          })
          .then(getBranchData)
          .then((branchData) => {
            // Make sure ref is singular for deletion
            if (!Array.isArray(branchData)) {
              // If internal branch, delete branch
              deleteBranch(post.branchName).then(() => {
                console.log('branch is deleted')
              })
            }
          }).then(() => {
            postComment(post.number, messages.publishedMsg()).then(() => {
              console.log(`Publish successful. #${post.number} - ${post.title}`)
            })
          })
        })
      }
    })

    // Return items for future use in UI
    return callback(null, {
      headers: {
         // Required for CORS support to work
        "Access-Control-Allow-Origin" : "*",
        // Required for cookies, authorization headers with HTTPS
        "Access-Control-Allow-Credentials" : true
      },
      statusCode: 200,
      body: JSON.stringify({
        items: data.Items,
      })
    })

  }).catch((e) => {
    return callback(e)
  })
}
