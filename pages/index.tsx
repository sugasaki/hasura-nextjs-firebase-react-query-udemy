import { Auth } from '../components/Auth'
import { Layout } from '../components/Layout'
import { GetStaticProps } from 'next'
import { dehydrate } from 'react-query/hydration'
import { fetchNews } from '../hooks/useQueryNews'
import { News } from '../types/types'
import { QueryClient, useQueryClient } from 'react-query'

export default function Home() {
  const queryClient = useQueryClient()
  const data = queryClient.getQueryData<News[]>('news')

  return (
    <Layout title="Home">
      <p className="mb-5 text-blue-500 text-xl">News list by SSG</p>
      {data?.map((news) => (
        <p className="font-bold" key={news.id}>
          {news.content}
        </p>
      ))}
      <Auth />
    </Layout>
  )
}

/**
 * Serverside
 * ビルド時、ISR実行時に呼び出される
 * @returns
 */
export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient()

  // prefetchQueryする。
  // Fetch結果をqueryClientのキャッシュに保存する
  await queryClient.prefetchQuery('news', fetchNews)

  return {
    props: {
      // dehydrateは prefetch時にキャッシュの情報を取得する
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 3,
  }
}
