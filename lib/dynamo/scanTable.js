const awsSDK = require('aws-sdk')
const dynamoDoc = new awsSDK.DynamoDB.DocumentClient()

module.exports = function scanTable(tableName) {
  return dynamoDoc.scan({ TableName: tableName }).promise();
}
