import * as vscode from 'vscode';
import * as path from 'path';
import { SlnElem } from './SlnElem';
import { SlnFileParser } from "./SlnFileParser";

export default class MsvsProjProvider implements vscode.TreeDataProvider<SlnElem> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;
	private sfp:SlnFileParser;

	constructor(private readonly _tarSlnFilePath:string,  private outputChannel:vscode.OutputChannel) { 
		let rootDirPath = path.dirname(_tarSlnFilePath);
		outputChannel.appendLine(`[Info] start to read "${_tarSlnFilePath}".`);
		this.sfp = new SlnFileParser(_tarSlnFilePath, rootDirPath, outputChannel);
		outputChannel.appendLine(`[Info] end to read "${_tarSlnFilePath}".`);
		return;
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire();
	}

	public getTreeItem(element: SlnElem): vscode.TreeItem {
		return element;
	}
	public getParent(element: SlnElem): SlnElem {
		return element;
	}
	public getChildren(element?: SlnElem): SlnElem[] | Thenable<SlnElem[]> {
		let ret:SlnElem[] = [];
		if(element){
			let elemFullPath = path.join(this.sfp.rootDirPath, element.fullpath);
			if(elemFullPath === this.sfp.rootDirPath){
				ret = this.sfp.rootMsvsProj.children;
			}else{
				ret = element.children;
			}
		}else{
			ret = [this.sfp.rootMsvsProj];
		}
		return ret;
	}
}