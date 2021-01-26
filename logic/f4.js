const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f401 = document.getElementById("f4_01");
const f402 = document.getElementById("f4_02");
const f403 = document.getElementById("f4_03");

ipcRenderer.on('get_f4_config_data', (event, data) => {
    log.info('ipcRenderer.on: get_f4_config_data');

    f401.value = data.f401;
    f402.value = data.f402;
    f403.value = data.f403;
});

// F4 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f4_config_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f4_config_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF4ConfigData = function() {
    log.info('function: setF4ConfigData');

    const f4ConfigData = {
        f401: f401.options[f401.selectedIndex].value,
        f402: f402.options[f402.selectedIndex].value,
        f403: f403.options[f403.selectedIndex].value
    };

    ipcRenderer.send('set_f4_config_data', f4ConfigData);
    return;
}

module.exports = {
    setF4ConfigData: setF4ConfigData
}
