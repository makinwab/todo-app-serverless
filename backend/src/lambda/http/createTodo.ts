import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  createLogger(`Processing event: ${event}`)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const item = await createTodo(userId, newTodo)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}


