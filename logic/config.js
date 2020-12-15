const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { TAB_SERIAL_CONFIG, TAB_BASIC_LEFT_CONFIG, TAB_BASIC_RIGHT_CONFIG, TAB_EXTERNAL_PRINT_CONFIG, TAB_CALIBRATION_CONFIG, TAB_CALIBRATION, TAB_INIT } = require('../util/constant');
const { setSerialConfigData } = require('./serialConfig');
const { setBasicLeftConfigData, setBasicRightConfigData } = require('./basicConfig');
const { setExternalPrintConfigData } = require('./externalPrintConfig');
const { setCalibrationConfigData } = require('./calibrationConfig');

const displayType = 'block';
require('./calibration');
require('./init');

//
// 화면 상단
//
let configOkButton = document.getElementById("configOk");
configOkButton.addEventListener('click', function(){

  if(serialDiv.style.display == displayType) {
    setSerialConfigData();
  }
  if(basicLeftDiv.style.display == displayType) {
    setBasicLeftConfigData();
  }
  if(basicRightDiv.style.display == displayType) {
    setBasicRightConfigData();
  }

  if(externalPrintDiv.style.display == displayType) {
    setExternalPrintConfigData();
  }

  if(calibrationConfigDiv.style.display == displayType) {
    setCalibrationConfigData();
  }
})

let closeConfigWindowButton = document.getElementById("closeConfigWindow");
closeConfigWindowButton.addEventListener('click', function(){
  console.log('closeConfigWindowButton');
  // setTimeout(function(){
  //   closeConfigWindowButton.blur();
  // }, 200)

  ipcRenderer.send('set_stream_mode', 'ok');
  closeWindow();
});

let closeWindow = function() {
  ipcRenderer.send('window_close', 'config');
}

let romVer = document.getElementById("romVer");

ipcRenderer.on('get_rom_ver', (event, data) => {
  console.log('get_rom_ver');

  romVer.innerHTML = data;
});

//
// 화면 하단
//

let serialConfigButton = document.getElementById("serialConfigButton");
let basicLeftConfigButton = document.getElementById("basicLeftConfigButton");
let basicRightConfigButton = document.getElementById("basicRightConfigButton");
let externalPrintConfigButton = document.getElementById("externalPrintConfigButton");
let calibrationConfigButton = document.getElementById("calibrationConfigButton");
let calButton = document.getElementById("calButton");
let initButton = document.getElementById("initButton");

let serialDiv = document.getElementById("serialDiv");
let basicLeftDiv = document.getElementById("basicLeftDiv");
let basicRightDiv = document.getElementById("basicRightDiv");
let externalPrintDiv = document.getElementById("externalPrintDiv");
let calibrationConfigDiv = document.getElementById("calibrationConfigDiv");
let calDiv = document.getElementById("calDiv");
let initDiv = document.getElementById("initDiv");

let setDivDisplay = function(tab) {

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  initDiv.style.display = "none";
  configOkButton.style.display = "none";

  if(tab == TAB_SERIAL_CONFIG) {
    serialDiv.style.display = displayType;
    configOkButton.style.display = displayType;
  }
  else if(tab == TAB_BASIC_LEFT_CONFIG) {
    basicLeftDiv.style.display = displayType;
    configOkButton.style.display = displayType;
  }
  else if(tab == TAB_BASIC_RIGHT_CONFIG) {
    basicRightDiv.style.display = displayType;
    configOkButton.style.display = displayType;
  }
  else if(tab == TAB_EXTERNAL_PRINT_CONFIG) {
    externalPrintDiv.style.display = displayType;
    configOkButton.style.display = displayType;
  }
  else if(tab == TAB_CALIBRATION_CONFIG) {
    calibrationConfigDiv.style.display = displayType;
    configOkButton.style.display = displayType;
  }
  else if(tab == TAB_CALIBRATION) {
    calDiv.style.display = displayType;
  }
  else if(tab == TAB_INIT) {
    initDiv.style.display = displayType;
  }
}

let setButtonActive = function(tab) {
  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  initButton.classList.remove("active");

  if(tab == TAB_SERIAL_CONFIG) {
    serialConfigButton.classList.add("active");
  }
  else if(tab == TAB_BASIC_LEFT_CONFIG) {
    basicLeftConfigButton.classList.add("active");
  }
  else if(tab == TAB_BASIC_RIGHT_CONFIG) {
    basicRightConfigButton.classList.add("active");
  }
  else if(tab == TAB_EXTERNAL_PRINT_CONFIG) {
    externalPrintConfigButton.classList.add("active");
  }
  else if(tab == TAB_CALIBRATION_CONFIG) {
    calibrationConfigButton.classList.add("active");
  }
  else if(tab == TAB_CALIBRATION) {
    calButton.classList.add("active");
  }
  else if(tab == TAB_INIT) {
    initButton.classList.add("active");
  }
}

serialConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_serial_config_data', 'ok');

  setDivDisplay(TAB_SERIAL_CONFIG);
  setButtonActive(TAB_SERIAL_CONFIG);
})

basicLeftConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_left_config_data', 'ok');

  setDivDisplay(TAB_BASIC_LEFT_CONFIG);
  setButtonActive(TAB_BASIC_LEFT_CONFIG);
})

basicRightConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_right_config_data', 'ok');

  setDivDisplay(TAB_BASIC_RIGHT_CONFIG);
  setButtonActive(TAB_BASIC_RIGHT_CONFIG);
})

externalPrintConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_external_print_config_data', 'ok');

  setDivDisplay(TAB_EXTERNAL_PRINT_CONFIG);
  setButtonActive(TAB_EXTERNAL_PRINT_CONFIG);
})

calibrationConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_calibration_config_data', 'ok');

  setDivDisplay(TAB_CALIBRATION_CONFIG);
  setButtonActive(TAB_CALIBRATION_CONFIG);
})

calButton.addEventListener('click', function(){
  ipcRenderer.send('get_cal_data', 'ok');

  setDivDisplay(TAB_CALIBRATION);
  setButtonActive(TAB_CALIBRATION);
})

initButton.addEventListener('click', function(){
  setDivDisplay(TAB_INIT);
  setButtonActive(TAB_INIT);
})
