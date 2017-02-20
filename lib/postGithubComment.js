const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = function postGithubComment(number, message) {
  // /repos/:owner/:repo/issues/:number/comments
  const commentAPI = `https://api.github.com/repos/${GITHUB_REPO}/issues/${number}/comments`
  var config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
    }
  }
  if (GITHUB_API_TOKEN) {
    config.headers['Authorization'] = `token ${GITHUB_API_TOKEN}`
  }

  return axios.post(commentAPI, {
    "body": message,
  }, config).then(function(response) {
    console.log('post response', response)
    return response
  });
}
