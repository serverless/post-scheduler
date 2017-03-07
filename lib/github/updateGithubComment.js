const axios = require('axios')
const config = require('./axios-config')
const GITHUB_REPO = process.env.GITHUB_REPO

module.exports = function updateGithubComment(commentID, message) {
  /* /repos/:owner/:repo/issues/comments/:id */
  const commentAPI = `https://api.github.com/repos/${GITHUB_REPO}/issues/comments/${commentID}`
  return axios.patch(commentAPI, {
    "body": message,
  }, config).then(function(response) {
    console.log('patch response', response)
    return response
  });
}
