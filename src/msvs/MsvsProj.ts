import * as path from 'path';
import * as vscode from 'vscode';

export class MsvsProj extends vscode.TreeItem {
	public children:MsvsProj[];
	public idealPath:string;
	constructor(
		public ParentGUID:string,
		public label:string,
		public FilePath:string,
		public OwnGUID:string,
		public rootDirPath:string	
	){
			super(label, vscode.TreeItemCollapsibleState.Collapsed);
			this.children = [];
			this.idealPath = label.replace(/\./g, '_');
	}
	get description(): string { return this.label; }
	get path():string{ return path.join(this.rootDirPath, this.FilePath); }
	get projDir():string{ return path.dirname(this.path); }	
	get idealLeafName():string{ return this.label.replace(/\./g, '_'); }

	public HasChildren():boolean{
		if(this.children.length >0){
			return true;
		}else{
			return false;
		}
	}
	public FindChildrenProjIndexByGUID(targetGUID:string):number|undefined{
		let ret:number = this.children.findIndex((v)=>{return v.OwnGUID === targetGUID;});

		if(ret){
			return ret;
		}else{
			return undefined;
		}
	}
}
