import * as vscode from 'vscode';
import * as vsParse from "vs-parse";
import * as path from 'path';

export class MsvsProjNode extends vscode.TreeItem {	
	public relativePath: string;
	public rootDirPath: string;
	public children:MsvsProjNode[];

	constructor(_relativePath:string, _rootDirPath:string){
		let label:string = _relativePath.split("\\")[0];
		super(label, vscode.TreeItemCollapsibleState.Collapsed);
		this.relativePath = _relativePath;
		this.rootDirPath = _rootDirPath;
		this.children = [];
		console.log(this.label + " is created.\n");
	}
	get description(): string {
		return this.label;
	}
	get fullPath():string{
		return path.join(this.rootDirPath,this.relativePath);
	}
	public getBuildSettings(){
		let p = vsParse.parseProjectSync(this.fullPath);
		console.log(p);
	}
	public getProjDir(){
		return path.dirname(this.fullPath);
	}
	public addChild(childRelativePath:string, childRootDirPath:string):void{
		let newProjNode:MsvsProjNode = new MsvsProjNode(
			childRelativePath,
			childRootDirPath			
		);
		if(newProjNode.label === ""){
			return;
		}
		for(let c of this.children){
			if(c.label === newProjNode.label){
				return;
			}
		}

		console.log(newProjNode.label + " is created.\n");
		this.children.push(newProjNode);
		
		let childNodePath:string = '';
		let dirs:string[] = childRelativePath.split('\\');
		for(let i=1;i<dirs.length;i++){
			if(dirs[i]){
				childNodePath += '/' + dirs[i];
			}
		}
		newProjNode.addChild(childNodePath, childRootDirPath);
	}
}
