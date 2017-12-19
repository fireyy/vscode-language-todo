# vscode-language-todo

Adds syntax highlighting to TODO, FIXME, CHANGED, XXX, IDEA, HACK, NOTE, REVIEW, NB, BUG, QUESTION, COMBAK, TEMP, DEBUG and OPTIMIZE in comments and text in VSCode.

Originally converted from [atom/language-todo](https://github.com/atom/language-todo).

## Support file type

- JavaScript
- CSS
- HTML
- Markdown (snippet not work now)
- jsx (snippet bugly in render section)
- TypeScript
- CoffeeScript
- Ruby
- Python
- PHP
- Go
- SASS (only .scss)
- Less
- Vue

## Known Issues

- [x] Snippet not work in markdown

    Quick suggestions are disabled by default in markdown files, you must setting:

    ```json
    "[markdown]":  {
        "editor.quickSuggestions": true
    }
    ```

- [x] Syntaxes not work in `.vue`
- [ ] snippet bugly in `.jsx` render section
