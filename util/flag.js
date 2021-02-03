class scaleFlag {
    constructor() {
        // 상태 표시
        this.isStable = false;
        this.isZero = false;
        this.isNet = false;
        this.isHold = false;
        this.isHg = false;

        // 표시 데이터
        this.displayMsg = '000000';

        this.f = false;
        this.cf = false;
        // this.array_index_f = 0;
        // this.array_index_cf = 0;
        // this.read = false;
        // this.write = false;
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

        // 시퀀스 상태 0: false, 1: true
        this.seqStateFINISH = false;
        this.seqStateLITTLE = false;
        this.seqStateMUCH = false;
        this.seqStateNEARZERO = false;

        // Comparator 상태 0: false, 1: true
        this.compStateHI = false;
        this.compStateOK = false;
        this.compStateLO = false;
        this.compStateNG = false;

        // // 스팬 적용
        // this.do_span = false;
        //
        // // init F 모드
        // this.mode_init_f = false;
        //
        // // init All 모드
        // this.mode_init_a = false;
        //
        // // init 응답 플래그
        // this.init_f = false;
        //
        // // 100ms 카운터
        // this.cnt_100ms = 0;
        //
        // // 초기화 루틴 진입
        // this.do_init = false;

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

class cfFlag {
    constructor() {
        this.isReadState = true;
        this.CF01 = 1;
        this.CF02 = 0;
        this.CF03 = 10000;
        this.CF04 = 0.00000;
        this.CF05 = 3.20000;
        this.CF06 = 10000;
        this.CF07 = 100;
        this.CF08 = 2.0;
        this.CF09 = 1.5;
        this.CF10 = 1.0;
        this.CF11 = 2.0;
        this.CF12 = 0;
        this.CF13 = 0;
    }
}

class f0Flag {
    constructor() {
        this.isReadState = true;
        this.F001 = 0;
        this.F002 = 8;
        this.F003 = 0;
        this.F004 = 0.0;
        this.F005 = 0.0;
        this.F006 = 0.0;
        this.F007 = 0.0;
        this.F008 = 0;
        this.F009 = 0;
        this.F010 = 0;
        this.F011 = 0;
        this.F012 = 0;
        this.F013 = 0;
        this.F014 = 0;
        this.F015 = 0;
        this.F016 = 0;
        this.F017 = 0;
        this.F018 = 0;
    }
}

class f1Flag {
    constructor() {
        this.isReadState = true;
        this.F101 = 0;
        this.F102 = 0;
        this.F103 = 2;
        this.F104 = 0;
        this.F105 = 2;
        this.F106 = 2;
        this.F107 = 0;
    }
}

class f2Flag {
    constructor() {
        this.F201 = 2;
        this.F202 = 1;
        this.F203 = 2;
        this.F204 = 0;
        this.F205 = 0;
    }
}

class f3Flag {
    constructor() {
        this.isReadState = true;
        this.F301 = 0;
        this.F302 = 0;
        this.F303 = 2;
        this.F304 = 0;
        this.F305 = 2;
        this.F306 = 0;
    }
}

class f4Flag {
    constructor() {
        this.isReadState = true;
        this.F401 = 0;
        this.F402 = 0;
        this.F403 = 0;
    }
}

class f5Flag {
    constructor() {
        this.isReadState = true;
        this.F501 = 0;
        this.F502 = 10000;
        this.F503 = 0;
        this.F504 = 10000;
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
    cfFlag: cfFlag,
    f0Flag: f0Flag,
    f1Flag: f1Flag,
    f3Flag: f3Flag,
    f4Flag: f4Flag,
    f5Flag: f5Flag,
    basicConfigFlag: basicConfigFlag,
    externalPrintConfigFlag: externalPrintConfigFlag,
    calibrationConfigFlag: calibrationConfigFlag
}
