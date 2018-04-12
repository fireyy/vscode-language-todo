const {
  commands,
  Disposable,
  languages,
  Uri,
  window,
  workspace
} = require('vscode')
var fs = require('fs')
var path = require('path')
const vltodoProvider = require('./provider')
const vltodoCommands = require('./commands')

function activate(context) {
  function exeName()
  {
      var isWin = /^win/.test( process.platform )
      return isWin ? "rg.exe" : "rg"
  }

  function getRgPath()
  {
      var rgPath = ""

      rgPath = exePathIsDefined( workspace.getConfiguration( 'vscode-language-todo' ).ripgrep )
      if( rgPath ) return rgPath

      rgPath = exePathIsDefined( path.join( path.dirname( path.dirname( require.main.filename ) ), "node_modules/vscode-ripgrep/bin/", exeName() ) )
      if( rgPath ) return rgPath

      rgPath = exePathIsDefined( path.join( path.dirname( path.dirname( require.main.filename ) ), "node_modules.asar.unpacked/vscode-ripgrep/bin/", exeName() ) )
      if( rgPath ) return rgPath

      return rgPath
  }

  function exePathIsDefined( rgExePath )
  {
      return fs.existsSync( rgExePath ) ? rgExePath : undefined
  }

  let rgPath = getRgPath()
  let provider = new vltodoProvider({
    rgPath: rgPath
  })

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
