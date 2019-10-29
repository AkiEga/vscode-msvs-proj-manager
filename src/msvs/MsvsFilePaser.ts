import * as path from 'path';

class MyPath{
	public cwd:string; 		// full path of current work directory 
	public relative:string; // relative
	public full:string; 	// full path

	constructor(_cwd:string, _full:string){
		this.cwd = _cwd;
		this.full = _full;
		this.relative = path.relative(this.cwd, this.full);
	}
}

class MsvsProjFileTree{
	public children:MsvsProjFile[];
}

export class MsvsProjFile {
	public id: string;	
	public label: string;
	public realFilePath: MyPath;
	public idealFilePath: MyPath;
}

export class MsvsSlnFile {
	public readonly id:string;
	public realFilePath:MyPath;
	public rootMsvsFileTreeNode:MsvsProjFileTree;
}

export default class MsvsFilePaser{
	public sln:MsvsSlnFile;
	constructor(){

	}
	public ParseSlnFile(){

	}

}