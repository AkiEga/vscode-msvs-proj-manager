import * as path from 'path';
import * as vscode from 'vscode';

export class MsvsProj{
	public children:MsvsProj[];
	constructor(
		public ParentGUID:string,
		public label:string,
		public FilePath:string,
		public OwnGUID:string		
		){			
			this.children = [];
	}
}

export class SlnElem extends vscode.TreeItem {
	public id: string;	
	public label: string;
	public relativePath: string;
	public rootDirPath: string;
	public children:SlnElem[];

	constructor(_relativePath:string, _rootDirPath:string){
		let label:string = _relativePath.split("\\").pop();
		super(label, vscode.TreeItemCollapsibleState.Collapsed);
		this.relativePath = _relativePath;
		this.rootDirPath = _rootDirPath;
		this.children = [];
	}

	get description(): string { return this.label; }
	get fullPath():string{ return path.join(this.rootDirPath,this.relativePath); }
	get projDir():string{ return path.dirname(this.fullPath); }

	public addChild(childRelativePath:string,fullDepthPath:string):void{
		// add current children nodes		
		let newProjNode:SlnElem = this.CreateNodeAndAddChild(childRelativePath);

		// create next children nodes
		if(newProjNode){			
			let nextChildNodePath = this.GenNextChildNodePath(
				childRelativePath, fullDepthPath);
			newProjNode.addChild(nextChildNodePath, fullDepthPath);
		}
	}

	private CreateNodeAndAddChild(childRelativePath:string):SlnElem{
		if(childRelativePath=== undefined){
			return null;
		}
		let newProjNode:SlnElem = new SlnElem(
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
