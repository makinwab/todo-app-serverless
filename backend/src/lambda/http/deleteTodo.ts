import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId, todoExists } from '../utils'

import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger(`Processing delete todo event: ${event}`)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
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

  await deleteTodo(todoId, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({})
  }
}

async function deleteTodo(todoId: string, userId: string) {
  try {
    return await docClient.delete({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    }).promise()
  } catch(err) {
    createLogger(`Error while deleting document: ${err}`)
  }
}
