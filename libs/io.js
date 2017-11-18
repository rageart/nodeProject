var logger   = require('../config/logger');
var dbConn = require('./oracleConnection.js');
var struct = require('./coupledMessage.js');
var pushServiceAPI = require('./pushServiceAPI.js');
var pcViewerAPI = require('./pcViewerAPI.js');
var util = require('util');
var utilLib = require('./utilLib');
var constVal = require('../config/const.js');
var fs = require('fs');
var net = require('net');
var io = require('socket.io')();
var channelAPI = require('../libs/channelAPI.js');

//config
var conf = JSON.parse(fs.readFileSync("./config/config.json"));
var AppServer = conf.AppServer;

var regQueue = [];
//---------------------------------------------------------------------------------------------
// App Server
//---------------------------------------------------------------------------------------------
if(AppServer){

	logger.info("AppServer ::::" + AppServer);
	if(AppServer){
		var appServerIP = '127.0.0.1';
		var appServerPort = 12345;
		var client;

		var retryInterval = 3000;
		var retriedTimes = 0;
		var maxRetries = 10;

		var socket = new net.Socket();

		(function connect() {

			function reconnect() {
				if (retriedTimes >= maxRetries) {
					throw new Error('retriedTimes > maxRetries');
				}

				retriedTimes += 1;
				setTimeout(connect, retryInterval);
			}
			var svip = {port: appServerPort, host: appServerIP, localAddress:appServerIP, localPort: 30000};
			//client = socket.connect(appServerPort, appServerIP, function() {
			client = socket.connect(svip, function() {
				logger.info('App Server tcp connected success');
			});

			client.on('connect', function() {

				retriedTimes = 0;
				logger.info('connect event emit');
			});

			var recvData = '';
			client.on('data', function(data) {
				logger.info('Noti message ocurred!');

				parsingMessage(data);
			});

			client.on('close', function() {
				logger.crit('Connection closed');

				reconnect();
			});

			client.on('error', function (err) {
				logger.crit('connect error', err);
			});

			//process.stdin.pipe(client, {end: false});
		}());
	}//AppServer
};


function parsingMessage(data){

	//logger.info('function : parsingMessage');
    struct.parsingBodyData(data, function(error, header, body, unProcessedBuf) {
	//    struct.parsingBodyData(data, function(error, header, body) {

    if (error){
    	logger.crit(error);
    }else{
        switch (header.command){
          case 'B100':
				  case 'B102':  // TOSS 기본 연결

                    var resBody = 'MOBILE_NUM='+body.MOBILE_NUM+'&CTN_DEVICE='+body.CTN_DEVICE;
                    var packet = struct.makeData(header.command, resBody);
                    client.write(packet);
                    io.sockets.emit(header.command, body);
                    break;
				  case 'B602':
				  case 'B603':

						var lcsAccsUrl = 'http://'+ g_lcsAccUrl + ':8080/toss/?CUST_CTN='+body.MOBILE_NUM +'&amp;INSERT_DATE='+body.P_INSERT_DATE+'&amp;LCS_FLMGNO='+body.LCS_FLMGNO;

						var xml;
						xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:q0="http://lguplus/u3/esb" xmlns:q1="java:lguplus.u3.esb.osc115" xmlns:q2="java:lguplus.u3.esb.common" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
						xml += '<soapenv:Body>\n';
						xml += '<q0:Oscpc115>\n';
						xml += '<q0:RequestRecord>\n';
						xml += '<q1:ESBHeader>\n';
						xml += '<q2:ServiceID>OSC115</q2:ServiceID>\n';
						xml += '<q2:TransactionID>'+ body.LCS_FLMGNO +'</q2:TransactionID>\n';
						xml += '<q2:SystemID>LCS000</q2:SystemID>\n';
						xml += '<q2:ErrCode></q2:ErrCode>\n';
						xml += '<q2:ErrMsg></q2:ErrMsg>\n';
						xml += '<q2:Reserved></q2:Reserved>\n';
						xml += '</q1:ESBHeader>\n';
						xml += '<q1:RequestBody>\n';
						xml += '<q1:Oscpc115RequestInVO>\n';
						xml += '<q1:lcsFlmgNo>'+ body.LCS_FLMGNO +'</q1:lcsFlmgNo>\n';
						xml += '<q1:lcsFlmgDvCd>'+ body.LCS_FLMGDV_CD +'</q1:lcsFlmgDvCd>\n';
						xml += '<q1:consNo>'+ body.CONS_NO +'</q1:consNo>\n';
						xml += '<q1:consReqNo>'+ body.CONS_REQNO +'</q1:consReqNo>\n';
						xml += '<q1:lcsUseBizIdntNo>'+ body.LCS_USE_BIZIDNTNO +'</q1:lcsUseBizIdntNo>\n';
						xml += '<q1:lcsAccsUrl>'+ lcsAccsUrl +'</q1:lcsAccsUrl>\n';
						xml += '<q1:prpsCoByPtyId>'+ body.PRPSCOBYPTY_ID +'</q1:prpsCoByPtyId>\n';
						xml += '</q1:Oscpc115RequestInVO>\n';
						xml += '</q1:RequestBody>\n';
						xml += '</q0:RequestRecord>\n';
						xml += '</q0:Oscpc115>\n';
						xml += '</soapenv:Body>\n';
						xml += '</soapenv:Envelope>\n';
   					var bodyString = xml;

   					logger.info('toss bodyString:',bodyString);

						var headers = {
							'Content-Type': 'text/xml;charset=UTF-8',
							'Content-Length': bodyString.length,
							'soapAction': ''
						};

						// toss direct 접속
						var options = {
						      host: TOSS_HOST,
						      port: TOSS_PORT,
							//host: 'toss.lguplus.co.kr',

							//시험서버
			                //host: '172.22.14.79',
			                //host: 'test.toss.lguplus.co.kr',
			                //port: 15011,
			                path: '/CSSI/OSC/Oscpc115',
			                method: 'POST',
			                headers: headers
						};

		        var callback = function(response) {
				        //logger.info('callback1::: ');
				        response.on('data', function(data) {

					        	logger.info('toss response: ', data.toString());

						        var xmlparse = data;
						        var succYn;
						        var msg;
						        var transactionID;

						        parseString(xmlparse, function (err, result) {
											//json 값 가져오기
											if (err)
											logger.crit('toss parse err:',err);

											transactionID = result['soapenv:Envelope']['soapenv:Body'][0]['ns3:Oscpc115Response'][0]['ns3:ResponseRecord'][0]['q1:ESBHeader'][0]['q2:TransactionID'];
											succYn = result['soapenv:Envelope']['soapenv:Body'][0]['ns3:Oscpc115Response'][0]['ns3:ResponseRecord'][0]['ResponseBody'][0]['Oscpc115ResponseOutVO'][0]['succYn'];
											msg = result['soapenv:Envelope']['soapenv:Body'][0]['ns3:Oscpc115Response'][0]['ns3:ResponseRecord'][0]['ResponseBody'][0]['Oscpc115ResponseOutVO'][0]['msg'];
											logger.info('toss transactionID:', transactionID);
											logger.info('toss succYn:',succYn);
											logger.info('toss msg:',msg);
						        });

							      //update : value
										var query = 'UPDATE TB_TOSS_HISTORY SET RESULT=?, MESSAGE=?, RESPONSE_TIME = DATE_FORMAT(now(),"%Y%m%d%H%i%s")' +
							                   ' WHERE LCS_FLMGNO=? AND DEL_FLAG=?';

							      //dbConn.query(query,[succYn, msg, body.MOBILE_NUM, body.P_INSERT_DATE,toss_map.get("lcsFlmgNo")], function (error, results) {
							      dbConn.query(query,[succYn, msg, transactionID, '0'], function (error, results) {
							        	logger.info('Query:', query);

								        if (error) {
								        	logger.error('DB Error:', error);
												} else {
													//logger.info('DB success');
												}
										});
								}); //end::response.on

								//the whole response has been recieved, so we just print it out here
						    response.on('end', function() {
							    	logger.info('end');
									//console.log(succYn + '' + msg);
								});
						};//end::callback

			    //insert: body data (TB_TOSS_HISTORY)

			    http.request(options, callback).write(bodyString);

			    //var lcsAccsUrl = 'http://'+ g_lcsAccUrl + ':8080/toss/?CUST_CTN='+body.MOBILE_NUM + '&INSERT_DATE=' + body.P_INSERT_DATE + '&LCS_FLMGNO=' + toss_map.get("lcsFlmgNo");
			    var lcsAccsUrl = 'http://'+ g_lcsAccUrl + ':8080/toss/?CUST_CTN='+body.MOBILE_NUM + '&INSERT_DATE=' + body.P_INSERT_DATE + '&LCS_FLMGNO=' + body.LCS_FLMGNO;

			    var result = '';
			    var query = 'INSERT INTO TB_TOSS_HISTORY ' +
			                 '(P_CUST_CTN, P_INSERT_DATE, LCS_FLMGNO, TOSS_TYPE, LCS_FLMGDV_CD, CONS_NO, CONS_REQNO, LCS_USE_BIZIDNTNO, LCS_ACCURL, PRPSCOBYPTY_ID, REQUEST_TIME, RESULT, DEL_FLAG) ' +
			                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_FORMAT(now(),"%Y%m%d%H%i%s"), ?, ?)';

					//dbConn.query(query,[body.MOBILE_NUM, body.P_INSERT_DATE, toss_map.get("lcsFlmgNo"),toss_map.get("lcsFlmgDvCd"),toss_map.get("consNo"),toss_map.get("consReqNo"), lcsAccsUrl, toss_map.get("prpsCoByPtyId"),result], function (error, results) {
					dbConn.query(query,[body.MOBILE_NUM, body.P_INSERT_DATE, body.LCS_FLMGNO, '1', body.LCS_FLMGDV_CD, body.CONS_NO, body.CONS_REQNO, body.LCS_USE_BIZIDNTNO, lcsAccsUrl, body.PRPSCOBYPTY_ID, result,'0'], function (error, results) {
						logger.info('Query:', query);

						if (error) {
							logger.error('DB Error:', error);
						} else {
							//logger.info('DB success');
						}
					});//end::dbConn
					break;
                case 'B400':
                case 'B410':
                case 'B500':    // STB Status Message (noti)
                case 'B501':    // Mobile Viewer Status Message (noti)
                case 'B600':
                case 'B601':    // 단말 수신측 종료에 의한 Mobile 서비스 종료
                case 'B900':    // PC Viewer 비정상 종료
                case 'B801':    // PC Viewer 단말 송신측 종료 (noti)
                case 'B902':    // PC Viewer
                    io.sockets.emit(header.command, body);
                    break;
                //#1 Start [2015.07.23] by ywhan
                case 'D002':  // member join
                    var resBody = 'MOBILE_NUM='+body.MOBILE_NUM+'&CTN_DEVICE='+body.CTN_DEVICE;
                    var packet = struct.makeData(header.command, resBody);
                    client.write(packet);

                    var code_01 = body.CONTROL_ID.substring(0,3);
                    var code_02 = body.CONTROL_ID.substring(3,6);
                    var code_03 = body.CONTROL_ID.substring(6,9);

                    var query = util.format('SELECT CTN,NM,DEPT_NM,ARANK FROM TB_ORGANOGRAM WHERE CTN = \'%s\' and DEPT_CODE_01 = \'%s\' and DEPT_CODE_02 = \'%s\' and DEPT_CODE_03 = \'%s\''
                        ,body.MOBILE_NUM ,code_01, code_02, code_03);

                    dbConn.query(query, function (error, results) {
                    	logger.info('Query:', query);

                        if (error) {
                        	logger.error('DB Error:', error);
                        } else {
                        	//logger.info('DB success');

                            var voiceInfo;
                            if (Object.keys(results).length > 0) {
                                voiceInfo = merge(results[0], body);
                                logger.info('results + body merge');
                            }else {
                            	logger.info('results emtpy');

                                var unknown = { NM : body.MOBILE_NUM, CTN : body.MOBILE_NUM, DEPT_NM : "-", ARANK : "-" };
                                voiceInfo = merge(unknown, body);
                            }

                            logger.info('make D200');
                            var jsonData = struct.makeJsonTypeAddVoice(voiceInfo);
                            packet = struct.makeData('D200', jsonData);
                            client.write(packet);
                        }
                    });
                //#1 End
                case 'D001':  // room create
                    //io.sockets.emit(header.command, body);
                case 'B101' : // Quick connect
                case 'D003' : // member stb send request
				case 'B103' : // TOSS Quick connect
				case 'B104' : // Multi control
					if (header.resultCode != '0000'){
                    	io.sockets.emit('B998', body);
					} else {
						var code_01 = body.CONTROL_ID.substring(0, 3);
						var code_02 = body.CONTROL_ID.substring(3, 6);
						var code_03 = body.CONTROL_ID.substring(6, 9);
						channelAPI.getRegidsChannel(code_01, code_02, code_03, function(error, results) {

							for(var i = 0; i < results.length; i++) {								
								pcViewerAPI.GetViewerIndex(dbConn, results[i], function(info, RET) {
									logger.info('getViewerIndex callback :', RET[0].VIEW_INDEX);
									// PC뷰어 추가
									var mobileArray = [];				
									var mobileInfo = {};
									var mobileInfoList = {};
							
									mobileInfo.ctn   = info.DEV_KEY;
									mobileInfo.name  = info.DEV_NM;
									mobileInfo.dept  = info.DEV_DEPT_NM;
									mobileInfo.index = RET[0].VIEW_INDEX;
									mobileArray.push(mobileInfo);
		
									mobileInfoList.MOBILE_NUM = body.MOBILE_NUM;
									mobileInfoList.CTN_DEVICE = body.CTN_DEVICE;
									mobileInfoList.INSERT_DATE = body.P_INSERT_DATE;
									mobileInfoList.VIEW_TYPE = constVal.PC;
									mobileInfoList.DEV_NM = '';
									mobileInfoList.DEV_DEPT_NM = '';
									mobileInfoList.mobileList = mobileArray;

									packet = struct.makeData('B302', mobileInfoList);
									client.write(packet);									
								});

								if (results[i].MOBILE_NUM !== '' && results[i].MOBILE_NUM !== null) {
									// mobile 추가
									var mobileArray = [];				
									var mobileInfo = {};
									var mobileInfoList = {};

									mobileInfo.ctn = results[i].MOBILE_NUM;
									mobileInfo.name = results[i].DEV_NM;
									mobileInfo.dept = results[i].DEV_DEPT_NM;
									mobileInfo.index = 0;
									mobileArray.push(mobileInfo);
		
									mobileInfoList.MOBILE_NUM = body.MOBILE_NUM;
									mobileInfoList.CTN_DEVICE = body.CTN_DEVICE;
									mobileInfoList.INSERT_DATE = body.P_INSERT_DATE;
									mobileInfoList.VIEW_TYPE = constVal.MOBILE;
									mobileInfoList.DEV_NM = '';
									mobileInfoList.DEV_DEPT_NM = '';
									mobileInfoList.mobileList = mobileArray;
																	
									push_gcm(mobileInfoList);			

									packet = struct.makeData('B302', mobileInfoList);
									client.write(packet);									
								}																	
							}

							if (Object.keys(results).length == 0) {
								var viewerInfo;
								viewerInfo.CTN_DEVICE = body.CTN_DEVICE;
								viewerInfo.MOBILE_NUM = body.MOBILE_NUM
								packet = struct.makeData('B302', viewerInfo);
								client.write(packet);
							}
						});

	                    io.sockets.emit(header.command, body);
					}
                    break;
				case 'B202' : // 영상 서비스 중 mVoIP통화 연결을 하면 푸시

                    var code_01 = body.CONTROL_ID.substring(0,3);
                    var code_02 = body.CONTROL_ID.substring(3,6);
                    var code_03 = body.CONTROL_ID.substring(6,9);

					// 관제센터 디폴트가 mobile이 아니고 mVoIP 연결계정이 있을 경우 푸시 메세지 전송
					logger.info('getCallId callback');
					function getCallId(callback) {
	                	var query3 = 'SELECT *, b.SV_OP_SV_V,c.DEV_KEY FROM TB_CONTROL a left join TB_CUSTOMER b ON a.CODE_03 = b.CUSTOMER_CODE';
	                	query3 += ' left join (SELECT * FROM TB_DEFAULT_CONNECT_INFO WHERE DEV_TYPE = \'1\') c ';
	                	query3 += ' ON a.CODE_01 = c.CODE_01 and a.CODE_02 = c.CODE_02 and a.CODE_03 = c.CODE_03 AND a.DEFAULT_DEVICE = c.DEV_TYPE'
	                	query3 += ' WHERE a.CODE_01 = \''+code_01+'\' AND a.CODE_02 = \''+code_02+'\' AND a.CODE_03 = \''+code_03+'\'';
                    	dbConn.query(query3 , function(err, rows) {
                    		logger.info('Query: ', query3);
                    		if (err) {
                    			logger.error('DB Error: ', err);
                                callback(err, null);
                            } else {
								if (Object.keys(rows).length > 0) {
									callback(null, rows[0]);
								} else {
	                                callback(err, null);
								}
							}
                        });
                    }

                    getCallId(function(err, content) {
                    	if (content == null) {
	                    	logger.info('control is null');
                    		return;
                    	}
                    	logger.info('CALL_ID : ', content.CALL_ID);
						//if (content.SV_OP_SV_V == 'Y' && body.CALL_TYPE == 'M' && body.F_CALL_TYPE == '1') {
						if (content.SV_OP_SV_V == 'Y' && body.CALL_TYPE == 'M') {
			                //if(content.DEFAULT_DEVICE != MOBILE || content != '-') {
			                if (body.F_CALL_TYPE == '1') { // mobile 일 경우  gcm push
				                logger.info('DEV_KEY : ' + content.DEV_KEY + '	F_MOBILE_NUM : ' + body.F_MOBILE_NUM);
				                // 디폴트가 모바일이고 관제탑 전화번호와 디폴트 모바일 전화번호가 다를 경우 관제탑 전화로  mVoIP로 연결하기 위해 푸시
								// 통화대상이 MOBILE이면 무조건 대상 MOBILE로 푸시 전송 (12.16 임시소스 수정 : 박영진)
//				               	if (body.F_MOBILE_NUM != content.DEV_KEY){
									var voiceInfo = {};
									voiceInfo.name = content.CTL_NM;
									voiceInfo.ctn = content.CTL_TEL_NUM;
									voiceInfo.dept = content.CTL_ADMIN_NM;
									voiceInfo.arank = '';

									var voiceArray = [];
									voiceArray.push(voiceInfo);

				                	var push_data = {};
									push_data.INSERT_DATE = body.P_INSERT_DATE;
									push_data.CTN_DEVICE = body.CTN_DEVICE;
									push_data.MOBILE_NUM = body.MOBILE_NUM;
									push_data.CALL_TYPE = '1';
									push_data.mobileList = voiceArray;

				                	push_gcm(push_data);
//				                }
			                } else { // 3 : pc 일 경우
			                    io.sockets.emit(header.command, body);
			                }
						}
					})
					break;
                case 'D099' : // room destroy
                    var packet = struct.makeData(header.command, body);
                    client.write(packet);
                    io.sockets.emit(header.command, body);
                    break;
                case 'B200' :   // Voice 추가 응답
                case 'B300' :	// STB 추가 응답
				case 'B302' : 	// Viewer 추가 응답
				case 'B303' : 	// Viewer 삭제 응답

					// error 응답 처리
					if (header.resultCode != '0000'){
                    	io.sockets.emit('B999', body);
                    } else {

                        // Mobile이고 추가 했을 경우는 PUSH 메세지 전송
                        if (header.command == 'B302' && body.VIEW_TYPE == constVal.MOBILE) {

                            //add mobile 응답 확인 후에 PUSH MESSAGE 전송을 해야 함
                            var mobileArray = new Array();

                            var mobileInfo = new Object();
                            mobileInfo.ctn = body.VIEW_NUM;
                            mobileArray.push(mobileInfo);

                            var mobileInfoList = new Object();
                            mobileInfoList.INSERT_DATE = body.LAST_DATE;
                            mobileInfoList.MOBILE_NUM = body.MOBILE_NUM;
                            mobileInfoList.DEV_NM = body.DEV_NM;
                            mobileInfoList.DEV_DEPT_NM = body.DEV_DEPT_NM;
                            mobileInfoList.mobileList = mobileArray;

							var default_flag = body.DEFAULT_FLAG;
							if (default_flag == '1') { // 기본연결이고 관제탑 전화번호와 수신 단말의 전화번호가 같을 경우 5초 딜레이
	                        	//setTimeout(function(){addmobileInfo(body)}, 5000);
	                        	//addpushdelay = addpushdelay + 1;
								setTimeout(function() { push_gcm(mobileInfoList); }, 5000);
							} else {
								//var obj = clone(mobileInfoList);
								//if(addpushdelay <0) {
	                        	//	addpushdelay = 0;
	                        	//}

	                        	push_gcm(mobileInfoList);
							}
                        }

                        io.sockets.emit(header.command, body);
					}
                    break;
                case 'B304' :   // 영상 서비스 수신 시작
                case 'B305' :   // 영상 서비스 수신 종료
                	// error 응답 처리
					if (header.resultCode == '0009'){
                    	io.sockets.emit('B998', body);
                    } else if (header.resultCode == '0099'){
                    	io.sockets.emit('B997', body);
                    } else {
                    	io.sockets.emit(header.command, body);
                    }
                    break;
				case 'B001' :   // reg id 등록 /수정

					pushServiceAPI.checkValidRegID(dbConn, body, function(error, results) {

						var date = new Date().formatDate("yyyyMMddhhmmss");
						if (Object.keys(results).length == 0){  // regId 최초등록

							var query = util.format('INSERT INTO TB_PUSH_REG_INFO (DEV_KEY, DEV_TYPE, REG_ID, REG_STATUS, INSERT_DATE, UPDATE_DATE) VALUES' +
							 			'( \'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\')' , body.MOBILE_NUM, '1', body.REG_ID, '1', date, date);
						}else { // update

							var query = util.format('UPDATE TB_PUSH_REG_INFO SET REG_ID = \'%s\', UPDATE_DATE = \'%s\' WHERE DEV_KEY = \'%s\' and DEV_TYPE = \'%s\'', body.REG_ID, date, body.MOBILE_NUM, '1');

						}

						var responseValue;
						dbConn.query(query, function (error, result) {

							logger.info('Query:', query);

							if (error){
								responseValue = '1';
								logger.error('DB Error:', error);
							}else {
								//logger.info('DB success');
								responseValue = '0';
							}

	                        var resBody = 'REG_RST='+responseValue+'&MOBILE_NUM='+body.MOBILE_NUM;
	                        var packet = struct.makeData(header.command, resBody);
	                        client.write(packet);
						});
					});
					break;
				case 'B003' :

					//console.log(body.PUSH_MSG);
					pushServiceAPI.insertPushResponseHistory(dbConn, body, function() {

						logger.info('insertPushResponseHistory end');

                        var packet = struct.makeData(header.command, '');
                        client.write(packet);

                        io.sockets.emit(header.command, body);
					});
					break;
				default:
					var protocolMsg = merge(header, body);
                    io.sockets.emit(header.command, protocolMsg);
					break;
                //case 'D400':
                //case 'D410':
                //case 'D500':
                //    io.sockets.emit(header.command, body);
                //    break;
            }

            logger.info('Noti message emit:', header.command);

	        if (unProcessedBuf.length > 0){
			    logger.info('recursive coupled massage data  <== ', unProcessedBuf.toString());
				parsingMessage(unProcessedBuf);
			}
			/*
			var unProcessedData = data.slice(header.length + header.bodyLength, data.length);
	        if (unProcessedData.length > 0){
			    logger.info('recursive coupled massage data  <== ', unProcessedData);
				var unProcessedBuf = new Buffer(unprocessedData);
				parsingMessage(unProcessedBuf);
	        }
	        */
        }
    });
}

exports.parsingMessage = parsingMessage;

function addmobileInfo(body) {
	//add mobile 응답 확인 후에 PUSH MESSAGE 전송을 해야 함
    var mobileArray = new Array();

    var mobileInfo = new Object();
    mobileInfo.ctn = body.VIEW_NUM;
    mobileArray.push(mobileInfo);

    var mobileInfoList = new Object();
    mobileInfoList.INSERT_DATE = body.LAST_DATE;
    mobileInfoList.MOBILE_NUM = body.MOBILE_NUM;
    mobileInfoList.DEV_NM = body.DEV_NM;
    mobileInfoList.DEV_DEPT_NM = body.DEV_DEPT_NM;
    mobileInfoList.mobileList = mobileArray;

   //logger.info('mobileInfoList.mobileList',mobileInfoList.mobileList);

	/*var default_flag = body.DEFAULT_FLAG;
	if (default_flag) { // 기본연결일 경우
        var code_01 = body.CONTROL_ID.substring(0,3);
        var code_02 = body.CONTROL_ID.substring(3,6);
        var code_03 = body.CONTROL_ID.substring(6,9);

		lcsServiceAPI.getPhoneNumberOfControl(dbConn, code_01, code_02, code_03, function (obj) {
			logger.info('getPhoneNumberOfControl:', obj[0].CTL_TEL_NUM);

			if (body.VIEW_NUM == obj[0].CTL_TEL_NUM) { // 관제탑 대표전화와 단말뷰어 수신자 번호가 같을 경우 푸시 딜레이
				setTimeout(function() { push_gcm(mobileInfoList); }, 5000);
				//var timeoutId = setTimeout(function() { push_gcm(mobileInfoList); }, 5000);
				//clearTimeout(timeoutId);
			} else {
				push_gcm(mobileInfoList);
           	}
		});
	} else {*/
   		push_gcm(mobileInfoList);
//}
}

exports.addmobileInfo = addmobileInfo;
//---------------------------------------------------------------------------------------------
// 모바일 시뮬레이터 테스트 소켓
//---------------------------------------------------------------------------------------------
/*
var mobileSocket = new net.Socket();
var mobileServerPort = 15490;

var mobileClent;
mobileClient = mobileSocket.connect(mobileServerPort, appServerIP, function() {
    logger.info('App Server tcp connected success');
});

mobileClient.on('connect', function() {
    logger.info('mobile connect success');
});

mobileClient.on('data', function(data) {
    logger.info('Noti message ocurred');

    taCpMsg.parsingBodyData(data, function(error, header, body) {

        if (error){
            logger.info(error);
        }else{

			var protocolMsg = merge(header, body);
            io.sockets.emit(header.command, protocolMsg);

            logger.info('Noti message emit:', header.command);
        }
    });
});

mobileClient.on('close', function() {
    logger.info('Connection closed');
});

mobileClient.on('error', function (err) {
    logger.info('connect error', err);
})
*/
//---------------------------------------------------------------------------------------------
// Web Server on
//---------------------------------------------------------------------------------------------
/*
server.listen(webServerPort, function(){
	logger.info("Http server listening on port " + webServerPort);
});
*/
/*
var httpsServerPort = 8080;
var server = https.createServer(options, app).listen(httpsServerPort, function(){
    console.log("Https server listening on port " + httpsServerPort);
});
*/

function push_gcm(data)
{
	// push gcm start
	if (data != null){
		//logger.info('[push_gcm] : ', JSON.stringify(data));
        regQueue.push(data);
		logger.info('regQueue : ', regQueue);
        logger.info('regQueue pushed');
    }

    // 우선순위 재조립
    logger.info('sort');
    // Sort();

    // GCM Server와 동기 작업을 위해 요청 상태인지 체크
    logger.info('regQueue length check : ', regQueue.length);
    if (data != null && regQueue.length > 1){
        return;
    }

	// get reg_id
	logger.info('Get Regid to target device');
	pushServiceAPI.GetRegIds(dbConn, regQueue[0], function(tarGetInfo, regIdGrp){

		/* Reg ID가 없는 것은 원천적으로 mobile 서비스를 이용하지 못하게 막는걸로
		var errMessage = '', notRegCount = 0;
		for(var i = 0; i < regIdGrp.length; i++){

			if (regIdGrp[i] == ''){
				errMessage = errMessage + tarGetInfo.mobileList[i].ctn + '\n';
				notRegCount++;
			}
		}

		if (notRegCount > 0){
			errMessage += '\n';
			errMessage += '수신 단말의 Reg id가 존재하지 않습니다.\n';
			errMessage += '수신 단말이 적어도 한 번은 어플을 통해 LTE-실시간영상관제시스템에 접속해야';
			errMessage += 'Reg id가 등록됩니다.\n';
			io.sockets.emit('B999', errMessage);
		}
		*/

		// mVoIP
		if (typeof tarGetInfo.CALL_TYPE == "undefined" || tarGetInfo.CALL_TYPE == null) tarGetInfo.CALL_TYPE = 3;
		if (tarGetInfo.CALL_TYPE == 1) {
			tarGetInfo.title = '[LTE-LCS] mVoIP 음성 서비스';
			//tarGetInfo.content = tarGetInfo.MOBILE_NUM + '/' + tarGetInfo.DEV_NM + '/' + tarGetInfo.DEV_DEPT_NM + '로 부터 수신 받은 영상을 확인하시겠습니까?';
			tarGetInfo.content = tarGetInfo.MOBILE_NUM + '로부터 통화요청이 왔습니다.\n\n통화연결을 하시겠습니까?';
			//XX관제센터에서 통화요청이 왔습니다. 통화연결을 하시겠습니까?
			tarGetInfo.MSG_TYPE = 'CALL';
			tarGetInfo.PUSH_TYPE = '3';
		} else {
			tarGetInfo.title = '[LTE-LCS] 영상 수신 서비스';
			tarGetInfo.content = tarGetInfo.MOBILE_NUM + '/' + tarGetInfo.DEV_NM + '/' + tarGetInfo.DEV_DEPT_NM + '로 부터 수신 받은 영상을 확인하시겠습니까?';
			tarGetInfo.MSG_TYPE = 'VIEW';
			tarGetInfo.PUSH_TYPE = '1';
		}
		pushMessage(tarGetInfo, regIdGrp);
	});
}

exports.push_gcm = push_gcm;

var retransCount = 0;
function pushMessage(info, registrationIds){

	//var server_access_key = "AIzaSyAURTN3yKn0U8s6Lbl8rKylrhC4INCi6FA";
	var sender = new gcm.Sender(server_access_key);

	var message = new gcm.Message();

	// send push message
	info.cust_key         = new Date().getTime();
	info.requestTime     = new Date().formatDate("yyyyMMddhhmmss") + '' +  new Date().getMilliseconds();

	message.addData('P_CUST_CTN', info.MOBILE_NUM);
	message.addData('P_INSERT_DATE', info.INSERT_DATE);
	message.addData('MSG_TYPE', info.MSG_TYPE);
	message.addData('CUST_KEY', info.cust_key);
	message.addData('PUSH_TYPE', info.PUSH_TYPE);
	message.addData('TITLE', info.title);
	message.addData('MESSAGE', info.content);
	message.addData('REQUEST_TIME', info.requestTime);

	logger.info('send message : ', message);
	sender.send(message, { registrationTokens: registrationIds }, 1, function (err, response) {

		if(err) {
			logger.crit('gcm send error:',err);
		}

		var curTime = new Date().formatDate("yyyyMMddhhmmss") + '' +  new Date().getMilliseconds();
		info.responseTime = curTime;

		logger.info('response : ', response);

		/* InvalidRegistration test
		response.canonical_ids = 1;
		response.results.shift();
		var rs = { "message_id": "1:2342", "registration_id": "32" };
		response.results.push(rs);
		*/

		/* Unavailable test
		response.success = 0;
		response.failure = 1;
		response.results.shift();
		var rs = { error : 'Unavailable'};
		response.results.push(rs);
		*/

		/* http statusCode err test
		response.statusCode = 404;
		response.results.shift();
		 */

		// call back
		//-- 응답 결과 데이터 Insert
		pushServiceAPI.insertResult(dbConn, info, registrationIds, response);

		//-- 응답 결과 분석 후 reg_id DB 수정
		pushServiceAPI.manageRegID(dbConn, info, response, function(ret) {

			// 재전송 필요
			if (ret != null){
				logger.info('retry regQueue add : ', ret);
				if (retransCount < 3){
					regQueue.push(ret);
					retransCount++;
				}else{
					retransCount = 0;
				}
			}

			logger.info('manageRegID end');
		});


		// 처리된 push 요청 제거
		logger.info('queue 제거');
		regQueue.shift();

		//addpushdelay = addpushdelay - 1;

		//-- queue에 보낼 요청이 남아 있다면 send push message
		if (regQueue.length > 0){
			logger.info('regQueue.length :', regQueue.length);
			logger.info('recursive push_gcm');
			push_gcm(null);
		}

		//-- 없으면 빠져 나오기
		logger.info('exit push_gcm');
	});
}

exports.pushMessage = pushMessage;

// push Message Send ( 메세지내용, 디비정보, 시작cnt, 마지막cnt, 디비업데이트 정보,notice insert시간, 발신자 번호 push)
function gcm_go(messages,results,sCnt,fCnt,dbRegistrationIdUpdate,insert_date,cust_ctn,seq,r_count){

	//console.log('session cust_ctn1 : ', cust_ctn);
	//console.log('session insert_date1 : ', insert_date);

	var sender = new gcm.Sender(server_access_key);
	var registrationIds = [];// 여기에 pushid 문자열을 넣는다.
	var ctn = [];

	var limitScap = 1000;//범위 (10개씩 push Message Send)

    var fCntFor = fCnt ;
	var sCnt_b = sCnt + limitScap;
	var fCnt_b = fCnt + limitScap;

	var process = "";//프로세스종료
    if(fCnt >= results.length ){
    	fCntFor = results.length;
    	process = "out";
    }

    //registrationId 범위만큼 추가
	for(var j = sCnt;j<fCntFor; j++ ){
		//registrationIds.push(token3);
		registrationIds.push(results[j].REG_ID);
		ctn.push(results[j].DEV_KEY);
	}

	var message = new gcm.Message();

	var date = new Date();
	var req_time = date.formatDate("yyyyMMddhhmmss")+ '' + date.getMilliseconds();

	var TITLE = "공지사항";
	var MESSAGE = messages;
	var CUST_KEY = date.getTime();

	message.addData('P_CUST_CTN', cust_ctn);
	message.addData('P_INSERT_DATE', insert_date);
	message.addData('CUST_KEY', CUST_KEY);
	message.addData('MSG_TYPE', 'NOTI');
	message.addData('PUSH_TYPE', '2');
	message.addData('TITLE', TITLE);
	message.addData('MESSAGE', MESSAGE);
	message.addData('REQUEST_TIME', req_time);

	var re_msg_id = "";

	sender.send(message, { registrationTokens: registrationIds }, 1, function (err, response) {

		 if(err){
			 logger.crit('notice push send error:',err);

		 	//insert TB_PUSH_HISTORY
		    for(var gcmj = 0; gcmj < registrationIds.length; gcmj ++){
				  // 실행구간, registrationId, 결과값message_id, 결과값error ( 필요결과값 계속추가가능....)
				  var sString = sCnt+"`"+registrationIds[gcmj]+"`" + "-"  +"`" +"-"+ "`" +"-"+ "`" +"-"+ "`" +ctn[gcmj];
				  //console.log(sString);
				  dbRegistrationIdUpdate.push(sString);//디비업데이트 정보 push
			}

		    if(process == "") {//re_msg_id:리턴값, process:out 이면 프로세스 종료
		    	//logger.info("err:"+r_count);
				gcm_go(messages,results,sCnt_b,fCnt_b,dbRegistrationIdUpdate,insert_date,cust_ctn,r_count);
			}else if(process == "out"){//프로세스종료면 배열값 리턴
				//logger.info("err::"+r_count);
				gcm_db_update(dbRegistrationIdUpdate,MESSAGE,req_time,insert_date,cust_ctn,'408',CUST_KEY,seq,r_count);
			}

		 }else{

			var r_date = new Date();
			var res_time = r_date.formatDate("yyyyMMddhhmmss")+ '' + r_date.getMilliseconds();

			var statusCode;

			 //response.statusCode = '404';

			if(response.statusCode == undefined) {
				statusCode = '200';
				for(var gcmi = 0; gcmi < Object.keys(response.results).length; gcmi ++){
				  // 실행구간, registrationId, 결과값message_id, 결과값error ( 필요결과값 계속추가가능....)
				  var sString = sCnt+"`"+registrationIds[gcmi]+"`" + response.results[gcmi].message_id  +"`" +response.results[gcmi].registration_id+ "`" +response.results[gcmi].error+ "`" +res_time+ "`" +ctn[gcmi];
				  //console.log(sString);
				  dbRegistrationIdUpdate.push(sString);//디비업데이트 정보 push
				}
			}else {
			 	statusCode = response.statusCode;
			 	for(var gcmi = 0; gcmi < registrationIds.length; gcmi ++){
				  // 실행구간, registrationId, 결과값message_id, 결과값error ( 필요결과값 계속추가가능....)
				  var sString = sCnt+"`"+registrationIds[gcmi]+"`" + " "  +"`" +" "+ "`" +" "+ "`" +res_time+ "`" +ctn[gcmi];
				  //console.log(sString);
				  dbRegistrationIdUpdate.push(sString);//디비업데이트 정보 push
				}
			}

			//console.log(response);
			//console.log(response.results.length);

			//re_msg_id = response.results[0].message_id ;
			 //if(re_msg_id != '' && process == "") {//re_msg_id:리턴값, process:out 이면 프로세스 종료
			 if(process == "") {//re_msg_id:리턴값, process:out 이면 프로세스 종료
				// logger.info("1111"+r_count);
				gcm_go(messages,results,sCnt_b,fCnt_b,dbRegistrationIdUpdate,insert_date,cust_ctn,r_count);
			}else if(process == "out"){//프로세스종료면 배열값 리턴
				//logger.info("2222"+r_count);
				gcm_db_update(dbRegistrationIdUpdate,MESSAGE,req_time,insert_date,cust_ctn,statusCode,CUST_KEY,seq,r_count);
			}

		} //else
	}); //sender
}

exports.gcm_go = gcm_go;

//gcm 변경정보 업데이트
function gcm_db_update(dbRegistrationIdUpdate,MESSAGE,req_time,insert_date,cust_ctn,statusCode,CUST_KEY,seq,r_count){
	logger.info("dbRegistrationIdUpdate"+dbRegistrationIdUpdate);

	var date = new Date();

	//console.log('statusCode::'+statusCode);
	//console.log('session cust_ctn2 : ', cust_ctn)

	var datetime = date.formatDate("yyyyMMddhhmmss")+ '' + date.getMilliseconds();
	var P_CUST_CTN = cust_ctn;
	var P_INSERT_DATE = insert_date;
	var TITLE = "공지사항";
	var MESSAGE = MESSAGE;
	var REQUEST_TIME = date.formatDate("yyyyMMddhhmmss") + '' + date.getMilliseconds();
	var RECEIVE_TIME = '';
	var PUSH_STATUS = '0';
	var PUSH_TYPE = '2';
	var HTTP_CODE = statusCode;
    var fail_reg_id = [];

	for(var i=0;i<dbRegistrationIdUpdate.length;i++) {

		var res = dbRegistrationIdUpdate[i].split('`');

		/* canonical id  테스트용
		var can_id;
		if (i ==3){

			can_id = '31';
		}else {

			can_id = res[3];
		}
		*/

		var	can_id = res[3];
		var res_time = res[5];
		var CTN = res[6];
		var MESSAGE_ID = res[2];
		var GCM_ERROR = res[4];

		/* Unavailable 테스트용
		var GCM_ERROR;
		if (i == 0){
			GCM_ERROR = 'Unavailable';
		}else {
			GCM_ERROR = res[4];
		}
		 */
		var REG_ID = res[1];
		var GCM_RESULT;
		var CANONICAL_ID;

		if(MESSAGE_ID != 'undefined' && MESSAGE_ID != null) {
			GCM_RESULT = '1';
		}else {
			MESSAGE_ID = '';
			GCM_RESULT = '2';
		}

		if(can_id != 'undefined' && can_id != null) {
			CANONICAL_ID = '1';
		}else if(can_id == "-") {
			CANONICAL_ID ='';
		}else {
			CANONICAL_ID = '0';
		}

		if(HTTP_CODE != '200') {
			GCM_RESULT = '2';
			CANONICAL_ID = '0';
		}

		if(HTTP_CODE == "408") {
			HTTP_CODE = "408";
		}


		if (GCM_ERROR == 'undefined' || GCM_ERROR == '-'){
			GCM_ERROR = '';
		}

		if(res_time == '-') {
            res_time = '';
        }

		 var query = 'INSERT INTO TB_PUSH_HISTORY ' +
	     '(P_CUST_CTN, P_INSERT_DATE, CTN, CUST_KEY,  TITLE, MESSAGE, REQUEST_TIME, RESPONSE_TIME, PUSH_TYPE, MESSAGE_ID, PUSH_STATUS, HTTP_CODE, GCM_RESULT, GCM_ERROR, REG_ID, CANONICAL_ID, RECEIVE_TIME, INSERT_DATE) ' +
	     'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

		//console.log('session cust_ctn3 : ', cust_ctn)
		//console.log(P_CUST_CTN);

	    dbConn.query(query, [P_CUST_CTN, P_INSERT_DATE, CTN, CUST_KEY, TITLE, MESSAGE, req_time, res_time, PUSH_TYPE, MESSAGE_ID, PUSH_STATUS, HTTP_CODE, GCM_RESULT, GCM_ERROR, REG_ID, CANONICAL_ID, RECEIVE_TIME, datetime], function (err, result) {

	        if (err){
	        	logger.error('DB Error:', err);
	        }else {
	            //console.log('DB success');
	        }
	    });

	    if(can_id != null && can_id != 'undefined') { // can_id가 있으면 update
	    	var query = 'update TB_PUSH_REG_INFO set REG_ID = ?,  UPDATE_DATE = DATE_FORMAT(now(),"%Y%m%d%H%i%s") where DEV_KEY=?';

		    dbConn.query(query, [can_id, CTN], function (err, result) {

		        if (err){
		        	logger.error('DB Error:', err);
		        }else {
		            //console.log('DB success');
		        }
		    });
	    }else {
	    }

	    //error 메세지가 InvalidRegistration 또는 NotRegistered일 경우 delete
	    if(GCM_ERROR == 'InvalidRegistration' || GCM_ERROR == 'NotRegistered') {

	    	var query = 'delete from TB_PUSH_REG_INFO where DEV_KEY=?';

    		dbConn.query(query, [CTN], function (err, result) {

		        if (err){
		        	logger.error('DB Error:', err);
		        }else {
		            //console.log('DB success');
		        }
		    });
	    }

		if(GCM_ERROR == 'Unavailable') {
	    	fail_reg_id.push(CTN);
	   	}
	}

	if(fail_reg_id.length > 0){
		//logger.info("fail_reg_id:"+r_count);
		re_send(fail_reg_id,MESSAGE,insert_date,seq,cust_ctn,r_count);
	}
}

exports.gcm_db_update = gcm_db_update;


function re_send(fail_reg_id,MESSAGE,insert_date,seq,cust_ctn,r_count){

	//logger.info("function re_send::::"+r_count);

	var message = MESSAGE;
	//var insert_date = insert_date;
	var cust_ctn = cust_ctn;
	var seq = seq;

	//logger.info("re_send::r_count::"+r_count);

	//console.log('session cust_ctn : ', cust_ctn);
	//console.log('session insert_date : ', insert_date);

	var dbRegistrationIdUpdate = [];//디비업데이트 정보 push

	var date = new Date();
	var senddate = date.formatDate("yyyyMMddhhmmss")+ '' + date.getMilliseconds();

	fail_reg_id = "'"+ fail_reg_id + "'";
	logger.info("fail_reg_id:::"+fail_reg_id);

	var f = "(" +fail_reg_id.replace(/,/g,"','") +")";

	//logger.info(f);

	//console.log(seq + ']]]' + senddate);

	var query1 = 'update TB_NOTICE_POPUP set N_SENDDATE = ? where SEQ=?';

    dbConn.query(query1, [senddate, seq], function (err, result) {

        if (err){
        	logger.error('DB Error:', err);
        }else {
            //console.log('DB success');
        }
    });

	var query = 'SELECT DEV_KEY,REG_ID FROM TB_PUSH_REG_INFO where DEV_KEY in ' + f;

	var cnt = 0;
     dbConn.query(query, function (error, results) {
    	 if (error) {
    		 logger.error('DB Error:',error);
             callback(error, null);
         } else {
        	// logger.info("re_send:"+ r_count);
        	//타이틀, 디비데이타, 0, 10(범위), db 업데이트, notice insert시간, 발신자 번호
         	r_count = r_count+1;
        	if(r_count < 3) { // 1부터 시작
             	gcm_go(message, results, 0, 1000, dbRegistrationIdUpdate, senddate,cust_ctn,seq, r_count);
             	//gcm_go(messages,results, 0, 10, dbRegistrationIdUpdate,insert_date,cust_ctn,seq,r_count);
        	}
        	//response.send('ok');
         }
     });
}

//var io = require('socket.io').listen(server);
var packet;
//io.sockets.on('connection', function (socket) {
io.on('connection', function (socket) {
    id = socket.id;

    logger.info("socket.io connection:", id);
    socket.on('addVoice', function(data) {
    logger.info('Add Voice Event occurred.');
    	//logger.info('Receive Data:', data);

        packet = struct.makeData(data.COMMAND, data);

        //logger.info('packet:', packet);
        var retVal = client.write(packet, function(){
            if (retVal){
            	logger.info('packet write success');
                //io.sockets.connected[id].emit('insertVoiceList', data);
                logger.info('socket emit msgEvent / id:', id);

                // 관제센터 영상 추가 시 푸시 메세지
                //if(request.session.mVoIP == 'Y' && data.CALL_TYPE == '1') {
                if(data.mVoIP == 'Y' && data.CALL_TYPE == '1') {
                	data.mobileList = data.voiceList;
                	push_gcm(data);
                }
            } else{
            	logger.info('packet write fail');
            }
        });
    });

    socket.on('retryVoice', function(data) {
    	logger.info('retryVoice Event occurred.');
    	//logger.info('Receive Data:', data);
        packet = struct.makeData(data.COMMAND, data);

       // logger.info('packet:', packet);
        var retVal = client.write(packet, function(){
            if (retVal){
            	logger.info('packet write success');
                //io.sockets.connected[id].emit('insertVoiceList', data);

                var query = util.format('update TB_TERMINAL_IMAGE_TRANS set CTN_CNT=IFNULL(CTN_CNT, 0)+%d where CUST_CTN=\'%s\' and CTN_DEVICE=\'%s\' and INSERT_DATE=\'%s\''
                    ,data.voiceList.length, data.MOBILE_NUM, data.CTN_DEVICE, data.INSERT_DATE);
                dbConn.query(query, function (error, results) {

                	logger.info('Query:', query);

                    if (error){
                    	logger.error('DB Error:', error);
                    }else {
                    	//logger.info('DB success');
                    }
                });

                //console.log('socket emit msgEvent / id:', id);
            } else{
            	logger.error('packet write fail');
            }
        });
    });

    socket.on('addSTB', function(data) {
    	logger.info('Add STB event occurred');
    	//logger.info('Receive Data:', data);
        packet = struct.makeData(data.COMMAND, data);

        //logger.info('packet:', packet);
        var retVal = client.write(packet, function(){
            if (retVal){
            	logger.info('packet write success');

                var query = util.format('update TB_TERMINAL_IMAGE_TRANS set STB_CNT=IFNULL(STB_CNT, 0)+%d where CUST_CTN=\'%s\' and CTN_DEVICE=\'%s\' and INSERT_DATE=\'%s\''
                    ,data.stbList.length, data.MOBILE_NUM, data.CTN_DEVICE, data.INSERT_DATE);
                dbConn.query(query, function (error, results) {

                	logger.info('Query:', query);

                    if (error){
                    	logger.error('DB Error:', error);
                    }else {
                    	//logger.info('DB success');
                        //response.send(results);
                    }
                });

                //io.sockets.connected[id].emit('insertSTBList', data);
                logger.info('socket emit msgEvent / id:', id);
            } else{
            	logger.error('packet write fail');
            }
        });
    });

    socket.on('retrySTB', function(data) {
    	logger.info('retrySTB event occurred');
    	//logger.info('Receive Data:', data);
        packet = struct.makeData(data.COMMAND, data);

        //logger.info('packet:', packet);
        var retVal = client.write(packet, function(){
            if (retVal){
            	logger.info('packet write success');

                var query = util.format('update TB_TERMINAL_IMAGE_TRANS set STB_CNT=IFNULL(STB_CNT, 0)+%d where CUST_CTN=\'%s\' and CTN_DEVICE=\'%s\' and INSERT_DATE=\'%s\''
                    ,data.stbList.length, data.MOBILE_NUM, data.CTN_DEVICE, data.INSERT_DATE);
                dbConn.query(query, function (error, results) {

                	logger.info('Query:', query);

                    if (error){
                    	logger.error('DB Error:', error);
                    }else {
                    	//logger.info('DB success');
                        //response.send(results);
                    }
                });

            } else{
            	logger.error('packet write fail');
            }
        });
    });

    socket.on('deleteSTB', function(data) {
    	logger.info('Delete STB event occurred', data);
    	//logger.info('Receive Data:', data);
        packet = struct.makeData(data.COMMAND, data);
        //logger.info('packet:', packet);

        var retVal = client.write(packet, function(){
        });

    });

	socket.on('addMobile', function(data) {
		logger.info('addMobile event occurred');
		packet = struct.makeData(data.COMMAND, data);

		var retVal = client.write(packet, function() {
			logger.info('addMobile packet was sent to Application Server');
		});
	});

	socket.on('deleteMobile', function(data) {
		logger.info('deleteMobile event occurred');
		//logger.info('Receive Data:', data);
		packet = struct.makeData(data.COMMAND, data);
		//logger.info('packet:', packet);

		var retVal = client.write(packet, function() {
			logger.info('deleteMobile packet was sent to Application Server');
		});
	});
	//#2 End

    socket.on('changeSetupEvent', function(data) {

    	logger.info('changeSetupEvent occured');

        packet = struct.makeData(data, '');

        logger.info('make changeSetupEvent message');
        var retVal = client.write(packet, function() {
            if (retVal) {
            	logger.info('changeSetupEvent to AppServer was sent');
            }
        });
    });


	socket.on('socketControl', function(data) {
		logger.info('socketControl event occurred');
		packet = struct.makeData(data.COMMAND, data);

		var retVal = client.write(packet, function() {
			logger.info('socketControl packet was sent to Application Server');
		});
	});


    socket.on('service_close', function(data) {

    	logger.info('service_close occured');

        var resBody = 'MOBILE_NUM='+data.MOBILE_NUM+'&CTN_DEVICE='+data.CTN_DEVICE+'&INSERT_DATE='+data.INSERT_DATE;
        packet = struct.makeData(data.COMMAND, resBody);

        logger.info('make service_close message');
        var retVal = client.write(packet, function() {
            if (retVal) {
            	logger.info('service_close to AppServer was sent');
            }
        });
    });

    socket.on('startStream', function (data) {

        logger.info('startStream event occured!');
        packet = struct.makeData(data.COMMAND, data);

        var retVal = client.write(packet, function () {
            if (retVal) {
                logger.info('startStream event to AppServer was sent');
            }
        });
    });

    socket.on('EndStream', function (data) {

        logger.info('endStream event occured!');
        packet = struct.makeData(data.COMMAND, data);

        var retVal = client.write(packet, function () {
            if (retVal) {
                logger.info('endStream event to AppServer was sent');
            }
        });
    });

    socket.on('Abnormal', function (data) {

        logger.info('Abnormal event occured!');
        packet = struct.makeData(data.COMMAND, data);

        var retVal = client.write(packet, function () {
            if (retVal) {
                logger.info('Abnormal event to AppServer was sent');
            }
        });
    });

    socket.on('log_OperatePCViewer', function (data) {

        var logMsg;
        logMsg = 'OperatePCViewer' + ' [' + data.USER_ID + ']' + '[' + data.DIR + ']' + '[' + data.OPERATE + ']' + '[' + data.PARAM + ']' + ' : ' + data.RESULT;
        logger.info(logMsg);
    });

});


module.exports = io;
