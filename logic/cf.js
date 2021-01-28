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
const cf07Value =document.getElementById("cf_07_value");
const cf08 = document.getElementById("cf_08");
const cf08Value =document.getElementById("cf_08_value");
const cf09 = document.getElementById("cf_09");
const cf09Value =document.getElementById("cf_09_value");
const cf10 = document.getElementById("cf_10");
const cf10Value =document.getElementById("cf_10_value");
const cf11 = document.getElementById("cf_11");
const cf11Value =document.getElementById("cf_11_value");
const cf12 = document.getElementById("cf_12");
const cf13 = document.getElementById("cf_13");

const keypad_cf = document.getElementById("keypad_cf");
const key_cf_list = document.querySelectorAll(".key_cf");

cf07.oninput = function() {
    cf07Value.innerHTML = this.value;
}
cf08.oninput = function() {
    cf08Value.innerHTML = (this.value / 10).toFixed(1);
}
cf09.oninput = function() {
    cf09Value.innerHTML = (this.value / 10).toFixed(1);
}
cf10.oninput = function() {
    cf10Value.innerHTML = (this.value / 10).toFixed(1);
}
cf11.oninput = function() {
    cf11Value.innerHTML = (this.value / 10).toFixed(1);
}

let focused_input = '';
const background_color = 'pink';

const makeKeypadSetting = function(element, ev) {
    if(keypad_cf.style.display == "none") {
        ev.target.style.background = background_color;
        keypad_cf.style.display = "block";
        focused_input = element;

        if(element == 'cf04' || element == 'cf06') {
            keypad_cf.style.left = '30px';
            keypad_cf.style.right = 'auto';
        }
    }
    else {
        ev.target.style.background = '';
        keypad_cf.style.display = "none";
        focused_input = '';

        if(element == 'cf04' || element == 'cf06') {
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

        inputValue = inputDocument.value.toString();
        inputValueLength = inputValue.length;

        if(keyValue == 'C'){
            inputDocument.value = '0';
        }
        else if(keyValue == '+/-') {
            if(focused_input == 'cf03'
            || focused_input == 'cf05') {
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
        else if(keyValue == '.') {
            if(focused_input == 'cf03'
            || focused_input == 'cf06') {
                return;
            }
            if(inputValueLength == 0) {
                return;
            }
            if(inputValue.indexOf(keyValue) > 0) {
                return;
            }

            inputDocument.value = inputValue + keyValue;
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
            if(focused_input == 'cf03') {
                if(convertedValue > 999999 || convertedValue < 1) {
                    return;
                }
                cf03.value = inputDocument.value;
            }
            else if(focused_input == 'cf04') {
                if(convertedValue > 7.00000 || convertedValue < -7.00000) {
                    return;
                }
                cf04.value = inputDocument.value;
            }
            else if(focused_input == 'cf05') {
                if(convertedValue > 9.99999 || convertedValue < 0.00001) {
                    return;
                }
                cf05.value = inputDocument.value;
            }
            else if(focused_input == 'cf06') {
                if(convertedValue > 999999 || convertedValue < -999999) {
                    return;
                }
                cf06.value = inputDocument.value;
            }

            inputDocument.style.background = '';
            keypad_cf.style.display = "none";
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

ipcRenderer.on('get_cf_data', (event, data) => {
    log.info('ipcRenderer.on: get_cf_data');

    cf01.value = data.cf01;
    cf02.value = data.cf02;
    cf03.value = data.cf03;
    cf04.value = data.cf04;
    cf05.value = data.cf05;
    cf06.value = data.cf06;
    cf07.value = data.cf07;
    cf07Value.innerHTML = cf07.value;
    cf08.value = data.cf08;
    cf08Value.innerHTML = (cf08.value / 10).toFixed(1);
    cf09.value = data.cf09;
    cf09Value.innerHTML = (cf09.value / 10).toFixed(1);
    cf10.value = data.cf10;
    cf10Value.innerHTML = (cf10.value / 10).toFixed(1);
    cf11.value = data.cf11;
    cf11Value.innerHTML = (cf11.value / 10).toFixed(1);
    cf12.checked = false;
    if(data.cf12 == 1) {
        cf12.checked = true;
    }
    cf13.value = data.cf13;
});

// CF Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_cf_data', (event, arg) => {
    log.info('ipcRenderer.on: set_cf_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setCF = function() {
    log.info('function: setCF');

    const cfConfigData = {
        cf01: cf01.options[cf01.selectedIndex].value,
        cf02: cf02.options[cf02.selectedIndex].value,
        cf03: cf03.value,
        cf04: cf04.value,
        cf05: cf05.value,
        cf06: cf06.value,
        cf07: cf07.value,
        cf08: cf08.value,
        cf09: cf09.value,
        cf10: cf10.value,
        cf11: cf11.value,
        cf12: cf12.checked == true ? 1 : 0,
        cf13: cf13.options[cf13.selectedIndex].value
    };

    ipcRenderer.send('set_cf_data', cfConfigData);
    return;
}

module.exports = {
    setCF: setCF
}
