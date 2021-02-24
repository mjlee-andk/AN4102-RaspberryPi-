const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f010 = document.getElementById("f0_10");
const f011 = document.getElementById("f0_11");
const f012 = document.getElementById("f0_12");
const f013 = document.getElementById("f0_13");
const f014 = document.getElementById("f0_14");
const f015 = document.getElementById("f0_15");
const f016 = document.getElementById("f0_16");
const f017 = document.getElementById("f0_17");
const f018 = document.getElementById("f0_18");

const keypad_f0 = document.getElementById("keypad_f0_2");
const key_f0_list = document.querySelectorAll(".key_f0_2");

const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_f0.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_f0.style.display = "block";
        keypad_f0.style.left = '30px';
        keypad_f0.style.right = 'auto';
    }
    else {
        if(ev.target.value == '') {
            alert('값을 입력해주세요.');
            return;
        }
        ev.target.style.background = '';
        keypad_f0.style.display = "none";
    }
}

f011.addEventListener('click', (event) => {
    makeKeypadSetting('f011', event);
})

key_f0_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        inputDocument = f011;

        inputValue = inputDocument.value.toString();
        inputValueLength = inputValue.length;

        if(keyValue == 'C'){
            inputDocument.value = '';
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
            if(inputValue == '') {
                alert('값을 입력해주세요.');
                return;
            }
            let convertedValue = Number(inputValue);
            if(convertedValue > 999999 || convertedValue < -999999) {
                alert('입력 범위 내의 값을 입력해주세요.(-999999 이상 999999 이하)');
                return;
            }
            f011.value = inputValue;

            inputDocument.style.background = '';
            keypad_f0.style.display = "none";
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

ipcRenderer.on('get_f0_2_data', (event, data) => {
    log.info('ipcRenderer.on: get_f0_2_data');

    f010.value = data.F010;
    f011.value = data.F011;
    f012.value = data.F012;
    f013.value = data.F013;
    f014.value = data.F014;
    f015.value = data.F015;
    f016.value = data.F016;
    f017.value = data.F017;
    f018.value = data.F018;
});

// F0_2 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f0_2_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f0_2_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF0_2Data = function() {
    log.info('function: setF0_2Data');

    const f0_2Data = {
        F010: f010.options[f010.selectedIndex].value,
        F011: f011.value,
        F012: f012.options[f012.selectedIndex].value,
        F013: f013.options[f013.selectedIndex].value,
        F014: f014.options[f014.selectedIndex].value,
        F015: f015.options[f015.selectedIndex].value,
        F016: f016.options[f016.selectedIndex].value,
        F017: f017.options[f017.selectedIndex].value,
        F018: f018.options[f018.selectedIndex].value
    };

    ipcRenderer.send('set_f0_2_data', f0_2Data);
    return;
}

module.exports = {
    setF0_2Data: setF0_2Data
}
