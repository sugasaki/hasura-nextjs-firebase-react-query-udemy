## firebase functions

```
firebase init
```

### Setting

hasura url
hasura admin_secret

```
firebase functions:config:set hasura.url="https://hasura-firebasexxxxx.hasura.app/v1/graphql" hasura.admin_secret="xxxxxxxxxxx"
```

### Deploy

```
firebase deploy --only functions
```
