import * as vscode from 'vscode';
import * as fs from "fs";
import * as vsParse from "vs-parse";
import { ProjNode } from './ProjNode';

export default class MsvsProjManager{
	public constructor(){
	}
	public listupSlnFiles(rootFolderPath:string):string[] {
		let fileList = this.listupFiles(rootFolderPath, /.*\.sln$/);
		return fileList;
	}
	public listupMsvsProjFiles(rootFolderPath:string):string[] {
		let fileList = this.listupFiles(rootFolderPath, /.*\.vc(x|s)proj$/);
		return fileList;
	}

	private listupFiles(rootFolderPath:string, pattern:RegExp):string[]{
		let srcFileList: string[] = [];
		let tarFileList: string[] = [];
		
		this.readdirRecursively(rootFolderPath,srcFileList);
		for(let file of srcFileList){
			if(pattern.test(file) === true){
				tarFileList.push(file);
			}
		}

		return tarFileList;
	}

	public readSlnFile(slnFilePath:string):ProjNode[] {
		let solutionData:any = vsParse.parseSolutionSync(slnFilePath);

		let projectsInSlnFile:ProjNode[]= [];
		for(let p of solutionData.projects){
			console.log(p);
			let newProjNode:ProjNode = new ProjNode(
				p.relativePath,
				p.relativePath,
				vscode.TreeItemCollapsibleState.Collapsed
			);
			projectsInSlnFile.push(newProjNode);
		}

		return projectsInSlnFile;
	}

	private readdirRecursively(dir:string, files = []):any {
		const paths:string[] = fs.readdirSync(dir);
		const dirs = [];
		for (const path of paths) {
			const stats = fs.statSync(`${dir}/${path}`);
			let fullPath = `${dir}/${path}`.replace(/\\/g, "/");
			if (stats.isDirectory()) {
				dirs.push(fullPath);
			} else {
				files.push(fullPath);
			}
		}
		for (const d of dirs) {
			files = this.readdirRecursively(d, files);
		}
		return files;
	}
}