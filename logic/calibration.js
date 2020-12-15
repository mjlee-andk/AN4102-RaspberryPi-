const { ipcRenderer } = require('electron')
const remote = require('electron').remote;

// 교정
let spanValueText = document.getElementById("spanValueText");

let keypad_span = document.getElementById("keypad_span");
let key_span_list = document.querySelectorAll(".key_span");
let key_btn_span_list = document.querySelectorAll(".key_btn_span");

let calZeroButton = document.getElementById("calZeroButton");
let checkCalZero = document.getElementById("checkCalZero");

let calSpanButton = document.getElementById("calSpanButton");
let checkCalSpan = document.getElementById("checkCalSpan");

calZeroButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: 'CAL 0',
      message: 'CAL 0를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);
      let response = result.response;
      if(response == 0) {
        ipcRenderer.send('set_cal_zero', 'ok');
      }
      else {
        checkCalZero.innerHTML = 'NG';
      }

    }).catch(err => {
      console.log(err);
    });
})

calSpanButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: 'CAL F',
      message: 'CAL F를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);
      let response = result.response;

      if(response == 0) {
        ipcRenderer.send('set_cal_span', 'ok');
      }
      else {
        checkCalSpan.innerHTML = 'NG';
      }

    }).catch(err => {
      console.log(err);
    });
})

ipcRenderer.on('set_cal_zero', (event, arg) => {
  console.log('set_cal_zero');

  if(arg == 'ok') {
    checkCalZero.innerHTML = 'OK';
  }
  else {
    checkCalZero.innerHTML = 'NG';
  }
});

ipcRenderer.on('set_cal_span', (event, arg) => {
  console.log('set_cal_span');

  if(arg == 'ok') {
    setSpanValue();
    checkCalSpan.innerHTML = 'OK';
  }
  else {
    checkCalSpan.innerHTML = 'NG';
  }
});

ipcRenderer.on('get_cal_data', (event, data) => {
  console.log('get_cal_data');
  spanValueText.value = data.spanValue;
});

let setSpanValue = function() {
  console.log('setSpanValue');

  ipcRenderer.send('set_span_value_data', spanValueText.value);
  return;
}

spanValueText.addEventListener("click", function(){
  if(keypad_span.style.display == "none") {
    keypad_span.style.display = "block";
  }
  else {
    keypad_span.style.display = "none";
  }
});

key_span_list.forEach((item, index) => {
  item.addEventListener("click", (event) => {
    var numBoxValue = spanValueText.value;
    var numBoxLength = spanValueText.value.length;
    var keyValue = item.innerHTML;

    // 양수일 때
    if(numBoxValue.indexOf('-') == -1) {
      // 최대 99999까지 입력 가능
      if(numBoxLength <= 4) {
        // 입력값이 0인 경우
        if(numBoxValue == 0) {
          spanValueText.value = keyValue;
        }
        else {
          spanValueText.value = spanValueText.value + keyValue;
        }
      }
    }
    else {
      // 최대 -99999까지 입력 가능
      if(numBoxLength <= 5) {
        // 입력값이 0인 경우
        if(numBoxValue == 0) {
          spanValueText.value = keyValue;
        }
        else {
          spanValueText.value = spanValueText.value + keyValue;
        }
      }
    }
  })
})

key_btn_span_list.forEach((item, index) => {
  item.addEventListener("click", (event) => {
    var inputValLength = spanValueText.value.length;
    var keyValue = item.innerHTML;
    if(keyValue == '삭제'){
        if(inputValLength > 0){
            spanValueText.value = spanValueText.value.substring(0, inputValLength - 1);
        }
    }
    else if(keyValue == '확인'){
        if(inputValLength == 0) {
          alert('값을 입력해주세요.');
          return;
        }
        keypad_span.style.display = "none";
    }
    // 입력값의 양/음수를 결정
    else {
      if(inputValLength > 0){
        if(spanValueText.value.includes('-')) {
            spanValueText.value = spanValueText.value.replace('-', '');
        }
        else {
          spanValueText.value = '-' + spanValueText.value;
        }
      }
    }
  })
});
