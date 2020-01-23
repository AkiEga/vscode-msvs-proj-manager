import * as vscode from 'vscode';
import * as childProccess from 'child_process';

import { SlnElem, SlnElemType} from '../msvs/SlnElem';
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
		return async (projNode: SlnElem) => {
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
				}
			}
			return;
		};
	}
	
	public buildMsvsProj(autoSelectActiveBuildConfig:boolean): (...args: any[]) => any {
		return async (projNode: SlnElem) => {
			// set msbuild cmd base string			
			let msbuildCmdStr:string = `"${this.msbuildPath}" "${this.slnFilePath}"`;

			// (if need) select msvs proj
			if(projNode.type === SlnElemType.proj){
				msbuildCmdStr +=  ` -t:${projNode.idealPath}`;
			}

			// (if need) select build config
			if(projNode.buildConfig.length > 0 && autoSelectActiveBuildConfig===false){
				let list:string[] = [];
				for(let bc of projNode.buildConfig){											
					list.push(`Configration=${bc.DebugOrRelease};Platform="${bc.platform}"`);
				}
				let selectedBuildConfig = await vscode.window.showQuickPick(list);
				msbuildCmdStr +=  ` -p:${selectedBuildConfig}`;
			}

			// execute msbuild cmd
			this.exeCmd(msbuildCmdStr);
		};
	}
	public cleanMsvsProj(): (...args: any[]) => any {
		return async (projNode: SlnElem) => {
			// The code you place here will be executed every time your command is executed
			if(projNode.type === SlnElemType.proj){
				this.exeCmd(`"${this.msbuildPath}" "${this.slnFilePath}" -t:${projNode.idealPath}:Clean`);
			}else if(projNode.type === SlnElemType.sln){
				this.exeCmd(`"${this.msbuildPath}" "${this.slnFilePath}" -t:Clean`);
			}
		};
	}

	private exeCmd(CmdStr:string) {
		let exeOption: object = { 
			encoding: 'Shift_JIS', 
			// detachment and ignored stdin are the key here: 
			detached: true, 
			stdio: [ 'ignore', 1, 2 ]
		};

		// output channel on vscode
		this.outputChannel.appendLine(
			`[Info] execute command "${CmdStr}"`);

		// execute a msBuild command
		let child = childProccess.exec(CmdStr, exeOption);
		child.unref();
		child.stdout.on('data', (data) => {
			let stdoutUTF8: string = iconv.decode(data, 'Shift_JIS');
			this.outputChannel.show(true);
			this.outputChannel.append(stdoutUTF8);
		});

		return;
	}
}
