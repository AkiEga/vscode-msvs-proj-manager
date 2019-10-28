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
		let newProjNode:MsvsProjNode = new MsvsProjNode(
			childRelativePath,
			this.rootDirPath			
		);
		if(newProjNode.label === ""){
			return;
		}
		for(let c of this.children){
			if(c.label === newProjNode.label){
				return;
			}
		}
		this.children.push(newProjNode);

		// create next children nodes
		let pathDiff:string = fullDepthPath.replace(childRelativePath,"");
		if(pathDiff === ""){
			return;
		}
		let nextRootPath:string = path.join(childRelativePath,pathDiff.split("\\")[1]);		

		newProjNode.addChild(nextRootPath, fullDepthPath);
	}
}
