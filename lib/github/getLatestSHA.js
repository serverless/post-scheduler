const axios = require('axios')
const config = require('./axios-config')
const GITHUB_REPO = process.env.GITHUB_REPO

module.exports = function getLastestSHA(number) {
  // const url = `https://api.github.com/repos/serverless/blog/pulls/98/commits`
  const url = `https://api.github.com/repos/${GITHUB_REPO}/pulls/${number}/commits`
  return axios.get(url, config).then(function(response) {
    // get latest commit
    const lastestCommit = response.data[response.data.length - 1]
    // This only gets 250 commits. TODO make recursive
    console.log('lastestCommit.sha', lastestCommit.sha)
    return lastestCommit.sha
  }).catch((e) => {
    console.log(e)
  })
}
