const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('../util/constant');

const { setCF } = require('./cf');
const { setF0_1Data } = require('./f0_1');
const { setF0_2Data } = require('./f0_2');
const { setF1Data } = require('./f1');
const { setF3Data } = require('./f3');
const { setF4Data } = require('./f4');
const { setF5Data } = require('./f5');

require('./calibration');

const DISPLAY_BLOCK = 'block';

const cfDiv = document.getElementById("cfDiv");
const f0_1Div = document.getElementById("f0_1Div");
const f0_2Div = document.getElementById("f0_2Div");
const f1Div = document.getElementById("f1Div");
const f2Div = document.getElementById("f2Div");
const f3Div = document.getElementById("f3Div");
const f4Div = document.getElementById("f4Div");
const calDiv = document.getElementById("calDiv");

const loader = document.getElementById("loader");

//
// 화면 상단
//
const configOkBtn = document.getElementById("configOk");
configOkBtn.addEventListener('click', function(){
    if(cfDiv.style.display == DISPLAY_BLOCK) {
        setCF();
    }
    else if(f0_1Div.style.display == DISPLAY_BLOCK) {
        setF0_1Data();
    }
    else if(f0_2Div.style.display == DISPLAY_BLOCK) {
        setF0_2Data();
    }
    else if(f1Div.style.display == DISPLAY_BLOCK) {
        setF1Data();
    }
    else if(f3Div.style.display == DISPLAY_BLOCK) {
        setF3Data();
    }
    else if(f4Div.style.display == DISPLAY_BLOCK) {
        setF4Data();
        setF5Data();
    }
    // else if(f5Div.style.display == DISPLAY_BLOCK) {
    //     setF5Data();
    // }

    loader.style.display = "block";
})

const closeWindow = function() {
    log.info('function: closeWindow');

    ipcRenderer.send('window_close', 'config');
}

const closeConfigWindowButton = document.getElementById("closeConfigWindow");
closeConfigWindowButton.addEventListener('click', function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    closeWindow();
});

//
// 화면 하단
//

const cfBtn = document.getElementById("cfBtn");
const f0_1Btn = document.getElementById("f0_1Btn");
const f0_2Btn = document.getElementById("f0_2Btn");
const f1Btn = document.getElementById("f1Btn");
const f3Btn = document.getElementById("f3Btn");
const f4f5Btn = document.getElementById("f4f5Btn");
const calBtn = document.getElementById("calBtn");

cfBtn.addEventListener('click', function(){
    ipcRenderer.send('get_cf_data', 'ok');

    setDivDisplay('cfBtn');
    setButtonActive('cfBtn');
})

f0_1Btn.addEventListener('click', function(){
    ipcRenderer.send('get_f0_1_data', 'ok');

    setDivDisplay('f0_1Btn');
    setButtonActive('f0_1Btn');
})

f0_2Btn.addEventListener('click', function(){
    ipcRenderer.send('get_f0_2_data', 'ok');

    setDivDisplay('f0_2Btn');
    setButtonActive('f0_2Btn');
})

f1Btn.addEventListener('click', function(){
    ipcRenderer.send('get_f1_data', 'ok');

    setDivDisplay('f1Btn');
    setButtonActive('f1Btn');
})

f3Btn.addEventListener('click', function(){
    ipcRenderer.send('get_f3_data', 'ok');

    setDivDisplay('f3Btn');
    setButtonActive('f3Btn');
})

f4f5Btn.addEventListener('click', function(){
    ipcRenderer.send('get_f4_data', 'ok');
    ipcRenderer.send('get_f5_data', 'ok');

    setDivDisplay('f4f5Btn');
    setButtonActive('f4f5Btn');
})

calBtn.addEventListener('click', function(){
    ipcRenderer.send('get_cal_data', 'ok');

    setDivDisplay('calBtn');
    setButtonActive('calBtn');
})

const setDivDisplay = function(tab) {
    log.info('function: setDivDisplay');

    cfDiv.style.display = "none";
    f0_1Div.style.display = "none";
    f0_2Div.style.display = "none";
    f1Div.style.display = "none";
    f3Div.style.display = "none";
    f4Div.style.display = "none";
    calDiv.style.display = "none";
    configOkBtn.style.display = "inline-block";

    if(tab == 'cfBtn') {
        cfDiv.style.display = DISPLAY_BLOCK;
    }
    else if(tab == 'f0_1Btn') {
        f0_1Div.style.display = DISPLAY_BLOCK;
    }
    else if(tab == 'f0_2Btn') {
        f0_2Div.style.display = DISPLAY_BLOCK;
    }
    else if(tab == 'f1Btn') {
        f1Div.style.display = DISPLAY_BLOCK;
    }
    else if(tab == 'f3Btn') {
        f3Div.style.display = DISPLAY_BLOCK;
    }
    else if(tab == 'f4f5Btn') {
        f4Div.style.display = DISPLAY_BLOCK;
    }
    else if(tab == 'calBtn') {
        calDiv.style.display = DISPLAY_BLOCK;
        configOkBtn.style.display = "none";
    }
}

const setButtonActive = function(tab) {
    log.info('function: setButtonActive');

    cfBtn.classList.remove("btn_clicked");
    f0_1Btn.classList.remove("btn_clicked");
    f0_2Btn.classList.remove("btn_clicked");
    f1Btn.classList.remove("btn_clicked");
    f3Btn.classList.remove("btn_clicked");
    f4f5Btn.classList.remove("btn_clicked");
    calBtn.classList.remove("btn_clicked");

    cfBtn.classList.add("btn_unclicked");
    f0_1Btn.classList.add("btn_unclicked");
    f0_2Btn.classList.add("btn_unclicked");
    f1Btn.classList.add("btn_unclicked");
    f3Btn.classList.add("btn_unclicked");
    f4f5Btn.classList.add("btn_unclicked");
    calBtn.classList.add("btn_unclicked");

    if(tab == 'cfBtn') {
        cfBtn.classList.add("btn_clicked");
        cfBtn.classList.remove("btn_unclicked");
    }
    else if(tab == 'f0_1Btn') {
        f0_1Btn.classList.add("btn_clicked");
        f0_1Btn.classList.remove("btn_unclicked");
    }
    else if(tab == 'f0_2Btn') {
        f0_2Btn.classList.add("btn_clicked");
        f0_2Btn.classList.remove("btn_unclicked");
    }
    else if(tab == 'f1Btn') {
        f1Btn.classList.add("btn_clicked");
        f1Btn.classList.remove("btn_unclicked");
    }
    else if(tab == 'f3Btn') {
        f3Btn.classList.add("btn_clicked");
        f3Btn.classList.remove("btn_unclicked");
    }
    else if(tab == 'f4f5Btn') {
        f4f5Btn.classList.add("btn_clicked");
        f4f5Btn.classList.remove("btn_unclicked");
    }
    else if(tab == 'calBtn') {
        calBtn.classList.add("btn_clicked");
        calBtn.classList.remove("btn_unclicked");
    }
}
setDivDisplay('cfBtn');
setButtonActive('cfBtn');
