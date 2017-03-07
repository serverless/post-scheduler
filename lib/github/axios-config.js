/* Github Request headers for axios */
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'serverlessbot-2'

module.exports = {
  'headers': {
    'User-Agent': GITHUB_USERNAME,
    'Authorization': `token ${GITHUB_API_TOKEN}`
  }
}
