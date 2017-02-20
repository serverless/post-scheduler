const awsSDK = require('aws-sdk')
const dynamoDoc = new awsSDK.DynamoDB.DocumentClient()
const SCHEDULED_POSTS_TABLE = process.env.SCHEDULED_POSTS_TABLE

module.exports = function saveScheduledPost(post, callback) {
  dynamoDoc.put({
    TableName: SCHEDULED_POSTS_TABLE,
    Item: post
  }, function(err, data) {
    if (err) {
      console.log('DB PUT Error', err)
      return callback(err)
    }
    return callback(err, data)
  })
}
