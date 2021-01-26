const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f012 = document.getElementById("f0_12");
const f013 = document.getElementById("f0_13");
const f014 = document.getElementById("f0_14");
const f015 = document.getElementById("f0_15");
const f016 = document.getElementById("f0_16");
const f017 = document.getElementById("f0_17");
const f018 = document.getElementById("f0_18");

ipcRenderer.on('get_f0_2_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_f0_2_config_data');

    f012.value = data.f012;
    f013.value = data.f013;
    f014.value = data.f014;
    f015.value = data.f015;
    f016.value = data.f016;
    f017.value = data.f017;
    f018.value = data.f018;
});

// F0_2 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f0_2_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f0_2_config_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF0_2ConfigData = function() {
    log.info('function: setF0_2ConfigData');

    const f0_2ConfigData = {
        f012: f012.options[f012.selectedIndex].value,
        f013: f013.options[f013.selectedIndex].value,
        f014: f014.options[f014.selectedIndex].value,
        f015: f015.options[f015.selectedIndex].value,
        f016: f016.options[f016.selectedIndex].value,
        f017: f017.options[f017.selectedIndex].value,
        f018: f018.options[f018.selectedIndex].value
    };

    ipcRenderer.send('set_f0_2_config_data', f0_2ConfigData);
    return;
}

module.exports = {
    setF0_1ConfigData: setF0_2ConfigData
}
