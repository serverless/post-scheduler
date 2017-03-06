const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = function getPullRequestData(url) {
  var config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
    }
  }
  if (GITHUB_API_TOKEN) {
    config.headers['Authorization'] = `token ${GITHUB_API_TOKEN}`
  }

  return axios.get(url, config).then(function(response) {
    return response.data
  });
}
