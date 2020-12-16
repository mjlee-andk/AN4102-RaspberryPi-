class scaleFlag {
    constructor() {
        // 상태 표시
        this.isStable = false;
        this.isZero = false;
        this.isNet = false;
        this.isHold = false;
        this.isHg = false;

        // 표시 데이터
        this.displayMsg = '888888';

        this.f = false;
        this.cf = false;
        this.array_index_f = 0;
        this.array_index_cf = 0;
        this.read = false;
        this.write = false;
        this.hi = 0;
        this.lo = 0;
        this.terminator = 'CRLF';  // CRLF
        this.block = false;
        // 컴퍼레이터
        this.comparator = false;
        this.comparator_mode = 0;

        // 컴퍼레이터 설정값
        this.s1_title = '';
        this.s1_value = '';
        this.s2_title = '';
        this.s2_value = '';
        this.s3_title = '';
        this.s3_value = '';
        this.s4_title = '';
        this.s4_value = '';
        this.s5_title = '';
        this.s5_value = '';

        // 단위 표시
        this.unit = 0;

        // 스팬 적용
        this.do_span = false;

        // init F 모드
        this.mode_init_f = false;

        // init All 모드
        this.mode_init_a = false;

        // init 응답 플래그
        this.init_f = false;

        // 100ms 카운터
        this.cnt_100ms = 0;

        // 초기화 루틴 진입
        this.do_init = false;

        // 대기 시간
        this.waiting_sec = 0;
    }
}

class uartFlag {
    constructor(port, baudrate, databits, parity, stopbits, terminator, fontcolor) {
        this.port = port;
        this.baudrate = baudrate;
        this.databits = databits;
        this.parity = parity;
        this.stopbits = stopbits;
        this.terminator = terminator;
        this.fontcolor = fontcolor;
    }
}

class basicConfigFlag {
    constructor() {
        // 커맨드로 정보 읽어오는건지 아닌지 확인
        this.isRead = true;

        // 기본설정 좌
        this.digitalFilter = 0; // 디지털 필터
        this.holdMode = 0; // 홀드모드
        this.averageTime = 0; // 평균화시간
        // 기본설정 우
        this.zeroRange = 2; // 제로범위
        this.zeroTrackingTime = 0; // 영점트래킹시간
        this.zeroTrackingWidth = 0; // 영점트래킹폭
        this.powerOnZero = 0; // 파워온제로
    }
}

class externalPrintConfigFlag {
    constructor() {
        this.isRead = true;

        this.printCondition = 0;
        this.configValue = 0;
        this.comparatorMode = 2;
        this.nearZero = 0;
    }
}

class calibrationConfigFlag {
    constructor() {
        this.isRead = true;

        this.capa = 10000; // 최대용량
        this.div = 1; // 최소눈금
        this.decimalPoint = 0; // 소수점 위치
        this.unit = 2; // 단위
        this.spanValue = 10000; //  스팬의 입력 전압에 관한 표시값
    }
}

module.exports = {
    scaleFlag: scaleFlag,
    uartFlag: uartFlag,
    basicConfigFlag: basicConfigFlag,
    externalPrintConfigFlag: externalPrintConfigFlag,
    calibrationConfigFlag: calibrationConfigFlag
}
