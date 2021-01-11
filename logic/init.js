const { ipcRenderer, remote } = require('electron');
const log = require('electron-log'); // 로그 기록

// 초기화
const initFunctionFButton = document.getElementById("initFunctionFButton");
const initConfigButton = document.getElementById("initConfigButton");

initFunctionFButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: 'F펑션 초기화',
            message: 'F펑션 초기화를 진행하시겠습니까?',
            buttons: ['ok', 'cancel']
        }).then(result => {
            const response = result.response;
            if(response == 0) {
                ipcRenderer.send('init_function_f', 'ok');
            }

        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
})

initConfigButton.addEventListener('click', function(){
    remote.dialog
        .showMessageBox({
            type: 'info',
            title: '설정 초기화',
            message: '설정 초기화를 진행하시겠습니까?',
            buttons: ['ok', 'cancel']
        }).then(result => {
            const response = result.response;
            if(response == 0) {
                ipcRenderer.send('init_config', 'ok');
            }
        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
})

ipcRenderer.on('init_finish', (event, arg) => {
    log.info('ipcRenderer.on: init_finish');

    remote.dialog
        .showMessageBox({
            type: 'info',
            title: '초기화 완료',
            message: '초기화가 완료 되었습니다. 확인을 누르시면 첫 화면으로 돌아갑니다.',
            buttons: ['ok']
        }).then(result => {
            const window = remote.getCurrentWindow();
            window.close();
        }).catch(err => {
            log.error('dialog error');
            log.error(err);
        });
});
