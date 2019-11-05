// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MsvsProjProvider from './msvs/MsvsProjProvider';
import MsBuildCommander from './command/commands';

///////////////////////////////////////////////////////////////////////////////
// For extension events
///////////////////////////////////////////////////////////////////////////////
export function activate(context: vscode.ExtensionContext) {
	const slnFilePath:string 
		= vscode.workspace.getConfiguration('vscode-msvs-proj-manager')
			.get<string>('default-sln-file-path');
	const msbuildPath:string
		= vscode.workspace.getConfiguration('vscode-msvs-proj-manager')
			.get<string>('msbuild-file-path');

	let mpp = new MsvsProjProvider(slnFilePath);
	vscode.window.createTreeView("slnExplorer", { treeDataProvider: mpp });

	let cmd = new MsBuildCommander(msbuildPath,slnFilePath);
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.read-sln-file', 
		cmd.readSlnFile());
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.open-terminal-nearby-msvs-proj', 
		cmd.openTerminalNearbyMsvsProj());
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.build-msvs-proj', 
		cmd.buildMsvsProj());
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.clean-msvs-proj', 
		cmd.cleanMsvsProj());
}

// this method is called when your extension is deactivated
export function deactivate() {}
