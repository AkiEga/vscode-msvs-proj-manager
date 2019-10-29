import * as vscode from 'vscode';
import * as childProccess from 'child_process';
import * as Encoding from 'encoding-japanese';

import { MsvsProjFile} from '../msvs/MsvsFilePaser';
//import { MsvsProjNode } from '../msvs/MsvsProjNode';
import MsvsProjProvider from '../msvs/MsvsProjProvider';
import * as fileUtil from '../util/fileUtil';

///////////////////////////////////////////////////////////////////////////////
// For extension command
///////////////////////////////////////////////////////////////////////////////
export function openTerminalNearbyMsvsProj(): (...args: any[]) => any {
	return async (projNode: MsvsProjFile) => {
		// The code you place here will be executed every time your command is executed
		if (projNode) {
			let dir = projNode.getProjDir();
			vscode.window.createTerminal({ cwd: dir }).show();
		}
	};
}
export function exeMsBuild(msbuildPath: string, target: string, projPath: string) {
	let msbuildCmdStr: string = `"${msbuildPath}" /t:${target} ${projPath}`;
	let exeOption: object = { encoding: 'Shift_JIS' };
	childProccess.exec(msbuildCmdStr, exeOption, (error, stdout, stderr) => {
		let retUTF8: string = Encoding.convert(stdout, {
			from: 'SJIS',
			to: 'UNICODE',
			type: 'string',
		});
		console.log(retUTF8);
	});
	return;
}

export function buildMsvsProj(msbuildPath:string): (...args: any[]) => any {
	return async (projNode: MsvsProjFile) => {
		// The code you place here will be executed every time your command is executed
		if (projNode) {
			exeMsBuild(msbuildPath,"Build",projNode.fullPath);
		}
	};
}
export function cleanMsvsProj(msbuildPath:string): (...args: any[]) => any {
	return async (projNode: MsvsProjFile) => {
		// The code you place here will be executed every time your command is executed
		if (projNode) {
			exeMsBuild(msbuildPath,"Clean",projNode.fullPath);
		}
	};
}

export function readSlnFile(): (...args: any[]) => any{
	return async () => {
		if (vscode.workspace.workspaceFolders) {
			let slnFiles:string[] = fileUtil.listupSlnFile();
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
		return;
	};
}