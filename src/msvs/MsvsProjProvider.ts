import * as vscode from 'vscode';
import * as path from 'path';
import * as vsParse from "vs-parse";
import { SlnFileManager} from './MsvsFilePaser';

export default class MsvsProjProvider implements vscode.TreeDataProvider<SlnFileManager> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private rootDirPath:string;
	private msvsProjRootNode:SlnFileManager;
	private tarSlnFilePath:string;

	constructor(private readonly _tarSlnFilePath:string) { 
		this.tarSlnFilePath = _tarSlnFilePath;
		this.init();
	}
	private init():void{
		this.rootDirPath = path.dirname(this.tarSlnFilePath);
		let solutionData:any = vsParse.parseSolutionSync(this.tarSlnFilePath);
		this.msvsProjRootNode = new SlnFileManager(".", this.rootDirPath);
		for(let p of solutionData.projects){
			let topDir:string = p.relativePath.split("\\")[0];
			this.msvsProjRootNode.addChild(topDir, p.relativePath);
		}	

		let mpf = new SlnFileManager(this.tarSlnFilePath, this.rootDirPath);
		mpf.ReadSlnFile(this.tarSlnFilePath);
		return;
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: SlnFileManager): vscode.TreeItem {
		return element;
	}

	public getChildren(element?: SlnFileManager): SlnFileManager[] | Thenable<SlnFileManager[]> {
		let ret:SlnFileManager[] = [];
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