const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록

// 교정
const spanValueText = document.getElementById("spanValueText");

const keypad_span = document.getElementById("keypad_span");
const key_span_list = document.querySelectorAll(".key_span");
const key_btn_span_list = document.querySelectorAll(".key_btn_span");

const calZeroButton = document.getElementById("calZeroButton");
const checkCalZero = document.getElementById("checkCalZero");

const calSpanButton = document.getElementById("calSpanButton");
const checkCalSpan = document.getElementById("checkCalSpan");

calZeroButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'CAL 0',
            message: 'CAL 0를 진행하시겠습니까?',
            buttons: ['ok', 'cancel']
        }).then(result => {
            const response = result.response;
            if(response == 0) {
                ipcRenderer.send('set_cal_zero', 'ok');
            }
            else {
                checkCalZero.innerHTML = 'NG';
            }
        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
})

calSpanButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'CAL F',
            message: 'CAL F를 진행하시겠습니까?',
            buttons: ['ok', 'cancel']
        }).then(result => {
            const response = result.response;

            if(response == 0) {
                ipcRenderer.send('set_cal_span', 'ok');
            }
            else {
                checkCalSpan.innerHTML = 'NG';
            }
        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
})

ipcRenderer.on('set_cal_zero', (event, arg) => {
    log.info('ipcRenderer.on: set_cal_zero');

    if(arg == 'ok') {
        checkCalZero.innerHTML = 'OK';
    }
    else {
        checkCalZero.innerHTML = 'NG';
    }
});

ipcRenderer.on('set_cal_span', (event, arg) => {
    log.info('ipcRenderer.on: set_cal_span');

    if(arg == 'ok') {
        setSpanValue();
        checkCalSpan.innerHTML = 'OK';
    }
    else {
        checkCalSpan.innerHTML = 'NG';
    }
});

ipcRenderer.on('get_cal_data', (event, data) => {
    log.info('ipcRenderer.on: get_cal_data');

    spanValueText.value = data.spanValue;
});

const setSpanValue = function() {
    log.info('function: setSpanValue');

    ipcRenderer.send('set_span_value_data', spanValueText.value);
    return;
}

spanValueText.addEventListener("click", function(){
    if(keypad_span.style.display == "none") {
        keypad_span.style.display = "block";
    }
    else {
        keypad_span.style.display = "none";
    }
});

key_span_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const numBoxValue = spanValueText.value;
        const numBoxLength = spanValueText.value.length;
        const keyValue = item.innerHTML;

        // 양수일 때
        if(numBoxValue.indexOf('-') == -1) {
            // 최대 99999까지 입력 가능
            if(numBoxLength <= 4) {
                // 입력값이 0인 경우
                if(numBoxValue == 0) {
                    spanValueText.value = keyValue;
                }
                else {
                    spanValueText.value = spanValueText.value + keyValue;
                }
            }
        }
        else {
            // 최대 -99999까지 입력 가능
            if(numBoxLength <= 5) {
                // 입력값이 0인 경우
                if(numBoxValue == 0) {
                    spanValueText.value = keyValue;
                }
                else {
                    spanValueText.value = spanValueText.value + keyValue;
                }
            }
        }
    })
})

key_btn_span_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const inputValLength = spanValueText.value.length;
        const keyValue = item.innerHTML;
        if(keyValue == '삭제'){
            if(inputValLength > 0){
                spanValueText.value = spanValueText.value.substring(0, inputValLength - 1);
            }
        }
        else if(keyValue == '확인'){
            if(inputValLength == 0) {
                alert('값을 입력해주세요.');
                return;
            }
            keypad_span.style.display = "none";
        }
        // 입력값의 양/음수를 결정
        else {
            if(inputValLength > 0){
                if(spanValueText.value.includes('-')) {
                    spanValueText.value = spanValueText.value.replace('-', '');
                }
                else {
                    spanValueText.value = '-' + spanValueText.value;
                }
            }
        }
    })
});
