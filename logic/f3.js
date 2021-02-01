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
            inputDocument.value = '';
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


ipcRenderer.on('get_f3_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_f3_config_data');

    f301.value = data.f301;
    f302.value = data.f302;
    f303.value = data.f303;
    f304.value = data.f304;
    f305.value = data.f305;
    f306.value = data.f306;
});

// F3 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f3_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f3_config_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF3ConfigData = function() {
    log.info('function: setF3ConfigData');

    const f3ConfigData = {
        f301: f301.options[f301.selectedIndex].value,
        f302: f302.options[f302.selectedIndex].value,
        f303: f303.options[f303.selectedIndex].value,
        f304: f304.options[f304.selectedIndex].value,
        f305: f305.options[f305.selectedIndex].value,
        f306: f306.value
    };

    ipcRenderer.send('set_f3_config_data', f3ConfigData);
    return;
}

module.exports = {
    setF3ConfigData: setF3ConfigData
}
