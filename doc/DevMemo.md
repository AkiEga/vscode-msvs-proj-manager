# TODO
- setting 
	- auto detecting
		- [x] sln file
		- [x] msbuild.exe
		- [x] build setting(e.g. x86 or x64, Debug or Release...)
	- environment variables
		- [x] enable to set environment variables(e.g. PATH) from ${workspaceFolder}/.vscode/.env

- parsing sln file
	- [x] in the first time, set OwnGUID of root msvs proj 	
- building
	- [x] solution build
	- [x] solution clean
	- [x] live outputting build results

- UI
	- [ ] refresh button in solution tree

- etc
	- [ ] add project
	- [ ] remove project
	- [ ] add demo.gif to Readme.md 

# Dev memo
## Design

## solution explorer in visual studio 20xx
```c++
<root>
	+ <AnyFolder>		// ideal folder
	+	\ <AnyProject> 	// real proj, exist real .*proj file
	:
```
  
## msbuild command
- case1: project build(Debug, x64)  
```shell
msbuild <.sln file path> -t:<ideal proj name> -p:Configuration=Debug:Platform=x64
```
- case 2: project clean(Debug, x64)  
```shell
msbuild <.sln file path> -t:<ideal proj name>:Clean -p:Configuration=Debug:Platform=x64
```
  
## .sln file structure
- define project
```vb
Project("{<Parent GUID>}") = "<Element Label>", "<Element Real File Path>", "{<Elemnt GUID>}"
EndProject
```
- define project link relation (parent proj<->child proj)
```vb
GlobalSection(NestedProjects)
	{<child Proj GUID>} = {<Parent Proj GUID>}
EndGlobalSection
```
  
## .*proj file structure
- build configuration
```xml

```
  
