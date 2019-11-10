import * as fs from 'fs';
import { SlnElem, MsvsProjBuildConfig } from './MsvsProj';
import * as vscode from 'vscode';
import * as util from 'util';
import * as path from 'path';

export class SlnFileParser {
	public rootMsvsProj: SlnElem;
	private isFirstProject:boolean = true;
	constructor(
		public tarSlnFilePath: string, 
		public rootDirPath: string, 
		private outputChannel:vscode.OutputChannel) {
		let tarSlnFileBasename = path.basename(this.tarSlnFilePath);

		// set root msvs proj (.sln file)
		this.rootMsvsProj = new SlnElem('',tarSlnFileBasename,tarSlnFileBasename,'',this.rootDirPath);
		this.rootMsvsProj.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;

		// .sln read file
		let data:string;
		try{
			data = fs.readFileSync(this.tarSlnFilePath, 'utf-8');
		}catch(err){
			this.outputChannel.appendLine(`[Error] Failed reading "${this.tarSlnFilePath}".`);
			this.outputChannel.appendLine(err);
		}
		this.outputChannel.appendLine(`[Info] Succeed in reading "${this.tarSlnFilePath}".`);
		let lines: string[] = data.split(/\n|\r\n|\r/g);			

		// parse sln file
		this.Parse(lines, 0);

		// apend label to parsed msvs projects
		this.rootMsvsProj.SetIdealPath("");

		// debug output
		this.outputChannel.appendLine(`[Info] Detail info of parsed projects:`);
		this.outputChannel.append(util.inspect(this.rootMsvsProj.children,{showHidden: true, depth: Infinity })+"\n");

		return;
	}
	private Parse(lines: string[], lineIndex: number): void {
		// pre check if index was over 
		if (lineIndex < 0 || lines.length <= lineIndex) {
			return;
		}

		if (lines[lineIndex].match(/^\s*Project.*$/g)) {
			lineIndex = this.ParsedForProj(lines, lineIndex);
		}else if (lines[lineIndex].match(/^\s*GlobalSection\(ProjectConfigurationPlatforms\).*$/g)){
			lineIndex = this.ParsedForBuildConfig(lines, lineIndex);
		}else if (lines[lineIndex].match(/^\s*GlobalSection\(NestedProjects\).*$/g)) {
			lineIndex = this.ParsedForNestedRelation(lines, lineIndex);
		}
		this.Parse(lines, lineIndex + 1);
	}
	private ParsedForProj(lines: string[], lineIndex: number): number {
		if (lines.length <= lineIndex) {
			return;
		}
		
		let matched: string[] = lines[lineIndex].match(/^\s*Project\("{([^{}]*)}"\) = "([^"]*)", "([^"]*)", "{([^{}]*)}"/);
		let ParentGUID = matched[1];
		let label = matched[2];		
		let FilePath = matched[3];
		let OwnGUID = matched[4];

		if(this.isFirstProject){
			this.rootMsvsProj.OwnGUID = ParentGUID;
			this.isFirstProject = false;
		}
		this.rootMsvsProj.children.push(new SlnElem(ParentGUID, label, FilePath, OwnGUID, this.rootDirPath));
		this.outputChannel.appendLine(`[Info] Add Project:"${matched[1]}".`);

		// search "EndProject" 
		let i:number;
		for (i = lineIndex + 1; i < lines.length; i++) {			
			if (lines[i].match(/^\s*EndProject$/)) {
				break;
			}
		}

		return i;
	}
	private ParsedForBuildConfig(lines: string[], lineIndex: number): number {
		let nextLineIndex: number = lineIndex;
		for (nextLineIndex = lineIndex + 1; nextLineIndex < lines.length; nextLineIndex++) {
			let line: string = lines[nextLineIndex];			

			let rGUID:string 	= String.raw`([^{}]*)`;
			let rConfig:string 	= String.raw`(Debug|Release)`;
			let rPlatform:string = String.raw`([^\.]*)`;
			let rActive:string = String.raw`(ActiveCfg|Build\.0)`;
			let rAll:string
				// = String.raw`^\s*{${rGUID}}.${rConfig}\|${rPlatform}\.${rActive} = .*$`;
				= String.raw`^\s*{${rGUID}}\.${rConfig}\|${rPlatform}\.${rActive} = ${rConfig}\|${rPlatform}.*$`;
			// let sAll:string = String.raw`^\s*{${rGUID}}.*$`;
			// let rAll:RegExp = new RegExp(sAll,'');

			let matched = line.match(new RegExp(rAll));
			if (matched) {
				let mGUID:string = matched[1];
				let mConfig:string 	= matched[2];
				let mPlatform:string = matched[3];
				let mActive:string = matched[4];

				let tarProj = this.rootMsvsProj.FindByGUID(mGUID);
				tarProj.buildConfig.push(
					{
						platform:mPlatform,
						DebugOrRelease:mConfig,
						activeState:mActive
					}
				);
			}
			// Detect End Point
			if (line.match(/^\s*EndGlobalSection$/)) {
				break;
			}
		}
		return nextLineIndex;
	}
	private ParsedForNestedRelation(lines: string[], lineIndex: number): number {
		// pre check if index was over 
		if (lines.length <= lineIndex) {
			return;
		}
		let nextLineIndex: number;
		for (nextLineIndex = lineIndex + 1; nextLineIndex < lines.length; nextLineIndex++) {
			let line: string = lines[nextLineIndex];
			let matched: string[] = line.match(/^\s*{([^{}]*)} = {([^{}]*)}\s*$/);
			if (matched) {
				let childProjGUID = matched[1];
				let parentProjGUID = matched[2];

				// pop child proj
				let childProj:SlnElem
					 = this.rootMsvsProj.PopProjByGUID(childProjGUID);
				if(childProj){
					childProj.idealPath = "";
					this.rootMsvsProj.AddChildProjByGUID(parentProjGUID,childProj);
					let parentProj = this.rootMsvsProj.FindByGUID(parentProjGUID);
					this.outputChannel.appendLine(`[Info] Linked Project:"${parentProj.label}(${parentProjGUID})"->"${childProj.label}(${childProjGUID})".`);
				}
			}
			// Detect End Point
			if (line.match(/^\s*EndGlobalSection$/)) {
				break;
			}
		}
		return nextLineIndex;
	}
}
