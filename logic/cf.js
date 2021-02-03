const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const cf01 = document.getElementById("cf_01");
const cf02 = document.getElementById("cf_02");
const cf03 = document.getElementById("cf_03");
const cf04 = document.getElementById("cf_04");
const cf05 = document.getElementById("cf_05");
const cf06 = document.getElementById("cf_06");
const cf07 = document.getElementById("cf_07");
const cf08 = document.getElementById("cf_08");
const cf09 = document.getElementById("cf_09");
const cf10 = document.getElementById("cf_10");
const cf11 = document.getElementById("cf_11");
const cf12 = document.getElementById("cf_12");
const cf13 = document.getElementById("cf_13");

const keypad_cf = document.getElementById("keypad_cf");
const key_cf_list = document.querySelectorAll(".key_cf");

let focused_input = '';
const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_cf.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_cf.style.display = "block";
        focused_input = element;

        if(element == 'cf03' || element == 'cf05' || element == 'cf06'
    || element == 'cf08' || element == 'cf09' || element == 'cf11') {
            keypad_cf.style.left = '30px';
            keypad_cf.style.right = 'auto';
        }
    }
    else {
        ev.target.style.background = '';
        keypad_cf.style.display = "none";
        focused_input = '';

        if(element == 'cf03' || element == 'cf05' || element == 'cf06'
    || element == 'cf08' || element == 'cf09' || element == 'cf11') {
            keypad_cf.style.left = 'auto';
            keypad_cf.style.right = '30px';
        }
    }
}

cf03.addEventListener('click', (event) => {
    makeKeypadSetting('cf03', event);
})
cf04.addEventListener('click', (event) => {
    makeKeypadSetting('cf04', event);
})
cf05.addEventListener('click', (event) => {
    makeKeypadSetting('cf05', event);
})
cf06.addEventListener('click', (event) => {
    makeKeypadSetting('cf06', event);
})
cf07.addEventListener('click', (event) => {
    makeKeypadSetting('cf07', event);
})
cf08.addEventListener('click', (event) => {
    makeKeypadSetting('cf08', event);
})
cf09.addEventListener('click', (event) => {
    makeKeypadSetting('cf09', event);
})
cf10.addEventListener('click', (event) => {
    makeKeypadSetting('cf10', event);
})
cf11.addEventListener('click', (event) => {
    makeKeypadSetting('cf11', event);
})

key_cf_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let inputDocument;
        let inputValue;
        let inputValueLength = 0;
        const keyValue = item.innerHTML;

        if(focused_input == 'cf03') {
            inputDocument = cf03;
        }
        if(focused_input == 'cf04') {
            inputDocument = cf04;
        }
        if(focused_input == 'cf05') {
            inputDocument = cf05;
        }
        if(focused_input == 'cf06') {
            inputDocument = cf06;
        }
        if(focused_input == 'cf07') {
            inputDocument = cf07;
        }
        if(focused_input == 'cf08') {
            inputDocument = cf08;
        }
        if(focused_input == 'cf09') {
            inputDocument = cf09;
        }
        if(focused_input == 'cf10') {
            inputDocument = cf10;
        }
        if(focused_input == 'cf11') {
            inputDocument = cf11;
        }

        inputValue = inputDocument.value.toString();
        inputValueLength = inputValue.length;

        if(keyValue == 'C'){
            inputDocument.value = '';
        }
        else if(keyValue == '+/-') {
            if(focused_input == 'cf03'
            || focused_input == 'cf05' || focused_input == 'cf07'
            || focused_input == 'cf08' || focused_input == 'cf09'
            || focused_input == 'cf10' || focused_input == 'cf11') {
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
        else if(keyValue == '확인') {
            if(inputValue == '') {
                alert('값을 입력해주세요.');
                return;
            }
            let convertedValue = Number(inputDocument.value);
            if(focused_input == 'cf03') {
                if(convertedValue > 999999 || convertedValue < 1) {
                    alert('입력 범위 내의 값을 입력해주세요.(1 이상 999999 이하)');
                    return;
                }
                cf03.value = inputValue;
            }
            else if(focused_input == 'cf04') {
                let fixedValue = convertedValue.toFixed(5);
                if(fixedValue > 7.00000 || fixedValue < -7.00000) {
                    alert('입력 범위 내의 값을 입력해주세요.(-7.00000 이상 7.00000 이하)');
                    return;
                }

                cf04.value = fixedValue.toString();
            }
            else if(focused_input == 'cf05') {
                let fixedValue = convertedValue.toFixed(5);
                if(fixedValue > 9.99999 || fixedValue < 0.00001) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.00001 이상 9.99999 이하)');
                    return;
                }
                cf05.value = fixedValue.toString();
            }
            else if(focused_input == 'cf06') {
                if(convertedValue > 999999 || convertedValue < -999999) {
                    alert('입력 범위 내의 값을 입력해주세요.(-999999 이상 999999 이하)');
                    return;
                }
                cf06.value = inputValue;
            }
            else if(focused_input == 'cf07') {
                if(convertedValue > 100 || convertedValue < 0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0 이상 100 이하)');
                    return;
                }
                cf07.value = inputValue;
            }
            else if(focused_input == 'cf08') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 9.9 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 9.9 이하)');
                    return;
                }
                cf08.value = fixedValue.toString();
            }
            else if(focused_input == 'cf09') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 9.9 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 9.9 이하)');
                    return;
                }
                cf09.value = fixedValue.toString();
            }
            else if(focused_input == 'cf10') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 9.9 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 9.9 이하)');
                    return;
                }
                cf10.value = fixedValue.toString();
            }
            else if(focused_input == 'cf11') {
                let fixedValue = convertedValue.toFixed(1);
                if(fixedValue > 9.9 || fixedValue < 0.0) {
                    alert('입력 범위 내의 값을 입력해주세요.(0.0 이상 9.9 이하)');
                    return;
                }
                cf11.value = fixedValue.toString();
            }

            inputDocument.style.background = '';
            keypad_cf.style.display = "none";
            keypad_cf.style.left = 'auto';
            keypad_cf.style.right = '30px';
            focused_input = '';
        }
        else {
            if(focused_input == 'cf04'
            || focused_input == 'cf05' || focused_input == 'cf08'
            || focused_input == 'cf09' || focused_input == 'cf10'
            || focused_input == 'cf11') {
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
                // 입력창에 입력된 값이 0일 때
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

ipcRenderer.on('get_cf_data', (event, data) => {
    log.info('ipcRenderer.on: get_cf_data');

    cf01.value = data.CF01;
    cf02.value = data.CF02;
    cf03.value = data.CF03;
    cf04.value = data.CF04 / 100000;
    cf05.value = data.CF05 / 100000;
    cf06.value = data.CF06;

    cf07.value = data.CF07;

    cf08.value = data.CF08 / 10;
    cf09.value = data.CF09 / 10;
    cf10.value = data.CF10 / 10;
    cf11.value = data.CF11 / 10;

    cf12.checked = false;
    if(data.CF12 == 1) {
        cf12.checked = true;
    }
    cf13.value = data.CF13;
});

// CF Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_cf_data', (event, arg) => {
    log.info('ipcRenderer.on: set_cf_data');

    loader.style.display = "none";
    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setCF = function() {
    log.info('function: setCF');

    const cfConfigData = {
        CF01: cf01.options[cf01.selectedIndex].value,
        CF02: cf02.options[cf02.selectedIndex].value,
        CF03: cf03.value,
        CF04: cf04.value * 100000,
        CF05: cf05.value * 100000,
        CF06: cf06.value,
        CF07: cf07.value,
        CF08: cf08.value * 10,
        CF09: cf09.value * 10,
        CF10: cf10.value * 10,
        CF11: cf11.value * 10,
        CF12: cf12.checked == true ? 1 : 0,
        CF13: cf13.options[cf13.selectedIndex].value
    };

    ipcRenderer.send('set_cf_data', cfConfigData);
    return;
}

module.exports = {
    setCF: setCF
}
