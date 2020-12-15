const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('../util/constant');

// 기본 설정 좌
let digitalFilterSelect = document.getElementById("digitalFilterSelect");
let holdModeSelect = document.getElementById("holdModeSelect");
let averageTimeSlider = document.getElementById('averageTimeSlider');
let averageTimeSliderValue = document.getElementById('averageTimeSliderValue');

averageTimeSlider.oninput = function() {
  averageTimeSliderValue.innerHTML = this.value / 10;
}

ipcRenderer.on('get_basic_left_config_data', (event, data) => {
  console.log('get_basic_left_config_data');

  digitalFilterSelect.value = data.digitalFilter;
  holdModeSelect.value = data.holdMode;
  averageTimeSlider.value = data.averageTime;
  averageTimeSliderValue.innerHTML = averageTimeSlider.value / 10;
});

ipcRenderer.on('set_basic_left_config_data', (event, data) => {
  console.log('set basic left config ' + data );

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, FIVE_HUNDRED_MS);
});

let setBasicLeftConfigData = function() {
  console.log('setBasicLeftConfigData');

  let basicLeftConfigData = {
    digitalFilter: digitalFilterSelect.options[digitalFilterSelect.selectedIndex].value,
    holdMode: holdModeSelect.options[holdModeSelect.selectedIndex].value,
    averageTime: averageTimeSlider.value
  };
  console.log(basicLeftConfigData);

  ipcRenderer.send('set_basic_left_config_data', basicLeftConfigData);
  return;
}

// 기본 설정 우
let zeroRangeSlider = document.getElementById("zeroRangeSlider");
let zeroRangeSliderValue = document.getElementById("zeroRangeSliderValue");

let zeroTrackingTimeSlider = document.getElementById("zeroTrackingTimeSlider");
let zeroTrackingTimeSliderValue = document.getElementById("zeroTrackingTimeSliderValue");

let zeroTrackingWidthSlider = document.getElementById('zeroTrackingWidthSlider');
let zeroTrackingWidthSliderValue = document.getElementById("zeroTrackingWidthSliderValue");

let powerOnZeroToggle = document.getElementById('powerOnZeroToggle');

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
  console.log('get_basic_right_config_data');

  zeroRangeSlider.value = data.zeroRange;
  zeroRangeSliderValue.innerHTML = zeroRangeSlider.value;

  zeroTrackingTimeSlider.value = data.zeroTrackingTime;
  zeroTrackingTimeSliderValue.innerHTML = zeroTrackingTimeSlider.value / 10;

  zeroTrackingWidthSlider.value = data.zeroTrackingTime;
  zeroTrackingWidthSliderValue.innerHTML = zeroTrackingWidthSlider.value / 10;

  if(data.powerOnZero == 0) {
    powerOnZeroToggle.checked = false;
  }
  else if(data.powerOnZero == 1) {
    powerOnZeroToggle.checked = true;
  }

});

ipcRenderer.on('set_basic_right_config_data', (event, arg) => {
  console.log('set basic right ' + arg );

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    let window = remote.getCurrentWindow();
    window.close();
  }, FIVE_HUNDRED_MS);
})

let setBasicRightConfigData = function() {
  console.log('setBasicRightConfigData');

  let basicRightConfigData = {
    zeroRange: zeroRangeSlider.value,
    zeroTrackingTime: zeroTrackingTimeSlider.value,
    zeroTrackingWidth: zeroTrackingWidthSlider.value,
    powerOnZero: powerOnZeroToggle.checked == true ? 1 : 0
  };

  ipcRenderer.send('set_basic_right_config_data', basicRightConfigData);
  return;
}

module.exports = {
  setBasicLeftConfigData: setBasicLeftConfigData,
  setBasicRightConfigData: setBasicRightConfigData
}
