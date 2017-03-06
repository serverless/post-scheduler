const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = function mergePullRequest(post) {
  console.log('run merge')
  // /repos/:owner/:repo/merges
  const mergeAPI = `https://api.github.com/repos/${GITHUB_REPO}/merges`
  const config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
      'Authorization': `token ${GITHUB_API_TOKEN}`
    }
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
