const path = require('path');
const fs = require('fs');
const _config = { type: 'space', size: 4 }

const JSONFormatter = require('json-format')

function timeout(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(1)
            } catch (e) {
                reject(0)
            }
        }, delay)
    });
}



function writeFileModuleSync(name, data) {
    let str = JSONFormatter(data, _config)
    fs.writeFileSync(path.resolve(__dirname, name), `module.exports=${str}`);
}



function isEmptyObj(obj) {
    return Object.keys(obj).length < 1
}

function mergeObject(obj1, ...param) {
    return Object.assign(obj1, ...param)
}



module.exports = {
    writeFileModuleSync: writeFileModuleSync,
    mergeObject: mergeObject,
    isEmptyObj: isEmptyObj,
    timeout: timeout
};