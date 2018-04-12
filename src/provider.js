const vscode = require('vscode')
const querystring = require('querystring')
var ripgrep = require('./ripgrep')
const {
  execSync
} = require('child_process')

function getRootFolder () {
    var rootFolder = vscode.workspace.getConfiguration('vscode-language-todo').rootFolder;
    if( rootFolder === "" )
    {
        if( vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 )
        {
            rootFolder = vscode.workspace.workspaceFolders[ 0 ].uri.fsPath;
        }
    }
    return rootFolder;
}

// const rootPath = vscode.workspace.rootPath
let rootPath = getRootFolder()

class vltodoProvider {
  constructor(opts) {
    this.options = opts || {}
    this.links = []
    this._subscriptions = vscode.workspace.onDidCloseTextDocument(doc => {
      this.links[doc.uri.toString()] = []
    })
  }

  dispose() {
    this._subscriptions.dispose()
  }

  static get scheme() {
    return 'vltodo'
  }

  onDidChange() {}

  provideTextDocumentContent(uri) {
    let uriString = uri.toString()
    this.links[uriString] = []
    const params = querystring.parse(uri.query)
    if (params.path) rootPath = params.path

    return runCommandSync(this.options.rgPath).then((resultsArray) => {
      console.log('resultsArray', resultsArray)
      if (resultsArray == null || !resultsArray.length) {
        return 'There was an error during your search!'
      }
  
      let resultsByFile = {}
  
      resultsArray.forEach((searchResult) => {
        let fileName = searchResult.file
        if (fileName == null || !fileName.length) {
          return
        }
        if (resultsByFile[fileName] == null) {
          resultsByFile[fileName] = []
        }
        resultsByFile[fileName].push(searchResult)
      })
  
      let sortedFiles = Object.keys(resultsByFile).sort()
      let lineNumber = 1
  
      let lines = sortedFiles.map((fileName) => {
        lineNumber += 1
        let resultsForFile = resultsByFile[fileName].map((searchResult, index) => {
          lineNumber += 1
          this.createDocumentLink(searchResult, lineNumber, uriString)
          return `  ${searchResult.line}: ${searchResult.match}`
        }).join('\n')
        lineNumber += 1
        return `
file://${rootPath}/${fileName}
${resultsForFile}`
      })
      let header = [`${resultsArray.length} search results found`]
      let content = header.concat(lines)
  
      return content.join('\n')
    }).catch((e) => {
      if(e.error) {
        vscode.window.showErrorMessage( "vscode-language-todo: " + e.error )
      } else {
        vscode.window.showErrorMessage( "vscode-language-todo: failed to execute search (" + e.stderr + ")" )
      }
    })
  }

  provideDocumentLinks(document) {
    return this.links[document.uri.toString()]
  }

  createDocumentLink(formattedLine, lineNumber, docURI) {
    const {
      file,
      line,
      column
    } = formattedLine
    const col = parseInt(column, 10)
    const preamble = `  ${line}:`.length
    // const match = formattedLine.result.match(cmd)
    // if (match == null) {
    //   return
    // }
    const linkRange = new vscode.Range(
      lineNumber,
      2,
      lineNumber,
      preamble
    )
    const uri = vscode.Uri.parse(`file://${rootPath}/${file}#${line}`)
    this.links[docURI].push(new vscode.DocumentLink(linkRange, uri))
  }
}

module.exports = vltodoProvider

function formatLine(splitLine) {
  return {
    file: splitLine[1],
    line: splitLine[2],
    column: splitLine[3],
    result: splitLine[4]
  }
}

function openLink(fileName, line) {
  var params = {
    fileName: fileName,
    line: line
  }
  return encodeURI('command:vltodo.openFile?' + JSON.stringify(params))
}

function runCommandSync(rgPath) {
  let regex = vscode.workspace.getConfiguration('vscode-language-todo').regex

  let globsDefault = [
    "!**/node_modules/**",
    "!**/bower_components/**",
    "!**/.vscode/**",
    "!**/.github/**",
    "!**/.git/**",
    "!**/*.map"
  ]

  let globs = vscode.workspace.getConfiguration('vscode-language-todo').globs

  globs = globsDefault.concat(globs)

  var options = {
    regex: "\"" + regex + "\"",
    rgPath: rgPath,
    globs: globs
  }
  
  // return execSync(`"${rgDiskPath}" --case-sensitive --line-number --column --hidden -e "${regex}" ${ignoreStr}`, execOpts)
  return ripgrep( rootPath, options )
}
