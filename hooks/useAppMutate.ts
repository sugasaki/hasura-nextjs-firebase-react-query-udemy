import { useEffect } from 'react'
import { useQueryClient, useMutation } from 'react-query'
import { GraphQLClient } from 'graphql-request'
import Cookie from 'universal-cookie'
import {
  CREATE_TASK,
  DELETE_TASK,
  UPDATE_TASK,
  CREATE_NEWS,
  DELETE_NEWS,
  UPDATE_NEWS,
} from '../queries/queries'
import { Task, EditTask, News, EditNews } from '../types/types'
import { useDispatch } from 'react-redux'
import { resetEditedTask, resetEditedNews } from '../slices/uiSlice'

const cookie = new Cookie() // Cookieを使う
const endpoint = process.env.NEXT_PUBLIC_HASURA_ENDPOINT
let graphQLClient: GraphQLClient

/**
 *
 * @returns
 */
export const useAppMutate = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

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
   * create Task
   */
  const createTaskMutation = useMutation(
    /**
     * タスクの作成
     * @param title
     * @returns
     */
    (title: string) => graphQLClient.request(CREATE_TASK, { title: title }),
    {
      onSuccess: (res) => {
        // 新規作成後、キャッシュに作成したデータを追加する
        const previousTodos = queryClient.getQueryData<Task[]>('tasks')
        if (previousTodos) {
          queryClient.setQueryData('tasks', [
            ...previousTodos,
            res.insert_tasks_one,
          ])
        }
        // 作成完了したので、選択中のタスクをリセットする
        dispatch(resetEditedTask())
      },
      onError: () => {
        // エラー時も選択中のタスクをリセットする
        dispatch(resetEditedTask())
      },
    }
  )

  /**
   * タスク編集
   */
  const updateTaskMutation = useMutation(
    (task: EditTask) => graphQLClient.request(UPDATE_TASK, task),
    {
      onSuccess: (res, variables) => {
        // 新規作成後、キャッシュに作成したデータを追加する
        const previousTodos = queryClient.getQueryData<Task[]>('tasks')
        if (previousTodos) {
          queryClient.setQueryData<Task[]>(
            'tasks',
            // 更新後のタスクだけをキャッシュ書き換える
            previousTodos.map((task) =>
              task.id === variables.id ? res.update_tasks_by_pk : task
            )
          )
        }
        dispatch(resetEditedTask())
      },
      onError: () => {
        dispatch(resetEditedTask())
      },
    }
  )

  /**
   * タスク削除
   */
  const deleteTaskMutation = useMutation(
    (id: string) => graphQLClient.request(DELETE_TASK, { id: id }),
    {
      onSuccess: (res, variables) => {
        const previousTodos = queryClient.getQueryData<Task[]>('tasks')
        if (previousTodos) {
          queryClient.setQueryData<Task[]>(
            'tasks',
            previousTodos.filter((task) => task.id !== variables)
          )
        }
        dispatch(resetEditedTask())
      },
    }
  )

  /**
   * ニュースの作成
   */
  const createNewsMutation = useMutation(
    (content: string) =>
      graphQLClient.request(CREATE_NEWS, { content: content }),
    {
      onSuccess: (res) => {
        const previousNews = queryClient.getQueryData<News[]>('news')
        if (previousNews) {
          queryClient.setQueryData('news', [
            ...previousNews,
            res.insert_news_one,
          ])
        }
        dispatch(resetEditedNews())
      },
      onError: () => {
        dispatch(resetEditedNews())
      },
    }
  )

  /**
   * ニュースの編集
   */
  const updateNewsMutation = useMutation(
    (news: EditNews) => graphQLClient.request(UPDATE_NEWS, news),
    {
      onSuccess: (res, variables) => {
        const previousNews = queryClient.getQueryData<News[]>('news')
        if (previousNews) {
          queryClient.setQueryData<News[]>(
            'news',
            previousNews.map((news) =>
              news.id === variables.id ? res.update_news_by_pk : news
            )
          )
        }
        dispatch(resetEditedNews())
      },
      onError: () => {
        dispatch(resetEditedNews())
      },
    }
  )

  /**
   * ニュースの削除
   */
  const deleteNewsMutation = useMutation(
    (id: string) => graphQLClient.request(DELETE_NEWS, { id: id }),
    {
      onSuccess: (res, variables) => {
        const previousNews = queryClient.getQueryData<News[]>('news')
        if (previousNews) {
          queryClient.setQueryData<News[]>(
            'news',
            previousNews.filter((news) => news.id !== variables)
          )
        }
        dispatch(resetEditedNews())
      },
    }
  )

  /**
   * 関数群を外部から使えるようにreturn
   */
  return {
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
  }
}
