import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger(`Processing event: ${event}`)

  const todoId = uuid.v4()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const newTodoItem = {
    todoId,
    userId: getUserId(event),
    ...newTodo
  }

  await docClient.put({
    TableName: todosTable,
    Item: newTodoItem
  }).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newTodoItem
    })
  }
}
