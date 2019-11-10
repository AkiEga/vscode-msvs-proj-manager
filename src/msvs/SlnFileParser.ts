import * as fs from 'fs';
import { SlnElem, SlnElemType } from './MsvsProj';
import * as vscode from 'vscode';
import * as util from 'util';
import * as path from 'path';
import { parentPort } from 'worker_threads';

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
		this.rootMsvsProj.type = SlnElemType.sln;
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
		for(let p of this.rootMsvsProj.children){
			p.idealPath = p.idealLabel;			
			if(p.HasChildren){
				p.type = SlnElemType.folder;
				this.SetIdealPathRecursively(p.children,p.idealPath);
			}else{
				p.type = SlnElemType.proj;
			}
		}

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

		let l = lines[lineIndex];
		// Project("{<Parent GUID>}") = "<Element Label>", "<Element Real File Path>", "{<Elemnt GUID>}"
		// EndProject
		if (l.match(/^\s*Project.*$/g)) {
			lineIndex = this.ParsedForProj(lines, lineIndex);
		}
		else if (l.match(/^\s*GlobalSection\(NestedProjects\).*$/g)) {
			lineIndex = this.ParsedForGlobalSection(lines, lineIndex);
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
	// private ParsedForGlobal(lines: string[], lineIndex: number): number {
	// 	let newLineIndex: number = lineIndex;
		
	// 	return newLineIndex;
	// }
	private ParsedForGlobalSection(lines: string[], lineIndex: number): number {
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
					 = this.RandomPopProjByGUID(this.rootMsvsProj.children,childProjGUID);
				if(childProj){
					childProj.idealPath = "";
					this.AddChildProjByGUID(this.rootMsvsProj.children,parentProjGUID,childProj, "");
					let parentProj = this.FindByGUID(this.rootMsvsProj, parentProjGUID);
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

	private RandomPopProjByGUID(projects:SlnElem[], targetGUID:string):SlnElem|undefined{
		// pre check for a empty projects case
		if(projects.length === 0){
			return undefined;
		}
		
		for(let i=0;i<projects.length;i++){
			if(projects[i].OwnGUID === targetGUID){
				// clone found proj and remove original proj in projects array
				let ret:SlnElem = projects[i];
				projects.splice(i,1);

				return ret;
			}
		}
		// do same process to children proj recursively	
		for(let p of projects){
			// do same process to children proj recursively
			if(p.HasChildren){
				return this.RandomPopProjByGUID(p.children,targetGUID);
			}
		}
	}
	private FindByGUID(project:SlnElem, targetGUID:string):SlnElem|undefined{		
		if(project.OwnGUID === targetGUID){
			return project;
		}

		// do same process to children proj recursively			
		for(let p of project.children){	
			let ret = this.FindByGUID(p,targetGUID);
			if(ret){
				return ret;
			}
		}

		return undefined;
	}
	private AddChildProjByGUID(projects:SlnElem[], parentGUID:string, childProj:SlnElem, additionalIdealPath:string):void{
		for(let i=0;i<projects.length;i++){
			if(projects[i].OwnGUID === parentGUID){
				let parentProjIndex = i;
				projects[parentProjIndex].children.push(childProj);
			}
		}
			
		// do same process to children proj recursively
		for(let p of projects){
			if(p.HasChildren){
				this.AddChildProjByGUID(p.children,parentGUID,childProj,additionalIdealPath);
			}
		}
		return;		
	}
	private SetIdealPathRecursively(projects:SlnElem[],additionalIdealPath:string):void{
		for(let p of projects){
			p.idealPath = `${additionalIdealPath}\\${p.idealLabel}`;
			if(p.HasChildren){
				p.type = SlnElemType.folder;
				this.SetIdealPathRecursively(p.children,`${p.idealPath}`);
			}else{
				p.type = SlnElemType.proj;
			}
		}
		return;
	}
}
