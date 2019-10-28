// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MsvsProjProvider from './msvsProj/MsvsProjProvider';
import { MsvsProjNode } from './msvsProj/MsvsProjNode';
import * as fs from 'fs';

///////////////////////////////////////////////////////////////////////////////
// For utility
///////////////////////////////////////////////////////////////////////////////
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
function listupSlnFile():string[]{
	if (vscode.workspace.workspaceFolders) {
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
		let slnFiles: string[] = listupFiles(workspaceFolder, /.*\.sln$/);
		return slnFiles;
	}else{
		return [];
	}
}

///////////////////////////////////////////////////////////////////////////////
// For extension command
///////////////////////////////////////////////////////////////////////////////
function openTerminalNearbyMsvsProj(): (...args: any[]) => any {
	return async (projNode: MsvsProjNode) => {
		// The code you place here will be executed every time your command is executed
		if (projNode) {
			let dir = projNode.getProjDir();
			vscode.window.createTerminal({ cwd: dir }).show();
		}
	};
}

///////////////////////////////////////////////////////////////////////////////
// For extension events
///////////////////////////////////////////////////////////////////////////////
export function activate(context: vscode.ExtensionContext) {
	const slnFilePath:string = vscode.workspace.getConfiguration('vscode-msvs-proj-manager').get<string>('default-sln-file-path');
	let mpp = new MsvsProjProvider(slnFilePath);
	vscode.window.createTreeView("slnExplorer", { treeDataProvider: mpp });

	vscode.commands.registerCommand('vscode-msvs-proj-manager.read-sln-file', async () => {
		if (vscode.workspace.workspaceFolders) {
			let slnFiles:string[] = listupSlnFile();
			let selectedSlnFile = "";
			if (slnFiles.length === 1) {
				selectedSlnFile = slnFiles[0];
			} else if (slnFiles.length >= 2) {
				selectedSlnFile = await vscode.window.showQuickPick(slnFiles);
			} else {
				return;
			}
			if (typeof (selectedSlnFile) !== undefined) {
				let mpp = new MsvsProjProvider(selectedSlnFile);
				vscode.window.createTreeView("slnExplorer", { treeDataProvider: mpp });
			}
		}
	});
	vscode.commands.registerCommand('vscode-msvs-proj-manager.open-terminal-nearby-msvs-proj', openTerminalNearbyMsvsProj());
}

// this method is called when your extension is deactivated
export function deactivate() {}
