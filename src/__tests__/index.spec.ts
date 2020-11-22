import test from 'ava'
import * as ts from 'typescript'
import transformer from '..'

test(`should be able to compile dynamic import to static import`, (t) => {
  const sourceCode = `import React, { useState, useEffect } from 'react'

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
  `
  const source = ts.createSourceFile('', sourceCode, ts.ScriptTarget.ESNext, true)
  const result = ts.transform(source, [transformer])
  const transformedSourceFile = result.transformed[0]
  const printer = ts.createPrinter()
  const resultCode = printer.printFile(transformedSourceFile as ts.SourceFile)

  t.snapshot(resultCode)

  result.dispose()
})
