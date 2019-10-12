// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MsvsProjManager from './msvsProjManager/msvsProjManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-msvs-proj-manager" is now active!');

	// create Msvs Project manager
	var mpm = new MsvsProjManager();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.listup-msvs-proj', async () => {
		// The code you place here will be executed every time your command is executed
		if(vscode.workspace.workspaceFolders){
			var workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
			var ret:string[] = await mpm.listup(workspaceFolder);
			console.log(ret);
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
