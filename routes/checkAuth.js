var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var logger = require('../config/logger');
var oracledb = require('oracledb');
var dbConfig = require('../config/dbconfig.js');
var url = require('url');
var java = require('java');
var querystring = require('querystring');

java.classpath.push("./libs/security/security.jar");
var security = java.import("com.iwill.Swan");
security.initSync("./libs/security/VulnerCheckList.xml");


router.all('*', function(req, res, next) {
    if (url.parse(req.url, true).pathname == '/login') {
        next();
    } else if (!req.session.userid) {
        /*
        var sso_id, system_id;
        
        sso_id = req.getHeader('iv-user');
        if (sso_id == null || sso_id === "Unauthenticated") {
            next();
            return;
        }
        system_id = sso_id;
        
        // language type
        var languageType = "KO";
        for (var i = 0; i < req.cookies.length; i++) {
            //var cookieInfo = req.cookies[i];
            var setCookie = false;	    		    
            //if (cookieInfo.getName() === "LPL_LANG") {
            if (typeof req.cookies[i].LPL_LANG !== "undefined") {
                languageType = req.cookies[i].LPL_LANG;
                setCookie = true;
                if(languageType === "1")  {        // English	
                    languageType = "EN";
                } else if(languageType === "2") {  // Chinese	    	
                    languageType = "CN";	    		
                } else if(languageType === "3") {  // polish	
                    languageType = "PL";
                } else if(languageType === "4")  { // Vietnames	
                    languageType = "VH";
                } else { // korean		
                    languageType = "KO";	    		
                }
            }
        }
            
        if (setCookie = false) {
            //Cookie cookie = new Cookie ("LPL_LANG", "0"); // 쿠키값이 없을 경우 기본 한글             
            //req.session.LPL_LANG = "0";
            //cookie.setDomain("*.lgdisplay.com");
            // 5 일간 저장	    	
            //cookie.setMaxAge(5 * 24 * 60 * 60);	       
            //(HttpServletResponse) response).addCookie(cookie);
            res.cookie("LPL_LANG", "0", {domain : "*.lgdisplay.com", maxAge : 5*24*60*60});
        }
        	    		
        // 시스템에 사용할 세션값 설정
        req.session.userid = sso_id;
        req.session.system_id = system_id;
        req.session.system_lang = languageType;
        
        next();
        */
        res.redirect('/login');
    } else {
        next();
    }
});

router.all('*', function(req, res, next) {

    var url_parts;
    if (req.method == 'POST') {
        url_parts = querystring.stringify(req.body);
        var url_parts_nm = url.parse(req.url, true).pathname;
    } else if (req.method == 'GET') {
        url_parts = url.parse(req.url, true);
        var url_parts_nm = url_parts.pathname;
        url_parts = url_parts.search;
        var sub = url_parts.substr(1, 1);
    }
    if (typeof url_parts == "undefined" || url_parts.length == 0 || sub == "_" || url_parts_nm == "/alert/") {
        next();
    } else {
        var params = url_parts.substring(url_parts.indexOf('?') + 1, url_parts.length);
        params = params.split("&");
        var size = params.length;
        var key, value;
        var weakNum = 0;
        var weakWord;
        var returnVal;
        for (var i = 0; i < size; i++) {
            key = params[i].split("=")[0];
            value = params[i].split("=")[1];

            if (key == 'fileName' || key == 'img') {
                returnVal = security.checkSync(value, 0, "common", "filedown");
            } else {
                returnVal = security.checkSync(value, 0, "forEditor", "xss|sqlinjection");
            }
            if (returnVal == "true") {
                logger.info('check url : ' + url_parts_nm + ' check key : ' + key);
                logger.info('weakWord value : ' + decodeURIComponent(value));
                weakNum = 1;
                weakWord = value;
            }
        }
        if (weakNum == 0) {
            next();
        } else {
            console.log("취약점 발견!!");
            logger.info('Security vulnerability ID : ', req.session.userid)
            res.redirect("/logout");
        }
    }
});

module.exports = router;
