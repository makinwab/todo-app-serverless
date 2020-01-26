import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import { getUserId, todoExists } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger(`Processing update todos event: ${event}`)

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const validTodo = await todoExists(todoId, userId)

  if (!validTodo) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const payload: UpdateTodoRequest = JSON.parse(event.body)

  await updateTodo(todoId, userId, payload)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest) {
  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    },
    ExpressionAttributeNames: {
      '#N': 'name'
    },
    UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeValues: {
      ':name': payload.name,
      ':dueDate': payload.dueDate,
      ':done': payload.done
    }
  }).promise()
}
