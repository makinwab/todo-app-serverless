import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger(`Processing delete todo event: ${event}`)

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

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
