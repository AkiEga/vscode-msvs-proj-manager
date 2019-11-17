# vscode-msvs-proj-manager README
## Features
This extension support to deal with a microsoft visual studio 20xx solution's in vscode.

- parsing .sln file
- open terminal in msvs proj flie's root dir 

## Requirements
OS: Windows 10  
vscode: 1.39.0  

## Extension Settings
To read .sln file while this extension is activated, please prepair the below json statement in `${workspaceDir}/.vscode/settings.json`.  

For example:
```json
{
	"vscode-msvs-proj-manager": {
		"default-sln-file-path": "C:/work/hoge/fuga.sln",		// full path case
		// "default-sln-file-path": "${workspaceDir}/fuga.sln",	// using ${workspaceDir} symbol case
		// "default-sln-file-path": "../fuga.sln",	 			// relative path case (from ${workspaceDir}/.vscode)
		"msbuild-file-path": "C:/Program Files (x86)/MSBuild/12.0/Bin/MSBuild.exe"
	}
}
```

And you can set temporary environment variables(e.g. PATH) in `${workspaceDir}/.vscode/.env`.  
```shell
# comment
PATH="c:\work"
HOGE=FUGA
```

Ref) [.env file rules](https://github.com/motdotla/dotenv#rules)

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
