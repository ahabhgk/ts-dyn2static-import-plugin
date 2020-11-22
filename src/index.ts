import * as ts from 'typescript'

interface ImportStruct {
  filename: string
  importAsName: string
}

function transformer(ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  const imports: ImportStruct[] = []
  const updateVisitor: ts.Visitor = (node: ts.Node): ts.Node => {
    if (ts.isSourceFile(node)) {
      return ts.visitEachChild(node, updateVisitor, ctx)
    }
    if (isDynamicImportExpression(node)) {
      const filename = getDynamicImportFilename(node)
      const importAsName = filename2ImportAsName(filename)
      imports.push({ filename, importAsName })
      return updateDynamicImport(node, importAsName)
    }
    return ts.visitEachChild(node, updateVisitor, ctx)
  }
  const insertVisitor: ts.Visitor = (node: ts.Node): ts.Node => {
    if (ts.isSourceFile(node)) {
      return ts.factory.updateSourceFile(node, [
        ...imports.map((struct) => createImportDeclaration(struct)),
        ...node.statements,
      ])
    }
    return node
  }

  return (sf: ts.SourceFile) => {
    const updatedSF = ts.visitNode(sf, updateVisitor)
    const insertedSF = ts.visitNode(updatedSF, insertVisitor)
    imports.length = 0
    return insertedSF
  }
}

function createImportDeclaration({ filename, importAsName }: ImportStruct) {
  return ts.factory.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(
      undefined,
      ts.factory.createNamespaceImport(
        ts.factory.createIdentifier(importAsName),
      ),
    ),
    ts.createLiteral(filename),
  )
}

function isDynamicImportExpression(node: ts.Node): node is ts.CallExpression {
  if (
    ts.isCallExpression(node) &&
    node.getChildCount() > 0 &&
    node.getChildren()[0].kind === ts.SyntaxKind.ImportKeyword
  ) {
    return true
  }
  return false
}

function getDynamicImportFilename(node: ts.CallExpression) {
  return node.arguments[0].getText().slice(1, -1)
}

function filename2ImportAsName(filename: string) {
  return filename.replace(/[\.\/]/g, (c) => c === '.' ? '_' : '$')
}

function updateDynamicImport(node: ts.CallExpression, importAsName: string): ts.Node {
  const exp = ts.factory.createPropertyAccessExpression(
    ts.factory.createIdentifier('Promise'),
    ts.factory.createIdentifier('resolve'),
  )
  return ts.factory.updateCallExpression(
    node,
    exp,
    node.typeArguments,
    [ts.factory.createIdentifier(importAsName)],
  )
}

export default transformer
