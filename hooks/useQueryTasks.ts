import { useEffect } from 'react'
import { GraphQLClient } from 'graphql-request'
import { useQuery } from 'react-query'
import { Task } from '../types/types'
import { GET_TASKS } from '../queries/queries'
import Cookie from 'universal-cookie'

const cookie = new Cookie() // Cookieを使う
const endpoint = process.env.NEXT_PUBLIC_HASURA_ENDPOINT
let graphQLClient: GraphQLClient

interface TasksRes {
  tasks: Task[]
}

/**
 *  graphQL fetcher
 * @returns
 */
const fetchTasks = async () => {
  const { tasks: data } = await graphQLClient.request<TasksRes>(GET_TASKS)
  return data
}

/**
 * Tasksを扱うHooks
 * @returns
 */
export const useQueryTasks = () => {
  /**
   * ユーザーが変更になるたび、（tokenが変更になるたび）
   * GraphQLClientを再作成する
   */
  useEffect(() => {
    graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${cookie.get('token')}`,
      },
    })
  }, [cookie.get('token')])

  /**
   * useQuery
   */
  return useQuery<Task[], Error>({
    queryKey: 'tasks',
    queryFn: fetchTasks,
    staleTime: 0,
  })
}
