const puppeteer = require('puppeteer');
const awaitTo = require('async-await-error-handling');
const ora = require('ora');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

/** 
 * 四个直辖市会将「市辖区」作为二级行政区域
 * 重庆市会将「县」作为二级行政区域
 * 河北省/河南省/湖北省/海南省 等省份会将「省直辖县级行政区划」作为第二级行政区域
 * 新疆会将「自治区直辖县级行政区划」作为第二级行政区域
 * 出于实用性考虑，省市联动会过滤掉这些，直接用第二级行政区域补充
*/
const { timeout, writeFileModuleSync, isEmptyObj } = require('./utils');


const spinner1 = ora({
    color: 'yellow'
});

const spinner2 = ora({
    color: 'yellow'
});

const currentYear = new Date().getFullYear() - 1
const CITY_FILE = "city.js"
const ARAE_FILE = "area.js"
const directAreaSpecial = ['嘉峪关市']
const provincesData = require('./provinces.js')
const provinces = provincesData['100000'];
const pcodes = [];
const target = `http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/${currentYear}/#{route}.html`;
let cities = {};
if (fs.existsSync(path.resolve(__dirname, CITY_FILE))) {
    cities = require('./' + CITY_FILE);
}
const delay = 1500;
const isGetCity = false;
const isGetArea = true;
let areas = {};
let url = '';


// 当前正在抓取的目标
let curCity = '';
let curPCode = '';
const unCatchProvice = ['710000', '810000', '820000', '900000', '910000'] //过滤
Object.keys(provinces).forEach(code => {
    if (!unCatchProvice.includes(code)) {
        pcodes.push(code.slice(0, 2));
    }
});

async function getCitiesByPCode(page, pcode) {
    url = target.replace('#{route}', pcode);
    const parentCode = `${pcode}0000`;
    const provinceText = provinces[parentCode]
    await page.goto(url);
    let city_obj = []
    spinner1.text = chalk.blue(`正在抓取${provinceText}的市级数据：${url}`);
    cities = await page.evaluate((parentCode, cities, provinceText) => {
        const formatText = (text) => {
            const replace = ['市辖区']//直辖市
            return replace.includes(text) ? provinceText : text
        }
        //最小6位,大于6位去除末尾的连续0
        const formatCode = (code) => {
            let index = /0+$/.exec(code).index
            if (index < 6) {
                index = 6
            }
            return code.slice(0, index)
        }
        const list = [...document.querySelectorAll('.citytable .citytr')];
        const city_filter = ['省直辖县级行政区划', '自治区直辖县级行政区划', '县'];
        let city = {}
        list.forEach(el => {
            const t = el.innerText.split('\t');
            if (!city_filter.includes(t[1])) {
                city[formatCode(t[0])] = formatText(t[1])
            }
        });
        cities[parentCode] = city
        return cities;
    }, parentCode, cities, provinceText);
}





async function getAreasByCCode(page, city) {
    url = target.replace('#{route}', `${city.code.slice(0, 2)}/${city.code.slice(0, 4)}`);
    if (directAreaSpecial.includes(city.text)) {
        url = target.replace('#{route}', `${city.code.slice(0, 2)}/${city.code.slice(2, 4)}/${city.code.slice(0, 4)}01`);
    }
    await page.goto(url);
    spinner2.text = chalk.blue(`正在抓取 ${provinces[city.parentCode]}/${city.text} 的县区数据：${url}`);
    areas = await page.evaluate((city, areas) => {
        let list = [...document.querySelectorAll('.countytable .countytr')];
        if (!list.length) {
            list = [...document.querySelectorAll('.countytable .towntr')];//东莞市/中山市/儋州市
        }
        if (!list.length) {
            list = [...document.querySelectorAll('.towntable .towntr')];//嘉峪关市
        }
        const formatCode = (code) => {
            let index = /0+$/.exec(code).index
            if (index < 6) {
                index = 6
            }
            return code.length > 6 ? code.slice(0, index) : code
        }
        let area = {}
        const area_filter = ['市辖区'];//区级过滤
        list.forEach(el => {
            const t = el.innerText.split('\t');
            if (!area_filter.includes(t[1])) {
                area[formatCode(t[0])] = t[1]
            }
        });
        areas[city.code] = area
        return areas;
    }, city, areas);
}

process.on('unhandledRejection', (err) => {
    console.log('\n', chalk.red(`抓取数据失败，失败链接: ${url}\n`), err.message);
    process.exit(1);
});

(async () => {


    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    if (isGetCity) {
        spinner1.start(chalk.blue('开始抓取市区数据....'));
        for (let i = 0, l = pcodes.length; i < l; i++) {
            const pcode = pcodes[i];
            await timeout(delay);
            const [err] = await awaitTo(getCitiesByPCode(page, pcode));
            if (err) {
                console.log('\n', chalk.red(`抓取数据失败，失败链接: ${url}，错误信息: ${err.message}，正在重试....\n`));
                await getCitiesByPCode(page, pcode);
            }
        }

        writeFileModuleSync(CITY_FILE, cities);
        spinner1.succeed(chalk.green('市区数据抓取完毕，开始抓取县区数据....'));
    }
    if (isGetArea) {
        let cityArr = []
        Object.keys(cities).forEach((parentCode) => {
            let city = cities[parentCode]
            Object.keys(city).forEach(code => {
                cityArr.push({ code, text: city[code], parentCode })
            })
        })
        if (cityArr.length < 1) {
            console.log('\n', '请先读取市区数据')
        }
        spinner2.start(chalk.blue('正在抓取县区数据....'));
        for (let i = 0, l = cityArr.length; i < l; i++) {
            const city = cityArr[i];
            await timeout(delay);
            const [err] = await awaitTo(getAreasByCCode(page, city));
            if (err) {
                console.log('\n', chalk.red(`抓取数据失败，失败链接: ${url}，错误信息: ${err.message}，正在重试....\n`));
                await getAreasByCCode(page, city);
            }
        }
        writeFileModuleSync(ARAE_FILE, areas)
        spinner2.succeed(chalk.green('县区数据抓取完毕'));
    }
    await browser.close();
})();

