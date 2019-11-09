import * as vscode from 'vscode';
import * as childProccess from 'child_process';

import { MsvsProj} from '../msvs/MsvsProj';
import MsvsProjProvider from '../msvs/MsvsProjProvider';
import * as fileUtil from '../util/fileUtil';
import * as iconv from 'iconv-lite';

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
	public readSlnFile(tree:vscode.TreeView<MsvsProjProvider>): (...args: any[]) => any{
		return async () => {
			if (vscode.workspace.workspaceFolders) {
				let slnFiles:string[] = fileUtil.listupSlnFile(true);
				let selectedSlnFile = "";
				if (slnFiles.length === 1) {
					selectedSlnFile = slnFiles[0];
				} else if (slnFiles.length >= 2) {
					selectedSlnFile = await vscode.window.showQuickPick(slnFiles);
				} else {
					return;
				}
				if (typeof (selectedSlnFile) !== undefined) {
					let mpp = new MsvsProjProvider(selectedSlnFile, this.outputChannel);
					tree.reveal(mpp);
					// vscode.window.createTreeView("slnExplorer", { treeDataProvider: mpp });
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

		let msbuildArgs:string[] = [
			this.slnFilePath,
			`-t:${targetProj.idealPath}`,
			`-t:${target}`
		];
		let exeOption: object = { 
			encoding: 'Shift_JIS', 
			// detachment and ignored stdin are the key here: 
			detached: true, 
			stdio: [ 'ignore', 1, 2 ]
		};

		// output channel on vscode
		this.outputChannel.appendLine(
			`[Info] execute command ""${this.msbuildPath}" ${msbuildArgs}"`);

		// execute a msBuild command
		let child = childProccess.execFile(this.msbuildPath, msbuildArgs, exeOption);
		child.unref();
		child.stdout.on('data', (data) => {
			let stdoutUTF8: string = iconv.decode(data, 'Shift_JIS');
			// let stdoutUTF8 = stdout.toString('Shift_JIS');			
			this.outputChannel.append(stdoutUTF8);
			console.log(stdoutUTF8);
		});

		return;
	}
}
