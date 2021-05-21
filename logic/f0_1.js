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
const f005 = document.getElementById("f0_05");
const f006 = document.getElementById("f0_06");
const f007 = document.getElementById("f0_07");
const f008 = document.getElementById("f0_08");
const f009 = document.getElementById("f0_09");

const keypad_f0 = document.getElementById("keypad_f0");
const key_f0_list = document.querySelectorAll(".key_f0");

let focused_input = '';
const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_f0.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_f0.style.display = "block";
        focused_input = element;

        if(element == 'f005' || element == 'f007' || element == 'f009') {
            keypad_f0.style.left = '30px';
            keypad_f0.style.right = 'auto';
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
        keypad_f0.style.display = "none";
        focused_input = '';

        if(element == 'f005' || element == 'f007' || element == 'f009') {
            keypad_f0.style.left = 'auto';
            keypad_f0.style.right = '30px';
        }
    }
}

f004.addEventListener('click', (event) => {
    makeKeypadSetting('f004', event);
})
f005.addEventListener('click', (event) => {
    makeKeypadSetting('f005', event);
})
f006.addEventListener('click', (event) => {
    makeKeypadSetting('f006', event);
})
f007.addEventListener('click', (event) => {
    makeKeypadSetting('f007', event);
})
f008.addEventListener('click', (event) => {
    makeKeypadSetting('f008', event);
})
f009.addEventListener('click', (event) => {
    makeKeypadSetting('f009', event);
})

key_f0_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        if(focused_input == 'f004') {
            inputDocument = f004;
        }
        if(focused_input == 'f005') {
            inputDocument = f005;
        }
        if(focused_input == 'f006') {
            inputDocument = f006;
        }
        if(focused_input == 'f007') {
            inputDocument = f007;
        }
        if(focused_input == 'f008') {
            inputDocument = f008;
        }
        if(focused_input == 'f009') {
            inputDocument = f009;
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
            return;
        }
        else if(keyValue == '확인') {
            if(inputValue == '') {
                alert('값을 입력해주세요.');
                return;
            }
            let convertedValue = Number(inputValue);
            if(focused_input == 'f004') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 10.0 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 10.0 이하)');
                    return;
                }
                f004.value = fixedValue.toString();
            }
            else if(focused_input == 'f005') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 10.0 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 10.0 이하)');
                    return;
                }
                f005.value = fixedValue.toString();
            }
            else if(focused_input == 'f006') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 10.0 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 10.0 이하)');
                    return;
                }
                f006.value = fixedValue.toString();
            }
            else if(focused_input == 'f007') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 10.0 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 10.0 이하)');
                    return;
                }
                f007.value = fixedValue.toString();
            }
            else if(focused_input == 'f008') {
                if(convertedValue > 999999 || convertedValue < 0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0 이상 999999 이하)');
                    return;
                }
                f008.value = inputValue;
            }
            else if(focused_input == 'f009') {
                if(convertedValue > 10 || convertedValue < 0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0 이상 10 이하)');
                    return;
                }
                f009.value = inputValue;
            }

            inputDocument.style.background = '';
            keypad_f0.style.display = "none";
            focused_input = '';
        }
        else {
            if(focused_input == 'f004'
            || focused_input == 'f005' || focused_input == 'f006'
            || focused_input == 'f007') {
                // 소수점이 있을 경우
                if(inputValue.indexOf('.') > -1) {
                    inputDocument.value = inputValue + keyValue;
                }
                // 소수점이 없을 경우
                else {
                    // 리셋하여 입력된 값이 없을 경우
                    if(inputValue.length == 0) {
                        inputDocument.value = keyValue;
                    }
                    // 입력된 값이 1개일 경우
                    else if(inputValue.length == 1){
                        inputDocument.value = inputValue + '.' + keyValue;
                    }
                    // 그 외
                    else {
                        inputDocument.value = inputValue + keyValue;
                    }
                }
            }
            else {
                if(inputValue == '0') {
                    inputDocument.value = keyValue;
                }
                else {
                    inputDocument.value = inputValue + keyValue;
                }
            }
        }
    })
})

ipcRenderer.on('get_f0_1_data', (event, data) => {
    log.info('ipcRenderer.on: get_f0_1_data');

    let binData = data.F001.toString(2);
    let binDataLength = binData.length;

    for(let i = 0; i < 6 - binDataLength; i++) {
        binData = '0' + binData;
    }

    f001_1.checked = binData.charAt(0) == '1' ? true : false;
    f001_2.checked = binData.charAt(1) == '1' ? true : false;
    f001_3.checked = binData.charAt(2) == '1' ? true : false;
    f001_4.checked = binData.charAt(3) == '1' ? true : false;
    f001_5.checked = binData.charAt(4) == '1' ? true : false;
    f001_6.checked = binData.charAt(5) == '1' ? true : false;

    f002.value = data.F002;
    f003.value = data.F003;
    f004.value = parseFloat(data.F004 / 10).toFixed(1);
    f005.value = parseFloat(data.F005 / 10).toFixed(1);
    f006.value = parseFloat(data.F006 / 10).toFixed(1);
    f007.value = parseFloat(data.F007 / 10).toFixed(1);
    f008.value = data.F008;
    f009.value = data.F009;
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
    let binF001 = '';

    binF001 = binF001 + (f001_1.checked == true ? '1' : '0');
    binF001 = binF001 + (f001_2.checked == true ? '1' : '0');
    binF001 = binF001 + (f001_3.checked == true ? '1' : '0');
    binF001 = binF001 + (f001_4.checked == true ? '1' : '0');
    binF001 = binF001 + (f001_5.checked == true ? '1' : '0');
    binF001 = binF001 + (f001_6.checked == true ? '1' : '0');
    intF001 = parseInt(binF001, 2);

    const f0_1Data = {
        F001: intF001,
        F002: f002.options[f002.selectedIndex].value,
        F003: f003.options[f003.selectedIndex].value,
        F004: f004.value * 10,
        F005: f005.value * 10,
        F006: f006.value * 10,
        F007: f007.value * 10,
        F008: f008.value,
        F009: f009.value
    };

    ipcRenderer.send('set_f0_1_data', f0_1Data);
    return;
}

module.exports = {
    setF0_1Data: setF0_1Data
}
