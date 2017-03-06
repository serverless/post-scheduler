const awsSDK = require('aws-sdk')
const dynamoDoc = new awsSDK.DynamoDB.DocumentClient()

module.exports = function deleteItem(tableName, key) {
  return dynamoDoc.delete({
    TableName: tableName,
    Key: {
      number: key
    },
  }).promise()
}
