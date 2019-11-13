import * as vscode from 'vscode';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import * as dotenv from 'dotenv';

///////////////////////////////////////////////////////////////////////////////
// For utility
///////////////////////////////////////////////////////////////////////////////
export function searchFileInEnvValPath(pattern:RegExp):string[]{
	let pathEnvVal:string[] = process.env.path.split(";");
	let filesInPath:string[] = [];
	for(let p of pathEnvVal){
		for(let f of readdirNotRecursively(p)){
			if(f.match(pattern)){				
				filesInPath.push(f);
			}
		}
	}

	return filesInPath;
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
	const paths: fs.Dirent[] = fs.readdirSync(dir, {withFileTypes: true});
	
	for (const p of paths) {
		if (p.isDirectory() === false) {
			files.push(path.join(dir,p.name).replace(/\\/g,'/'));
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
export function pathSettingWithDotEnvfile():void{
	let dotenvFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".vscode/.env");

	// check .env file exists
	try{
		fs.statSync(dotenvFilePath);
	}catch(err){
		if(err.code === 'ENOENT'){
			return;
		}
	}
	const envConfig = dotenv.parse(fs.readFileSync(dotenvFilePath));
	for (const k in envConfig) {
		if(process.env[k]){
			process.env[k] = process.env[k] + ";" + envConfig[k];
		}else{
			process.env[k] = envConfig[k];
		}
	}
	return;
}