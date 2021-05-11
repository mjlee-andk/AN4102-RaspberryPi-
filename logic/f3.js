const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f301 = document.getElementById("f3_01");
const f302 = document.getElementById("f3_02");
const f303 = document.getElementById("f3_03");
const f304 = document.getElementById("f3_04");
const f305 = document.getElementById("f3_05");
const f306 = document.getElementById("f3_06");

const keypad_f3 = document.getElementById("keypad_f3");
const key_f3_list = document.querySelectorAll(".key_f3");

const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_f3.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_f3.style.display = "block";
        keypad_f3.style.left = '30px';
        keypad_f3.style.right = 'auto';
    }
    else {
        if(ev.target.value == '') {
            alert('값을 입력해주세요.');
            return;
        }
        ev.target.style.background = '';
        keypad_f3.style.display = "none";
    }
}

f306.addEventListener('click', (event) => {
    makeKeypadSetting('f306', event);
})

key_f3_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        inputDocument = f306;

        inputValue = inputDocument.value.toString();
        inputValueLength = inputValue.length;

        if(keyValue == 'C'){
            // inputDocument.value = '';
            if(inputValueLength <= 0) {
                return;
            }
            inputDocument.value = inputDocument.value.substring(0, inputValueLength - 1);
        }
        else if(keyValue == '+/-') {
            return;
        }
        else if(keyValue == '0') {
            if(inputValue == '0'){
                return;
            }
            inputDocument.value = inputValue + keyValue;
        }
        else if(keyValue == '확인') {
            if(inputDocument.value == '') {
                alert('값을 입력해주세요.');
                return;
            }
            let convertedValue = Number(inputDocument.value);
            if(convertedValue > 99 || convertedValue < 0) {
                alert('입력 범위 내의 값을 입력해주세요.(99 이상 0 이하)');
                return;
            }
            f306.value = inputDocument.value;

            inputDocument.style.background = '';
            keypad_f3.style.display = "none";
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


ipcRenderer.on('get_f3_data', (event, data) => {
    log.info('ipcRenderer.on: get_f3_data');

    f301.value = data.F301;
    f302.value = data.F302;
    f303.value = data.F303;
    f304.value = data.F304;
    f305.value = data.F305;
    f306.value = data.F306;
});

// F3 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f3_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f3_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF3Data = function() {
    log.info('function: setF3Data');

    const f3Data = {
        F301: f301.options[f301.selectedIndex].value,
        F302: f302.options[f302.selectedIndex].value,
        F303: f303.options[f303.selectedIndex].value,
        F304: f304.options[f304.selectedIndex].value,
        F305: f305.options[f305.selectedIndex].value,
        F306: f306.value
    };

    ipcRenderer.send('set_f3_data', f3Data);
    return;
}

module.exports = {
    setF3Data: setF3Data
}
