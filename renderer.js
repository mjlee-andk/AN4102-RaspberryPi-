const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록
const CONSTANT = require('./util/constant');
const COLOR = require('./util/color');

const alert_text = 'ON 버튼을 눌러 설정을 입력해주세요.';

let colorName = '';
let isProgramOn = false;

// 메인 화면 상단 버튼
let openPCConfigWindowButton = document.getElementById("openPCConfigWindow");
let openConfigWindowButton = document.getElementById("openConfigWindow");
const closeMainWindowButton = document.getElementById("closeMainWindow");
// 계량값 표시부
let displayMsg = document.getElementById("displayMsg");
let unitTag = document.getElementById("unit");
// 라벨 표시
let labelStableClass = document.getElementById("state_stable");
let labelHoldClass = document.getElementById("state_hold");
let labelZeroClass = document.getElementById("state_zero");
let labelNetClass = document.getElementById("state_net");

let subWeight = document.querySelectorAll(".sub_weight span");
// 컴퍼레이터 설정값
let comS1Title = document.getElementById("s1_title");
let comS1Value = document.getElementById("s1_value");
let comS2Title = document.getElementById("s2_title");
let comS2Value = document.getElementById("s2_value");
let comS3Title = document.getElementById("s3_title");
let comS3Value = document.getElementById("s3_value");
let comS4Title = document.getElementById("s4_title");
let comS4Value = document.getElementById("s4_value");
let comS5Title = document.getElementById("s5_title");
let comS5Value = document.getElementById("s5_value");

// 컴퍼레이터 키패드
let keypad_subweight = document.getElementById("keypad_subweight");
let key_subweight_list = document.querySelectorAll(".key_subweight");
let key_btn_subweight_list = document.querySelectorAll(".key_btn_subweight");
let comp_flag = -1; // 현재 선택한 컴퍼레이터 값 구분자. -1이 아무것도 선택하지 않은 상태

comS1Value.addEventListener("click", function(){
    if(!isProgramOn) {
        alert(alert_text);
        return;
    }
    if(keypad_subweight.style.display == "none") {
        if(comp_flag != -1) {
            return;
        }
        keypad_subweight.style.display = "block";
        comS1Value.style.color = COLOR['WHITE'];
        keypad_subweight.style.right = "30px";
        keypad_subweight.style.left = "auto";
        comp_flag = 0;
    }
    else {
        if(comp_flag != 0) {
            return;
        }
        keypad_subweight.style.display = "none";
        comS1Value.style.color = colorName;
        comp_flag = -1;
    }
});
comS2Value.addEventListener("click", function(){
    if(!isProgramOn) {
        alert(alert_text);
        return;
    }
    if(keypad_subweight.style.display == "none") {
        if(comp_flag != -1) {
            return;
        }
        keypad_subweight.style.display = "block";
        comS2Value.style.color = COLOR['WHITE'];
        keypad_subweight.style.right = "30px";
        keypad_subweight.style.left = "auto";
        comp_flag = 1;
    }
    else {
        if(comp_flag != 1) {
            return;
        }
        keypad_subweight.style.display = "none";
        comS2Value.style.color = colorName;
        comp_flag = -1;
    }
});
comS3Value.addEventListener("click", function(){
    if(!isProgramOn) {
        alert(alert_text);
        return;
    }
    if(keypad_subweight.style.display == "none") {
        if(comp_flag != -1) {
            return;
        }
        keypad_subweight.style.display = "block";
        comS3Value.style.color = COLOR['WHITE'];
        keypad_subweight.style.right = "30px";
        keypad_subweight.style.left = "auto";
        comp_flag = 2;
    }
    else {
        if(comp_flag != 2) {
            return;
        }
        keypad_subweight.style.display = "none";
        comS3Value.style.color = colorName;
        comp_flag = -1;
    }
});
comS4Value.addEventListener("click", function(){
    if(!isProgramOn) {
        alert(alert_text);
        return;
    }
    if(keypad_subweight.style.display == "none") {
        if(comp_flag != -1) {
            return;
        }
        keypad_subweight.style.display = "block";
        keypad_subweight.style.right = "auto";
        keypad_subweight.style.left = "30px";
        comS4Value.style.color = COLOR['WHITE'];
        comp_flag = 3;
    }
    else {
        if(comp_flag != 3) {
            return;
        }
        keypad_subweight.style.display = "none";
        comS4Value.style.color = colorName;
        comp_flag = -1;
    }
});
comS5Value.addEventListener("click", function(){
    if(!isProgramOn) {
        alert(alert_text);
        return;
    }
    if(keypad_subweight.style.display == "none") {
        if(comp_flag != -1) {
            return;
        }
        keypad_subweight.style.display = "block";
        keypad_subweight.style.right = "auto";
        keypad_subweight.style.left = "30px";
        comS5Value.style.color = COLOR['WHITE'];
        comp_flag = 4;
    }
    else {
        if(comp_flag != 4) {
            return;
        }
        keypad_subweight.style.display = "none";
        comS5Value.style.color = colorName;
        comp_flag = -1;
    }
});

key_subweight_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let comp_value;
        if(comp_flag == 0) {
            comp_value = comS1Value;
        }
        else if(comp_flag == 1) {
            comp_value = comS2Value;
        }
        else if(comp_flag == 2) {
            comp_value = comS3Value;
        }
        else if(comp_flag == 3) {
            comp_value = comS4Value;
        }
        else if(comp_flag == 4) {
            comp_value = comS5Value;
        }

        const numBoxValue = comp_value.innerHTML;
        const numBoxLength = comp_value.innerHTML.length;
        const keyValue = item.innerHTML;

        // 최대 6자리까지 입력가능
        if(numBoxLength >= 6) {
            return;
        }

        // 현재 값이 0인 경우
        if(numBoxValue == 0) {
            comp_value.innerHTML = keyValue;
        }
        // 현재 값이 0이 아닌 경우
        else {
            comp_value.innerHTML = comp_value.innerHTML + keyValue;
        }
    })
})

key_btn_subweight_list.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        let comp_value;
        if(comp_flag == 0) {
            comp_value = comS1Value;
        }
        else if(comp_flag == 1) {
            comp_value = comS2Value;
        }
        else if(comp_flag == 2) {
            comp_value = comS3Value;
        }
        else if(comp_flag == 3) {
            comp_value = comS4Value;
        }
        else if(comp_flag == 4) {
            comp_value = comS5Value;
        }

        const numBoxValue = comp_value.innerHTML;
        const inputValLength = comp_value.innerHTML.length;
        const keyValue = item.innerHTML;

        if(keyValue == '삭제'){
            if(inputValLength <= 0) {
                return;
            }
            comp_value.innerHTML = comp_value.innerHTML.substring(0, inputValLength - 1);
            // comp_value.innerHTML = '';
        }
        else if(keyValue == '확인'){
            if(inputValLength == 0) {
                alert('값을 입력해주세요.');
                return;
            }
            setCompValue(comp_flag, comp_value.innerHTML);
            keypad_subweight.style.display = "none";
            comp_value.style.color = colorName;
            comp_flag = -1;
        }
    })
});

const setCompValue = function(flag, value) {
    log.info('function: setCompValue');

    const comp_value = {
        flag: flag,
        value: value
    }
    ipcRenderer.send('set_comp_value', comp_value);
}

// 2단 투입 시작 버튼
let startBtn = document.getElementById("start");
let stopBtn = document.getElementById("stop");
let onoffBtn = document.getElementById("onoff");
let grossnetBtn = document.getElementById("grossnet");
let zeroBtn = document.getElementById("zero");
let printBtn = document.getElementById("print");

// 시퀀스 상태
let seqStateNearZero = document.getElementById("seq_state_near_zero");
let seqStateInputMuch = document.getElementById("seq_state_input_much");
let seqStateInputLittle = document.getElementById("seq_state_input_little");
let seqStateFinish = document.getElementById("seq_state_finish");

// 컴퍼레이터 상태
let compStateHI = document.getElementById("comp_state_hi");
let compStateLO = document.getElementById("comp_state_lo");
let compStateOK = document.getElementById("comp_state_ok");

// 메인 동작 관련 커맨드 버튼
let setClearTareButton = document.getElementById("setClearTare");
let setZeroTareButton = document.getElementById("setZeroTare");
let setGrossNetButton = document.getElementById("setGrossNet");
let setHoldButton = document.getElementById("setHold");
let powerButton = document.getElementById("power");

openPCConfigWindowButton.addEventListener('click', function(){
    ipcRenderer.send('open_pc_config_window', 'ok');
})

openConfigWindowButton.addEventListener('click', function(){
    ipcRenderer.send('open_config_window', 'ok');
})

closeMainWindowButton.addEventListener('click', function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    closeWindow();
})

ipcRenderer.on('set_font_color', (event, data) => {
    log.info('ipcRenderer.on: set_font_color');

    setFontColor(data)
});

ipcRenderer.on('close_comparator_keypad', (event, data) => {
    log.info('ipcRenderer.on: close_comparator_keypad');
    closeComparatorKeypad();
})

const closeComparatorKeypad = function() {
    log.info('function: close_comparator_keypad');

    keypad_subweight.style.display = "none";
    comS1Value.style.color = colorName;
    comS2Value.style.color = colorName;
    comS3Value.style.color = colorName;
    comS4Value.style.color = colorName;
    comS1Value.style.color = colorName;
    comp_flag = -1;
}

const setFontColor = function(font_color) {
    log.info('function: setFontColor');

    if(font_color == CONSTANT['FONT_COLOR_RED']) {
        colorName = COLOR['RED'];
    }
    else if(font_color == CONSTANT['FONT_COLOR_YELLOW']) {
        colorName = COLOR['YELLOW'];
    }
    else {
        colorName = COLOR['BLUE'];
    }
    displayMsg.style.color = colorName;
    unitTag.style.color = colorName;

    for(i = 0; i < subWeight.length; i++) {
        subWeight[i].style.color = colorName;
    }
}

ipcRenderer.on('rx_data', (event, data) => {
    displayMsg.innerHTML = data.displayMsg;
    console.log('data.unit', data.unit);
    // 단위 표시
    if(data.unit == 0) {
        unitTag.innerHTML = 'kg';
    }
    else if(data.unit == 1) {
        unitTag.innerHTML = 'g';
    }
    else if(data.unit == 2) {
        unitTag.innerHTML = 't';
    }
    else if(data.unit == 3) {
        unitTag.innerHTML = 'lb';
    }

    // 상태 표시
    if(data.isStable) {
        labelStableClass.style.color = colorName;
    }
    else {
        labelStableClass.style.color = COLOR['WHITE'];
    }

    if(data.isHold) {
        labelHoldClass.style.color = colorName;
    }
    else {
        labelHoldClass.style.color = COLOR['WHITE'];
    }

    if(data.isZero) {
        labelZeroClass.style.color = colorName;
    }
    else {
        labelZeroClass.style.color = COLOR['WHITE'];
    }

    if(data.isNet) {
        labelNetClass.style.color = colorName;
    }
    else {
        labelNetClass.style.color = COLOR['WHITE'];
    }

    // 컴퍼레이터 초기 설정
    if(data.comparator) {
        comS1Title.innerHTML = data.s1_title;
        comS2Title.innerHTML = data.s2_title;
        comS3Title.innerHTML = data.s3_title;
        comS4Title.innerHTML = data.s4_title;
        comS5Title.innerHTML = data.s5_title;

        comS1Value.innerHTML = data.s1_value;
        comS2Value.innerHTML = data.s2_value;
        comS3Value.innerHTML = data.s3_value;
        comS4Value.innerHTML = data.s4_value;
        comS5Value.innerHTML = data.s5_value;
    }

    // 시퀀스 상태
    if(data.seqStateFINISH) {
        seqStateFinish.className = "seq_state_on";
    }
    else {
        seqStateFinish.className = "seq_state_off";
    }

    if(data.seqStateLITTLE) {
        seqStateInputLittle.className = "seq_state_on";
    }
    else {
        seqStateInputLittle.className = "seq_state_off";
    }

    if(data.seqStateMUCH) {
        seqStateInputMuch.className = "seq_state_on";
    }
    else {
        seqStateInputMuch.className = "seq_state_off";
    }

    if(data.seqStateNEARZERO) {
        seqStateNearZero.className = "seq_state_on";
    }
    else {
        seqStateNearZero.className = "seq_state_off";
    }

    // Comparator 상태
    if(data.compStateHI) {
        compStateHI.style.color = COLOR['RED'];
        compStateLO.style.color = COLOR['WHITE'];
        compStateOK.style.color = COLOR['WHITE'];
    }
    else if(data.compStateLO) {
        compStateHI.style.color = COLOR['WHITE'];
        compStateLO.style.color = COLOR['ORANGE'];
        compStateOK.style.color = COLOR['WHITE'];
    }
    else if(data.compStateOK) {
        compStateHI.style.color = COLOR['WHITE'];
        compStateLO.style.color = COLOR['WHITE'];
        compStateOK.style.color = COLOR['GREEN'];
    }
    else {
        compStateHI.style.color = COLOR['WHITE'];
        compStateLO.style.color = COLOR['WHITE'];
        compStateOK.style.color = COLOR['WHITE'];
    }
});

ipcRenderer.on('print', (event, data) => {

});

ipcRenderer.on('set_comp_mode', (event, data) => {
    comS1Title.style.display = 'inline-block';
    comS1Value.style.display = 'inline-block';

    // 2단 투입, 2단 배출
    if(data == CONSTANT['COMP_MODE_INPUT'] || data == CONSTANT['COMP_MODE_EMISSION']) {
        comS1Title.innerHTML = 'Fi';
        comS2Title.innerHTML = 'Fr';
        comS3Title.innerHTML = 'Pl';
        comS4Title.innerHTML = 'Ov';
        comS5Title.innerHTML = 'Ud';

        startBtn.parentElement.style.display = "inline-block";
        stopBtn.parentElement.style.display = "inline-block";
        onoffBtn.parentElement.style.display = "inline-block";
        grossnetBtn.parentElement.style.display = "inline-block";
        zeroBtn.parentElement.style.display = "inline-block";
        printBtn.parentElement.style.display = "inline-block";
    }
    // 리미트
    else if(data == CONSTANT['COMP_MODE_LIMIT']) {
        comS1Title.innerHTML = 'Fi';
        comS2Title.innerHTML = 'SP1';
        comS3Title.innerHTML = 'SP2';
        comS4Title.innerHTML = 'Ov';
        comS5Title.innerHTML = 'Ud';

        startBtn.parentElement.style.display = "none";
        stopBtn.parentElement.style.display = "none";
        onoffBtn.parentElement.style.display = "inline-block";
        grossnetBtn.parentElement.style.display = "inline-block";
        zeroBtn.parentElement.style.display = "inline-block";
        printBtn.parentElement.style.display = "inline-block";

    }
    // 체커
    else if(data == CONSTANT['COMP_MODE_CHECKER']) {
        comS1Title.style.display = 'none';
        comS1Value.style.display = 'none';

        comS2Title.innerHTML = 'SP1';
        comS3Title.innerHTML = 'SP2';
        comS4Title.innerHTML = 'Ov';
        comS5Title.innerHTML = 'Ud';

        startBtn.parentElement.style.display = "none";
        stopBtn.parentElement.style.display = "none";
        onoffBtn.parentElement.style.display = "inline-block";
        grossnetBtn.parentElement.style.display = "inline-block";
        zeroBtn.parentElement.style.display = "inline-block";
        printBtn.parentElement.style.display = "inline-block";
    }
});

ipcRenderer.on('set_comp_value', (event, data) => {
    log.info('ipcRenderer.on: set_comp_value');

    comS1Value.innerHTML = data.s1_value;
    comS2Value.innerHTML = data.s2_value;
    comS3Value.innerHTML = data.s3_value;
    comS4Value.innerHTML = data.s4_value;
    comS5Value.innerHTML = data.s5_value;
});

ipcRenderer.on('main_button_active', (event, isActive) => {
    log.info('ipcRenderer.on: main_button_active');

    let stopBtn = document.getElementById("stop");
    let onoffBtn = document.getElementById("onoff");
    let grossnetBtn = document.getElementById("grossnet");
    let zeroBtn = document.getElementById("zero");
    let printBtn = document.getElementById("print");
    // 프로그램 OFF 상태
    if(!isActive) {
        startBtn.disabled = true;
        stopBtn.disabled = true;
        onoffBtn.disabled = true;
        grossnetBtn.disabled = true;
        zeroBtn.disabled = true;
        printBtn.disabled = true;
        openConfigWindowButton.disabled = true;
        isProgramOn = false;
    }
    // 프로그램 ON 상태
    else {
        startBtn.disabled = false;
        stopBtn.disabled = false;
        onoffBtn.disabled = false;
        grossnetBtn.disabled = false;
        zeroBtn.disabled = false;
        printBtn.disabled = false;
        openConfigWindowButton.disabled = false;
        isProgramOn = true;
    }
})

startBtn.addEventListener('click', function(){
    ipcRenderer.send('start', 'ok');
})

stopBtn.addEventListener('click', function(){
    ipcRenderer.send('stop', 'ok');
})

onoffBtn.addEventListener('click', function(){
    ipcRenderer.send('onoff', 'ok');
})

grossnetBtn.addEventListener('click', function(){
    ipcRenderer.send('grossnet', 'ok');
})

zeroBtn.addEventListener('click', function(){
    ipcRenderer.send('zero', 'ok');
})

printBtn.addEventListener('click', function(){
    ipcRenderer.send('print', 'ok');
})

powerButton.addEventListener('click', function(){
    setOnOffView();
})

const closeWindow = function() {
    ipcRenderer.send('window_close', 'main');
}

const setOnOffView = function() {
    log.info('function: setOnOffView');

    let onoffLabel = powerButton.innerHTML;

    // 프로그램 시작
    if(onoffLabel == 'ON') {
        powerButton.innerHTML = 'OFF';
        openPCConfigWindowButton.disabled = true;
    }
    // 프로그램 종료
    else {
        powerButton.innerHTML = 'ON';
        openPCConfigWindowButton.disabled = false;

        displayMsg.innerHTML = 'Standby';
        unitTag.innerHTML = '';

        labelStableClass.style.color = COLOR['WHITE'];
        labelHoldClass.style.color = COLOR['WHITE'];
        labelZeroClass.style.color = COLOR['WHITE'];
        labelNetClass.style.color = COLOR['WHITE'];

        seqStateFinish.className = "seq_state_off";
        seqStateInputLittle.className = "seq_state_off";
        seqStateInputMuch.className = "seq_state_off";
        seqStateNearZero.className = "seq_state_off";
    }

    ipcRenderer.send('power', onoffLabel);
}
