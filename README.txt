まなびタウン v4.1 STEP1分割版

構成:
- index.html: HTML構造
- css/style.css: 元HTML内のCSS
- js/app-art.js: 大容量の内蔵画像データと初期設定
- js/app.js: アプリ本体のJavaScript

公開方法:
1. ZIPを展開します。
2. 中の4ファイル/フォルダーを、階層を変えずGitHubリポジトリのルートへアップロードします。
3. GitHub Pagesの公開元を、そのブランチの /(root) に設定します。
4. index.htmlが自動的に開かれます。

注意:
- localStorageのキーや保存処理は変更していません。
- GitHub PagesのURLやリポジトリ名を変えると、ブラウザー上では別の保存領域として扱われます。
- app-art.jsは約23.6MBで、25MB未満に収まるよう分離しています。
