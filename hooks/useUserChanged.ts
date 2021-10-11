import { useEffect } from 'react'
import firebase from '../firebaseConfig'
import { useRouter } from 'next/router'
import Cookie from 'universal-cookie'

export let unSubMeta: () => void

export const useUserChanged = () => {
  const cookie = new Cookie()
  const router = useRouter()
  const HASURA_TOKEN_KEY = 'https://hasura.io/jwt/claims'

  useEffect(() => {
    const unSubUser = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(true)
        const idTokenResult = await user.getIdTokenResult()
        const hasuraClaims = idTokenResult.claims[HASURA_TOKEN_KEY]

        if (hasuraClaims) {
          // console.log(hasuraClaims, 'hasuraClaims')
          cookie.set('token', token, { path: '/' })
          router.push('/tasks')
        } else {
          // hasuraClaimsが取得できなかった場合は、Firebase側で作成に時間がかかっている時
          // よって作成まで待つ。
          console.log(user.uid, 'user.uid')
          const userRef = firebase
            .firestore()
            .collection('user_meta')
            .doc(user.uid)

          console.log(userRef, 'userRef')

          unSubMeta = userRef.onSnapshot(async () => {
            const tokenSnap = await user.getIdToken(true)
            console.log(tokenSnap, 'tokenSnap')

            const idTokenResultSnap = await user.getIdTokenResult()
            const hasuraClaimsSnap = idTokenResultSnap.claims[HASURA_TOKEN_KEY]
            if (hasuraClaimsSnap) {
              cookie.set('token', tokenSnap, { path: '/' })
              router.push('/tasks')
            }
          })
        }
      } else {
        console.log(user, 'un user')
      }
    })
    return () => {
      console.log('unSubUser')
      unSubUser()
    }
  }, [])
  return {}
}
