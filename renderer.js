const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { RED, YELLOW } = require('./util/constant');
const COLOR = require('./util/color');

// 메인 화면 상단 버튼
let openPCConfigWindowButton = document.getElementById("openPCConfigWindow");
let openConfigWindowButton = document.getElementById("openConfigWindow");
// const openInfoWindowButton = document.getElementById("openInfoWindow");
let closeMainWindowButton = document.getElementById("closeMainWindow");
// 계량값 표시부
let displayMsg = document.getElementById("displayMsg");
let unitTag = document.getElementById("unit");
// 라벨 표시
let labelStableClass = document.getElementById("state_stable");
let labelHoldClass = document.getElementById("state_hold");
let labelZeroClass = document.getElementById("state_zero");
let labelNetClass = document.getElementById("state_net");

let subDisplay = document.getElementsByClassName("sub_display");
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

// 메인 동작 관련 커맨드 버튼
let setClearTareButton = document.getElementById("setClearTare");
let setZeroTareButton = document.getElementById("setZeroTare");
let setGrossNetButton = document.getElementById("setGrossNet");
let setHoldButton = document.getElementById("setHold");
let printButton = document.getElementById("print");
let onOffButton = document.getElementById("onOff");

let colorName = '';

openPCConfigWindowButton.addEventListener('click', function(){
  console.log('openPCConfigWindowButton');
  ipcRenderer.send('open_pc_config_window', 'ok');
})

openConfigWindowButton.addEventListener('click', function(){
  console.log('openConfigWindowButton');
  ipcRenderer.send('open_config_window', 'ok');
})

// openInfoWindowButton.addEventListener('click', function(){
//   setTimeout(function(){
//     openInfoWindowButton.blur();
//   }, 200)
//   // TODO 다이얼로그 삭제 후 remote 없앨것
//   remote.dialog.showMessageBox({type: 'info', title: '정보', message: '준비중입니다.'});
//   return;
//   console.log('openInfoWindowButton');
//   setTimeout(function(){
//     openInfoWindowButton.blur();
//   }, 200)
//   ipcRenderer.send('open_info_window', 'ok');
// })

closeMainWindowButton.addEventListener('click', function(){
  console.log('closeMainWindowButton');

  ipcRenderer.send('set_stream_mode', 'ok');
  closeWindow();
})

ipcRenderer.on('set_font_color', (event, data) => {
  setFontColor(data)
});

let setFontColor = function(color) {

  if(color == RED) {
    colorName = COLOR['RED'];
  }
  else if(color == YELLOW) {
    colorName = COLOR['YELLOW'];
  }
  else {
    colorName = COLOR['BLUE'];
  }
  displayMsg.style.color = colorName;
  unitTag.style.color = colorName;

  for(i = 0; i < subDisplay.length; i++) {
    subDisplay[i].style.color = colorName;
  }
}

ipcRenderer.on('rx_data', (event, data) => {
  displayMsg.innerHTML = data.displayMsg;

  // 단위 표시
  if(data.unit == 1) {
    unitTag.innerHTML = 'g';
  }
  else if(data.unit == 2) {
    unitTag.innerHTML = 'kg';
  }
  else if(data.unit == 3) {
    unitTag.innerHTML = 't';
  }
  else {
    unitTag.innerHTML = '';
  }

  // 상태 표시
  if(data.isStable) {
    labelStableClass.style.color = colorName;
  }
  else {
    labelStableClass.style.color = COLOR.WHITE;
  }

  if(data.isHold) {
    labelHoldClass.style.color = colorName;
  }
  else {
    labelHoldClass.style.color = COLOR.WHITE;
  }

  if(data.isZero) {
    labelZeroClass.style.color = colorName;
  }
  else {
    labelZeroClass.style.color = COLOR.WHITE;
  }

  if(data.isNet) {
    labelNetClass.style.color = colorName;
  }
  else {
    labelNetClass.style.color = COLOR.WHITE;
  }

  // 컴퍼레이터 설정
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

})

ipcRenderer.on('print', (event, data) => {

});

ipcRenderer.on('main_button_active', (event, isActive) => {
  // 프로그램 ON 상태
  if(!isActive) {
    setClearTareButton.disabled = true;
    setZeroTareButton.disabled = true;
    setGrossNetButton.disabled = true;
    setHoldButton.disabled = true;
    printButton.disabled = true;
    openConfigWindowButton.disabled = true;
  }
  // 프로그램 OFF 상태
  else {
    setClearTareButton.disabled = false;
    setZeroTareButton.disabled = false;
    setGrossNetButton.disabled = false;
    setHoldButton.disabled = false;
    printButton.disabled = false;
    openConfigWindowButton.disabled = false;
  }
})

setClearTareButton.addEventListener('click', function(){
  ipcRenderer.send('set_clear_tare', 'ok');
})

setZeroTareButton.addEventListener('click', function(){
  ipcRenderer.send('set_zero_tare', 'ok');
})

setGrossNetButton.addEventListener('click', function(){
  ipcRenderer.send('set_gross_net', 'ok');
})

setHoldButton.addEventListener('click', function(){
  ipcRenderer.send('set_hold', 'ok');
})

printButton.addEventListener('click', function(){
  ipcRenderer.send('print', 'ok');
})

onOffButton.addEventListener('click', function(){
  setOnOffView();
})

let closeWindow = function() {
  ipcRenderer.send('window_close', 'main');
}

let setOnOffView = function() {
  let onoffLabel = onOffButton.innerHTML;

  // 프로그램 시작
  if(onoffLabel == 'ON') {
    onOffButton.innerHTML = 'OFF';
    openPCConfigWindowButton.disabled = true;
  }
  // 프로그램 종료
  else {
    onOffButton.innerHTML = 'ON';
    openPCConfigWindowButton.disabled = false;

    displayMsg.innerHTML = '888888';
    unitTag.innerHTML = '';

    labelStableClass.style.color = 'white';
    labelHoldClass.style.color = 'white';
    labelZeroClass.style.color = 'white';
    labelNetClass.style.color = 'white';
  }

  ipcRenderer.send('on_off', onoffLabel);
}
