import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import MsvsProjManager from './msvsProjManager';
import { ProjNode } from './ProjNode';

export default class MsvsProjProvider implements vscode.TreeDataProvider<ProjNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private rootDirPath:string;

	constructor(private readonly mpm: MsvsProjManager, private readonly tarSlnFilePath:string) { 
		this.rootDirPath = path.dirname(tarSlnFilePath);
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}


	public getTreeItem(element: ProjNode): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: ProjNode): ProjNode[] | Thenable<ProjNode[]> {
		let ret:ProjNode[] = [];
		//let currentPathPos = path.join(this.rootDirPath, element.path);
		if(element){
			if(path.dirname(element.path) === this.rootDirPath){
				ret = this.mpm.readSlnFile(this.tarSlnFilePath);
			}
		}else{
			ret = this.mpm.readSlnFile(this.tarSlnFilePath);
		}
		return ret;
	}

	// public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
	// 	return this.model.getContent(uri).then(content => content);
	// }
}