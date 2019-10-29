import * as vscode from 'vscode';
import * as path from 'path';
import * as vsParse from "vs-parse";
import { MsvsProjFile} from './MsvsFilePaser';

export default class MsvsProjProvider implements vscode.TreeDataProvider<MsvsProjFile> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private rootDirPath:string;
	private msvsProjRootNode:MsvsProjFile;
	private tarSlnFilePath:string;

	constructor(private readonly _tarSlnFilePath:string) { 
		this.tarSlnFilePath = _tarSlnFilePath;
		this.init();
	}
	private init():void{
		this.rootDirPath = path.dirname(this.tarSlnFilePath);
		let solutionData:any = vsParse.parseSolutionSync(this.tarSlnFilePath);
		this.msvsProjRootNode = new MsvsProjFile(".", this.rootDirPath);
		for(let p of solutionData.projects){
			let topDir:string = p.relativePath.split("\\")[0];
			this.msvsProjRootNode.addChild(topDir, p.relativePath);
		}	
		return;
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: MsvsProjFile): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: MsvsProjFile): MsvsProjFile[] | Thenable<MsvsProjFile[]> {
		let ret:MsvsProjFile[] = [];
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