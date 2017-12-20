const {
  commands,
  Disposable,
  languages,
  Uri,
  window,
  workspace
} = require('vscode')
const vltodoProvider = require('./provider')
const vltodoCommands = require('./commands')

function activate(context) {
  let provider = new vltodoProvider()

  const providerRegistrations = Disposable.from(
    workspace.registerTextDocumentContentProvider(vltodoProvider.scheme, provider),
    languages.registerDocumentLinkProvider({
      scheme: vltodoProvider.scheme
    }, provider)
  )

  const disposable = commands.registerCommand('vltodo.search', function () {
    const path = workspace.rootPath
    var uri = Uri.parse(vltodoProvider.scheme +
      `:result.vltodo?path=${path}`)
    return workspace.openTextDocument(uri).then(doc =>
      window.showTextDocument(doc, {
        preview: false,
        viewColumn: 1
      })
    )
  })

  context.subscriptions.push(
    disposable,
    providerRegistrations,
    commands.registerCommand('vltodo.openFile', vltodoCommands.openFile)
  )
}
exports.activate = activate

function deactivate() {}
exports.deactivate = deactivate
