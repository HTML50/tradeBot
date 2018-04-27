//---------------------------------------------打开popup立即执行的内容--------------------------------------------
//===============================================================================================

//不同平台交易对存储识别key
var key;



//指定概率相关变量

var theLevel;
var theAmount;

var oddsDecimal
var oddsInteger
var oddsBuy;
var oddsSell;
var minLevel, maxLevel;


//存放不同数量级的对应概率

var range;
var oddsLevel = {}



//1.向content-script通讯，获取当前交易对，平台
//2.从存储获取各个项的值
init();


//获取当前窗口url
chrome.tabs.query({ active: true }, function(tabsArr) {
    var currentTab = tabsArr[0];
    console.log('当前打开的页面(tab): ' , currentTab)
})


//---------------------------------------------事件绑定--------------------------------------------
//===============================================================================================

btnStart.onclick = start;
btnStop.onclick = stop;


//总量
//--------------------------------------------------------
amount.addEventListener('change', function() {
    store(this)
})

amount.addEventListener('input', function() {
    amountTip.innerHTML = arabiaToChinese(this.value)
})
//--------------------------------------------------------





//拖动选择概率，设定背景，数字
//--------------------------------------------------------

buyOrSell.addEventListener('input', function() {
    setSlide(buyOrSell,buyTip,sellTip,this.value)
})



integerOrDecimal.addEventListener('input', function() {
    setSlide(integerOrDecimal,integerTip,decimalTip,this.value)
})

//--------------------------------------------------------

timeHigh.addEventListener('change', function() {
    store(this)
})


timeLow.addEventListener('change', function() {
    store(this)
})

high.addEventListener('change', function() {
    store(this)
})


low.addEventListener('change', function() {
    store(this)
})



//单笔随机交易量

min.addEventListener('input', function() {
    checkRange()
    store(this)
    minTip.innerHTML = arabiaToChinese(this.value)
})

max.addEventListener('input', function() {
    checkRange()
    store(this)
    maxTip.innerHTML = arabiaToChinese(this.value)
})


//单笔交易数量级概率设定开关
randomLevelSwitch.addEventListener('change', function() {
    if (this.checked) {
        getRange();
        if (range > 0) {
            //增加概率
            createDIVs(range)
            randomLevelArea.classList.remove('hidden')
            this.value = 'on'
        } else {
            alert('单一数量级，无需设定概率')
            this.value = 'off'
            this.checked = false
        }
    } else {
        //active false
        this.checked = false
        randomLevelArea.classList.add('hidden')
        randomLevelArea.innerHTML = ''
        this.value = 'off'
    }

    store(this);
})


advanced.addEventListener('change', function() {

    console.log(this.checked)
    if (this.checked) {
        advancedSetting.classList.remove('none')
    } else {
        advancedSetting.classList.add('none')
    }

})

//--------------------------------------------函数--------------------------------------------
//===============================================================================================


function init() {

    //因为从storage中取数据都是异步，所以需要一步步完成。

    //向content-script通讯，获取当前交易对，平台
    var platform, transaction;

    var promiseGetPlatform = new Promise(function(resolve, reject) {
        sendMessageToContentScript({ cmd: 'getPlatform', value: '【通讯】popup请求获取交易平台' }, function(response) {
            if (response) {
                platform = response;
                resolve()
            } else{
               reject('获取平台错误？')
               if(confirm('未检测到脚本加载，是否重新刷新当前页面？(非交易平台？)')){
                    chrome.tabs.reload()
                    window.close();
               }
            } 
        });
    })



    var promiseGetTransaction = new Promise(function(resolve, reject) {
        sendMessageToContentScript({ cmd: 'getTransaction', value: '【通讯】popup请求获取交易对' }, function(response) {
            if (response) {
                transaction = response;
                resolve()
            } else {
                reject('获取交易对错误？')
            }
        });
    })



    //获取完成后，再获取存储的数据
    Promise.all([promiseGetPlatform, promiseGetTransaction]).then(function() {
        key = platform + '_' + transaction + '_';
        console.log('当前交易页面key： ' + key)

        Promise.all([getInitValuePromise(amount),
            getInitValuePromise(high),
            getInitValuePromise(low),
            getInitValuePromise(min),
            getInitValuePromise(max),
            getInitValuePromise(timeLow),
            getInitValuePromise(timeHigh),
            getInitValuePromise(randomLevelSwitch),
            getInitValuePromise(integerOrDecimal),
            getInitValuePromise(buyOrSell)
        ]).then(function() {

           fillStorageValueToInput()
            setSlide(buyOrSell,buyTip,sellTip,buyOrSell.value)
            setSlide(integerOrDecimal,integerTip,decimalTip,integerOrDecimal.value)
        })
    })

}

function fillStorageValueToInput() {
    amountTip.innerHTML = arabiaToChinese(amount.value)
    if(randomLevelSwitch.value === 'on'){

        new Promise(function(resolve,reject){
             getRange();
                for (let i = 0; i <= range; i++) {

                    (function() {
                        var level = minLevel * Math.pow(10, i)
                        var item = key + 'level' + level

                        chrome.storage.sync.get([item], function(result) {
                            if (typeof result[item] !== 'undefined') {
                                oddsLevel[level] = result[item];
                                if(i===range) resolve();
                            }
                        })
                    })(i);

                }
        }).then(function(){
            randomLevelSwitch.click()
        })
    }
}

function getInitValuePromise(DOM) {
    var item = key + DOM.id
    return new Promise(function(resolve, reject) {
        var item = key + DOM.id
        chrome.storage.sync.get([item], function(result) {
            if (typeof result[item] !== 'undefined') {
                console.warn(DOM,result[item])
                DOM.value = result[item]; 
            }
            resolve();
        })
    });
}


function getValueFromStorage(DOM) {
    var item = key + DOM.id
    chrome.storage.sync.get([item], function(result) {
        if (typeof result[item] !== 'undefined') {
            DOM.value = result[item];
        }
        //获取数据后，分条目预处理
        if (DOM === amount) amountTip.innerHTML = arabiaToChinese(amount.value)
        if (DOM === randomLevelSwitch) {
            if (DOM.value === 'on') {
                randomLevelSwitch.click()
            }
        }

    })
}


//将设定保存到storage
function store(DOM) {
    chrome.storage.sync.set({
        [key + DOM.id]: DOM.value }, function() {
        console.log('保存成功！' + DOM.id + '的值更新为： ' + DOM.value);
    });
}

//存储数量级概率
function storeOddsLevel(level, value) {
    chrome.storage.sync.set({
        [key + 'level' + level]: value }, function() {
        console.log('保存成功！概率' + level + '的值更新为： ' + value);
    });
}


//开始前，检查安全性
function checkVal() {
    var levelOdds = true,
        valueCorrect = true;


    //概率和为1
    if (randomLevelSwitch.checked) {
        var percent = 0
        for (i in oddsLevel) {
            percent += Number(oddsLevel[i])
        }
        console.log(percent)
        if(percent !== 100){
         flash(randomLevelTip,'概率总和应该等于100%')
          valueCorrect = false;
        }
    }


    if (Number(low.value) > Number(high.value)) {
        flash(priceTip,'最低价不能高于最高 → ')
        valueCorrect = false;
    }

    if (Number(min.value) > Number(max.value)) {
        flash(minTip,'最小值 > 最大值 ? ↑ ↑ ↑  ')
        valueCorrect = false;
    }

    return valueCorrect
}

function setSlide(DOM,DOM1,DOM2,val){
    var percent = Math.round(val * 100);
    store(DOM)
    DOM1.innerHTML = percent + '%';
    DOM2.innerHTML = 100 - percent + '%';

    DOM.style.backgroundSize = percent + '% 100%'
}


function flash(DOM,msg){
         DOM.classList.add('error');
     DOM.innerHTML = msg
     setTimeout(function(){
        DOM.classList.remove('error');
        if(DOM.innerHTML === msg) DOM.innerHTML ='';
     },5000)
}

//开始按钮
function start() {
    if (checkVal()) {
        var paramsObj={
            'high':high.value,
            'low':low.value,
            'min':min.value,
            'max':max.value,
            'amount':amount.value,
            'timeLow':timeLow.value,
            'timeHigh':timeHigh.value,
            'randomLevel':randomLevelSwitch.checked,
            'oddsInteger':integerOrDecimal.value,
            'oddsBuy':buyOrSell.value,
            'oddsLevel': oddsLevel,
            'advanced': advanced.checked,
            'mode':mode.value,
            'safeSpeed':safeTime.value
        }

        sendMessageToContentScript({ cmd: 'start',  value:paramsObj}, function(response) {
            console.log('[content script]' + response);
        });
    }
}


//停止按钮
function stop() {
    sendMessageToContentScript({ cmd: 'stop', value: '【通讯】popup停止任务' }, function(response) {
        console.log('[content script]' + response);
    });
}


//通讯 popup ---> content-script
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            if (callback) callback(response);
        });
    });
}


function getLevel(num) {
    return Math.pow(10, num.toString().length - 1)
}

function getRange() {
    minLevel = getLevel(min.value)
    maxLevel = getLevel(max.value)
    return range = Math.log10(maxLevel / minLevel)
}



//若改变随机量，检查是否先关闭设定按钮，以生成新的input
function checkRange() {
    //如果range存在，代表打开过设定概率的按钮。
    //若未打开过，就不存在需要检查改变了range的情况
    if (range) {
        var old = range;
        getRange();

        if (old !== range && randomLevelSwitch.value==='on') randomLevelSwitch.click();
    }

}


function createDIVs(oddsRange) {
    //把多个数量级放入对象oddsLevel
    for (i = 0; i <= oddsRange; i++) {
        createDIV(i)
    }
}

function createDIV(i) {

    let level = minLevel * Math.pow(10, i)
    var input = document.createElement('input')
    input.id = 'oddsLevel' + level;
    input.type = 'number'
    input.min = '0'
    input.max = '100'
    input.step = '1'
    input.className = 'no-arrow level-input'
    input.value = oddsLevel[level] === undefined ? 30 : oddsLevel[level];
    input.onchange = function() {
        oddsLevel[level] = input.value;
        storeOddsLevel(level, input.value)
    }


    var div = document.createElement('div')
    div.className = 'after-ele'
    div.innerHTML = '<span class="label">“' + levelToChinese(level) + '”的出现概率：</span>'
    div.appendChild(input)


    randomLevelArea.appendChild(div)
}





//阿拉伯数字转换为简写汉字
function levelToChinese(num) {
    var levelTable = {
        1: '个',
        10: '十',
        100: '百',
        1000: '千',
        10000: '万',
        100000: '十万',
        1000000: '百万',
        10000000: '千万'
    }

    return levelTable[num]
}


//阿拉伯数字转换为简写汉字
function arabiaToChinese(Num) {
    for (i = Num.length - 1; i >= 0; i--) {
        Num = Num.replace(",", "") //替换Num中的“,”
        Num = Num.replace(" ", "") //替换Num中的空格
    }
    if (isNaN(Num)) { //验证输入的字符是否为数字
        //alert("请检查小写金额是否正确");
        return;
    }
    //字符处理完毕后开始转换，采用前后两部分分别转换
    part = String(Num).split(".");
    newchar = "";
    //小数点前进行转化
    for (i = part[0].length - 1; i >= 0; i--) {
        if (part[0].length > 10) {
            //alert("位数过大，无法计算");
            return "";
        } //若数量超过拾亿单位，提示
        tmpnewchar = ""
        perchar = part[0].charAt(i);
        switch (perchar) {
            case "0":
                tmpnewchar = "零" + tmpnewchar;
                break;
            case "1":
                tmpnewchar = "一" + tmpnewchar;
                break;
            case "2":
                tmpnewchar = "二" + tmpnewchar;
                break;
            case "3":
                tmpnewchar = "三" + tmpnewchar;
                break;
            case "4":
                tmpnewchar = "四" + tmpnewchar;
                break;
            case "5":
                tmpnewchar = "五" + tmpnewchar;
                break;
            case "6":
                tmpnewchar = "六" + tmpnewchar;
                break;
            case "7":
                tmpnewchar = "七" + tmpnewchar;
                break;
            case "8":
                tmpnewchar = "八" + tmpnewchar;
                break;
            case "9":
                tmpnewchar = "九" + tmpnewchar;
                break;
        }
        switch (part[0].length - i - 1) {
            case 0:
                tmpnewchar = tmpnewchar;
                break;
            case 1:
                if (perchar != 0) tmpnewchar = tmpnewchar + "十";
                break;
            case 2:
                if (perchar != 0) tmpnewchar = tmpnewchar + "百";
                break;
            case 3:
                if (perchar != 0) tmpnewchar = tmpnewchar + "千";
                break;
            case 4:
                tmpnewchar = tmpnewchar + "万";
                break;
            case 5:
                if (perchar != 0) tmpnewchar = tmpnewchar + "十";
                break;
            case 6:
                if (perchar != 0) tmpnewchar = tmpnewchar + "百";
                break;
            case 7:
                if (perchar != 0) tmpnewchar = tmpnewchar + "千";
                break;
            case 8:
                tmpnewchar = tmpnewchar + "亿";
                break;
            case 9:
                tmpnewchar = tmpnewchar + "十";
                break;
        }
        newchar = tmpnewchar + newchar;
    }
    //替换所有无用汉字，直到没有此类无用的数字为止
    while (newchar.search("零零") != -1 || newchar.search("零亿") != -1 || newchar.search("亿万") != -1 || newchar.search("零万") != -1) {
        newchar = newchar.replace("零亿", "亿");
        newchar = newchar.replace("亿万", "亿");
        newchar = newchar.replace("零万", "万");
        newchar = newchar.replace("零零", "零");
    }
    //替换以“一十”开头的，为“十”
    if (newchar.indexOf("一十") == 0) {
        newchar = newchar.substr(1);
    }
    //替换以“零”结尾的，为“”
    if (newchar.lastIndexOf("零") == newchar.length - 1) {
        newchar = newchar.substr(0, newchar.length - 1);
    }
    return newchar;
}