import * as vscode from 'vscode';
import * as vsParse from "vs-parse";
import * as path from 'path';

export class MsvsProjNode extends vscode.TreeItem {	
	public relativePath: string;
	public rootDirPath: string;
	public children:MsvsProjNode[];

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
	public getBuildSettings(){
		let p = vsParse.parseProjectSync(this.fullPath);
	}
	public getProjDir(){
		return path.dirname(this.fullPath);
	}
	public addChild(childRelativePath:string,fullDepthPath:string):void{
		// add current children nodes		
		let newProjNode:MsvsProjNode = this.CreateNodeAndAddChild(childRelativePath);
		
		// create next children nodes
		if(newProjNode){			
			let nextChildNodePath = this.GenNextChildNodePath(
				childRelativePath, fullDepthPath);
			newProjNode.addChild(nextChildNodePath, fullDepthPath);
		}
	}

	private CreateNodeAndAddChild(childRelativePath:string):MsvsProjNode{
		if(childRelativePath=== undefined){
			return null;
		}
		let newProjNode:MsvsProjNode = new MsvsProjNode(
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
		nextChildNodePath = path.join(childRelativePath,pathDiff.split("\\")[1]);		

		return nextChildNodePath;
	}
}
