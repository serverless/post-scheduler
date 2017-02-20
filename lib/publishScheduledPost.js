const awsSDK = require('aws-sdk')
const moment = require('moment')
const axios = require('axios')
const postComment = require('./postGithubComment')
const dynamoDoc = new awsSDK.DynamoDB.DocumentClient()
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = (event, context, callback) => {
  dynamoDoc.scan({
    TableName: SCHEDULED_POSTS_TABLE,
  }, function(err, data) {
    if (err) {
      return callback(err)
    }

    var now = moment().unix();
    console.log('now unix', now)
    // then check items
    if (data.Items) {
      console.log('data.Items', data.Items)
    }

    data.Items.forEach((post) => {
      if (post.time < now) {
        console.log('post.time < now')
        // time to publish
        // remove from DB and merge
        mergePost(post).then((response) => {
          console.log('merged, remove from database', response)
          deletePost(post.number).then(() => {
            console.log('DELETE POST')
          }).then(() => {
            console.log('DELETE Branch')
            // https://developer.github.com/v3/git/refs/#delete-a-reference
            const msg = 'Your post was just published'
            postComment(post.number, msg).then(() => {
              console.log('added automatic message back to github')
              // return callback(null, {
              //   statusCode: 200,
              //   body: JSON.stringify({
              //     message: 'success',
              //   })
              // })
            })
          })
        })
      }
      // else skip
    })

    return callback(err, {
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
  })
}


function mergePost(post) {
  console.log('run merge')
  // /repos/:owner/:repo/merges
  const mergeAPI = `https://api.github.com/repos/${GITHUB_REPO}/merges`
  var config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
    }
  }
  if (GITHUB_API_TOKEN) {
    config.headers['Authorization'] = `token ${GITHUB_API_TOKEN}`
  }
  console.log('post.sha', post.sha)
  return axios.post(mergeAPI, {
    "base": "master",
    "head": post.sha,
    "commit_message": "publishing scheduled blog post"
  }, config).then(function(response) {
    console.log('post response', response)

    if (response.status === 204) {
      console.log('Branch already merged')
    }

    if (response.status === 409) {
      console.log('Merge Conflict, cannot publish post')
    }

    if (response.status === 404) {
      console.log('Missing head or base, cannot publish post')
    }

    return response
  }).catch((e) => {
    console.log(e)
  });
}


function deletePost(number) {
  var dynamoDeletePromise = dynamoDoc.delete({
    TableName: SCHEDULED_POSTS_TABLE,
    Key: {
      number: number
    },
  }).promise();

  return dynamoDeletePromise.then((data) => {
    console.log('Success');
    return data
  }).catch((err) => {
    console.log(err);
  });
}
