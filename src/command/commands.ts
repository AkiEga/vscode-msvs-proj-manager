import * as vscode from 'vscode';
import * as childProccess from 'child_process';
import * as Encoding from 'encoding-japanese';

import { MsvsProj} from '../msvs/MsvsProj';
import MsvsProjProvider from '../msvs/MsvsProjProvider';
import * as fileUtil from '../util/fileUtil';

///////////////////////////////////////////////////////////////////////////////
// For extension command
///////////////////////////////////////////////////////////////////////////////
export default class MsBuildCommander{
	constructor(public msbuildPath:string, public slnFilePath:string, public outputChannel:vscode.OutputChannel){
	}
	public openTerminalNearbyMsvsProj(): (...args: any[]) => any {
		return async (projNode: MsvsProj) => {
			// The code you place here will be executed every time your command is executed
			if (projNode) {
				let dir = projNode.projDir;
				vscode.window.createTerminal({ cwd: dir }).show();
			}
		};
	}
	public readSlnFile(): (...args: any[]) => any{
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
	
	public buildMsvsProj(): (...args: any[]) => any {
		return async (projNode: MsvsProj) => {
			// The code you place here will be executed every time your command is executed
			if (projNode) {
				this.exeMsBuild("Build",projNode);
			}
		};
	}
	public cleanMsvsProj(): (...args: any[]) => any {
		return async (projNode: MsvsProj) => {
			// The code you place here will be executed every time your command is executed
			if (projNode) {
				this.exeMsBuild("Clean",projNode);
			}
		};
	}

	private exeMsBuild(target: string, targetProj: MsvsProj) {
		let msbuildCmdStr: string = `"${this.msbuildPath}" ${this.slnFilePath} -t:${targetProj.idealPath};${target}`;
		let exeOption: object = { encoding: 'Shift_JIS' };

		// clear output channel on vscode
		this.outputChannel.clear();

		// execute a msBuild command
		childProccess.exec(msbuildCmdStr, exeOption, (error, stdout, stderr) => {
			let retUTF8: string = Encoding.convert(stdout, {
				from: 'SJIS',
				to: 'UNICODE',
				type: 'string',
			});
			this.outputChannel.append(retUTF8);
			console.log(retUTF8);
		});
		return;
	}
}
