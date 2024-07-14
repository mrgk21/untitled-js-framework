import { access, constants } from "node:fs/promises";
import { v7 } from "uuid";

async function checkFile(path) {
  const res = await statusifyPromise(() => access(path, constants.F_OK));
  return res.status;
}

function generateId() {
    return v7();
}

function sanitizedFilePath(path) {
    if (path.startsWith('./')) path = path.substring(2);
    if (path.startsWith('/')) path = path.substring(1);
    if (path.endsWith('/')) path = path.substring(0, path.length - 1);
    return path;
}

function statusifyPromise(fn) {
    return new Promise((res) => {
        fn()
            .then((data) => {
                res({ status: true, data });
            })
            .catch((err) => {
                res({ status: false, data: err });
            });
    });
}

export {
  checkFile,
  generateId,
  sanitizedFilePath,
  statusifyPromise
}