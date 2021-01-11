const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

//
// 기본 설정 좌
//
const digitalFilterSelect = document.getElementById("digitalFilterSelect");
const holdModeSelect = document.getElementById("holdModeSelect");
const averageTimeSlider = document.getElementById('averageTimeSlider');
const averageTimeSliderValue = document.getElementById('averageTimeSliderValue');

averageTimeSlider.oninput = function() {
    averageTimeSliderValue.innerHTML = this.value / 10;
}

ipcRenderer.on('get_basic_left_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_basic_left_config_data');

    digitalFilterSelect.value = data.digitalFilter;
    holdModeSelect.value = data.holdMode;
    averageTimeSlider.value = data.averageTime;
    averageTimeSliderValue.innerHTML = averageTimeSlider.value / 10;
});

ipcRenderer.on('set_basic_left_config_data', (event, data) => {
    log.info('ipcRenderer.on: set_basic_left_config_data');

    setStreamMode();
});

const setBasicLeftConfigData = function() {
    log.info('function: setBasicLeftConfigData');

    const basicLeftConfigData = {
        digitalFilter: digitalFilterSelect.options[digitalFilterSelect.selectedIndex].value,
        holdMode: holdModeSelect.options[holdModeSelect.selectedIndex].value,
        averageTime: averageTimeSlider.value
    };

    ipcRenderer.send('set_basic_left_config_data', basicLeftConfigData);

    return;
}

//
// 기본 설정 우
//
const zeroRangeSlider = document.getElementById("zeroRangeSlider");
const zeroRangeSliderValue = document.getElementById("zeroRangeSliderValue");

const zeroTrackingTimeSlider = document.getElementById("zeroTrackingTimeSlider");
const zeroTrackingTimeSliderValue = document.getElementById("zeroTrackingTimeSliderValue");

const zeroTrackingWidthSlider = document.getElementById('zeroTrackingWidthSlider');
const zeroTrackingWidthSliderValue = document.getElementById("zeroTrackingWidthSliderValue");

const powerOnZeroToggle = document.getElementById('powerOnZeroToggle');

zeroRangeSlider.oninput = function() {
    zeroRangeSliderValue.innerHTML = this.value;
}

zeroTrackingTimeSlider.oninput = function() {
    zeroTrackingTimeSliderValue.innerHTML = this.value / 10;
}

zeroTrackingWidthSlider.oninput = function() {
    zeroTrackingWidthSliderValue.innerHTML = this.value / 10;
}

ipcRenderer.on('get_basic_right_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_basic_right_config_data');

    zeroRangeSlider.value = data.zeroRange;
    zeroRangeSliderValue.innerHTML = zeroRangeSlider.value;

    zeroTrackingTimeSlider.value = data.zeroTrackingTime;
    zeroTrackingTimeSliderValue.innerHTML = zeroTrackingTimeSlider.value / 10;

    zeroTrackingWidthSlider.value = data.zeroTrackingTime;
    zeroTrackingWidthSliderValue.innerHTML = zeroTrackingWidthSlider.value / 10;

    powerOnZeroToggle.checked = false;
    if(data.powerOnZero == 1) {
        powerOnZeroToggle.checked = true;
    }
});

ipcRenderer.on('set_basic_right_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_basic_right_config_data');

    setStreamMode();
})

const setBasicRightConfigData = function() {
    log.info('function: setBasicRightConfigData');

    const basicRightConfigData = {
        zeroRange: zeroRangeSlider.value,
        zeroTrackingTime: zeroTrackingTimeSlider.value,
        zeroTrackingWidth: zeroTrackingWidthSlider.value,
        powerOnZero: powerOnZeroToggle.checked == true ? 1 : 0
    };

    ipcRenderer.send('set_basic_right_config_data', basicRightConfigData);
    return;
}

const setStreamMode = function() {
    log.info('function: setStreamMode');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
}

module.exports = {
    setBasicLeftConfigData: setBasicLeftConfigData,
    setBasicRightConfigData: setBasicRightConfigData
}
