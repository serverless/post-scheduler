const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

/* check if user is collaborator in github project */
module.exports = function validateUser(userName) {
  const colabURL = `https://api.github.com/repos/${GITHUB_REPO}/collaborators/${userName}`
  var config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
    }
  }
  if (GITHUB_API_TOKEN) {
    config.headers['Authorization'] = `token ${GITHUB_API_TOKEN}`
  }

  return axios.get(colabURL, config).then(function(response) {
    console.log('axios came back successfully')
    if (response.headers.status === '204 No Content') {
      console.log('person is collaborators, allow for scheduling')
      return true
      // save data into dynamo
    }
    console.log('person is not authed to schedule content')
    return false
  });
}
