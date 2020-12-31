const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const { FIVE_HUNDRED_MS } = require('../util/constant');

// 외부 출력
const printConditionRadios1 = document.getElementById("printConditionRadios1");
const printConditionRadios2 = document.getElementById("printConditionRadios2");
const configValueText = document.getElementById("configValueText");

const comparatorModeRadios1 = document.getElementById("comparatorModeRadios1");
const comparatorModeRadios2 = document.getElementById("comparatorModeRadios2");
const comparatorModeRadios3 = document.getElementById("comparatorModeRadios3");
const nearZeroText = document.getElementById("nearZeroText");

const keypad_config = document.getElementById("keypad_config");
const key_config_list = document.querySelectorAll(".key_config");
const key_btn_config_list = document.querySelectorAll(".key_btn_config");

const keypad_nearzero = document.getElementById("keypad_nearzero");
const key_nearzero_list = document.querySelectorAll(".key_nearzero");
const key_btn_nearzero_list = document.querySelectorAll(".key_btn_nearzero");

ipcRenderer.on('get_external_print_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_external_print_config_data');

    if(data.printCondition == 0) {
        printConditionRadios1.checked = true;
    }
    else if(data.printCondition == 1) {
        printConditionRadios2.checked = true;
    }

    configValueText.value = data.configValue;

    if(data.comparatorMode == 0) {
        comparatorModeRadios1.checked = true;
    }
    else if(data.comparatorMode == 1) {
        comparatorModeRadios2.checked = true;
    }
    else if(data.comparatorMode == 2) {
        comparatorModeRadios3.checked = true;
    }

    nearZeroText.value = data.nearZero;
});

ipcRenderer.on('set_external_print_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_external_print_config_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, FIVE_HUNDRED_MS);
});

const setExternalPrintConfigData = function() {
    log.info('function: setExternalPrintConfigData');

    let externalPrintConfigData = {
        printCondition: 0,
        configValue: 0,
        comparatorMode: 0,
        nearZero:0,
    };

    if(printConditionRadios1.checked) {
        externalPrintConfigData.printCondition = printConditionRadios1.value;
    }
    else if(printConditionRadios2.checked) {
        externalPrintConfigData.printCondition = printConditionRadios2.value;
    }

    externalPrintConfigData.configValue = configValueText.value;

    if(comparatorModeRadios1.checked) {
        externalPrintConfigData.comparatorMode = comparatorModeRadios1.value;
    }
    else if(comparatorModeRadios2.checked) {
        externalPrintConfigData.comparatorMode = comparatorModeRadios2.value;
    }
    else if(comparatorModeRadios3.checked) {
        externalPrintConfigData.comparatorMode = comparatorModeRadios3.value;
    }

    externalPrintConfigData.nearZero = nearZeroText.value;
    ipcRenderer.send('set_external_print_config_data', externalPrintConfigData);

    return;
}

configValueText.addEventListener("click", function(){
    if(keypad_config.style.display == "none") {
        keypad_config.style.display = "block";
    }
    else {
        keypad_config.style.display = "none";
    }
});

key_config_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const numBoxValue = configValueText.value;
        const numBoxLength = configValueText.value.length;
        const keyValue = item.innerHTML;

        // 양수일 때
        if(numBoxValue.indexOf('-') == -1) {
            // 최대 99999까지 입력 가능
            if(numBoxLength <= 4) {
                // 입력값이 0인 경우
                if(numBoxValue == 0) {
                    configValueText.value = keyValue;
                }
                else {
                    configValueText.value = configValueText.value + keyValue;
                }
            }
        }
        else {
            // 최대 -99999까지 입력 가능
            if(numBoxLength <= 5) {
                // 입력값이 0인 경우
                if(numBoxValue == 0) {
                    configValueText.value = keyValue;
                }
                else {
                    configValueText.value = configValueText.value + keyValue;
                }
            }
        }
    })
})

key_btn_config_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const inputValLength = configValueText.value.length;
        const keyValue = item.innerHTML;
        if(keyValue == '삭제'){
            if(inputValLength > 0){
                configValueText.value = configValueText.value.substring(0, inputValLength - 1);
            }
        }
        else if(keyValue == '확인'){
            if(inputValLength == 0) {
                alert('값을 입력해주세요.');
                return;
            }
            keypad_config.style.display = "none";
        }
        // 입력값의 양/음수를 결정
        else {
            if(inputValLength > 0){
                if(configValueText.value.includes('-')) {
                    configValueText.value = configValueText.value.replace('-', '');
                }
                else {
                    configValueText.value = '-' + configValueText.value;
                }
            }
        }
    })
});

// 외부출력 - 영점부근비교 키패드
nearZeroText.addEventListener("click", function(){
    if(keypad_nearzero.style.display === "none") {
        keypad_nearzero.style.display = "block";
    }
    else {
        keypad_nearzero.style.display = "none";
    }
});

key_nearzero_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const numBoxValue = nearZeroText.value;
        const numBoxLength = nearZeroText.value.length;
        const keyValue = item.innerHTML;

        // 양수일 때
        if(numBoxValue.indexOf('-') == -1) {
            // 최대 99999까지 입력 가능
            if(numBoxLength <= 4) {
                // 입력값이 0인 경우
                if(numBoxValue == 0) {
                    nearZeroText.value = keyValue;
                }
                else {
                    nearZeroText.value = nearZeroText.value + keyValue;
                }
            }
        }
        else {
            // 최대 -99999까지 입력 가능
            if(numBoxLength <= 5) {
                // 입력값이 0인 경우
                if(numBoxValue == 0) {
                    nearZeroText.value = keyValue;
                }
                else {
                    nearZeroText.value = nearZeroText.value + keyValue;
                }
            }
        }
    })
})

key_btn_nearzero_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const inputValLength = nearZeroText.value.length;
        const keyValue = item.innerHTML;
        if(keyValue == '삭제'){
            if(inputValLength > 0){
                nearZeroText.value = nearZeroText.value.substring(0, inputValLength - 1);
            }
        }
        else if(keyValue == '확인'){
            if(inputValLength == 0) {
                alert('값을 입력해주세요.');
                return;
            }
            keypad_nearzero.style.display = "none";
        }
        // 입력값의 양/음수를 결정
        else {
            if(inputValLength > 0){
                if(nearZeroText.value.includes('-')) {
                    nearZeroText.value = nearZeroText.value.replace('-', '');
                }
                else {
                    nearZeroText.value = '-' + nearZeroText.value;
                }
            }
        }
    })
});

module.exports = {
    setExternalPrintConfigData: setExternalPrintConfigData
}
