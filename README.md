

# area-puppeteer
基于 puppeteer 的中国行政区域抓取爬虫

根据 [area-puppeteer](https://github.com/dwqs/area-puppeteer) 修改完善

## 数据来源
* 国家统计局：[统计用区划代码和城乡划分代码](http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021/index.html)
* 国家民政部：[中华人民共和国行政区划代码变更](http://www.mca.gov.cn/article/sj/tjbz/a/)
* 国家民政部：[中华人民共和国行政区划](http://xzqh.mca.gov.cn/map)


## 国家级新区

[百科](https://baike.baidu.com/item/%E5%9B%BD%E5%AE%B6%E7%BA%A7%E6%96%B0%E5%8C%BA/6919267?fr=aladdin)

`merge_gov_area.js`

现有18个国家级新区：

- [x] 上海浦东新区  310115
- [x] 天津市滨海新区 120116
- [ ] 重庆两江新区
- [ ] 浙江舟山群岛新区
- [x] 甘肃兰州市兰州新区 620171
- [x] 广东广州市南沙新区   440115
- [ ] 陕西西咸新区
- [ ] 贵州省贵阳市贵安新区
- [ ] 青岛西海岸新区 
- [ ] 大连金普新区
- [x] 四川省成都市天府新区 510156
- [ ] 湖南湘江新区
- [x] 江苏省南京市江北新区 510156
- [ ] 福建省福州新区
- [ ] 哈尔滨新区
- [ ] 长春新区
- [ ] 江西赣江新区
    

## 不设区的地级市

[百科](https://baike.baidu.com/item/%E4%B8%8D%E8%AE%BE%E5%8C%BA%E7%9A%84%E5%B8%82)

现有4个不设区地级市：广东省东莞市，广东省中山市，海南省儋州市，甘肃省嘉峪关市


## 省直辖县/自治区直辖县


  河南省/湖北省/海南省  会将「省直辖县级行政区划」作为第二级行政区域
  新疆会将「自治区直辖县级行政区划」作为第二级行政区域
  重庆市 添加 「县」作为二级行政区域


## 数据更新

```
npm run start // 生成市县区数据
```












 


 
