const awsSDK = require('aws-sdk')
const moment = require('moment-timezone')
const axios = require('axios')
const messages = require('./messages')
const scanTable = require('./dynamo/scanTable')
const deleteItem = require('./dynamo/deleteItem')
const postComment = require('./github/postGithubComment')
const mergePullRequest = require('./github/mergePullRequest')
const dynamoDoc = new awsSDK.DynamoDB.DocumentClient()
const TIMEZONE = process.env.TIMEZONE
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

module.exports = (event, context, callback) => {

  scanTable(SCHEDULED_POSTS_TABLE).then((data) => {
    const timeNow = moment()
    // Format for timezone
    const timeNowAdjusted = moment.tz(timeNow, "MM-DD-YYYY h:mm A", TIMEZONE)
    const timeNowAdjustedUnix = timeNowAdjusted.unix()

    data.Items.forEach((post) => {
      if (post.time < timeNowAdjustedUnix) { // time to publish
        console.log('Publish', post.number)
        mergePullRequest(post).then(() => {
          console.log('merged, remove from database')
          deleteItem(SCHEDULED_POSTS_TABLE, post.number).then(() => {
            console.log('DELETE POST Success')
          }).then(() => {
            console.log('DELETE Branch')
            // Check for branch https://developer.github.com/v3/git/refs/#delete-a-reference
            // GET https://api.github.com/repos/serverless/blog/git/refs/heads/branch-name
            // check if exists and is not an array
            // if branch exists delete it
            // DELETE https://api.github.com/repos/serverless/blog/git/refs/heads/test-branch
            // then post comment
            postComment(post.number, messages.publishedMsg()).then(() => {
              console.log(`${post.number} published`)
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
