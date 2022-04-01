
const { writeFileModuleSync, mergeObject } = require('./utils');
const TARGET_FILE = "districts.js"
const provincesData = require('./provinces.js')
const cities = require('./city.js')
const areas = require('./area.js')

function sortByCode(data) {
    let ordered = {}
    Object.keys(data).sort().forEach(function (key) {
        ordered[key] = data[key];
    });
    return ordered
}
let target_data = mergeObject({}, provincesData, cities, areas)
writeFileModuleSync(TARGET_FILE, sortByCode(target_data));