import * as vscode from 'vscode';
import * as path from 'path';
import * as vsParse from "vs-parse";
import { SlnElem } from './MsvsFilePaser';
import { SlnFilePaser } from "./SlnFilePaser";

export default class MsvsProjProvider implements vscode.TreeDataProvider<SlnElem> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private rootDirPath:string;
	private msvsProjRootNode:SlnElem;
	private tarSlnFilePath:string;

	constructor(private readonly _tarSlnFilePath:string) { 
		this.tarSlnFilePath = _tarSlnFilePath;
		this.rootDirPath = path.dirname(this.tarSlnFilePath);
		
		let solutionData:any = vsParse.parseSolutionSync(this.tarSlnFilePath);
		this.msvsProjRootNode = new SlnElem(".", this.rootDirPath);
		for(let p of solutionData.projects){
			let topDir:string = p.relativePath.split("\\")[0];
			this.msvsProjRootNode.addChild(topDir, p.relativePath);
		}	

		let sfp = new SlnFilePaser(this.tarSlnFilePath, this.rootDirPath);

		return;
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: SlnElem): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: SlnElem): SlnElem[] | Thenable<SlnElem[]> {
		let ret:SlnElem[] = [];
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