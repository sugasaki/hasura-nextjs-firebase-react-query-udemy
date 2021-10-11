import Cookie from 'universal-cookie'
import firebase from '../firebaseConfig'
import { unSubMeta } from './useUserChanged'
import { useQueryClient } from 'react-query'
import { useDispatch } from 'react-redux'
import { resetEditedTask, resetEditedNews } from '../slices/uiSlice'

const cookie = new Cookie()

export const useLogout = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const logout = async () => {
    if (unSubMeta) {
      unSubMeta()
    }
    // Reduxの情報リセット
    dispatch(resetEditedTask())
    dispatch(resetEditedNews())

    // firebase Logout
    await firebase.auth().signOut()

    // キャッシュ削除
    queryClient.removeQueries('tasks')
    queryClient.removeQueries('news')

    // cookie情報削除
    cookie.remove('token')
  }

  return { logout }
}
