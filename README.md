# tradeBot
a demo for auto trading (Chrome extension)

之前在一家公司对倒画线操盘写的自动交易的谷歌扩展，用于市值管理？放量画线维持价格的脚本。（本来是好几个人一起手动对倒，太费劲了）



# 截图



![interface]( https://raw.githubusercontent.com/HTML50/tradeBot/master/candle.png )

![candle]( https://raw.githubusercontent.com/HTML50/tradeBot/master/interface.png )

# 完成的功能

 - 交易任务总量设定
 - 随机交易频率
 - 随机交易量
 - 在设定价格范围内的随机对倒价格
 - 交易额的整数、小数概率设定
 - 单笔交易量区间及其概率设定
 - 主买主卖比例设定
 - 匹配的交易所exx，bitz，coinegg，allcoin，okex



# 安装方法

1. clone本项目。
2. 解压缩，将tradeBot文件夹拖入到[扩展管理](chrome://extensions/)，`chrome://extensions/`，完成安装。
3. 安装另一个谷歌扩展`Allow-Control-Allow-Origin: *`，[下载地址](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=zh-CN)。
4. 登录交易账户，点击右上角tradeBot运行，可以先在高级设置里面选调试模式测试，以免不熟悉被机器人套利。



# 后续功能

- 给出当天的图形或价格数据，自动完成24小时内的画线。
- 更加自然的分时画线算法