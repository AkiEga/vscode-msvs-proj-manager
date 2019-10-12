import * as fs from "fs";
export default class MsvsProjManager{
	constructor(){
		console.log("hello msvsProjManager");
	}

	async listup(rootFolderPath:string):Promise<string[]> {
		var fileList: string[] = [];
		var files = fs.readdirSync(rootFolderPath);
		for(var file of files){
			if(/.*\.vc(x|s)proj$/.test(file) === true){
				fileList.push(file);
			}
		}

		return fileList;
	}
}