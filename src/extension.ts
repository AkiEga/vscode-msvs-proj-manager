// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MsvsProjProvider from './msvsProj/MsvsProjProvider';
import { MsvsProjNode } from './msvsProj/MsvsProjNode';
import * as fs from 'fs';
import * as path from 'path';

function readdirRecursively(dir: string, files = []): any {
	const paths: string[] = fs.readdirSync(dir);
	const dirs = [];
	for (const path of paths) {
		const stats = fs.statSync(`${dir}/${path}`);
		let fullPath = `${dir}/${path}`.replace(/\\/g, "/");
		if (stats.isDirectory()) {
			dirs.push(fullPath);
		}
		else {
			files.push(fullPath);
		}
	}
	for (const d of dirs) {
		files = readdirRecursively(d, files);
	}
	return files;
}
function listupFiles(rootFolderPath: string, pattern: RegExp): string[] {
	let srcFileList: string[] = [];
	let tarFileList: string[] = [];
	readdirRecursively(rootFolderPath, srcFileList);
	for (let file of srcFileList) {
		if (pattern.test(file) === true) {
			tarFileList.push(file);
		}
	}
	return tarFileList;
}



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-msvs-proj-manager" is now active!');

	vscode.commands.registerCommand('vscode-msvs-proj-manager.read-sln-file', async () => {
		if(vscode.workspace.workspaceFolders){
			let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
			let slnFiles:string[] = await listupFiles(workspaceFolder, /.*\.sln$/);

			let selectedSlnFile;
			if(slnFiles.length === 1){
				selectedSlnFile = slnFiles[0];
			}else if(slnFiles.length >= 2){
				selectedSlnFile = await vscode.window.showQuickPick(slnFiles);
			}else{
				return;
			}
			if(typeof(selectedSlnFile) !== undefined){
				let mpp = new MsvsProjProvider(selectedSlnFile);
				vscode.window.createTreeView("slnExplorer",{ treeDataProvider: mpp});					
			}
		}
	});
	vscode.commands.registerCommand('vscode-msvs-proj-manager.open-terminal-nearby-msvs-proj', async (projNode:MsvsProjNode) => {
		// The code you place here will be executed every time your command is executed
		if(projNode){
			console.log("msvs proj: "+projNode.path);
			let dir = projNode.getProjDir();
			console.log("msvs proj: "+ dir);

			vscode.window.createTerminal({cwd: dir}).show();
		}
	});

	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
