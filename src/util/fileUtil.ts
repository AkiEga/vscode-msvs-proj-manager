import * as vscode from 'vscode';
import * as fs from 'fs';

///////////////////////////////////////////////////////////////////////////////
// For utility
///////////////////////////////////////////////////////////////////////////////
function readdirRecursively(dir: string, files = []): any {
	const paths: string[] = fs.readdirSync(dir);
	const dirs = [];
	for (const path of paths) {
		const stats = fs.statSync(`${dir}/${path}`);
		let fullPath = `${dir}/${path}`.replace(/\\/g, "/");
		if (stats.isDirectory()) {
			dirs.push(fullPath);
		}
		else {
			files.push(fullPath);
		}
	}
	for (const d of dirs) {
		files = readdirRecursively(d, files);
	}
	return files;
}
function listupFiles(rootFolderPath: string, pattern: RegExp): string[] {
	let srcFileList: string[] = [];
	let tarFileList: string[] = [];
	readdirRecursively(rootFolderPath, srcFileList);
	for (let file of srcFileList) {
		if (pattern.test(file) === true) {
			tarFileList.push(file);
		}
	}
	return tarFileList;
}
export function listupSlnFile(): string[] {
	if (vscode.workspace.workspaceFolders) {
		let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
		let slnFiles: string[] = listupFiles(workspaceFolder, /.*\.sln$/);
		return slnFiles;
	}
	else {
		return [];
	}
}
