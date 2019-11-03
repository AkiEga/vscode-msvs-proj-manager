//import { MsvsProjFile } from './MsvsFilePaser';
import * as path from 'path';
import * as vscode from 'vscode';
import * as vsParse from "vs-parse";
import * as fs from 'fs';
import MsvsProjProvider from './MsvsProjProvider';
import { match } from 'minimatch';

class MyPath{
	public cwd:string; 		// full path of current work directory 
	public relative:string; // relative
	public full:string; 	// full path

	constructor(_cwd:string, _full:string){
		this.cwd = _cwd;
		this.full = _full;
		this.relative = path.relative(this.cwd, this.full);
	}
}

export class SlnFileManager extends vscode.TreeItem {
	public id: string;	
	public label: string;
	public realFilePath: MyPath;
	public idealFilePath: MyPath;
	public relativePath: string;
	public rootDirPath: string;
	public children:SlnFileManager[];

	public projects:MsvsProj[];
	public projectsTree:MsvsProjTree;

	constructor(_relativePath:string, _rootDirPath:string){
		let label:string = _relativePath.split("\\").pop();
		super(label, vscode.TreeItemCollapsibleState.Collapsed);
		this.relativePath = _relativePath;
		this.rootDirPath = _rootDirPath;
		this.children = [];

		this.projects = [];		
		this.projectsTree = new MsvsProjTree();
	}
	public ReadSlnFile(tarSlnFilePath:string){
		// read file
		fs.readFile(tarSlnFilePath, 'utf-8', (err, data)=>{
			let lines:string[] = data.split('\n');			
			this.Parse(lines,0);
		});
	}

	private Parse(lines:string[],lineIndex:number):void{	
		if(lines.length > lineIndex){
			let l = lines[lineIndex];
			// Project("{<Parent GUID>}") = "<Element Label>", "<Element Real File Path>", "{<Elemnt GUID>}"
			// EndProject
			if(l.match(/^\s*Project.*$/g)){
				lineIndex = this.ParsedForProj(lines,lineIndex);
			}else if(l.match(/^\s*GlobalSection\(NestedProjects\).*$/g)){
				lineIndex = this.ParsedForGlobalSection(lines,lineIndex);
			}

		}
		return;
	}

	private ParsedForProj(lines:string[],lineIndex:number):number{
		let newLineIndex:number = lineIndex;
		if(lines.length > lineIndex){
			let line = lines[lineIndex];

			let parsedLine:string[] = [];
			let regExp:RegExp = new RegExp('(Project)|[\(\)\{\}]','g');
			let filtered:string = line.replace(regExp,"");
			let splited:string[] = filtered.split(/[,=]/g);
			for(let s of splited){
				parsedLine.push(s.trim().replace(/"/g,''));
			}
			this.projects.push(new MsvsProj(parsedLine[0],parsedLine[1],parsedLine[2],parsedLine[3]));

			// search "EndProject"
			for(let i=lineIndex+1;i<lines.length;i++){
				line = lines[i];
				if(line.match(/^\s*EndProject$/)){
					newLineIndex = i;
					break;
				}
			}
		}else{
			newLineIndex = -1;
		}
		return newLineIndex;
	}
	private ParsedForGlobal(lines:string[],lineIndex:number):number{
		let newLineIndex:number = lineIndex;
		if(lines.length > lineIndex){
			let line = lines[lineIndex];

			let parsedLine:string[] = [];
			let regExp:RegExp = new RegExp('(Global)|[\(\)\{\}]','g');
			let filtered:string = line.replace(regExp,"");
			let splited:string[] = filtered.split(/[,=]/g);
			for(let s of splited){
				parsedLine.push(s.trim().replace(/"/g,''));
			}
			this.projects.push(new MsvsProj(parsedLine[0],parsedLine[1],parsedLine[2],parsedLine[3]));

			// search "EndProject"
			for(let i=lineIndex+1;i<lines.length;i++){
				line = lines[i];
				if(line.match(/^EndGlobal$/)){
					newLineIndex = i;
					break;
				}
			}
		}else{
			newLineIndex = -1;
		}
		return newLineIndex;
	}
	private ParsedForGlobalSection(lines:string[],lineIndex:number):number{
		let newLineIndex:number = lineIndex;
		if(lines.length > lineIndex){
			let line = lines[lineIndex];

			for(let i=lineIndex+1;i<lines.length;i++){
				line = lines[i];

				let matched:string[] = line.match(/^\s*{([^{}]*)} = {([^{}]*)}\s*$/g);
				let parentProjGUID = matched[0];
				let childProjGUID = matched[1];
				this.projects.find((value,index,obj)=>{

				});

				if(line.match(/^\s*EndGlobalSection$/)){
					newLineIndex = i;
					break;
				}
			}
		}else{
			newLineIndex = -1;
		}
		return newLineIndex;
	}

	get description(): string {
		return this.label;
	}
	get fullPath():string{
		return path.join(this.rootDirPath,this.relativePath);
	}
	public getProjDir(){
		return path.dirname(this.fullPath);
	}

	public addChild(childRelativePath:string,fullDepthPath:string):void{
		// add current children nodes		
		let newProjNode:SlnFileManager = this.CreateNodeAndAddChild(childRelativePath);

		// create next children nodes
		if(newProjNode){			
			let nextChildNodePath = this.GenNextChildNodePath(
				childRelativePath, fullDepthPath);
			newProjNode.addChild(nextChildNodePath, fullDepthPath);
		}
	}

	private CreateNodeAndAddChild(childRelativePath:string):SlnFileManager{
		if(childRelativePath=== undefined){
			return null;
		}
		let newProjNode:SlnFileManager = new SlnFileManager(
			childRelativePath,
			this.rootDirPath			
		);

		let isAddChild:Boolean = true;
		if(newProjNode.label === ""){
			isAddChild = false;
		}
		for(let c of this.children){
			if(c.label === newProjNode.label){
				isAddChild = false;
			}
		}

		if(isAddChild === true){
			this.children.push(newProjNode);
		}

		return newProjNode;
	}

	private GenNextChildNodePath(childRelativePath:string, fullDepthPath:string):string{
		let nextChildNodePath:string = "";
		let pathDiff:string = fullDepthPath.replace(childRelativePath,"");
		if(pathDiff === ""){
			return;
		}
		let pathDiffSplitted:string[] = pathDiff.split(/\\|\//);
		let nextDirname:string = pathDiffSplitted[1];
		if(nextDirname !== ""){
			nextChildNodePath = path.join(childRelativePath,nextDirname);	
		}
		return nextChildNodePath;
	}
}
class MsvsProjTree{
	public own:MsvsProj;
	public children:MsvsProj[];
	public addChild(newProj:MsvsProj){
		let doAdd:boolean = true;
		// check dupulication
		for(let c of this.children){
			if(c.OwnGUID === newProj.OwnGUID){
				doAdd = false;
			}
		}
		// do addition
		if(doAdd === true){
			this.children.push(newProj);
		}
	}
}
class MsvsSlnFile {
	public readonly id:string;
	public realFilePath:MyPath;
	public rootMsvsProjFile:SlnFileManager;
	constructor(_cwd:string, _realFullFilePath:string){
		this.realFilePath = new MyPath(_cwd, _realFullFilePath);
	}
}
class MsvsProj{
	constructor(
		public ParentGUID:string,
		public label:string,
		public OwnGUID:string,
		public FilePath:string
		){			
	}
}

export default class MsvsFilePaser{
	public sln:MsvsSlnFile;
	public tree:MsvsProjTree;
	public ParseSlnFile(tarSlnFilePath:string){
		this.sln = vsParse.parseSolutionSync(tarSlnFilePath);
		this.tree = new MsvsProjTree;
	}

}