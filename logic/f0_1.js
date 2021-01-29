const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f001_1 = document.getElementById("f0_01_1");
const f001_2 = document.getElementById("f0_01_2");
const f001_3 = document.getElementById("f0_01_3");
const f001_4 = document.getElementById("f0_01_4");
const f001_5 = document.getElementById("f0_01_5");
const f001_6 = document.getElementById("f0_01_6");

const f002 = document.getElementById("f0_02");
const f003 = document.getElementById("f0_03");
const f004 = document.getElementById("f0_04");
const f004Value =document.getElementById("f0_04_value");
const f005 = document.getElementById("f0_05");
const f005Value =document.getElementById("f0_05_value");
const f006 = document.getElementById("f0_06");
const f006Value =document.getElementById("f0_06_value");
const f007 = document.getElementById("f0_07");
const f007Value =document.getElementById("f0_07_value");
const f008 = document.getElementById("f0_08");
const f009 = document.getElementById("f0_09");
const f009Value =document.getElementById("f0_09_value");
const f010 = document.getElementById("f0_10");
const f011 = document.getElementById("f0_11");

const keypad_f0 = document.getElementById("keypad_f0");
const key_f0_list = document.querySelectorAll(".key_f0");

f004.oninput = function() {
    f004Value.innerHTML = (this.value / 10).toFixed(1);
}
f005.oninput = function() {
    f005Value.innerHTML = (this.value / 10).toFixed(1);
}
f006.oninput = function() {
    f006Value.innerHTML = (this.value / 10).toFixed(1);
}
f007.oninput = function() {
    f007Value.innerHTML = (this.value / 10).toFixed(1);
}
f009.oninput = function() {
    f009Value.innerHTML = this.value / 10;
}

let focused_input = '';
const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_f0.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_f0.style.display = "block";
        focused_input = element;
    }
    else {
        ev.target.style.background = '';
        keypad_f0.style.display = "none";
        focused_input = '';
    }
}

f008.addEventListener('click', (event) => {
    makeKeypadSetting('f008', event);
})
f011.addEventListener('click', (event) => {
    makeKeypadSetting('f011', event);
})

key_f0_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        if(focused_input == 'f008') {
            inputDocument = f008;
        }
        if(focused_input == 'f011') {
            inputDocument = f011;
        }

        inputValue = inputDocument.value.toString();
        inputValueLength = inputValue.length;

        if(keyValue == 'C'){
            inputDocument.value = '0';
        }
        else if(keyValue == '+/-') {
            if(focused_input == 'f008') {
                return;
            }

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
            if(focused_input == 'f008') {
                if(convertedValue > 999999 || convertedValue < 0) {
                    return;
                }
                f008.value = inputDocument.value;
            }
            else if(focused_input == 'f011') {
                if(convertedValue > 999999 || convertedValue < -999999) {
                    return;
                }
                f011.value = inputDocument.value;
            }

            inputDocument.style.background = '';
            keypad_f0.style.display = "none";
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

ipcRenderer.on('get_f0_1_data', (event, data) => {
    log.info('ipcRenderer.on: get_f0_1_data');

    let hexData = data.f001.toString(16);

    f001_1.checked = hexData.charAt(0) == '1' ? true : false;
    f001_2.checked = hexData.charAt(1) == '1' ? true : false;
    f001_3.checked = hexData.charAt(2) == '1' ? true : false;
    f001_4.checked = hexData.charAt(3) == '1' ? true : false;
    f001_5.checked = hexData.charAt(4) == '1' ? true : false;
    f001_6.checked = hexData.charAt(5) == '1' ? true : false;

    f002.value = data.f002;
    f003.value = data.f003;
    f004.value = data.f004;
    f004Value.innerHTML = (f004.value / 10).toFixed(1);
    f005.value = data.f005;
    f005Value.innerHTML = (f005.value / 10).toFixed(1);
    f006.value = data.f006;
    f006Value.innerHTML = (f006.value / 10).toFixed(1);
    f007.value = data.f007;
    f007Value.innerHTML = (f007.value / 10).toFixed(1);
    f008.value = data.f008;
    f009.value = data.f009;
    f010.value = data.f010;
    f011.value = data.f011;
});

// F0_1 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f0_1_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f0_1_data');

    loader.style.display = "none";
    setTimeout(function(){
        ipcRenderer.send('set_comp_mode', 'ok');
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF0_1Data = function() {
    log.info('function: setF0_1Data');

    let intF001 = 0;
    let hexF001 = '';

    hexF001 = hexF001 + (f001_1.checked == true ? '1' : '0');
    hexF001 = hexF001 + (f001_2.checked == true ? '1' : '0');
    hexF001 = hexF001 + (f001_3.checked == true ? '1' : '0');
    hexF001 = hexF001 + (f001_4.checked == true ? '1' : '0');
    hexF001 = hexF001 + (f001_5.checked == true ? '1' : '0');
    hexF001 = hexF001 + (f001_6.checked == true ? '1' : '0');
    intF001 = parseInt(hexF001, 16);

    const f0_1Data = {
        f001: intF001,
        f002: f002.options[f002.selectedIndex].value,
        f003: f003.options[f003.selectedIndex].value,
        f004: f004.value,
        f005: f005.value,
        f006: f006.value,
        f007: f007.value,
        f008: f008.value,
        f009: f009.value,
        f010: f010.options[f010.selectedIndex].value,
        f011: f011.value
    };

    ipcRenderer.send('set_f0_1_data', f0_1Data);
    return;
}

module.exports = {
    setF0_1Data: setF0_1Data
}
