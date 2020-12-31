const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
// const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('../util/constant');

// 교정 설정
const capaText = document.getElementById("capaText");
const divSelect = document.getElementById("divSelect");
const decimalPointSelect = document.getElementById("decimalPointSelect");
const unitSelect = document.getElementById("unitSelect");

const keypad_capa = document.getElementById("keypad_capa");
const key_capa_list = document.querySelectorAll(".key_capa");
const key_btn_capa_list = document.querySelectorAll(".key_btn_capa");

ipcRenderer.on('get_calibration_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_calibration_config_data');

    capaText.value = data.capa;
    divSelect.value = data.div;
    decimalPointSelect.value = data.decimalPoint;
    unitSelect.value = data.unit;
});

ipcRenderer.on('set_calibration_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_calibration_config_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, FIVE_HUNDRED_MS);
});

const setCalibrationConfigData = function() {
    log.info('function: setCalibrationConfigData');

    const calibrationConfigData = {
        capa: capaText.value,
        div: divSelect.options[divSelect.selectedIndex].value,
        decimalPoint: decimalPointSelect.options[decimalPointSelect.selectedIndex].value,
        unit: unitSelect.options[unitSelect.selectedIndex].value,
    };

    ipcRenderer.send('set_calibration_config_data', calibrationConfigData);
    return;
}

capaText.addEventListener("click", function(){
    if(keypad_capa.style.display == "none") {
        keypad_capa.style.display = "block";
    }
    else {
        keypad_capa.style.display = "none";
    }
});

key_capa_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const numBoxValue = capaText.value;
        const numBoxLength = capaText.value.length;
        const keyValue = item.innerHTML;

        // 최대 99999까지 입력 가능
        if(numBoxLength <= 4) {
            // 입력값이 0인 경우
            if(numBoxValue == 0) {
                capaText.value = keyValue;
            }
            else {
                capaText.value = capaText.value + keyValue;
            }
        }
    })
})

key_btn_capa_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        const inputValLength = capaText.value.length;
        const keyValue = item.innerHTML;
        if(keyValue == '삭제'){
            if(inputValLength > 0){
                capaText.value = capaText.value.substring(0, inputValLength - 1);
            }
        }
        else if(keyValue == '확인'){
            if(inputValLength == 0) {
                alert('값을 입력해주세요.');
                return;
            }
            if(capaText.value < 1) {
                alert('1 이상 값을 입력해주세요.');
                return;
            }
            keypad_capa.style.display = "none";
        }
    })
});

module.exports = {
    setCalibrationConfigData: setCalibrationConfigData
}
