# ts-dyn2static-import-plugin

> maybe impl for [ies-fe-sh/hire 简单的 TypeScript transform plugin](https://github.com/ies-fe-sh/hire/tree/master/ts-plugin)

```tsx
import React, { useState, useEffect } from 'react'

export function AsyncLogin() {
  const [Login, setLogin] = useState()
  useEffect(() => {
    import('./login').then(({ LoginComponent }) => {
      setLogin(() => LoginComponent)
    })
  }, [])

  if (!Login) {
    return <Loading />
  }
  return <Login />
}
```

↓ ↓ ↓ ↓ ↓ ↓

```tsx
import * as _$login from './login'
import React, { useState, useEffect } from 'react'

export function AsyncLogin() {
  const [Login, setLogin] = useState()
  useEffect(() => {
    Promise.resolve(_$login).then(({ LoginComponent }) => {
      setLogin(() => LoginComponent)
    })
  }, [])

  if (!Login) {
    return <Loading />
  }
  return <Login />
}
```
