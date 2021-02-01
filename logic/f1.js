const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const f101 = document.getElementById("f1_01");
const f102 = document.getElementById("f1_02");
const f103 = document.getElementById("f1_03");
const f104 = document.getElementById("f1_04");
const f105 = document.getElementById("f1_05");
const f106 = document.getElementById("f1_06");
const f107 = document.getElementById("f1_07");

ipcRenderer.on('get_f1_data', (event, data) => {
    log.info('ipcRenderer.on: get_f1_data');

    f101.value = data.f101;
    f102.value = data.f102;
    f103.value = data.f103;
    f104.value = data.f104;
    f105.value = data.f105;
    f106.value = data.f106;
    f107.value = data.f107;
});

// F1 Function 값 수정이 완료됨을 알리는 신호
ipcRenderer.on('set_f1_data', (event, arg) => {
    log.info('ipcRenderer.on: set_f1_data');

    setTimeout(function(){
        ipcRenderer.send('set_stream_mode', 'ok');
        const window = remote.getCurrentWindow();
        window.close();
    }, CONSTANT['FIVE_HUNDRED_MS']);
});

const setF1Data = function() {
    log.info('function: setF1Data');

    const f1Data = {
        f101: f101.options[f101.selectedIndex].value,
        f102: f102.options[f102.selectedIndex].value,
        f103: f103.options[f103.selectedIndex].value,
        f104: f104.options[f104.selectedIndex].value,
        f105: f105.options[f105.selectedIndex].value,
        f106: f106.options[f106.selectedIndex].value,
        f107: f107.options[f107.selectedIndex].value
    };

    ipcRenderer.send('set_f1_data', f1Data);
    return;
}

module.exports = {
    setF1Data: setF1Data
}
