import * as fs from 'fs';
import { MsvsProj } from './MsvsProj';

export class SlnFileParser {
	public tarSlnFilePath: string;
	public rootDirPath: string;
	public rootMsvsProj: MsvsProj;
	constructor(_tarSlnFilePath: string, _rootDirPath: string) {
		this.tarSlnFilePath = _tarSlnFilePath;
		this.rootDirPath = _rootDirPath;
		this.rootMsvsProj = new MsvsProj('','','','',this.rootDirPath);
		// .sln read file
		fs.readFile(this.tarSlnFilePath, 'utf-8', (err, data) => {
			let lines: string[] = data.split('\n');
			this.Parse(lines, 0);
		});
	}
	private Parse(lines: string[], lineIndex: number): void {
		// pre check if index was over 
		if (lines.length <= lineIndex) {
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
		let newLineIndex: number = lineIndex;
		if (lines.length > lineIndex) {
			let line = lines[lineIndex];
			let parsedLine: string[] = [];
			let regExp: RegExp = new RegExp('(Project)|[\(\)\{\}]', 'g');
			let filtered: string = line.replace(regExp, "");
			let splited: string[] = filtered.split(/[,=]/g);
			for (let s of splited) {
				parsedLine.push(s.trim().replace(/"/g, ''));
			}
			this.rootMsvsProj.children.push(new MsvsProj(parsedLine[0], parsedLine[1], parsedLine[2], parsedLine[3], this.rootDirPath));
			// search "EndProject"
			for (let i = lineIndex + 1; i < lines.length; i++) {
				line = lines[i];
				if (line.match(/^\s*EndProject$/)) {
					newLineIndex = i;
					break;
				}
			}
		}
		else {
			newLineIndex = -1;
		}
		return newLineIndex;
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
		let newLineIndex: number = lineIndex;
		for (let i = lineIndex + 1; i < lines.length; i++) {
			let line: string = lines[i];
			let matched: string[] = line.match(/^\s*{([^{}]*)} = {([^{}]*)}\s*$/);
			if (matched) {
				let childProjGUID = matched[1];
				let parentProjGUID = matched[2];

				// find parent/child proj index
				let parentProjIndex = this.rootMsvsProj.FindChildrenProjIndexByGUID(parentProjGUID);
				let childProjIndex = this.rootMsvsProj.FindChildrenProjIndexByGUID(childProjGUID);

				// move child proj to parent proj's under
				if(parentProjIndex !== undefined && childProjIndex !== undefined){
					let childProj:MsvsProj = this.PopProjByGUID(this.rootMsvsProj.children,childProjGUID);
					this.rootMsvsProj.children[parentProjIndex].children.push(childProj);
				}
			}
			// Detect End Point
			if (line.match(/^\s*EndGlobalSection$/)) {
				newLineIndex = i;
				break;
			}
		}
		return newLineIndex;
	}

	private PopProjByGUID(projects:MsvsProj[], targetGUID:string):MsvsProj|undefined{
		// pre check for a empty projects case
		if(projects.length === 0){
			return undefined;
		}

		let foundProjIndex = projects.findIndex((v)=>{return v.OwnGUID === targetGUID;});
		if(foundProjIndex){
			// clone found proj and remove original proj in projects array
			let ret:MsvsProj = projects[foundProjIndex];
			projects.splice(foundProjIndex,1);

			return ret;
		}else{
			for(let p of projects){
				// do same process to children proj recursively
				return this.PopProjByGUID(p.children,targetGUID);
			}
		}
	}
}