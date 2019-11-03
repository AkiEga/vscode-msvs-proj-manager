import * as path from 'path';
import * as vscode from 'vscode';

export class MsvsProj extends vscode.TreeItem {
	public children:MsvsProj[];
	constructor(
		public ParentGUID:string,
		public label:string,
		public FilePath:string,
		public OwnGUID:string,
		public rootDirPath:string	
	){
			super(label, vscode.TreeItemCollapsibleState.Collapsed);
			this.children = [];
	}
	get description(): string { return this.label; }
	get path():string{ return path.join(this.rootDirPath, this.FilePath); }
	get projDir():string{ return path.dirname(this.path); }	
}
