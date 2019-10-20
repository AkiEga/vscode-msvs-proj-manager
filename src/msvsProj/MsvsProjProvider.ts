import * as vscode from 'vscode';
import * as path from 'path';
import * as vsParse from "vs-parse";
import { MsvsProjNode } from './MsvsProjNode';

export default class MsvsProjProvider implements vscode.TreeDataProvider<MsvsProjNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private rootDirPath:string;
	private msvsProjNodes:MsvsProjNode[];

	constructor(private readonly tarSlnFilePath:string) { 
		this.rootDirPath = path.dirname(tarSlnFilePath);
		let solutionData:any = vsParse.parseSolutionSync(tarSlnFilePath);
		this.msvsProjNodes = [];
		for(let p of solutionData.projects){
			let msvsProjFullPath:string = path.join(this.rootDirPath, p.relativePath);
			let newProjNode:MsvsProjNode = new MsvsProjNode(
				p.relativePath,
				msvsProjFullPath,
				vscode.TreeItemCollapsibleState.Collapsed
			);
			this.msvsProjNodes.push(newProjNode);
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
		//let currentPathPos = path.join(this.rootDirPath, element.path);
		if(element){
			if(path.dirname(element.path) === this.rootDirPath){
				ret = this.msvsProjNodes;
			}
		}else{
			ret = this.msvsProjNodes;
		}
		return ret;
	}
}