// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import MsvsProjProvider from './msvs/MsvsProjProvider';
import MsBuildCommander from './command/commands';
import * as fileUtil from './util/fileUtil';

import * as path from 'path';
import * as fs from 'fs';

///////////////////////////////////////////////////////////////////////////////
// For extension events
///////////////////////////////////////////////////////////////////////////////
export function activate(context: vscode.ExtensionContext) {
	let outputChannel = vscode.window.createOutputChannel("vscode-msvs-proj-manager");

	let slnFilePath:string 
		= fileUtil.ResolveFullPath(vscode.workspace.getConfiguration('vscode-msvs-proj-manager')
			.get<string>('default-sln-file-path'));

	// auto detecting sln file
	if(!slnFilePath){
		slnFilePath = fileUtil.listupSlnFile(false)[0];
	}

	let msbuildPath:string
		= vscode.workspace.getConfiguration('vscode-msvs-proj-manager')
			.get<string>('msbuild-file-path');

	// auto detecting msbuild.exe
	if(!msbuildPath){
		let ret:string[] = fileUtil.searchFileInEnvValPath(/.*msbuild\.exe$/i);
		if(ret.length === 0){
			outputChannel.appendLine(`[Warning] "msbuild.exe" is not found! This extension can't use this command.`);
		}else{
			msbuildPath = ret[0];
			outputChannel.appendLine(`[Info] "msbuild.exe" is detected automatically(${msbuildPath})! This extension can't use this command.`);
		}
	}

	// set additional environment variables with ${workspaceDir}/.vscode/.env
	fileUtil.pathSettingWithDotEnvfile();

	// make a treeview of solution explorer 
	let mpp = new MsvsProjProvider(slnFilePath, outputChannel);
	let tree:vscode.TreeView<MsvsProjProvider> = vscode.window.createTreeView("slnExplorer", { treeDataProvider: mpp });

	// set vscode commands
	let cmd = new MsBuildCommander(msbuildPath,slnFilePath, outputChannel);
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.read-sln-file', 
		cmd.readSlnFile(tree));
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.open-terminal-nearby-msvs-proj', 
		cmd.openTerminalNearbyMsvsProj());
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.build-msvs-proj', 
		cmd.buildMsvsProj(false));
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.build-msvs-proj-with-active-config', 
		cmd.buildMsvsProj(true));
	vscode.commands.registerCommand(
		'vscode-msvs-proj-manager.clean-msvs-proj', 
		cmd.cleanMsvsProj());
}

// this method is called when your extension is deactivated
export function deactivate() {}
