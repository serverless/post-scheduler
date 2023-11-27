const axios = require('axios')
const GITHUB_REPO = process.env.GITHUB_REPO
var config = require('./axios-config')

/* check if user is collaborator in github project */
module.exports = function validateUser(userName) {
  console.log(`checking if ${userName} is a collaborator in ${GITHUB_REPO}`)
  const url = `https://api.github.com/repos/${GITHUB_REPO}/collaborators/${userName}`

  // Set axios to not reject 400 responses
  config.validateStatus = function (status) {
    return status >= 200 && status < 500
  }

  return axios.get(url, config).then(function(response) {
    if (response.status === 204) {
      console.log(`${userName} is a collaborator, allow for scheduling`)
      return Promise.resolve(true)
    }
    console.log(`${userName} is not a repo a collaborator and is not authorized to schedule content`)
    return Promise.resolve(false)
  }).catch((error) => {
    console.log(error)
  })
}
