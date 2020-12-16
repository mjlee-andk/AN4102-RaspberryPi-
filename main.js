const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const { WINDOW_WIDTH, WINDOW_HEIGHT, FIVE_HUNDRED_MS, PARITY_NONE, PARITY_ODD, PARITY_EVEN, CRLF, RED, WHITE, BLUE, DEFAULT_SERIAL_PORT_WINDOW, DEFAULT_SERIAL_PORT_LINUX } = require('./util/constant');
const { scaleFlag, uartFlag, basicConfigFlag, externalPrintConfigFlag, calibrationConfigFlag } = require('./util/flag');
const Store = require('electron-store'); // localStorage에 사용

const os = require('os');
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
let serialConfig = new uartFlag();
let basicConfig = new basicConfigFlag();
let externalPrintConfig = new externalPrintConfigFlag();
let calibrationConfig = new calibrationConfigFlag();
let currentPlatform;

const createWindow = function() {
    // 브라우저 창을 생성합니다.
    win = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        fullscreen: false
        // fullscreen: true
    })
    win.loadFile('index.html');
    // win.webContents.openDevTools();

    win.webContents.on('did-finish-load', () => {
        pcConfigGetLocalStorage();
    })

    currentPlatform = platformsNames[os.platform()];

    console.log(currentPlatform);
}

const openConfigWindow = function() {
    // 브라우저 창을 생성합니다.
    configWin = new BrowserWindow({
        parent: win,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        // fullscreen: true
        fullscreen: false
    })


    configWin.loadFile('view/config.html');
    // configWin.webContents.openDevTools();

    configWin.webContents.on('did-finish-load', () => {
        setTimeout(function() {
            getSerialConfig();
            getRomVer();
        }, FIVE_HUNDRED_MS);
    })
}

const openPCConfigWindow = function() {
    // 브라우저 창을 생성합니다.
    pcConfigWin = new BrowserWindow({
        parent: win,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false,
        // fullscreen: true
        fullscreen: false
    })

    pcConfigWin.loadFile('view/pcconfig.html');
    // pcConfigWin.webContents.openDevTools();

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

const pcConfigGetLocalStorage = function(event) {
    const localStorage = new Store();
    if(localStorage.get('pc_config') == undefined) {
        if(currentPlatform == 'WINDOWS') {
            localStorage.set('pc_config.port', DEFAULT_SERIAL_PORT_WINDOW);
        }
        else {
            localStorage.set('pc_config.port', DEFAULT_SERIAL_PORT_LINUX);
        }

        localStorage.set('pc_config.baudrate', 24);
        localStorage.set('pc_config.databits', 8);
        localStorage.set('pc_config.parity', PARITY_NONE);
        localStorage.set('pc_config.stopbits', 1);
        localStorage.set('pc_config.terminator', CRLF);
        localStorage.set('pc_config.fontcolor', BLUE);

        win.webContents.send('set_font_color', BLUE);
    }
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

const setStreamMode = function() {
    console.log('set stream mode');
    // 201204 AD모듈 붙이면서 스트림 모드 명령어 F205,1로 변경됨
    const command = 'F206,1' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message);
            return;
        }
    });
}

const setCommandMode = function() {
    console.log('set command mode');
    // 201204 AD모듈 붙이면서 커맨드 모드 명령어 F205,2로 변경됨
    const command = 'F206,2' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message);
            return;
        }
        openConfigWindow();
    });
}

const rssetCommand = function() {
    let command = 'RSSET' + '\r\n';

    scale.f = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            serialConfig = new uartFlag();
            configWin.webContents.send('set_serial_config_data', 'fail');
            return;
        }
    })
}

const commandOk = function() {
    let command = 'OK' + '\r\n';
    scale.comparator = false;
    scale.comparator_mode = 0;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
    })
}

ipcMain.on('set_comp_value', (event, data) => {
    console.log('set comparator value');
    console.log(data);
    console.log(data['flag']);
    console.log(data['value']);

    // 커맨드 모드로 진입
    let command = 'F206,2' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message);
            return;
        }

        // 변경하려는 컴퍼레이터 값 변경
        command = '' + '\r\n';
        sp.write(command, function(err){
            if(err) {
                console.log(err.message)
                return;
            }

            // 변경 완료 후 스트림 모드로 진입
            command = 'F206,1' + '\r\n';
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }
            })
        })
    });
})

ipcMain.on('commandOk', (event, arg) => {
    console.log('command ok');
})

const readHeader = function(rx) {
    // TODO trim을 하는게 맞는건지 판단 필요
    // rx = rx.trim();

    // TODO console 지우기
    // console.log(rx);
    const header1bit = rx.substr(0, 1);
    const header2bit = rx.substr(0, 2);
    const header3bit = rx.substr(0, 3);
    const header4bit = rx.substr(0, 4);
    const header5bit = rx.substr(0, 5);
    const header7bit = rx.substr(0, 7);

    if(header5bit == 'INFOK' || header5bit == 'INCOK') {
        // 초기화 된 설정값으로 변경 후 재연결
        const currentPort = pcConfig.port;
        pcConfig = new uartFlag(currentPort, 24, 8, PARITY_NONE, 1, CRLF);
        const localStorage = new Store();

        localStorage.set('pc_config.baudrate', 24);
        localStorage.set('pc_config.databits', 8);
        localStorage.set('pc_config.parity', PARITY_NONE);
        localStorage.set('pc_config.stopbits', 1);
        localStorage.set('pc_config.terminator', CRLF);
        localStorage.set('pc_config.fontcolor', BLUE);

        sp.close(function(err){
            if(err) {
                console.log(err.message)
                return;
            }
            configWin.webContents.send('init_finish', 'ok');
            startProgram();
        });
        return;
    }

    // 버전 확인
    if(header3bit == 'VER') {
        const data = Number(rx.substr(4,3))/100;
        configWin.webContents.send('get_rom_ver', data);

        return;
    }

    // 컴퍼레이터 모드 진입
    if(header3bit == 'COM') {
        console.log('comparator mode')
        scale.comparator = true;
        scale.comparator_mode = Number(rx.substr(4,2));

        // 컴퍼레이터 모드별 분류
        if(scale.comparator_mode == 1) {
            scale.s1_title = 'fi';
            scale.s2_title = 'fr';
            scale.s3_title = 'pl';
            scale.s4_title = 'ov';
            scale.s5_title = 'ud';
        }
    }

    if(scale.comparator) {
        // 데이터 소수점 포맷 체크
        const data = rx.substr(6,7);
        let value = '';
        value = Number(data).toString();

        const pointPos = data.indexOf('.');
        if(pointPos > 0) {
            value = Number(data).toFixed(6-pointPos).toString();
        }


        if(header4bit == 'RDS1') {
            scale.s1_value = value;
        }
        if(header4bit == 'RDS2') {
            scale.s2_value = value;
        }
        if(header4bit == 'RDS3') {
            scale.s3_value = value;
        }
        if(header4bit == 'RDS4') {
            scale.s4_value = value;
        }
        if(header4bit == 'RDS5') {
            scale.s5_value = value;
            setTimeout(function(){
                commandOk();
            }, FIVE_HUNDRED_MS);
        }
    }

    // CF 펑션
    if(scale.cf &&
        (header1bit == '?') ||
        (header1bit == 'I') ||
        (header2bit == 'CF') ||
        (header7bit == 'CALZERO') ||
        (header7bit == 'CALSPAN'))
    {
        scale.cf = false;
        console.log('scale cf');

        if(header2bit == 'CF') {
            const data = Number(rx.substr(5,7));
            if(basicConfig.isRead) {
                // 기본설정(우)
                if(header4bit == 'CF05') {
                    basicConfig.zeroRange = data;
                }

                if(header4bit == 'CF06') {
                    basicConfig.zeroTrackingTime = data;
                }

                if(header4bit == 'CF07') {
                    basicConfig.zeroTrackingWidth = data;
                }

                if(header4bit == 'CF08') {
                    basicConfig.powerOnZero = data;
                    configWin.webContents.send('get_basic_right_config_data', basicConfig);
                }
            }
            else {
                if(header4bit == 'CF08') {
                    configWin.webContents.send('set_basic_right_config_data', 'ok');
                    basicConfig.isRead = false;
                }
            }

            if(calibrationConfig.isRead) {
                // 교정 설정값
                if(header4bit == 'CF03') {
                    calibrationConfig.capa = data;
                }

                if(header4bit == 'CF02') {
                    calibrationConfig.div = data;
                }

                if(header4bit == 'CF01') {
                    calibrationConfig.decimalPoint = data;
                }

                if(header4bit == 'CF09') {
                    calibrationConfig.unit = data;
                    configWin.webContents.send('get_calibration_config_data', calibrationConfig);
                }
                // 교정
                if(header4bit == 'CF04') {
                    calibrationConfig.spanValue = data;
                    configWin.webContents.send('get_cal_data', calibrationConfig);
                }
            }
            else {
                if(header4bit == 'CF09') {
                    configWin.webContents.send('set_calibration_config_data', 'ok');
                    calibrationConfig.isRead = false;
                }
            }
        }

        if(header7bit == 'CALZERO') {
            configWin.webContents.send('set_cal_zero', 'ok');
            return;
        }

        if(header7bit == 'CALSPAN') {
            configWin.webContents.send('set_cal_span', 'ok');
            return;
        }
    }
    // F 펑션
    else if (scale.f &&
        (header1bit == '?') ||
        (header1bit == 'I') ||
        (header1bit == 'F') ||
        (header3bit == 'VER') ||
        (header5bit == 'STOOK') ||
        (header5bit == 'SETOK'))
    {
        scale.f = false;
        console.log('scale f');

        if(header5bit == 'STOOK') {
            console.log('STOOK');
            rssetCommand();
        }

        if(header5bit == 'SETOK') {
            console.log('SETOK');

            const localStorage = new Store();

            localStorage.set('pc_config.baudrate', serialConfig.baudrate);
            localStorage.set('pc_config.databits', serialConfig.databits);
            localStorage.set('pc_config.parity', serialConfig.parity);
            localStorage.set('pc_config.stopbits', serialConfig.stopbits);
            localStorage.set('pc_config.terminator', serialConfig.terminator);

            pcConfig.baudrate = serialConfig.baudrate;
            pcConfig.databits = serialConfig.databits;
            pcConfig.parity = serialConfig.parity;
            pcConfig.stopbits = serialConfig.stopbits;
            pcConfig.terminator = serialConfig.terminator;

            configWin.webContents.send('set_serial_config_data', 'ok');

            try {
                sp.close(function(err){
                    if(err) {
                        console.log(err.message)
                        return;
                    }
                    console.log('closed');
                    startProgram();
                });
            }
            catch(e) {
                console.log(e);
                console.log('Cannot open port.');
            }
        }

        if(header1bit == 'F') {
            const data = Number(rx.substr(5,7));
            if(basicConfig.isRead) {
                if(header4bit == 'F001') {
                    basicConfig.digitalFilter = data;
                }

                if(header4bit == 'F002') {
                    basicConfig.holdMode = data;
                }

                if(header4bit == 'F003') {
                    basicConfig.averageTime = data;
                    configWin.webContents.send('get_basic_left_config_data', basicConfig);
                }
            }
            else {
                if(header4bit == 'F003') {
                    configWin.webContents.send('set_basic_left_config_data', 'ok');
                    basicConfig.isRead = false;
                }
            }

            if(externalPrintConfig.isRead){
                if(header4bit == 'F101') {
                    externalPrintConfig.printCondition = data;
                }

                if(header4bit == 'F102') {
                    externalPrintConfig.configValue = data;
                }

                if(header4bit == 'F103') {
                    externalPrintConfig.comparatorMode = data;
                }

                if(header4bit == 'F104') {
                    externalPrintConfig.nearZero = data;
                    configWin.webContents.send('get_external_print_config_data', externalPrintConfig);
                }
            }
            else {
                if(header4bit == 'F104') {
                    configWin.webContents.send('set_external_print_config_data', 'ok');
                    externalPrintConfig.isRead = false;
                }
            }

            if(header4bit == 'F201') {
                console.log('success F201');

                serialConfig.baudrate = pcConfig.baudrate;
                serialConfig.databits = Number(pcConfig.databits);
                serialConfig.parity = pcConfig.parity;
                serialConfig.stopbits = Number(pcConfig.stopbits);
                serialConfig.terminator = pcConfig.terminator == CRLF ? 1 : 2;
                configWin.webContents.send('get_serial_config_data', serialConfig);
            }

            if(header4bit == 'F202') {
                console.log('success F202');
                serialConfig.databits = data;
            }

            if(header4bit == 'F203') {
                console.log('success F203');
                serialConfig.parity = data;
            }

            if(header4bit == 'F204') {
                console.log('success F204');
                serialConfig.stopbits = data;
            }

            if(header4bit == 'F205') {
                console.log('success F205');
                serialConfig.terminator = data;
                console.log(serialConfig);
            }
        }
    }
    // 스트림 데이터
    else {
        if(rx.length < 16) {
            return;
        }

        const state = rx.substr(3, 2);
        if (header2bit == 'ST') {
            scale.isStable = true;
            scale.isHold = false;
            scale.isHg = false;
            scale.isNet = false;
            if(state == 'NT') {
                scale.isNet = true;
            }
            scale.displayMsg = makeFormat(rx);
        }

        else if (header2bit == 'US') {
            scale.isStable = false;
            scale.isHold = false;
            scale.isHg = false;
            scale.isNet = false;
            if(state == 'NT') {
                scale.isNet = true;
            }
            scale.displayMsg = makeFormat(rx);
        }

        else if (header2bit == 'HD') {
            scale.isStable = false;
            scale.isHold = true;
            scale.isHg = false;
            scale.isNet = false;
            scale.displayMsg = makeFormat(rx);
        }

        else if (header2bit == 'HG') {
            scale.isStable = false;
            scale.isHold = true;
            scale.isHg = true;
            scale.isNet = false;
            scale.displayMsg = makeFormat(rx);
        }

        else if (header2bit == 'OL') {
            scale.isStable = false;
            scale.isHold = false;
            scale.isHg = false;
            scale.isNet = false;
            scale.displayMsg = '   .  ';
        }

        else {
            scale.isStable = false;
            scale.isHold = false;
            scale.isHg = false;
            scale.isNet = false;
            scale.isZero = false;
            scale.block = true;
            rx = '';
        }
        rx = '';
    }
}

const makeFormat = function(data) {
    let result = '';
    if(data == '' || data == undefined){
        return result;
    }

    const value = data.substr(6,8);
    const unit = data.substr(14,2).trim();

    result = Number(value).toString();

    const pointPos = value.indexOf('.');
    if(pointPos > 0) {
        result = Number(value).toFixed(7-pointPos).toString();
    }

    scale.isZero = false;
    if(result.substr(0,1).includes('0')) {
        scale.isZero = true;
    }

    scale.unit = unit.length;
    if(unit.length == 1) {
        if(unit == 'g') {
            scale.unit = 1;
        }
        else {
            scale.unit = 3;
        }
    }

    return result;
}

const getRomVer = function() {
    console.log('get_device_rom_ver');
    let command = '?VER' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message);
            return;
        }
    });
}

const setSerialConfig = function(data) {
    console.log('set_serial_config');

    let arg = '';
    if(data.baudrate.length == 2) {
        arg += '0' + data.baudrate;
    }
    else {
        arg += data.baudrate;
    }

    arg = arg + data.databits + data.parity + data.stopbits + data.terminator;

    console.log('set_device_serial_data');
    let command = 'RSSTO,' + arg + '\r\n';
    scale.f = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            serialConfig = new uartFlag();
            configWin.webContents.send('set_serial_config_data', 'fail');
            return;
        }
    })
}

const getSerialConfig = function() {
    console.log('get_serial_config');

    console.log('get_device_baudrate');
    let command = '?F201' + '\r\n';
    scale.f = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message);
            serialConfig = new uartFlag();
            return;
        }
        console.log('get_device_databits');
        command = '?F202' + '\r\n';
        scale.f = true;
        sp.write(command, function(err){
            if(err) {
                console.log(err.message)
                serialConfig = new uartFlag();
                return;
            }
            console.log('get_device_parity');
            command = '?F203' + '\r\n';
            scale.f = true;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    serialConfig = new uartFlag();
                    return;
                }
                console.log('get_device_stopbits');
                command = '?F204' + '\r\n';
                scale.f = true;
                sp.write(command, function(err){
                    if(err) {
                        console.log(err.message)
                        serialConfig = new uartFlag();
                        return;
                    }
                    console.log('get_device_terminator');
                    command = '?F205' + '\r\n';
                    scale.f = true;
                    sp.write(command, function(err){
                        if(err) {
                            console.log(err.message)
                            serialConfig = new uartFlag();
                            return;
                        }
                    })
                })
            })
        })
    })
}

const setBasicLeftConfig = function(data) {
    console.log('set_basic_left_config');

    console.log('set_device_digital_filter');
    let command = 'F001,' + data.digitalFilter.toString() + '\r\n';
    scale.f = true;
    basicConfig.isRead = false;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }

        setTimeout(function(){
            console.log('set_device_hold_mode');
            command = 'F002,' + data.holdMode.toString() + '\r\n';
            scale.f = true;
            basicConfig.isRead = false;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }

                setTimeout(function(){
                    console.log('set_device_average_time');
                    command = 'F003,' + data.averageTime.toString() + '\r\n';
                    scale.f = true;
                    basicConfig.isRead = false;
                    sp.write(command, function(err){
                        if(err) {
                            console.log(err.message)
                            return;
                        }
                    })
                }, FIVE_HUNDRED_MS);
            })
        }, FIVE_HUNDRED_MS);
    })
}

const getBasicLeftConfig = function() {
    console.log('get_basic_left_config');

    console.log('get_device_digital_filter');
    let command = '?F001' + '\r\n';
    scale.f = true;
    basicConfig.isRead = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
        console.log('get_device_hold_mode');
        command = '?F002' + '\r\n';
        scale.f = true;
        basicConfig.isRead = true;
        sp.write(command, function(err){
            if(err) {
                console.log(err.message)
                return;
            }
            console.log('get_device_average_time');
            command = '?F003' + '\r\n';
            scale.f = true;
            basicConfig.isRead = true;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }
            })
        })
    })
}

const setBasicRightConfig = function(data) {
    console.log('set_basic_right_config');

    console.log('set_device_zero_range');
    let command = 'CF05,' + data.zeroRange + '\r\n';
    scale.cf = true;
    basicConfig.isRead = false;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }

        setTimeout(function(){
            console.log('set_device_zero_tracking_time');
            command = 'CF06,' + data.zeroTrackingTime + '\r\n';
            scale.cf = true;
            basicConfig.isRead = false;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }

                setTimeout(function(){
                    console.log('set_device_zero_tracking_width');
                    command = 'CF07,' + data.zeroTrackingWidth + '\r\n';
                    scale.cf = true;
                    basicConfig.isRead = false;
                    sp.write(command, function(err){
                        if(err) {
                            console.log(err.message)
                            return;
                        }

                        setTimeout(function(){
                            console.log('set_device_power_on_zero');
                            command = 'CF08,' + data.powerOnZero + '\r\n';
                            scale.cf = true;
                            basicConfig.isRead = false;
                            sp.write(command, function(err){
                                if(err) {
                                    console.log(err.message)
                                    return;
                                }
                            })
                        }, FIVE_HUNDRED_MS);
                    })
                }, FIVE_HUNDRED_MS);
            })
        }, FIVE_HUNDRED_MS);
    })
}

const getBasicRightConfig = function() {
    console.log('get_basic_right_config');

    console.log('get_device_zero_range');
    let command = '?CF05' + '\r\n';
    scale.cf = true;
    basicConfig.isRead = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
        console.log('get_device_zero_tracking_time');
        command = '?CF06' + '\r\n';
        scale.cf = true;
        basicConfig.isRead = true;
        sp.write(command, function(err){
            if(err) {
                console.log(err.message)
                return;
            }
            console.log('get_device_zero_tracking_width');
            command = '?CF07' + '\r\n';
            scale.cf = true;
            basicConfig.isRead = true;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }

                console.log('get_device_power_on_zero');
                command = '?CF08' + '\r\n';
                scale.cf = true;
                basicConfig.isRead = true;
                sp.write(command, function(err){
                    if(err) {
                        console.log(err.message)
                        return;
                    }
                })
            })
        })
    })
}

const setExternalPrintConfig = function(data) {
    console.log('set_external_print_config');

    console.log('set_device_print_condition');
    let command = 'F101,' + data.printCondition + '\r\n';
    scale.f = true;
    externalPrintConfig.isRead = false;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
        setTimeout(function(){
            console.log('set_device_config_value');
            command = 'F102,' + data.configValue + '\r\n';
            scale.f = true;
            externalPrintConfig.isRead = false;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }
                setTimeout(function(){
                    console.log('set_device_comparator_mode');
                    command = 'F103,' + data.comparatorMode + '\r\n';
                    scale.f = true;
                    externalPrintConfig.isRead = false;
                    sp.write(command, function(err){
                        if(err) {
                            console.log(err.message)
                            return;
                        }
                        setTimeout(function(){
                            console.log('set_device_near_zero');
                            command = 'F104,' + data.nearZero + '\r\n';
                            scale.f = true;
                            externalPrintConfig.isRead = false;
                            sp.write(command, function(err){
                                if(err) {
                                    console.log(err.message)
                                    return;
                                }
                            })
                        }, FIVE_HUNDRED_MS)
                    })
                }, FIVE_HUNDRED_MS)
            })
        }, FIVE_HUNDRED_MS)
    })
}

const getExternalPrintConfig = function() {
    console.log('get_external_print_config');

    console.log('get_device_print_condition');
    let command = '?F101' + '\r\n';
    scale.f = true;
    externalPrintConfig.isRead = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
        console.log('get_device_config_value');
        command = '?F102' + '\r\n';
        scale.f = true;
        externalPrintConfig.isRead = true;
        sp.write(command, function(err){
            if(err) {
                console.log(err.message)
                return;
            }
            console.log('get_device_comparator_mode');
            command = '?F103' + '\r\n';
            scale.f = true;
            externalPrintConfig.isRead = true;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }
                console.log('get_device_near_zero');
                command = '?F104' + '\r\n';
                scale.f = true;
                externalPrintConfig.isRead = true;
                sp.write(command, function(err){
                    if(err) {
                        console.log(err.message)
                        return;
                    }
                })
            })
        })
    })
}

const setCalibrationConfig = function(data) {
    console.log('set_calibration_config');

    console.log('set_device_capa');
    let command = 'CF03,' + data.capa + '\r\n';
    scale.cf = true;
    calibrationConfig.isRead = false;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
        setTimeout(function(){
            console.log('set_device_div');
            command = 'CF02,' + data.div + '\r\n';
            scale.cf = true;
            calibrationConfig.isRead = false;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }
                setTimeout(function(){
                    console.log('set_device_decimal_point');
                    command = 'CF01,' + data.decimalPoint + '\r\n';
                    scale.cf = true;
                    calibrationConfig.isRead = false;
                    sp.write(command, function(err){
                        if(err) {
                            console.log(err.message)
                            return;
                        }
                        setTimeout(function(){
                            console.log('set_device_unit');
                            command = 'CF09,' + data.unit + '\r\n';
                            scale.cf = true;
                            calibrationConfig.isRead = false;
                            sp.write(command, function(err){
                                if(err) {
                                    console.log(err.message)
                                    return;
                                }
                            })
                        }, FIVE_HUNDRED_MS)
                    })
                }, FIVE_HUNDRED_MS)
            })
        }, FIVE_HUNDRED_MS)
    })
}

const getCalibrationConfig = function() {
    console.log('get_calibration_config');

    console.log('get_device_capa');
    let command = '?CF03' + '\r\n';
    scale.cf = true;
    calibrationConfig.isRead = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
        console.log('get_device_div');
        command = '?CF02' + '\r\n';
        scale.cf = true;
        calibrationConfig.isRead = true;
        sp.write(command, function(err){
            if(err) {
                console.log(err.message)
                return;
            }
            console.log('get_device_decimal_point');
            command = '?CF01' + '\r\n';
            scale.cf = true;
            calibrationConfig.isRead = true;
            sp.write(command, function(err){
                if(err) {
                    console.log(err.message)
                    return;
                }

                console.log('get_device_unit');
                command = '?CF09' + '\r\n';
                scale.cf = true;
                calibrationConfig.isRead = true;
                sp.write(command, function(err){
                    if(err) {
                        console.log(err.message)
                        return;
                    }
                })
            })
        })
    })
}

const setCalZero = function() {
    console.log('set_cal_zero');

    console.log('set_device_cal_zero');
    let command = 'CALZERO' + '\r\n';
    scale.cf = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            configWin.webContents.send('set_cal_zero', 'fail');
            return;
        }
    });
}

const setCalSpan = function() {
    console.log('set_cal_span');

    console.log('set_device_cal_span');
    let command = 'CALSPAN' + '\r\n';
    scale.cf = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            configWin.webContents.send('set_cal_span', 'fail');
            return;
        }
    });
}

const setSpanValue = function(data) {
    console.log('set_span_value');

    let command = 'CF04,' + data + '\r\n';
    scale.cf = true;
    calibrationConfig.isRead = false;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
    })
}

const getCal = function() {
    console.log('get_cal');

    console.log('get_device_span_value');
    let command = '?CF04' + '\r\n';
    scale.cf = true;
    calibrationConfig.isRead = true;
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
    })
}

const initFunctionF = function() {
    let command = 'INF' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
    });
}

const initConfig = function() {
    let command = 'INC' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
    });
}

const openPort = function() {
    try {
        let parity = 'none';
        if(pcConfig.parity == PARITY_ODD) {
            parity = 'odd';
        }
        else if(pcConfig.parity == PARITY_EVEN) {
            parity = 'even';
        }
        console.log(pcConfig);
        sp = new SerialPort(pcConfig.port, {
            baudRate: pcConfig.baudrate * 100,
            dataBits: Number(pcConfig.databits),
            parity: parity,
            stopBits: Number(pcConfig.stopbits)
        });

        return sp;
    }
    catch(e) {
        console.log(e);
        console.log('Cannot open port.');
    }
};

const changeMainButtonActive = function(isActive) {
    win.webContents.send('main_button_active', isActive);
}

let isPause = false;
let timer;

const confirmConnection = function() {
    if(isPause) {
        return;
    }
    scale.waiting_sec++;
    if(scale.waiting_sec > 1) {
        scale.displayMsg = '-----';
        scale.unit = 0;
        scale.isStable = false;
        scale.isHold = false;
        scale.isZero = false;
        scale.isNet = false;
        scale.isHg = false;
        changeMainButtonActive(false);
        win.webContents.send('rx_data', scale);
    }
}

const startWaitTimer = function() {
    isPause = false;
    timer = setInterval(function() {
        confirmConnection();
    }, 500);
}

const stopWaitTimer = function() {
    clearInterval(timer);
    isPause = true;
}

ipcMain.on('open_pc_config_window', (event, arg) => {
    console.log('open_pc_config_window');
    openPCConfigWindow();
})

ipcMain.on('window_close', (event, arg) => {
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

ipcMain.on('open_config_window', (event, arg) => {
    console.log('open_config_window');
    setCommandMode();
})

ipcMain.on('pc_config_set_data', (event, data) => {
    console.log('pc_config_set_data');
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

ipcMain.on('set_serial_config_data', (event, data) => {
    console.log('set_serial_config_data');

    serialConfig = data;
    setSerialConfig(data);
})

ipcMain.on('set_basic_left_config_data', (event, data) => {
    console.log('set_basic_left_config_data');

    setBasicLeftConfig(data);
})

ipcMain.on('set_basic_right_config_data', (event, data) => {
    console.log('set_basic_right_config_data');

    setBasicRightConfig(data);
})

ipcMain.on('set_external_print_config_data', (event, data) => {
    console.log('set_external_print_config_data');

    setExternalPrintConfig(data);
})

ipcMain.on('set_calibration_config_data', (event, data) => {
    console.log('set_calibration_config_data');

    setCalibrationConfig(data);
})

ipcMain.on('set_cal_zero', (event, data) => {
    console.log('set_cal_zero');

    setCalZero();
})

ipcMain.on('set_cal_span', (event, data) => {
    console.log('set_cal_span');

    setCalSpan();
})

ipcMain.on('set_span_value_data', (event, data) => {
    console.log('set_span_value_data');
    setSpanValue(data);
})

ipcMain.on('set_stream_mode', (event, data) => {
    console.log('set_stream_mode');
    if(sp == undefined) {
        return;
    }
    setStreamMode();
})

ipcMain.on('get_serial_config_data', (event, arg) => {
    getSerialConfig();
})

ipcMain.on('get_basic_left_config_data', (event, arg) => {
    getBasicLeftConfig();
})

ipcMain.on('get_basic_right_config_data', (event, arg) => {
    getBasicRightConfig();
})

ipcMain.on('get_external_print_config_data', (event, arg) => {
    getExternalPrintConfig();
})

ipcMain.on('get_calibration_config_data', (event, arg) => {
    getCalibrationConfig();
})

ipcMain.on('get_cal_data', (event, arg) => {
    getCal();
});

ipcMain.on('init_function_f', (event, arg) => {
    console.log('init_function_f');
    initFunctionF();
})

ipcMain.on('init_config', (event, arg) => {
    console.log('init_config');
    initConfig();
})

ipcMain.on('set_clear_tare', (event, arg) =>{
    console.log('set_clear_tare');
    setClearTare();
})

ipcMain.on('set_zero_tare', (event, arg) =>{
    console.log('set_zero_tare');
    setZeroTare();
})

ipcMain.on('set_gross_net', (event, arg) =>{
    console.log('set_gross_net');
    setGrossNet();
})

ipcMain.on('set_hold', (event, arg) =>{
    console.log('set_hold');
    setHold();
})

let setClearTare = function() {
    const command = 'CT' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return;
        }
    })
}

let setZeroTare = function() {
    const command = 'MZT' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return
        }
    })
}

let setGrossNet = function() {
    let command = 'MN' + '\r\n';

    if(scale.isNet) {
        command = 'MG' + '\r\n';
    }
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return
        }
    })
}

let setHold = function() {
    let command = 'HS' + '\r\n';

    if(scale.isHold) {
        command = 'HC' + '\r\n';
    }
    sp.write(command, function(err){
        if(err) {
            console.log(err.message)
            return
        }
    })
}

ipcMain.on('print', (event, arg) => {
    console.log('print');
    // TODO 프린트 기능 추가 필요
    dialog.showMessageBox({type: 'info', title: '프린트', message: '준비중입니다.'});
    return;
})

ipcMain.on('on_off', (event, arg) => {
    console.log('on_off');
    try {
        let isOpen = false;

        // 프로그램 시작
        if(arg == 'ON') {
            startWaitTimer();
            pcConfigGetLocalStorage(event);
            startProgram();
        }

        // 프로그램 종료
        else {
            stopWaitTimer();
            stopProgram();
        }
    }
    catch(e) {
        console.log(e);
    }
})

let net = require('net');
let testfunc = function(ls) {
    let server = net.createServer(function(socket) {
        // connection event
        console.log('client connect');
        socket.write('Welcome to Socket Server');
        // ls.on('data', function(rx) {
        //     readHeader(rx);
        //     socket.write(rx + '\r\n');
        //     win.webContents.send('rx_data', scale);
        //     // console.log(rx);
        //     scale.waiting_sec = 0;
        //     // isOpen = true;
        //     changeMainButtonActive(true);
        // });

        socket.on('data', function(chunk) {
            let message = chunk.toString();
            console.log('client send : ', message);
            if(message == 'MZT\r\n') {
                setZeroTare();
            }
        });

        socket.on('end', function() {
            console.log('client connection closed');
        });
    });

    return server;
}

let server2;


const startProgram = function() {
    sp = openPort();

    console.log('command start');
    // 201208 start 커맨드
    const command = 'START' + '\r\n';
    sp.write(command, function(err){
        if(err) {
            console.log(err.message);
            return;
        }
        const lineStream = sp.pipe(new Readline({ delimiter: pcConfig.terminator == CRLF ? '\r\n' : '\r' }));
        lineStream.on('data', function(rx) {
            readHeader(rx);
            win.webContents.send('rx_data', scale);
            // console.log(rx);
            scale.waiting_sec = 0;
            isOpen = true;
            changeMainButtonActive(isOpen);
        });
    });

    // server2 = testfunc(lineStream);
    //
    // server2.on('listening', function() {
    //     console.log('Server is listening');
    // });
    //
    // server2.on('close', function() {
    //     console.log('Server closed');
    // });
    //
    // server2.listen(3100);
}

const stopProgram = function() {
    scale = new scaleFlag();

    if(sp != undefined) {
        sp.close(function(err){
            setStreamMode();
            // server2.close();
            if(err) {
                console.log(err.message);
                return;
            }
            console.log('closed');
        });
    }

    changeMainButtonActive(false);
}

app.whenReady().then(createWindow)
