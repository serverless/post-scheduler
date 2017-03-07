const axios = require('axios')
const config = require('./axios-config')
const GITHUB_REPO = process.env.GITHUB_REPO

module.exports = function mergePullRequest(sha) {
  const mergeAPI = `https://api.github.com/repos/${GITHUB_REPO}/merges`
  return axios.post(mergeAPI, {
    "base": "master",
    "head": sha,
    "commit_message": "publishing scheduled blog post"
  }, config).then(function(response) {
    // console.log('post response', response)

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
