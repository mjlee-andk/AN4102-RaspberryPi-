const { ipcRenderer } = require('electron')
const remote = require('electron').remote;

// 초기화
let initFunctionFButton = document.getElementById("initFunctionFButton");
let initConfigButton = document.getElementById("initConfigButton");

initFunctionFButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: 'F펑션 초기화',
      message: 'F펑션 초기화를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);

      let response = result.response;
      if(response == 0) {
        ipcRenderer.send('init_function_f', 'ok');
      }

    }).catch(err => {
      console.log(err);
    });
})

initConfigButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: '설정 초기화',
      message: '설정 초기화를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);

      let response = result.response;
      if(response == 0) {
        ipcRenderer.send('init_config', 'ok');
      }
    }).catch(err => {
      console.log(err);
    });
})

ipcRenderer.on('init_finish', (event, arg) => {
  console.log('init_finish');

  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: '초기화 완료',
      message: '초기화가 완료 되었습니다. 확인을 누르시면 첫 화면으로 돌아갑니다.',
      buttons: ['ok']
    }).then(result => {

      let window = remote.getCurrentWindow();
      window.close();
    }).catch(err => {
      console.log(err);
    });
});
