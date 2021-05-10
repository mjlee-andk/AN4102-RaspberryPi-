const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const COLOR = require('../util/color');

// 교정
const spanValueText = document.getElementById("spanValueText");

const calZeroButton = document.getElementById("calZeroButton");
const checkCalZero = document.getElementById("checkCalZero");

const calSpanButton = document.getElementById("calSpanButton");
const checkCalSpan = document.getElementById("checkCalSpan");

calZeroButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'CAL ZERO',
            message: 'CAL ZERO를 진행하시겠습니까?',
            buttons: ['ok', 'cancel']
        }).then(result => {
            const response = result.response;
            if(response == 0) {
                ipcRenderer.send('set_cal_zero', 'ok');
            }
            else {
                checkCalZero.innerHTML = 'NG';
            }
        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
})

calSpanButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'CAL SPAN',
            message: 'CAL SPAN을 진행하시겠습니까?',
            buttons: ['ok', 'cancel']
        }).then(result => {
            const response = result.response;

            if(response == 0) {
                ipcRenderer.send('set_cal_span', 'ok');
            }
            else {
                checkCalSpan.innerHTML = 'NG';
            }
        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
})


// 라벨 표시
let labelStableClass = document.getElementById("state_stable");

ipcRenderer.on('rx_data', (event, data) => {
    // 상태 표시
    if(data.isStable) {
        labelStableClass.style.color = COLOR['BLUE'];
    }
    else {
        labelStableClass.style.color = COLOR['WHITE'];
    }
});

ipcRenderer.on('set_cal_zero', (event, arg) => {
    log.info('ipcRenderer.on: set_cal_zero');

    if(arg == 'ok') {
        checkCalZero.innerHTML = 'OK';
    }
    else {
        checkCalZero.innerHTML = 'NG';
    }
});

ipcRenderer.on('set_cal_span', (event, arg) => {
    log.info('ipcRenderer.on: set_cal_span');

    if(arg == 'ok') {
        checkCalSpan.innerHTML = 'OK';
    }
    else {
        checkCalSpan.innerHTML = 'NG';
    }
});
