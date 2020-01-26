import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { Todo } from '../dataLayer/todos'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as AWS from 'aws-sdk'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const todo = new Todo()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return await todo.getAllTodos(userId)
}

export async function createTodo(
  userId: string,
  payload: CreateTodoRequest
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const data = {
    todoId,
    userId,
    ...payload
  }

  return await todo.createTodo(data)
}


export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
  return await todo.updateTodo(todoId, userId, payload)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  await todo.deleteTodo(todoId, userId)
}

export async function todoExists(todoId: string, userId: string) {
  const item = await todo.getTodo(todoId, userId)

  console.log('Get todo: ', item)
  return !!item
}

export function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
