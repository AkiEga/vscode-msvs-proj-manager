import * as fs from 'fs';
import { MsvsProj } from './MsvsFilePaser';

export class SlnFilePaser {
	public tarSlnFilePath: string;
	public rootDirPath: string;
	public projects: MsvsProj[];
	constructor(_tarSlnFilePath: string, _rootDirPath: string) {
		this.tarSlnFilePath = _tarSlnFilePath;
		this.rootDirPath = _rootDirPath;
		this.projects = [];		
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
			this.projects.push(new MsvsProj(parsedLine[0], parsedLine[1], parsedLine[2], parsedLine[3]));
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
	private ParsedForGlobal(lines: string[], lineIndex: number): number {
		let newLineIndex: number = lineIndex;
		if (lines.length > lineIndex) {
			let line = lines[lineIndex];
			let parsedLine: string[] = [];
			let regExp: RegExp = new RegExp('(Global)|[\(\)\{\}]', 'g');
			let filtered: string = line.replace(regExp, "");
			let splited: string[] = filtered.split(/[,=]/g);
			for (let s of splited) {
				parsedLine.push(s.trim().replace(/"/g, ''));
			}
			this.projects.push(new MsvsProj(parsedLine[0], parsedLine[1], parsedLine[2], parsedLine[3]));
			// search "EndProject"
			for (let i = lineIndex + 1; i < lines.length; i++) {
				line = lines[i];
				if (line.match(/^EndGlobal$/)) {
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
				let childProj: MsvsProj;
				let parentProj: MsvsProj;
				// Find parent/child proj
				for (let p of this.projects) {
					if (p.OwnGUID === parentProjGUID) {
						parentProj = p;
					}
					if (p.OwnGUID === childProjGUID) {
						childProj = p;
					}
				}
				// push child proj into parent proj
				parentProj.children.push(childProj);
			}
			// Detect End Point
			if (line.match(/^\s*EndGlobalSection$/)) {
				newLineIndex = i;
				break;
			}
		}
		return newLineIndex;
	}
}
