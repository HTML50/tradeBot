function playSound() {
    audio.play()
}


function handleFiles() {
    var fileList = this.files; /* now you can work with the file list */
    console.log(fileList[0])
    audio.src = fileList[0]
}


//file.addEventListener("change", handleFiles, false);


btn.onclick = asyncTrade;

//var Socket = new WebSocket('wss://api.bitfinex.com/ws/2');


function asyncTrade() {
    var xhr = new XMLHttpRequest();
    var safe = true;

    var safeCheckProcess = setTimeout(function() {
        safe = false;
        console.log('timeout');
    }, 200)


    var duration = 0;
    var countDuration = setInterval(function() {
        duration += 10;
    }, 10)


    xhr.open('GET', 'https://api.coinegg.im/api/v1/ticker?coin=oc', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {

                clearInterval(countDuration);
                console.log('总耗时: ' + duration);



                var data = JSON.parse(xhr.responseText)
                if (data.last && safe) {
                    console.log('卖一价格:' + data.sell, '买一价格:' + data.buy)
                    clearTimeout(safeCheckProcess)

                }

            } else {
                console.warn('connection error');
            }
        }
    }
    xhr.send();
}

console.log("4秒后检查当前窗口")