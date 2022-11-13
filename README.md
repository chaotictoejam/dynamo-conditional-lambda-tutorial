# Dynamo Condition Expression Tutorial

This repo holds the example code used in my [How To Use Condition Expressions in DynamoDB](https://youtu.be/EacuuiQvJvg) video.

This repo was generated using Serverless Framework and mocks a User API Service example. The following examples are shown:
* GetUser - expects a UserId as a path parameter
* UpdateUser - expects a UserId as a path parameter and a body, and illustrates the attribute_exists condition expression
* CreateUser - expects a body, and illustrates to attribute_not_exists codition expression and also shows how to use TransactWrite
* DeleteUser - expects a UserId as a path parameter
* UpdateUserRewards - expects a UserId as a path parameter and uses business logic to determine if the reward balance can be updated
