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
		"default-sln-file-path": "C:/work/hoge/fuga.sln",
		"msbuild-file-path": "C:/Program Files (x86)/MSBuild/14.0/Bin/MSBuild.exe"
	}
}
```

## Known Issues
Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes
Users appreciate release notes as you update your extension.

### 1.0.0
Initial release of ...

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
