const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

/* check if user is collaborator in github project */
module.exports = function validateUser(userName) {
  const colabURL = `https://api.github.com/repos/${GITHUB_REPO}/collaborators/${userName}`
  const config = {
    'headers': {
      'User-Agent': GITHUB_USERNAME,
      'Authorization': `token ${GITHUB_API_TOKEN}`
    },
    // allow 400 errors from github for axios
    validateStatus: function (status) {
      return status >= 200 && status < 500
    }
  }

  return axios.get(colabURL, config).then(function(response) {
    console.log('axios came back successfully')
    if (response && response.headers && response.headers.status === '204 No Content') {
      console.log(`${userName} is a collaborator, allow for scheduling`)
      return Promise.resolve(true)
    }
    console.log(`${userName} is not a repo a collaborator and is not authorized to schedule content`)
    return Promise.resolve(false)
  }).catch(function (error) {
    console.log(error)
  })
}
