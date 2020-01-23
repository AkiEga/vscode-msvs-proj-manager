import { MsvsProjBuildConfig } from './MsvsProjBuildConfig';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

export enum SlnElemType{
	sln = 0,
	proj,
	folder,
}

export class SlnElem extends vscode.TreeItem {
	public type:SlnElemType;
	public children:SlnElem[];
	public idealPath:string;
	public buildConfig:MsvsProjBuildConfig[];
	constructor(
		public ParentGUID:string,
		public label:string,
		public FilePath:string,
		public OwnGUID:string,
		public rootDirPath:string
	){
		super(label, vscode.TreeItemCollapsibleState.Collapsed);
		this.type = SlnElemType.folder;
		if(fs.existsSync(this.fullpath) === true){
			if(fs.lstatSync(this.fullpath).isFile() === true){
				this.collapsibleState = vscode.TreeItemCollapsibleState.None;
				let ext = path.extname(this.fullpath);
				if(ext.match(/.*\.sln/)){
					this.type = SlnElemType.sln;
				}else if(ext.match(/.*proj/)){
					this.type = SlnElemType.proj;
				}
			}
		}
		this.children = [];
		this.buildConfig = [];
	}
	get leafname(): string {
		return path.basename(this.FilePath);
	}
	get description(): string { return this.leafname; }
	get fullpath():string{ return path.join(this.rootDirPath, this.FilePath); }
	get projDir():string{ return path.dirname(this.fullpath); }	
	get idealLabel():string{ return this.label.replace(/\./g, '_');}
	// get idealLeafName():string{ return  this.label.replace(/\./g, '_');}

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
	public PopProjByGUID(targetGUID:string):SlnElem|undefined{
		// pre check for a empty projects case		
		for(let i=0;i<this.children.length;i++){
			if(this.children[i].OwnGUID === targetGUID){
				// clone found proj and remove original proj in projects array
				let ret:SlnElem = this.children[i];
				this.children.splice(i,1);

				return ret;
			}
		}
		// do same process to children proj recursively	
		for(let childProj of this.children){
			if(childProj.HasChildren){
				return childProj.PopProjByGUID(targetGUID);
			}
		}
		return undefined;
	}
	public 	FindByGUID(targetGUID:string):SlnElem|undefined{		
		if(this.OwnGUID === targetGUID){
			return this;
		}

		// do same process to children proj recursively			
		for(let childProj of this.children){	
			let childProjResult = childProj.FindByGUID(targetGUID);
			if(childProjResult){
				return childProjResult;
			}
		}

		return undefined;
	}
	public AddChildProjByGUID(parentGUID:string, childProj:SlnElem):void{
		for(let i=0;i<this.children.length;i++){
			if(this.children[i].OwnGUID === parentGUID){
				let parentProjIndex = i;
				this.children[parentProjIndex].children.push(childProj);
			}
		}
			
		// do same process to children proj recursively
		for(let p of this.children){
			if(p.HasChildren){
				p.AddChildProjByGUID(parentGUID,childProj);
			}
		}
		return;		
	}

	public SetIdealPath(additionalIdealPath:string):void{
		// remove top backslash charactor
		this.idealPath 
			= `${additionalIdealPath}\\${this.idealLabel}`.replace(/^\\/,"");
		
		// do same process to children proj recursively
		if(this.type === SlnElemType.sln){
			this.children.forEach(c=>{c.SetIdealPath("");});	
		}else{
			this.children.forEach(c=>{
				c.SetIdealPath(`${additionalIdealPath}\\${this.idealLabel}`);
			});	
		}
		return;
	}

	public AddBuildConfig(newBuildConfig:MsvsProjBuildConfig):void{
		for(let bc of this.buildConfig){
			// avoid to push duplicated element
			if(	bc.platform === newBuildConfig.platform &&
				bc.DebugOrRelease === newBuildConfig.DebugOrRelease 
				){
				return;
			}
		}
		this.buildConfig.push(newBuildConfig);

		// sort build configures
		// T.B.D
	}
	public FindNearestElem(currentFocusedFilePath:string):SlnElem|undefined{
		let relativePath:string = path.relative(this.projDir, currentFocusedFilePath);
		if( (this.type === SlnElemType.proj) &&
			(relativePath.match(/^[^\.].*/) !== null)){
			return this;
		}

		// do same process to children proj recursively			
		for(let childProj of this.children){	
			let childProjResult = childProj.FindNearestElem(currentFocusedFilePath);
			if(childProjResult){
				return childProjResult;
			}
		}

		return undefined;
	}
}
