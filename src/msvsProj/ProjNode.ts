import * as vscode from 'vscode';

export class ProjNode extends vscode.TreeItem {
	constructor(
		public readonly label: string, 
		public path: string, 
		public readonly collapsibleState: vscode.TreeItemCollapsibleState, 
		public readonly command?: vscode.Command) {
		super(label, collapsibleState);
	}
	get description(): string {
		return this.path;
	}
}
