const { ipcRenderer } = require('electron')
const { uartFlag } = require('../util/flag');
const { PARITY_NONE, PARITY_ODD, PARITY_EVEN, CRLF, CR, RED, YELLOW, BLUE } = require('../util/constant');

let pcConfigOkButton = document.getElementById("pcConfigOkButton");
let pcConfigCloseButton = document.getElementById("pcConfigCloseButton");

let portSelect = document.getElementById("portSelect");
let baudrateSelect = document.getElementById("baudrateSelect");
let dataBitsRadios1 = document.getElementById("dataBitsRadios1");
let dataBitsRadios2 = document.getElementById("dataBitsRadios2");
let parityRadios1 = document.getElementById("parityRadios1");
let parityRadios2 = document.getElementById("parityRadios2");
let parityRadios3 = document.getElementById("parityRadios3");
let stopbitsRadios1 = document.getElementById("stopbitsRadios1");
let stopbitsRadios2 = document.getElementById("stopbitsRadios2");
let terminatorRadios1 = document.getElementById("terminatorRadios1");
let terminatorRadios2 = document.getElementById("terminatorRadios2");

let fontColorRadios1 = document.getElementById("fontColorRadios1");
let fontColorRadios2 = document.getElementById("fontColorRadios2");
let fontColorRadios3 = document.getElementById("fontColorRadios3");

pcConfigOkButton.addEventListener('click', function() {
    pcConfigSetData();
    closeWindow();
})

pcConfigCloseButton.addEventListener('click', function() {
    closeWindow();
})

// PC설정 화면 시작시 데이터 받아오기
ipcRenderer.on('pc_config_get_data', (event, data) => {
    console.log('pc_config_get_data');

    portSelect.value = data.port;
    baudrateSelect.value = data.baudrate;

    dataBitsRadios1.checked = (data.databits == 7);
    dataBitsRadios2.checked = (data.databits == 8);

    parityRadios1.checked = (data.parity == PARITY_NONE);
    parityRadios2.checked = (data.parity == PARITY_ODD);
    parityRadios3.checked = (data.parity == PARITY_EVEN);

    stopbitsRadios1.checked = (data.stopbits == 1);
    stopbitsRadios2.checked = (data.stopbits == 2);

    terminatorRadios1.checked = (data.terminator == CRLF);
    terminatorRadios2.checked = (data.terminator == CR);

    fontColorRadios1.checked = (data.fontcolor == RED);
    fontColorRadios2.checked = (data.fontcolor == YELLOW);
    fontColorRadios3.checked = (data.fontcolor == BLUE);
});

// Port 리스트 받아오기
ipcRenderer.on('port_list', (event, data) => {
    console.log('port_list');
    data.forEach(function(item, index, array){
        let objOption = document.createElement("option");
        objOption.text = item.path;
        objOption.value = item.path;

        portSelect.options.add(objOption);
    })
});

// 기기 설정 페이지에서 입력 받은 데이터로 설정하기
let pcConfigSetData = function() {
    let pcConfigNow = new uartFlag('COM1', 24, 8, PARITY_NONE, 1, CRLF, BLUE);

    pcConfigNow.port = portSelect.options[portSelect.selectedIndex].value;
    pcConfigNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

    pcConfigNow.port = portSelect.options[portSelect.selectedIndex].value;
    pcConfigNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

    pcConfigNow.databits = dataBitsRadios1.checked ? dataBitsRadios1.value : dataBitsRadios2.value;
    pcConfigNow.parity = parityRadios1.checked ? parityRadios1.value : (parityRadios2.checked ? parityRadios2.value : parityRadios3.value);
    pcConfigNow.stopbits = stopbitsRadios1.checked ? stopbitsRadios1.value : stopbitsRadios2.value;
    pcConfigNow.terminator = terminatorRadios1.checked ? terminatorRadios1.value : terminatorRadios2.value;

    pcConfigNow.fontcolor = fontColorRadios1.checked ? fontColorRadios1.value : (fontColorRadios2.checked ? fontColorRadios2.value : fontColorRadios3.value);
    ipcRenderer.send('pc_config_set_data', pcConfigNow);
    return;
}

let closeWindow = function() {
    ipcRenderer.send('window_close', 'pc_config');
}
