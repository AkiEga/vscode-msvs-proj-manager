// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MsvsProjProvider from './msvs/MsvsProjProvider';
import { MsvsProjNode } from './msvs/MsvsProjNode';
import * as fs from 'fs';
import * as childProccess from 'child_process';
import * as Encoding from 'encoding-japanese';

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
function exeMsBuild(msbuildPath:string, target:string, projPath:string){
	let msbuildCmdStr:string = `"${msbuildPath}" /t:${target} ${projPath}`;
	let exeOption:object = {encoding: 'Shift_JIS'};
	childProccess.exec(msbuildCmdStr, exeOption,
		(error,stdout,stderr)=>{
	
		let retUTF8:string	= Encoding.convert(stdout, {
			from: 'SJIS',
			to: 'UNICODE',
			type: 'string',
		});
		
		console.log(retUTF8);
	});

	return;
}

function buildMsvsProj(msbuildPath:string): (...args: any[]) => any {
	return async (projNode: MsvsProjNode) => {
		// The code you place here will be executed every time your command is executed
		if (projNode) {
			exeMsBuild(msbuildPath,"Build",projNode.fullPath);
		}
	};
}
function cleanMsvsProj(msbuildPath:string): (...args: any[]) => any {
	return async (projNode: MsvsProjNode) => {
		// The code you place here will be executed every time your command is executed
		if (projNode) {
			exeMsBuild(msbuildPath,"Clean",projNode.fullPath);
		}
	};
}

///////////////////////////////////////////////////////////////////////////////
// For extension events
///////////////////////////////////////////////////////////////////////////////
export function activate(context: vscode.ExtensionContext) {
	const slnFilePath:string = vscode.workspace.getConfiguration('vscode-msvs-proj-manager').get<string>('default-sln-file-path');
	const msbuildPath:string = vscode.workspace.getConfiguration('vscode-msvs-proj-manager').get<string>('msbuild-file-path');

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
	vscode.commands.registerCommand('vscode-msvs-proj-manager.build-msvs-proj', buildMsvsProj(msbuildPath));
	vscode.commands.registerCommand('vscode-msvs-proj-manager.clean-msvs-proj', cleanMsvsProj(msbuildPath));
}

// this method is called when your extension is deactivated
export function deactivate() {}
