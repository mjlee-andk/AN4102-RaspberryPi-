const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f501 = document.getElementById("f5_01");
const f502 = document.getElementById("f5_02");
const f503 = document.getElementById("f5_03");
const f504 = document.getElementById("f5_04");

const keypad_f5 = document.getElementById("keypad_f5");
const key_f5_list = document.querySelectorAll(".key_f5");

let focused_input = '';
const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_f5.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_f5.style.display = "block";
        focused_input = element;

        if(element == 'f501' || element == 'f503') {
            keypad_f5.style.left = 'auto';
            keypad_f5.style.right = '30px';
        }
    }
    else {
        if(element != focused_input) {
            return;
        }
        if(ev.target.value == '') {
            alert('값을 입력해주세요.');
            return;
        }

        ev.target.style.background = '';
        keypad_f5.style.display = "none";
        focused_input = '';

        if(element == 'f501' || element == 'f503') {
            keypad_f5.style.left = '30px';
            keypad_f5.style.right = 'auto';
        }
    }
}

f501.addEventListener('click', (event) => {
    makeKeypadSetting('f501', event);
})

f502.addEventListener('click', (event) => {
    makeKeypadSetting('f502', event);
})

f503.addEventListener('click', (event) => {
    makeKeypadSetting('f503', event);
})

f504.addEventListener('click', (event) => {
    makeKeypadSetting('f504', event);
})


key_f5_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        if(focused_input == 'f501') {
            inputDocument = f501;
        }
        if(focused_input == 'f502') {
            inputDocument = f502;
        }
        if(focused_input == 'f503') {
            inputDocument = f503;
        }
        if(focused_input == 'f504') {
            inputDocument = f504;
        }

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
            if(inputDocument.value == '') {
                alert('값을 입력해주세요.');
                return;
            }
            let convertedValue = Number(inputDocument.value);
            if(convertedValue > 999999 || convertedValue < -999999) {
                alert('입력 범위 내의 값을 입력해주세요.(-999999 이상 999999 이하)');
                return;
            }

            if(focused_input == 'f501') {
                f501.value = inputDocument.value;
            }
            else if(focused_input == 'f502') {
                f502.value = inputDocument.value;
            }
            else if(focused_input == 'f503') {
                f503.value = inputDocument.value;
            }
            else if(focused_input == 'f504') {
                f504.value = inputDocument.value;
            }

            inputDocument.style.background = '';
            keypad_f5.style.display = "none";
            focused_input = '';
        }
        else {
            if(inputValue == '0') {
                inputDocument.value = keyValue;
            }
            else {
                inputDocument.value = inputValue + keyValue;
            }
        }
    })
})


ipcRenderer.on('get_f5_data', (event, data) => {
    log.info('ipcRenderer.on: get_f5_data');

    f501.value = data.F501;
    f502.value = data.F502;
    f503.value = data.F503;
    f504.value = data.F504;
});

// F5 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f5_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f5_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF5Data = function() {
    log.info('function: setF5Data');

    const f5Data = {
        F501: f501.value,
        F502: f502.value,
        F503: f503.value,
        F504: f504.value
    };

    ipcRenderer.send('set_f5_data', f5Data);
    return;
}

module.exports = {
    setF5Data: setF5Data
}
