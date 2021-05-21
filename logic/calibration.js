const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const COLOR = require('../util/color');

const background_color = 'pink';
// 교정
const spanValueText = document.getElementById("spanValueText");

const calZeroButton = document.getElementById("calZeroButton");
const checkCalZero = document.getElementById("checkCalZero");

const calSpanButton = document.getElementById("calSpanButton");
const checkCalSpan = document.getElementById("checkCalSpan");

// Span 입력전압
const cal_span_input = document.getElementById("cal_span_input");

const keypad_span = document.getElementById("keypad_span");
const key_span_list = document.querySelectorAll(".key_span");

// 정격용량
const cal_cf03 = document.getElementById("cal_cf03");
let cal_cf03_value = 0;

const makeKeypadSetting = function(ev) {
    if(keypad_span.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_span.style.display = "block";
    }
    else {
        if(ev.target.value == '') {
            alert('값을 입력해주세요.');
            return;
        }
        ev.target.style.background = '';
        keypad_span.style.display = "none";

    //     if(element == 'cf03' || element == 'cf05' || element == 'cf06'
    // || element == 'cf08' || element == 'cf09' || element == 'cf11') {
    //         keypad_cf.style.left = 'auto';
    //         keypad_cf.style.right = '30px';
    //     }
    }
}

key_span_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument = cal_span_input;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        inputValue = inputDocument.value.toString();
        inputValueLength = inputValue.length;

        if(keyValue == 'C'){
            inputDocument.value = '';
            return;
        }
        else if(keyValue == 'del') {
            if(inputValueLength <= 0) {
                return;
            }
            inputDocument.value = inputDocument.value.substring(0, inputValueLength - 1);
        }
        else if(keyValue == '+/-') {
            if(inputValue == '0' || inputValue == ''){
                return;
            }
            // 음수일 경우
            if(inputValue.indexOf('-') >= 0) {
                inputValue = inputValue.replace('-', '');
            }
            // 양수일 경우
            else if(inputValue.indexOf('-') < 0) {
                inputValue = '-' + inputValue;
            }
            inputDocument.value = inputValue;
        }
        else if(keyValue == '확인') {

            console.log('cal_span_input', cal_span_input.value);
            console.log('cal_cf03_value', cal_cf03_value);

            if(inputValue == '') {
                alert('값을 입력해주세요.');
                return;
            }

            if(inputValue > cal_cf03_value) {
                alert('Span 입력전압 표시값은 정격용량을 초과할 수 없습니다.');
                return;
            }
            inputDocument.style.background = '';
            keypad_span.style.display = "none";
            keypad_span.style.left = 'auto';
            keypad_span.style.right = '30px';

            console.log('inputValue', inputValue);
            ipcRenderer.send('set_cal_span_value', inputValue);

            return;
        }
        // 나머지 숫자 키
        else {
            // 입력창에 입력된 값이 0일 때
            if(inputValue == '0') {
                inputDocument.value = keyValue;
            }
            else {
                inputDocument.value = inputValue + keyValue;
            }
        }
    })
})


// CALZERO 커맨드 버튼
calZeroButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'CAL ZERO',
            message: 'CAL ZERO를 진행하시겠습니까?',
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

// CALSPAN 커맨드 버튼
calSpanButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'CAL SPAN',
            message: 'CAL SPAN을 진행하시겠습니까?',
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

// CALSPAN시 필요한 SPAN 입력전압 입력 버튼
cal_span_input.addEventListener('click', (event) => {
    makeKeypadSetting(event);
})


// 안정 라벨 표시
// 캘리브레이션할 때 안정 여부를 파악하기 위해 필요함.
let labelStableClass = document.getElementById("state_stable");
ipcRenderer.on('rx_data', (event, data) => {
    // 상태 표시
    if(data.isStable) {
        labelStableClass.style.color = COLOR['BLUE'];
    }
    else {
        labelStableClass.style.color = COLOR['WHITE'];
    }
});

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
        checkCalSpan.innerHTML = 'OK';
    }
    else {
        checkCalSpan.innerHTML = 'NG';
    }
});

ipcRenderer.on('get_cal_data', (event, data) => {
    log.info('ipcRenderer.on: get_cal_data');

    cal_cf03_value = data.CF03;
    cal_span_input.value = data.CF06;
    cal_cf03.innerHTML = cal_cf03_value;

    console.log('getCF03', cal_cf03_value);
    console.log('getCF06', cal_span_input.value);
});

ipcRenderer.on('set_cal_span_value_result', (event, arg) => {
    log.info('ipcRenderer.on: set_cal_span_value_result');

    if(arg == 'ok') {
        alert('입력한 span 입력전압 표시값이 적용되었습니다.');
    }
});
