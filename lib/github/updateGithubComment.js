const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = function updateGithubComment(commentID, message) {
  // /repos/:owner/:repo/issues/comments/:id
  const commentAPI = `https://api.github.com/repos/${GITHUB_REPO}/issues/comments/${commentID}`
  console.log('DO COMMENT PATCH', commentAPI)
  var config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
    }
  }
  if (GITHUB_API_TOKEN) {
    config.headers['Authorization'] = `token ${GITHUB_API_TOKEN}`
  }

  return axios.patch(commentAPI, {
    "body": message,
  }, config).then(function(response) {
    console.log('patch response', response)
    return response
  });
}
