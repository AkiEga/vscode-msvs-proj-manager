import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import MsvsProjManager from './msvsProjManager';

export  class ProjNode extends vscode.TreeItem {	
	constructor(
		public readonly label: string,
		private path: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}

	get description(): string {
		return this.path;
	}

	// iconPath = {
	// 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
	// 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	// };

	// contextValue = 'project';
}
export default class MsvsProjProvider implements vscode.TreeDataProvider<ProjNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

	constructor(private readonly mpm: MsvsProjManager, private readonly tarSlnFile:string) { }

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}


	public getTreeItem(element: ProjNode): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: ProjNode): ProjNode[] | Thenable<ProjNode[]> {
		let projects = this.mpm.readSlnFile(this.tarSlnFile);
		let pn: ProjNode[] = [];
		for(let p of projects){
			let newProjNode:ProjNode
				= new ProjNode(p,p,vscode.TreeItemCollapsibleState.Collapsed);
			pn.push(newProjNode);
		}
		return pn;
	}

	// public provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
	// 	return this.model.getContent(uri).then(content => content);
	// }
}