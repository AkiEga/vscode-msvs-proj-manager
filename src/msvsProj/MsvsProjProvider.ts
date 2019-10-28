import * as vscode from 'vscode';
import * as path from 'path';
import * as vsParse from "vs-parse";
import { MsvsProjNode } from './MsvsProjNode';

export default class MsvsProjProvider implements vscode.TreeDataProvider<MsvsProjNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private rootDirPath:string;
	private msvsProjRootNode:MsvsProjNode;

	constructor(private readonly tarSlnFilePath:string) { 
		this.rootDirPath = path.dirname(tarSlnFilePath);
		let solutionData:any = vsParse.parseSolutionSync(tarSlnFilePath);
		this.msvsProjRootNode = new MsvsProjNode(".", this.rootDirPath);
		for(let p of solutionData.projects){
			this.msvsProjRootNode.addChild(p.relativePath,this.rootDirPath);
		}	
	}
	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: MsvsProjNode): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: MsvsProjNode): MsvsProjNode[] | Thenable<MsvsProjNode[]> {
		let ret:MsvsProjNode[] = [];
		if(element){
			if(path.dirname(element.fullPath) === this.rootDirPath){
				ret = this.msvsProjRootNode.children;
			}else{
				ret = element.children;
			}
		}else{
			ret = this.msvsProjRootNode.children;
		}
		return ret;
	}
}