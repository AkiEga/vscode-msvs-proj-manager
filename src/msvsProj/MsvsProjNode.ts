import * as vscode from 'vscode';
import * as vsParse from "vs-parse";
import * as path from 'path';

export class MsvsProjNode extends vscode.TreeItem {
	constructor(
		public readonly label: string, 
		public path: string, 
		public readonly collapsibleState: vscode.TreeItemCollapsibleState, 
		public readonly command?: vscode.Command) {
		super(label, collapsibleState);
	}
	get description(): string {
		return this.label;
	}
	public getBuildSettings(){
		let p = vsParse.parseProjectSync(this.path);
		console.log(p);
	}
	public getProjDir(){
		return path.dirname(this.path);
	}
}
