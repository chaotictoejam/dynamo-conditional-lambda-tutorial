'use strict';

const crypto = require('crypto')
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const tableName = 'Users';

module.exports.getUser = (event, context, callback) => {
  const params = {
    TableName: tableName,
    Key: {
      'PK': "USER#"+event.pathParameters.userId
    }
  }
  dynamodb.get(params)
    .promise()
    .then(data => {
      if (data.Item){
        callback(null, {
          statusCode: 200,
          body: data.Item,
        });
      } else {
        callback(null, {
          statusCode: 404,
          body: 'No user exists'
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
    'PK': 'USER#'+event.pathParameters.userId,
    'UserId': event.pathParameters.userId,
    'FirstName': event.body.firstName,
    'LastName': event.body.lastName,
    'Email': event.body.email,
    'rewardBalance' : event.body.rewardBalance
  };
  const params = {
    ConditionExpression: 'attribute_exists(PK)',
    TableName: tableName,
    Item: item
  }
  dynamodb.put(params)
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

module.exports.createUser = (event, context, callback) => {
  const userId = crypto.randomUUID();
  const transactItems = {
    TransactItems: [
      {
        Put: {
          TableName: tableName,
          Item: {
            'PK': 'USER#' + userId,
            'UserId': userId,
            'FirstName': event.body.firstName,
            'LastName': event.body.lastName,
            'Email': event.body.email,
            'rewardBalance': event.body.rewardBalance
          },
          ConditionExpression: 'attribute_not_exists(PK)'
        }
      },
      {
        Put: {
          TableName: tableName,
          Item: {
            'PK': 'EMAIL#' + event.body.email
          },
          ConditionExpression: 'attribute_not_exists(PK)'
        }
      }
    ]
  };
  dynamodb.transactWrite(transactItems)
    .promise()
    .then(() => {
      callback(null, {
        statusCode: 200,
        body: ''
      });
    }).catch((err) => {
      // If an error occurs write to the console
      console.error(err);
      callback(null, {
        statusCode: 400,
        body: err.message
      });
    });
}

module.exports.deleteUser = (event, context, callback) => {
  const userId = event.pathParameters.userId;

  //Get Users Email
  const params = {
    TableName: tableName,
    Key: {
      'PK': "USER#" + userId
    }
  }
  dynamodb.get(params)
    .promise()
    .then(data => {
      var email = data.Item?.Email;
      const transactItems = {
        TransactItems: [
          {
            Delete: {
              TableName: tableName,
              Key: {
                'PK': "USER#" + userId
              }
            }
          },
          {
            Delete: {
              TableName: tableName,
              Key: {
                'PK': "EMAIL#" + email
              }
            }
          }
        ]
      }
      dynamodb.transactWrite(transactItems)
        .promise()
        .then(() => {
          callback(null, {
            statusCode: 200,
            body: ''
          });
        }).catch((err) => {
          // If an error occurs write to the console
          console.error(err);
          callback(null, {
            statusCode: 400,
            body: err.message
          });
        });
    }).catch((err) => {
      callback(null, {
        statusCode: 400,
        body: err.message
      });
    });
}

module.exports.updateUserRewards = (event, context, callback) => {
  let params = {};
  if (event.body.operator === "+") {
    params = {
      TableName: tableName,
      Key: {
        'PK': 'USER#' + event.pathParameters.userId
      },
      UpdateExpression: 'SET RewardBalance = RewardBalance + :amount',
      ExpressionAttributeValues: {
        ":amount": event.body.amount
      }
    }
  } else {
    params = {
      TableName: tableName,
      Key: {
        'PK': 'USER#' + event.pathParameters.userId
      },
      ConditionExpression: 'RewardBalance >= :amount',
      UpdateExpression: 'SET RewardBalance = RewardBalance - :amount',
      ExpressionAttributeValues: {
        ":amount": event.body.amount
      }
    }
  }
  dynamodb.update(params)
    .promise()
    .then(() => {
      callback(null, {
        statusCode: 200,
        body: ''
      });
    }).catch((err) => {
      callback(null, {
        statusCode: 400,
        body: err.message
      });
    });
}