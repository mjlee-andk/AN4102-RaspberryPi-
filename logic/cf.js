const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');
const { uartFlag } = require('../util/flag');

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
const key_btn_cf_list = document.querySelectorAll(".key_btn_cf");

let focused_input = '';
const background_color = 'pink';

const makeKeypadSetting = function(element) {
    if(keypad_cf.style.display == "none") {
        event.target.style.background = background_color;
        keypad_cf.style.display = "block";
        focused_input = element;
    }
    else {
        event.target.style.background = '';
        keypad_cf.style.display = "none";
        focused_input = '';
    }
}

cf03.addEventListener('click', (event) => {
    makeKeypadSetting('cf03');
})
cf04.addEventListener('click', (event) => {
    makeKeypadSetting('cf04');
})
cf05.addEventListener('click', (event) => {
    makeKeypadSetting('cf05');
})
cf06.addEventListener('click', (event) => {
    makeKeypadSetting('cf06');
})
cf07.addEventListener('click', (event) => {
    makeKeypadSetting('cf07');
})
cf08.addEventListener('click', (event) => {
    makeKeypadSetting('cf08');
})
cf09.addEventListener('click', (event) => {
    makeKeypadSetting('cf09');
})
cf10.addEventListener('click', (event) => {
    makeKeypadSetting('cf10');
})
cf11.addEventListener('click', (event) => {
    makeKeypadSetting('cf11');
})

key_cf_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let currentDocument;
        let numBoxValue;
        let isNegative = false;
        const keyValue = item.innerHTML;

        if(focused_input == 'cf03') {
            currentDocument = cf03;
        }
        if(focused_input == 'cf04') {
            currentDocument = cf04;
        }
        if(focused_input == 'cf05') {
            currentDocument = cf05;
        }
        if(focused_input == 'cf06') {
            currentDocument = cf06;
        }
        if(focused_input == 'cf07') {
            currentDocument = cf07;
        }
        if(focused_input == 'cf08') {
            currentDocument = cf08;
        }
        if(focused_input == 'cf09') {
            currentDocument = cf09;
        }
        if(focused_input == 'cf10') {
            currentDocument = cf10;
        }
        if(focused_input == 'cf11') {
            currentDocument = cf11;
        }

        // 현재 도큐먼트의 input에 입력된 값을 양의 정수로 바꿈
        numBoxValue = currentDocument.value.toString();

        // 음수인 경우에는 기억해둠.
        if(numBoxValue.indexOf('-') > 0) {
            isNegative = true;
            numBoxValue = numBoxValue.replace('-', '');
        }
        // 소수점 삭제
        numBoxValue = numBoxValue.replace('.', '');

        // 입력한 숫자로 바꿈
        numBoxValue = numBoxValue + keyValue;
        // 음수인 경우에는 마이너스 표시 복구
        if(isNegative) {
            numBoxValue = '-' + numBoxValue;
        }

        // 각 펑션별로 범위 검사
        let changedValue = Number(numBoxValue);
        if(focused_input == 'cf03') {
            if(changedValue > 999999 || changedValue < 1) {
                return;
            }
            cf03.value = changedValue;
        }
        else if(focused_input == 'cf04') {
            if(changedValue > 700000 || changedValue < -700000) {
                return;
            }
            cf04.value = changedValue.toFixed(5);
        }
        else if(focused_input == 'cf05') {
            if(changedValue > 999999 || changedValue < 1) {
                return;
            }
            cf05.value = changedValue.toFixed(5);
        }
        else if(focused_input == 'cf06') {
            if(changedValue > 999999 || changedValue < -999999) {
                return;
            }
            cf06.value = changedValue;
        }
        else if(focused_input == 'cf07') {
            if(changedValue > 100 || changedValue < 0) {
                return;
            }
            cf07.value = changedValue;
        }
        else if(focused_input == 'cf08') {
            if(changedValue > 99 || changedValue < 0) {
                return;
            }
            cf08.value = changedValue.toFixed(1);
        }
        else if(focused_input == 'cf09') {
            if(changedValue > 99 || changedValue < 0) {
                return;
            }
            cf09.value = changedValue.toFixed(1);
        }
        else if(focused_input == 'cf10') {
            if(changedValue > 99 || changedValue < 0) {
                return;
            }
            cf10.value = changedValue.toFixed(1);
        }
        else if(focused_input == 'cf11') {
            if(changedValue > 99 || changedValue < 0) {
                return;
            }
            cf11.value = changedValue.toFixed(1);
        }
    })
})

key_btn_cf_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let currentDocument;
        let numBoxValue;
        let numBoxValueLength = 0;

        const keyValue = item.innerHTML;

        if(focused_input == 'cf03') {
            currentDocument = cf03;
        }
        if(focused_input == 'cf04') {
            currentDocument = cf04;
        }
        if(focused_input == 'cf05') {
            currentDocument = cf05;
        }
        if(focused_input == 'cf06') {
            currentDocument = cf06;
        }
        if(focused_input == 'cf07') {
            currentDocument = cf07;
        }
        if(focused_input == 'cf08') {
            currentDocument = cf08;
        }
        if(focused_input == 'cf09') {
            currentDocument = cf09;
        }
        if(focused_input == 'cf10') {
            currentDocument = cf10;
        }
        if(focused_input == 'cf11') {
            currentDocument = cf11;
        }

        numBoxValue = currentDocument.value.toString();
        numBoxValueLength = numBoxValue.length;

        if(keyValue == '삭제') {
             currentDocument.value = '';
        }
        else if(keyValue == '확인') {
            if(numBoxValueLength == 0) {
                alert('값을 입력해주세요.');
                return;
            }
            currentDocument.style.background = '';
            keypad_cf.style.display = "none";
            focused_input = '';
        }
        else if(keyValue == '+/-') {
            if(numBoxValue.indexOf('-') < 0) {
                numBoxValue = '-' + numBoxValue;
            }
            else {
                numBoxValue = numBoxValue.replace('-', '');
            }
            currentDocument.value = Number(numBoxValue);
        }
    })
});

ipcRenderer.on('get_cf_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_cf_config_data');

    cf01.value = data.cf01;
    cf02.value = data.cf02;
    cf03.value = data.cf03;
    cf04.value = data.cf04;
    cf05.value = data.cf05;
    cf06.value = data.cf06;
    cf07.value = data.cf07;
    cf08.value = data.cf08;
    cf09.value = data.cf09;
    cf10.value = data.cf10;
    cf11.value = data.cf11;
    cf12.checked = false;
    if(data.cf12 == 1) {
        cf12.checked = true;
    }
    cf13.value = data.cf13;
});

// CF Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_cf_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_cf_config_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setCFConfigData = function() {
    log.info('function: setCFConfigData');

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

    ipcRenderer.send('set_cf_config_data', cfConfigData);
    return;
}

module.exports = {
    setCFConfigData: setCFConfigData
}
