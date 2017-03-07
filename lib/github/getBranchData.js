const axios = require('axios')
const config = require('./axios-config')
const GITHUB_REPO = process.env.GITHUB_REPO

module.exports = function getBranchData(branchName) {
  console.log('get branch data')
  const url = `https://api.github.com/repos/${GITHUB_REPO}/git/refs/heads/${branchName}`

  return axios.get(url, config).then(function(response) {
    return response.data
  });
}
