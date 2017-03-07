const axios = require('axios')
const config = require('./axios-config')
const GITHUB_REPO = process.env.GITHUB_REPO

module.exports = function deleteBranch(branchName) {
  console.log('do branch delete')
  const url = `https://api.github.com/repos/${GITHUB_REPO}/git/refs/heads/${branchName}`

  return axios.delete(url, config).then(function(response) {
    return response.data
  })
}
