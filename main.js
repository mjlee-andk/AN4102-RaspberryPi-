const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline'); // 시리얼 데이터 파싱
const Store = require('electron-store'); // local Storage

const log = require('electron-log'); // 로그 기록
const net = require('net'); // 소켓 서버통신

const CONSTANT = require('./util/constant');
const { scaleFlag, uartFlag, cfFlag, f0Flag, f1Flag, f3Flag, f4Flag, f5Flag, basicConfigFlag, externalPrintConfigFlag, calibrationConfigFlag } = require('./util/flag');

const os = require('os'); // 운영체제 확인
const platforms = {
    WINDOWS: 'WINDOWS',
    MAC: 'MAC',
    LINUX: 'LINUX',
    SUN: 'SUN',
    OPENBSD: 'OPENBSD',
    ANDROID: 'ANDROID',
    AIX: 'AIX'
};
const platformsNames = {
    win32: platforms.WINDOWS,
    darwin: platforms.MAC,
    linux: platforms.LINUX,
    sunos: platforms.SUN,
    openbsd: platforms.OPENBSD,
    android: platforms.ANDROID,
    aix: platforms.AIX,
};

let sp;
let win;
let configWin;
let pcConfigWin;
let scale = new scaleFlag();
let pcConfig = new uartFlag();

let cfConfig = new cfFlag();
let f0Config = new f0Flag();
let f1Config = new f1Flag();
let f3Config = new f3Flag();
let f4Config = new f4Flag();
let f5Config = new f5Flag();

let serialConfig = new uartFlag();
let basicConfig = new basicConfigFlag();
let externalPrintConfig = new externalPrintConfigFlag();
let calibrationConfig = new calibrationConfigFlag();
let currentPlatform;
let decimalPoint = 0;
let socketServer;

// 최초 메인화면 창 생성
const createWindow = function() {
    log.info('function: createWindow');
    // 브라우저 창을 생성합니다.
    win = new BrowserWindow({
        width: CONSTANT['WINDOW_WIDTH'],
        height: CONSTANT['WINDOW_HEIGHT'],
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        fullscreen: true
    })
    win.loadFile('index.html');

    win.webContents.on('did-finish-load', () => {
        pcConfigGetLocalStorage();
    })

    currentPlatform = platformsNames[os.platform()];
    log.info('OS:', currentPlatform);
}

// AD모듈 설정화면 창 생성
const openConfigWindow = function() {
    log.info('function: openConfigWindow');
    // 브라우저 창을 생성합니다.
    configWin = new BrowserWindow({
        parent: win,
        width: CONSTANT['WINDOW_WIDTH'],
        height: CONSTANT['WINDOW_HEIGHT'],
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        fullscreen: true
    })

    configWin.loadFile('view/config.html');
    configWin.webContents.on('did-finish-load', () => {
        setTimeout(function() {
            getCF();
        }, CONSTANT['FIVE_HUNDRED_MS']);
    })
}

// 기기 설정화면 창 생성
const openPCConfigWindow = function() {
    log.info('function: openPCConfigWindow');
    // 브라우저 창을 생성합니다.
    pcConfigWin = new BrowserWindow({
        parent: win,
        width: CONSTANT['WINDOW_WIDTH'],
        height: CONSTANT['WINDOW_HEIGHT'],
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        fullscreen: true
    })

    pcConfigWin.loadFile('view/pcconfig.html');

    // PC설정 화면 로드 완료되면 포트 목록 호출 및 PC설정 데이터 전송
    pcConfigWin.webContents.on('did-finish-load', () => {
        // 포트목록 불러오기
        SerialPort.list().then(
            ports => {
                pcConfigWin.webContents.send('port_list', ports);
                pcConfigWin.webContents.send('pc_config_get_data', pcConfig)
            }
        );
    })
}


// OK 커맨드
const commandOk = function() {
    log.info('function: commandOk');
    let command = 'OK' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: OK');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('set_comp_value', (event, data) => {
    log.info('ipcMain.on: set_comp_value');

    let compFlag = data['flag'];
    let compValue = data['value'];

    // 커맨드 모드로 진입
    log.info('command: F205,1');
    let command = 'F205,1' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: F205,1');
            log.error(err);
            return;
        }

        // 데이터 총 7바이트 전송
        command = 'WDS' + (compFlag+1).toString() + ',' ;

        // 부호 결정
        if(compValue > 0) {
            command = command + '+';
        }
        else {
            command = command + '-';
        }

        // 부호 제외 6자리 맞추기
        let compValueLength = compValue.toString().length;
        let sendValue = compValue.toString().replace('.', '');

        for(let i = 0; i < 6 - compValueLength; i++) {
            sendValue = '0' + sendValue;
        }

        command = command + sendValue + '\r\n';

        setTimeout(function(){
            log.info('command: WDS');
            sp.write(command, function(err){
                if(err) {
                    log.error('command: WDS');
                    log.error(err);
                    return;
                }

                setTimeout(function(){
                    if(compFlag == 0) {
                        scale.s1_value = compValue;
                    }
                    if(compFlag == 1) {
                        scale.s2_value = compValue;
                    }
                    if(compFlag == 2) {
                        scale.s3_value = compValue;
                    }
                    if(compFlag == 3) {
                        scale.s4_value = compValue;
                    }
                    if(compFlag == 4) {
                        scale.s5_value = compValue;
                    }

                    // 변경 완료 후 스트림 모드로 진입
                    log.info('command: F205,0');
                    command = 'F205,0' + '\r\n';
                    sp.write(command, function(err){
                        if(err) {
                            log.error('command: F205,0');
                            log.error(err);
                            return;
                        }
                        scale.comparator = true;
                    })
                }, CONSTANT['ONE_HUNDRED_MS'])
            })
        }, CONSTANT['ONE_HUNDRED_MS'])
    });
})

ipcMain.on('commandOk', (event, arg) => {
    log.info('ipcMain.on: commandOk');
})

const convertComparatorValue = function(value, dp) {
    log.info('function: convertComparatorValue');
    let result;
    result = value.toString().replace('.', '');
    result =
    Number(
        result.slice(0, result.length-dp)
        + '.'
        + result.slice(result.length-dp)
    ).toFixed(dp);

    return result;
}

const convertHexStringToBinary = function(hex) {
    let result = '';
    if(hex == '') {
        return;
    }
    result = ('0000'+ parseInt(hex, 16).toString(2)).slice(-4);
    return result;
}

const readHeader = function(rx) {
    const separator = ',';
    const splitedData = rx.split(separator);
    const splitedDataLength = splitedData.length;

    // 통신포맷
    if(splitedDataLength == 5) {
        if(rx.length < 20) {
            return;
        }

        const header1 = splitedData[0];
        const header2 = splitedData[1];
        const seqState = splitedData[2];
        const compState = splitedData[3];
        const body = splitedData[4];

        scale.isStable = false;
        scale.isHold = false;
        scale.isHg = false;
        scale.isNet = false;
        scale.isZero = false;
        scale.block = false;

        if(scale.comparator) {
            scale.comparator = false;
            scale.comparator_mode = 0;

            getDecimalPoint(Number(body).toString());

            setTimeout(function(){
                scale.s1_value = convertComparatorValue(scale.s1_value, decimalPoint);
                scale.s2_value = convertComparatorValue(scale.s2_value, decimalPoint);
                scale.s3_value = convertComparatorValue(scale.s3_value, decimalPoint);
                scale.s4_value = convertComparatorValue(scale.s4_value, decimalPoint);
                scale.s5_value = convertComparatorValue(scale.s5_value, decimalPoint);

                win.webContents.send('set_comp_value', scale);
            }, CONSTANT['ONE_HUNDRED_MS']);
        }

        const seqStateBinary = convertHexStringToBinary(seqState);
        scale.seqStateFINISH = seqStateBinary.charAt(0) == '1' ? true : false;
        scale.seqStateLITTLE = seqStateBinary.charAt(1) == '1' ? true : false;
        scale.seqStateMUCH = seqStateBinary.charAt(2) == '1' ? true : false;
        scale.seqStateNEARZERO = seqStateBinary.charAt(3) == '1' ? true : false;

        const compStateBinary = convertHexStringToBinary(compState);
        scale.compStateHI = compStateBinary.charAt(0) == '1' ? true : false;
        scale.compStateOK = compStateBinary.charAt(1) == '1' ? true : false;
        scale.compStateLO = compStateBinary.charAt(2) == '1' ? true : false;
        scale.compStateNG = compStateBinary.charAt(3) == '1' ? true : false;

        scale.displayMsg = makeFormat(body);

        // 안정
        if(header1 == 'ST') {
            scale.isStable = true;
            scale.isZero = false;
            if(header2 == 'NT') {
                scale.isNet = true;
            }
        }

        // 불안정
        else if(header1 == 'US') {
            scale.isStable = false;
            scale.isZero = false;
            if(header2 == 'NT') {
                scale.isNet = true;
            }
        }

        else if(header1 == 'ZT') {
            scale.isStable = true;
            scale.isZero = true;
        }

        else if(header1 == 'ZS') {
            scale.isStable = false;
            scale.isZero = true;
        }

        // 오버
        else if (header1 == 'OL') {
            scale.displayMsg = '   .  ';
        }

        else {
            scale.block = true;
        }
        rx = '';
    }

    // 컴퍼레이터 읽기, 쓰기, 모드
    // F펑션, CF펑션
    else if(splitedDataLength == 2) {
        const header = splitedData[0];
        const body = splitedData[1];
        const headerCategory = header.substr(0,2);

        // 컴퍼레이터 모드 진입
        if(header == 'COM') {
            scale.comparator = true;
            scale.comparator_mode = Number(body);
            setCompMode(scale.comparator_mode);
        }
        // 컴퍼레이터 설정값 읽기
        if(scale.comparator) {
            let value = Number(body).toString();

            if(header == 'RDS1') {
                scale.s1_value = value;
            }
            else if(header == 'RDS2') {
                scale.s2_value = value;
            }
            else if(header == 'RDS3') {
                scale.s3_value = value;
            }
            else if(header == 'RDS4') {
                scale.s4_value = value;
            }
            else if(header == 'RDS5') {
                scale.s5_value = value;

                setTimeout(function(){
                    commandOk();
                }, CONSTANT['ONE_HUNDRED_MS']);
            }
        }

        if(headerCategory == 'F0') {
            const data = Number(body);
            f0Config[header] = data;
            if(f0Config.isReadState) {
                if(header == 'F009') {
                    configWin.webContents.send('get_f0_1_data', f0Config);
                }
                if(header == 'F018') {
                    configWin.webContents.send('get_f0_2_data', f0Config);
                }
            }
            else {
                if(header == 'F009') {
                    configWin.webContents.send('set_f0_1_data', 'ok');
                    f0Config.isReadState = false;
                }
                if(header == 'F018') {
                    configWin.webContents.send('set_f0_2_data', f0Config);
                    f0Config.isReadState = false;
                }
            }
        }

        if(headerCategory == 'F1') {
            const data = Number(body);
            f1Config[header] = data;

            if(f1Config.isReadState) {
                if(header == 'F107') {
                    configWin.webContents.send('get_f1_data', f1Config);
                }
            }
            else {
                if(header == 'F107') {
                    configWin.webContents.send('set_f1_data', 'ok');
                    f1Config.isReadState = false;
                }
            }
        }

        if(headerCategory == 'F3') {
            const data = Number(body);
            f3Config[header] = data;

            if(f3Config.isReadState) {
                if(header == 'F306') {
                    configWin.webContents.send('get_f3_data', f3Config);
                }
            }
            else {
                if(header == 'F306') {
                    configWin.webContents.send('set_f3_data', 'ok');
                    f3Config.isReadState = false;
                }
            }
        }

        if(headerCategory == 'F4') {
            const data = Number(body);
            f4Config[header] = data;

            if(f4Config.isReadState) {
                if(header == 'F403') {
                    configWin.webContents.send('get_f4_data', f4Config);
                }
            }
            else {
                if(header == 'F403') {
                    configWin.webContents.send('set_f4_data', 'ok');
                    f4Config.isReadState = false;
                }
            }
        }

        if(headerCategory == 'F5') {
            const data = Number(body);
            f5Config[header] = data;

            if(f5Config.isReadState) {
                if(header == 'F504') {
                    configWin.webContents.send('get_f5_data', f5Config);
                }
            }
            else {
                if(header == 'F504') {
                    configWin.webContents.send('set_f5_data', 'ok');
                    f5Config.isReadState = false;
                }
            }
        }

        if(headerCategory == 'CF') {
            const data = Number(body);
            cfConfig[header] = data;
            if(cfConfig.isReadState) {
                // 캘리브레이션 - 스팬 입력 전압
                if(header == 'CF05') {
                    configWin.webContents.send('get_cal_data', cfConfig);
                }

                // CF 펑션 마지막 커맨드
                if(header == 'CF13') {
                    configWin.webContents.send('get_cf_data', cfConfig);
                }
            }
            else {
                if(header == 'CF13') {
                    configWin.webContents.send('set_cf_data', 'ok');
                    cfConfig.isReadState = false;
                }
            }
        }
    }

    // 컴퍼레이터 버전정보
    // CALZERO, CALSPAN
    // ?, I
    else if(splitedDataLength == 1) {
        const header = splitedData[0];
        if(header == '?') {
            log.error('COMMAND NOT DEFINE');
        }
        if(header == 'I') {
            // log.error('COMMAND NOT RUN');
            log.error('CALIBRATION ERROR');
        }
        if(header.substr(0, 1) == '@') {
            log.info('COMPARATOR VERSION INFO:', header);
        }
        if(header == 'CALZERO') {
            configWin.webContents.send('set_cal_zero', 'ok');
            return;
        }
        if(header == 'CALSPAN') {
            configWin.webContents.send('set_cal_span', 'ok');
            return;
        }
    }
}

const getDecimalPoint = function(value) {
    if(value == '') {
        return;
    }
    let result = '';
    const pointPos = value.indexOf('.');

    if(pointPos > 0) {
        decimalPoint = 7-pointPos
        result = Number(value).toFixed(decimalPoint).toString();
    }
    // 소수점 없음
    else {
        result = Number(value).toString();
    }
    return result;
}

const makeFormat = function(data) {
    let result = '';
    if(data == '' || data == undefined){
        return result;
    }

    const value = data.substr(0,8);
    const unit = data.substr(8,2).trim();

    result = getDecimalPoint(value);

    if(unit == 'kg') {
        scale.unit = 0;
    }
    else if(unit == 'g') {
        scale.unit = 1;
    }
    else if(unit == 't') {
        scale.unit = 2;
    }
    else if(unit == 'lb') {
        scale.unit = 3;
    }

    return result;
}

const openPort = function() {
    log.info('function: openPort');
    try {
        let parity = 'none';
        if(pcConfig.parity == CONSTANT['PARITY_ODD']) {
            parity = 'odd';
        }
        else if(pcConfig.parity == CONSTANT['PARITY_EVEN']) {
            parity = 'even';
        }
        sp = new SerialPort(pcConfig.port, {
            baudRate: pcConfig.baudrate * 100,
            dataBits: Number(pcConfig.databits),
            parity: parity,
            stopBits: Number(pcConfig.stopbits)
        });
        log.info('pcConfig');
        log.info(pcConfig);
        return sp;
    }
    catch(e) {
        log.error('error: openPort');
        log.error('Cannot open port.');
        log.error(e);
    }
};

const changeMainButtonActive = function(isActive) {
    log.info('function: changeMainButtonActive');
    win.webContents.send('main_button_active', isActive);
}

const confirmConnection = function() {
    // log.info('function: confirmConnection');
    if(isPause) {
        return;
    }
    scale.waiting_sec++;
    if(scale.waiting_sec > 2) {
        scale.displayMsg = '-----';
        scale.unit = 0;
        scale.isStable = false;
        // scale.isHold = false;
        scale.isZero = false;
        scale.isNet = false;
        // scale.isHg = false;
        win.webContents.send('rx_data', scale);
    }
}

ipcMain.on('open_pc_config_window', (event, arg) => {
    log.info('ipcMain.on: open_pc_config_window');
    openPCConfigWindow();
})

// 커맨드 모드로 변경
const setCommandMode = function() {
    log.info('function: setCommandMode');

    const command = 'F205,1' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: F205,1');
            log.error(err);
            return;
        }
        openConfigWindow();
    });
}
ipcMain.on('open_config_window', (event, arg) => {
    log.info('ipcMain.on: open_config_window');
    setCommandMode();
})

ipcMain.on('window_close', (event, arg) => {
    log.info('ipcMain.on: window_close');
    if(arg == 'main') {
        win.close();
    }
    else if(arg == 'config'){
        configWin.close();
    }
    else if(arg == 'pc_config'){
        pcConfigWin.close();
    }
});

ipcMain.on('pc_config_set_data', (event, data) => {
    log.info('ipcMain.on: pc_config_set_data');
    pcConfig = data;

    const localStorage = new Store();

    localStorage.set('pc_config.port', data.port);
    localStorage.set('pc_config.baudrate', data.baudrate);
    localStorage.set('pc_config.databits', data.databits);
    localStorage.set('pc_config.parity', data.parity);
    localStorage.set('pc_config.stopbits', data.stopbits);
    localStorage.set('pc_config.terminator', data.terminator);
    localStorage.set('pc_config.fontcolor', data.fontcolor);

    win.webContents.send('set_font_color', data.fontcolor);
})

ipcMain.on('set_cal_zero', (event, data) => {
    log.info('ipcMain.on: set_cal_zero');
    commandCalzero();
})
const commandCalzero = function() {
    log.info('function: commandCalzero');
    let command = 'CALZERO' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: CALZERO');
            log.error(err);
            configWin.webContents.send('set_cal_zero', 'fail');
            return;
        }
    });
}

ipcMain.on('set_cal_span', (event, data) => {
    log.info('ipcMain.on: set_cal_span');
    commandCalspan();
})
const commandCalspan = function() {
    log.info('function: commandCalspan');
    let command = 'CALSPAN' + '\r\n';
    scale.cf = true;
    sp.write(command, function(err){
        if(err) {
            log.error('command: commandCalspan');
            log.error(err);
            configWin.webContents.send('set_cal_span', 'fail');
            return;
        }
    });
}

// 스트림 모드로 변경
ipcMain.on('set_stream_mode', (event, data) => {
    log.info('ipcMain.on: set_stream_mode');
    if(sp == undefined) {
        return;
    }
    setStreamMode();
})
const setStreamMode = function() {
    log.info('function: setStreamMode');

    const command = 'F205,0' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: F205,0');
            log.error(err);
            return;
        }
    });
}

ipcMain.on('set_comp_mode', (event, data) => {
    log.info('ipcMain.on: set_comp_mode');
    setCompMode(f0Config.f003);
})
const setCompMode = function(param) {
    // 2단 투입, 2단 배출
    if(param == CONSTANT['COMP_MODE_INPUT'] || param == CONSTANT['COMP_MODE_EMISSION']) {
        scale.s1_title = 'Fi';
        scale.s2_title = 'Fr';
        scale.s3_title = 'Pl';
        scale.s4_title = 'Ov';
        scale.s5_title = 'Ud';
    }
    // 리미트
    else if(param == CONSTANT['COMP_MODE_LIMIT']) {
        scale.s1_title = 'Fi';
        scale.s2_title = 'SP1';
        scale.s3_title = 'SP2';
        scale.s4_title = 'Ov';
        scale.s5_title = 'Ud';
    }
    // 체커
    else if(param == CONSTANT['COMP_MODE_CHECKER']) {
        scale.s1_title = 'Fi';
        scale.s2_title = 'SP1';
        scale.s3_title = 'SP2';
        scale.s4_title = 'Ov';
        scale.s5_title = 'Ud';
    }

    win.webContents.send('set_comp_mode', param);
}

const writeCommandCallback = function(i, lastIndex, list, callback) {
    setTimeout(function(){
        log.info('write command: ' + list[i]);
        sp.write(list[i], function(err){
            if(err) {
                log.error('write command: ' + list[i]);
                log.error(err);
                return;
            }
        })

        if(i >= lastIndex) {
            callback();
        }
        else {
            writeCommandCallback(i+1, lastIndex, list, callback);
        }
    }, 300)
}

ipcMain.on('set_cf_data', (event, data) => {
    log.info('ipcMain.on: set_cf_data');
    setCF(data);
})
ipcMain.on('get_cf_data', (event, arg) => {
    log.info('ipcMain.on: get_cf_data');
    getCF();
})
const setCF = function(data) {
    log.info('function: setCF');

    cfConfig.isReadState = false;
    let commandList = new Array();
    for(var i = 1; i < 14; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'CF';
        if(i < 10) {
            header = 'CF0';
        }
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        if(header == 'CF01' || header == 'CF02' || header == 'CF12' || header == 'CF13') {
            content = tmpValue;
        }
        else {
            // 부호 붙여주기
            let numValue = Number(tmpValue);
            content = '+';
            if(numValue < 0) {
                content = '-';
            }

            // 6자리 채우기
            let numLength = tmpValue.length;
            for(var j = 0; j < 6-numLength; j++) {
                content = content + '0';
            }
            content = content + tmpValue;
        }

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }

    writeCommandCallback(0, 12, commandList, function(){

    });
}
const getCF = function() {
    log.info('function: getCF');

    cfConfig.isReadState = true;
    for(var i = 1; i < 14; i++) {
        let command = '';

        // 헤더 정리
        let header = '?CF';
        if(i < 10) {
            header = '?CF0';
        }
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

ipcMain.on('set_f0_1_data', (event, data) => {
    log.info('ipcMain.on: set_f0_1_data');
    setF0_1(data);
})
ipcMain.on('get_f0_1_data', (event, arg) => {
    log.info('ipcMain.on: get_f0_1_data');
    getF0_1();
})
const setF0_1 = function(data) {
    log.info('function: setF0_1');

    f0Config.isReadState = false;
    let commandList = new Array();
    for(var i = 1; i < 10; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'F00';
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        if(header == 'F002' || header == 'F003') {
            content = tmpValue;
        }
        else {
            // 부호 붙여주기
            let numValue = Number(tmpValue);
            content = '+';
            if(numValue < 0) {
                content = '-';
            }

            // 6자리 채우기
            let numLength = tmpValue.length;
            for(var j = 0; j < 6-numLength; j++) {
                content = content + '0';
            }
            content = content + tmpValue;
        }

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }
    writeCommandCallback(0, 8, commandList, function(){

    });
}
const getF0_1 = function() {
    log.info('function: getF0_1');

    f0Config.isReadState = true;
    for(var i = 1; i < 10; i++) {
        let command = '';

        // 헤더 정리
        let header = '?F00';
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

ipcMain.on('set_f0_2_data', (event, data) => {
    log.info('ipcMain.on: set_f0_2_data');
    setF0_2(data);
})
ipcMain.on('get_f0_2_data', (event, arg) => {
    log.info('ipcMain.on: get_f0_2_data');
    getF0_2();
})
const setF0_2 = function(data) {
    log.info('function: setF0_2');

    f0Config.isReadState = false;
    let commandList = new Array();
    for(var i = 0; i < 9; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'F01';
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        if(header == 'F011') {
            // 부호 붙여주기
            let numValue = Number(tmpValue);
            content = '+';
            if(numValue < 0) {
                content = '-';
            }

            // 6자리 채우기
            let numLength = tmpValue.length;
            for(var j = 0; j < 6-numLength; j++) {
                content = content + '0';
            }
            content = content + tmpValue;
        }
        else {
            content = tmpValue;
        }

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }
    writeCommandCallback(0, 8, commandList, function(){

    });
}
const getF0_2 = function() {
    log.info('function: getF0_2');

    f0Config.isReadState = true;
    for(var i = 0; i < 9; i++) {
        let command = '';

        // 헤더 정리
        let header = '?F01';
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

ipcMain.on('set_f1_data', (event, data) => {
    log.info('ipcMain.on: set_f1_data');
    setF1(data);
})
ipcMain.on('get_f1_data', (event, arg) => {
    log.info('ipcMain.on: get_f1_data');
    getF1();
})
const setF1 = function(data) {
    log.info('function: setF1');

    f1Config.isReadState = false;
    let commandList = new Array();
    for(var i = 1; i < 8; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'F10';
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        content = tmpValue;

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }
    writeCommandCallback(0, 6, commandList, function(){

    });
}
const getF1 = function() {
    log.info('function: getF1');

    f1Config.isReadState = true;
    for(var i = 1; i < 8; i++) {
        let command = '';

        // 헤더 정리
        let header = '?F10';
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

ipcMain.on('set_f3_data', (event, data) => {
    log.info('ipcMain.on: set_f3_data');
    setF3(data);
})
ipcMain.on('get_f3_data', (event, arg) => {
    log.info('ipcMain.on: get_f3_data');
    getF3();
})
const setF3 = function(data) {
    log.info('function: setF3');

    f3Config.isReadState = false;
    let commandList = new Array();
    for(var i = 1; i < 7; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'F30';
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        content = tmpValue;

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }
    writeCommandCallback(0, 5, commandList, function(){

    });
}
const getF3 = function() {
    log.info('function: getF3');

    f3Config.isReadState = true;
    for(var i = 1; i < 7; i++) {
        let command = '';

        // 헤더 정리
        let header = '?F30';
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

ipcMain.on('set_f4_data', (event, data) => {
    log.info('ipcMain.on: set_f4_data');
    setF4(data);
})
ipcMain.on('get_f4_data', (event, arg) => {
    log.info('ipcMain.on: get_f4_data');
    getF4();
})
const setF4 = function(data) {
    log.info('function: setF4');

    f4Config.isReadState = false;
    let commandList = new Array();
    for(var i = 1; i < 4; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'F40';
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        content = tmpValue;

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }
    writeCommandCallback(0, 2, commandList, function(){

    });
}
const getF4 = function() {
    log.info('function: getF4');

    f4Config.isReadState = true;
    for(var i = 1; i < 4; i++) {
        let command = '';

        // 헤더 정리
        let header = '?F40';
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

ipcMain.on('set_f5_data', (event, data) => {
    log.info('ipcMain.on: set_f5_data');
    setF5(data);
})
ipcMain.on('get_f5_data', (event, arg) => {
    log.info('ipcMain.on: get_f5_data');
    getF5();
})
const setF5 = function(data) {
    log.info('function: setF5');

    f5Config.isReadState = false;
    let commandList = new Array();
    for(var i = 1; i < 5; i++) {
        let command = '';
        let content = '';

        // 헤더 정리
        let header = 'F50';
        header = header + i.toString();

        // 내용 정리
        let tmpValue = data[header].toString();
        content = tmpValue;

        // 최종 커맨드
        command = header + ',' + content + '\r\n';
        commandList.push(command);
    }
    writeCommandCallback(0, 3, commandList, function(){

    });
}
const getF5 = function() {
    log.info('function: getF5');

    f5Config.isReadState = true;
    for(var i = 1; i < 5; i++) {
        let command = '';

        // 헤더 정리
        let header = '?F50';
        header = header + i.toString();

        // 최종 커맨드
        command = header + '\r\n';

        log.info('read command: ' + header);
        sp.write(command, function(err){
            if(err) {
                log.error('read command: ' + header);
                log.error(err);
                return;
            }
        })
    }
}

// 2단 투입 시작
ipcMain.on('start', (event, arg) =>{
    log.info('ipcMain.on: start');
    start();
})
const start = function() {
    log.info('function: start');
    const command = 'SW1' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: SW1');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('stop', (event, arg) =>{
    log.info('ipcMain.on: stop');
    stop();
})
const stop = function() {
    log.info('function: stop');
    const command = 'SW2' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: SW2');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('onoff', (event, arg) =>{
    log.info('ipcMain.on: onoff');
    onoff();
})
const onoff = function() {
    log.info('function: onoff');
    const command = 'SW3' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: SW3');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('grossnet', (event, arg) =>{
    log.info('ipcMain.on: grossnet');
    grossnet();
})
const grossnet = function() {
    log.info('function: grossnet');
    const command = 'SW4' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: SW4');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('zero', (event, arg) =>{
    log.info('ipcMain.on: zero');
    zero();
})
const zero = function() {
    log.info('function: zero');
    const command = 'SW5' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: SW5');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('print', (event, arg) =>{
    log.info('ipcMain.on: print');
    print();
})
const print = function() {
    log.info('function: print');
    const command = 'SW6' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('command: SW6');
            log.error(err);
            return;
        }
    })
}

ipcMain.on('power', (event, arg) => {
    log.info('ipcMain.on: power');
    try {
        // 프로그램 시작
        if(arg == 'ON') {
            startWaitTimer();   // 대기 타이머 시작 - 2초 이상 데이터 수신 안될 경우를 체크하기 위한 타이머
            startProgram(); // 프로그램 시작
            pcConfigGetLocalStorage(event); // 로컬저장소에 저장된 pc config 값 불러오기
        }

        // 프로그램 종료
        else {
            stopWaitTimer();    // 대기 타이머 종료
            stopProgram();  // 프로그램 종료
            closeComparatorKeypad(); // 컴퍼레이터 수정하는 키패드 종료
        }
    }
    catch(e) {
        log.error('error: ipcMain.on / power');
    }
})
let isPause = false;
let timer;

const startWaitTimer = function() {
    log.info('function: startWaitTimer');
    isPause = false;
    timer = setInterval(function() {
        confirmConnection();
    }, CONSTANT['FIVE_HUNDRED_MS']);
}
const stopWaitTimer = function() {
    log.info('function: stopWaitTimer');
    clearInterval(timer);
    isPause = true;
}

const startProgram = function() {
    log.info('function: startProgram');
    sp = openPort();

    log.info('command: START');
    // 201208 start 커맨드
    const command = 'START' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            log.error('error: command START');
            log.error(err);
            return;
        }

        const lineStream = sp.pipe(new Readline({ delimiter: pcConfig.terminator == CONSTANT['CRLF'] ? '\r\n' : '\r' }, { encoding: 'utf-8' }));
        lineStream.on('data', function(rx) {
            readHeader(rx);
            win.webContents.send('rx_data', scale);
            scale.waiting_sec = 0;
        });

        createSocketServer(lineStream);
    });

    changeMainButtonActive(true);
}
const stopProgram = function() {
    log.info('function: stopProgram');
    // scale = new scaleFlag();

    if(sp != undefined) {
        sp.close(function(err){
            socketServer.close();
            setStreamMode();

            if(err) {
                log.error('error: serialport close');
                log.error(err);
                return;
            }
        });
    }

    changeMainButtonActive(false);
}

// 기기 설정값 로컬스토리지 값 가져오기
const pcConfigGetLocalStorage = function(event) {
    log.info('function: pcConfigGetLocalStorage');
    const localStorage = new Store();

    // 아예 저장이 되어있지 않은 경우 디폴트 값으로 세팅
    if(localStorage.get('pc_config') == undefined) {
        if(currentPlatform == 'WINDOWS') {
            localStorage.set('pc_config.port', CONSTANT['DEFAULT_SERIAL_PORT_WINDOW']);
        }
        else {
            localStorage.set('pc_config.port', CONSTANT['DEFAULT_SERIAL_PORT_LINUX']);
        }

        localStorage.set('pc_config.baudrate', 24);
        localStorage.set('pc_config.databits', 8);
        localStorage.set('pc_config.parity', CONSTANT['PARITY_NONE']);
        localStorage.set('pc_config.stopbits', 1);
        localStorage.set('pc_config.terminator', CONSTANT['CRLF']);
        localStorage.set('pc_config.fontcolor', CONSTANT['FONT_COLOR_BLUE']);

        win.webContents.send('set_font_color', CONSTANT['FONT_COLOR_BLUE']);
    }
    // 저장되어있는 값으로 세팅
    else {
        let tmpConfig = localStorage.get('pc_config');
        pcConfig.port = tmpConfig.port;
        pcConfig.baudrate = tmpConfig.baudrate;
        pcConfig.databits = tmpConfig.databits;
        pcConfig.parity = tmpConfig.parity;
        pcConfig.stopbits = tmpConfig.stopbits;
        pcConfig.terminator = tmpConfig.terminator;
        pcConfig.fontcolor = tmpConfig.fontcolor;

        win.webContents.send('set_font_color', tmpConfig.fontcolor);
    }
}

const closeComparatorKeypad = function(){
    win.webContents.send('close_comparator_keypad', '');
}

const createSocketServer = function(ls) {
    // TCP/IP 서버 소켓
    socketServer = net.createServer(function(socket) {
        let isConnected = true;

        log.info('client connect');
        socket.write('Welcome to Socket Server');

        // 계량모듈로부터 받는 시리얼 데이터를 클라이언트로 전송하기
        ls.on('data', function(rx) {
            if(isConnected){
                socket.write(rx + '\r\n');
            }
        });

        // 클라이언트에서 보내는 데이터 처리
        socket.on('data', function(chunk) {
            let message = chunk.toString();
            log.info('client send : ', message);
        });

        // 클라이언트와 연결이 해제되었을때
        socket.on('end', function() {
            log.info('client connection end');
            isConnected = false;
        });

        // 연결 에러 있을 때
        socket.on('error', (err) => {
            log.error('Connection error:', err.message);
        });
    })
    .listen(CONSTANT['SERVER_PORT'], function(){
        log.info('listening on 3100...');
    });
}

app.whenReady().then(createWindow)
