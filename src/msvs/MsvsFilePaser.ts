import * as path from 'path';
import * as vscode from 'vscode';

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

class MsvsProjFileTree{
	public children:MsvsProjFile[];
}

export class MsvsProjFile extends vscode.TreeItem {
	public id: string;	
	public label: string;
	public realFilePath: MyPath;
	public idealFilePath: MyPath;
	public relativePath: string;
	public rootDirPath: string;
	public children:MsvsProjFile[];

	constructor(_relativePath:string, _rootDirPath:string){
		let label:string = _relativePath.split("\\").pop();
		super(label, vscode.TreeItemCollapsibleState.Collapsed);
		this.relativePath = _relativePath;
		this.rootDirPath = _rootDirPath;
		this.children = [];
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
		let newProjNode:MsvsProjFile = this.CreateNodeAndAddChild(childRelativePath);

		// create next children nodes
		if(newProjNode){			
			let nextChildNodePath = this.GenNextChildNodePath(
				childRelativePath, fullDepthPath);
			newProjNode.addChild(nextChildNodePath, fullDepthPath);
		}
	}

	private CreateNodeAndAddChild(childRelativePath:string):MsvsProjFile{
		if(childRelativePath=== undefined){
			return null;
		}
		let newProjNode:MsvsProjFile = new MsvsProjFile(
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
	}}

export class MsvsSlnFile {
	public readonly id:string;
	public realFilePath:MyPath;
	public rootMsvsProjFile:MsvsProjFile;
	constructor(_cwd:string, _realFullFilePath:string){
		this.realFilePath = new MyPath(_cwd, _realFullFilePath);
	}
}

export default class MsvsFilePaser{
	public sln:MsvsSlnFile;
	constructor(){

	}
	public ParseSlnFile(){

	}

}