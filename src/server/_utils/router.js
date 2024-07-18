import { readdir } from "fs/promises"
import { clientDir} from "../../config.js"
import path from "path";

/*
 *
let tree = {
  root: {
      isPageHtml: boolean,
      isLayoutHtml: boolean,
      folderType: "static" || "dynamic",
      dynamicFolderOptions: {},
      children: [
        {
          post: {
            isPageHtml: boolean,
            isLayoutHtml: boolean,
            folderType: "static" || "dynamic",
            dynamicFolderOptions: {},
            children: []
          }
        }
      ]
  }
} 
*/
  

function checkFileType(name, type) {
  return name.startsWith(type) && name.endsWith('.html');
}

function checkFolderType(name) {
  if(name.startsWith('[') && name.endsWith(']'))
    return 'dynamic'
  return 'static'     
}

export async function generateClientRoute() {
  // pass 1
  const newTree = await createRouterTree(clientDir);
  
  // pass 2
  
  return newTree;
}

async function createRouterTree(dir, treeRef = {name: 'root', path: '/'}) {
  const directory = await readdir(dir, {recursive: false, withFileTypes: true});

  const dirs = [];
  for (const item of directory) {
    if(item.isDirectory()) {
      dirs.push(item);
      continue;
    }

    treeRef.isPageHtml = (treeRef.isPageHtml ?? false) || checkFileType(item.name, 'page');
    treeRef.isLayoutHtml = (treeRef.isLayoutHtml ?? false) || checkFileType(item.name, 'layout');

  } 

  treeRef.children = [];

  for(const ind in dirs) {

    const item = dirs[ind];

    const folderType = checkFolderType(item.name);
    treeRef.folderType = folderType; 
    if(folderType == 'dynamic') 
      treeRef.dynamicFolderOptions = {}
    
       
    const child = await createRouterTree(path.join(dir, item.name), {name: item.name, path: `${treeRef.path}${item.name}/`});
    treeRef.children.push(child);
  }

  return treeRef
}

