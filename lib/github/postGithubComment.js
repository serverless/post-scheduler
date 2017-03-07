const axios = require('axios')
const config = require('./axios-config')
const GITHUB_REPO = process.env.GITHUB_REPO

module.exports = function postGithubComment(number, message) {
  /* /repos/:owner/:repo/issues/:number/comments */
  const commentAPI = `https://api.github.com/repos/${GITHUB_REPO}/issues/${number}/comments`
  return axios.post(commentAPI, {
    "body": message,
  }, config).then(function(response) {
    return response
  });
}
