"use strict";

const crypto = require('crypto')
const doc = require('dynamodb-doc');
const dynamodb = new doc.DynamoDB();

const tableName = "Users";

module.exports.getUser = (event, context, callback) => {
  const params = {
    TableName: tableName,
    Key: {
      'UserId': event.pathParameters.userId
    }
  }
  dynamodb.getItem(params)
    .promise()
    .then(data => {
      if (!isEmpty(data)){
        console.log(data)
        callback(null, {
          statusCode: 200,
          body: data,
        });
      } else {
        callback(null, {
          statusCode: 404,
          body: "No user exists"
        });
      }
  }).catch((err) => {
    // If an error occurs write to the console
    console.error(err);
  });
};

module.exports.updateUser = (event, context, callback) => {
  console.log(event);
  const item = {
    "UserId": event.pathParameters.userId,
    "FirstName": event.body.firstName,
    "LastName": event.body.lastName,
    "Email": event.body.email
  };
  const params = {
    ConditionExpression: 'attribute_exists(UserId)',
    TableName: tableName,
    Item: item
  }
  dynamodb.putItem(params)
    .promise()
    .then(() => {
      callback(null, {
        statusCode: 200,
        body: ''
      });
    }).catch((err) => {
      // If an error occurs write to the console
      console.error(err);
    });
};

// TO DO Complete Example for Transaction
module.exports.createUser = (event, context, callback) => {
  const item = {
    "UserId": crypto.randomUUID(),
    "FirstName": event.body.firstName,
    "LastName": event.body.lastName,
    "Email": event.body.email
  };
  const params = {
    ConditionExpression: 'attribute_not_exists(Email)',
    TableName: tableName,
    Item: item
  }
  dynamodb.putItem(params)
    .promise()
    .then(() => {
      callback(null, {
        statusCode: 200,
        body: ''
      });
    }).catch((err) => {
      // If an error occurs write to the console
      console.error(err);
    });
};

// TO DO Complete Example for Transaction
module.exports.deleteUser = (event, context, callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};

function isEmpty(object) {
  return Object.keys(object).length === 0
}