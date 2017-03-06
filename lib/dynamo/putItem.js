const awsSDK = require('aws-sdk')
const dynamoDoc = new awsSDK.DynamoDB.DocumentClient()

module.exports = function putItem(tableName, item) {
  return dynamoDoc.put({
    TableName: tableName,
    Item: item
  }).promise()
}
