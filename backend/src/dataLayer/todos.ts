import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

export class Todo {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }

    const result = await this.docClient.query(params).promise()

    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      ExpressionAttributeNames: {
        '#N': 'name'
      },
      UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      }
    }).promise()
  }

  async updateTodoAttachment(todoId: string, userId: string, attachmentUrl: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'SET attachmentUrl = :attachment',
      ExpressionAttributeValues: {
        ':attachment': attachmentUrl
      }
    }).promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    try {
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      }).promise()
    } catch(err) {
      createLogger(`Error while deleting document: ${err}`)
    }
  }

  async getTodo(todoId: string, userId: string) {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return result.Item
  }
}

function createDynamoDBClient() {
  return new AWS.DynamoDB.DocumentClient()
}
