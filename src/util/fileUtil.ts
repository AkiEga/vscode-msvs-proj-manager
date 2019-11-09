import * as vscode from 'vscode';
import * as fs from 'fs';
import * as process from 'process';

///////////////////////////////////////////////////////////////////////////////
// For utility
///////////////////////////////////////////////////////////////////////////////
export function searchFileInEnvValPath(pattern:RegExp):string|undefined{
	let pathEnvVal:string[] = process.env.path.split(";");

	for(let p of pathEnvVal){
		let filesInPath = readdirNotRecursively(p);
		for(let f of filesInPath){
			let str:string =f;
			if(str.match(pattern)){				
				return str.replace(/\\/g, "/");
			}
		}
	}

	return undefined;
}

function readdirRecursively(dir: string): any {
	let files:string[] = [];
	const paths: string[] = fs.readdirSync(dir);
	const dirs = [];
	files = files.concat(readdirNotRecursively(dir));
	for (const d of dirs) {
		files = files.concat(readdirRecursively(d));
	}
	return files;
}
function readdirNotRecursively(dir: string): any {
	let files:string[] = [];
	const paths: string[] = fs.readdirSync(dir);
	
	for (const path of paths) {
		const stats = fs.statSync(`${dir}/${path}`);
		let fullPath = `${dir}/${path}`.replace(/\\/g, "/");
		if (stats.isDirectory() === false) {
			files.push(fullPath);
		}
	}
	
	return files;
}
function listupFiles(rootFolderPath: string, pattern: RegExp, recursively:boolean): string[] {
	let srcFileList: string[] = [];
	let tarFileList: string[] = [];
	if(recursively===true){
		srcFileList = readdirRecursively(rootFolderPath);
	}else{
		srcFileList = readdirNotRecursively(rootFolderPath);
	}
	for (let file of srcFileList) {
		if (pattern.test(file) === true) {
			tarFileList.push(file);
		}
	}
	return tarFileList;
}
export function listupSlnFile(recursively:boolean): string[] {
	if (vscode.workspace.workspaceFolders) {
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
		let slnFiles: string[] = listupFiles(workspaceFolder, /.*\.sln$/, recursively);
		return slnFiles;
	}
	else {
		return [];
	}
}
