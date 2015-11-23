var JError = require('./JPushError');
var Request = require('request');
var JModel = require('./PushPayload');
var JUtil = require('./util.js');

var PUSH_API_URL = 'https://api.jpush.cn/v3/push';
var REPORT_API_URL = 'https://report.jpush.cn/v3';
var REPORT_RECEVIED = "/received";
var REPORT_USER = "/users";
var REPORT_MESSAGE = "/messages";
var USER_AGENT = 'JPush-API-NodeJS-Client';
var HOST_NAME_SSL = "https://device.jpush.cn";
var DEVICE_PATH = "/v3/devices";
var TAG_PATH = "/v3/tags";
var ALIAS_PATH = "/v3/aliases";
var VALIDATE = "/validate";
var CONNECT_TIMEOUT = 5 * 1000;
var DEFAULT_MAX_RETRY_TIMES = 3;
var READ_TIMEOUT = 30 * 1000;
// Pattern
var PUSH_PATTERNS = /^[a-zA-Z0-9]{24}/;
var MSG_IDS_PATTERNS = /[^\d,]/;

exports.buildClient = function(appKey, masterSecret ,clientAlias, retryTimes) {
  return new JPushClient(appKey, masterSecret, clientAlias, retryTimes);
};

/**
 * @desc 建立推送客户端
 * @param {String} appKey 应用key
 * @param {String} masterSecret 密匙
 * @param {String} clientAlias 应用别名
 * @param {Integer} retryTimes 重发次数
 */
function JPushClient(appKey, masterSecret, clientAlias, retryTimes ) {
    if (!appKey || !masterSecret) {
        throw JError
                .InvalidArgumentError('appKey and masterSecret are both required.');
    }

    if (typeof appKey !== 'string' || typeof masterSecret !== 'string'
            || !PUSH_PATTERNS.test(appKey) || !PUSH_PATTERNS.test(masterSecret)) {

        throw new JError.InvalidArgumentError(
                'appKey and masterSecret format is incorrect. '
                        + 'They should be 24 size, and be composed with alphabet and numbers. '
                        + 'Please confirm that they are coming from JPush Web Portal.');

    }
    this.appkey = appKey;
    this.masterSecret = masterSecret;
    this.clientAlias = clientAlias;

    if (retryTimes) {
        if (typeof retryTimes != 'number') {
            throw JError.InvalidArgumentError("Invalid retryTimes.");
        }
        this.retryTimes = retryTimes;
    } else {
        this.retryTimes = DEFAULT_MAX_RETRY_TIMES;
    }
    // 待移除字段
    this.isDebug = true;
}

/**
 * create a push payload
 *
 * @returns {exports.PushPayload}
 */
function push() {
    return new JModel.PushPayload(this);
}

function sendPush(payload, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    return _request(PUSH_API_URL, payload, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'POST', 1, this.retryTimes, this.clientAlias, callback);
}


/**
 * @desc 送达统计封装
 */
function getReportReceiveds(msg_ids, callback) {
  msg_ids = JUtil.arrayJoinComma(msg_ids);
  if (MSG_IDS_PATTERNS.test(msg_ids)) {
      throw new JError.InvalidArgumentError(
              'Invalid msg_ids, msg_ids should be composed with alphabet and comma.');
  }
  var header = {
      'User-Agent' : USER_AGENT,
      'Connection' : 'Keep-Alive',
      'Charset' : 'UTF-8',
      'Content-Type' : 'application/json'
  };
  var url = REPORT_API_URL + REPORT_RECEVIED + '?msg_ids=' + msg_ids;
  return _request(url, null, header, {
      user : this.appkey,
      pass : this.masterSecret
  }, 'GET', 1, this.retryTimes, this.isDebug, callback);
}

/**
 * @desc 消息统计（vip）
 */
function getReportMessages(msg_ids, callback) {
  msg_ids = JUtil.arrayJoinComma(msg_ids);
  if (MSG_IDS_PATTERNS.test(msg_ids)) {
        throw new JError.InvalidArgumentError(
                'Invalid msg_ids, msg_ids should be composed with alphabet and comma.');
    }
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = REPORT_API_URL + REPORT_MESSAGE + '?msg_ids=' + msg_ids;
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'GET', 1, this.retryTimes, this.isDebug, callback);
}

/**
 * @desc 用户统计（vip）
 */
function getReportUsers(timeUnit, start, duration, callback) {
  var header = {
          'User-Agent' : USER_AGENT,
          'Connection' : 'Keep-Alive',
          'Charset' : 'UTF-8',
          'Content-Type' : 'application/json'
      };
      var url = REPORT_API_URL + REPORT_USER + '?time_unit=' + timeUnit + '&start=' + start + '&duration=' + duration;
      return _request(url, null, header, {
          user : this.appkey,
          pass : this.masterSecret
      }, 'GET', 1, this.retryTimes, this.isDebug, callback);

}
/**
 * device api
 *
 * @param registrationId
 */
function getDeviceTagAlias(registrationId, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + DEVICE_PATH + "/" + registrationId;
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'GET', 1, this.retryTimes, this.isDebug, callback);
}


function updateDeviceTagAlias(registrationId, alias, clearTag, tagsToAdd,
        tagsToRemove, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + DEVICE_PATH + "/" + registrationId;
    if (tagsToAdd instanceof Array && tagsToRemove instanceof Array) {
        var json = {};
        var tags = {};
        if (alias != null) {
            json['alias'] = alias;
        }
        if (clearTag) {
            json['tags'] = '';
        } else {
            if (tagsToAdd != null && tagsToAdd.length > 0) {
                tags['add'] = tagsToAdd
            }
            if (tagsToRemove != null && tagsToRemove.length > 0) {
                tags['remove'] = tagsToRemove
            }
            json['tags'] = tags;
            console.log(json)
        }
    } else {
        throw new JError.InvalidArgumentError(
                'tagsToAdd or tagsToRemove type should be array');
    }
    return _request(url, JSON.stringify(json), header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'POST', 1, this.retryTimes, this.isDebug, callback);
}

function getTagList(callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + TAG_PATH ;
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'GET', 1, this.retryTimes, this.isDebug, callback);
}

function isDeviceInTag(theTag, registrationID, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + TAG_PATH + "/" + theTag
            + "/registration_ids/" + registrationID;
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'GET', 1, this.retryTimes, this.isDebug, callback);
}

function addRemoveDevicesFromTag(theTag, toAddUsers, toRemoveUsers, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + TAG_PATH + "/" + theTag;
    var registration_ids = {};
    if (null != toAddUsers && toAddUsers.length > 0) {
        registration_ids['add'] = toAddUsers;
    }
    if (null != toRemoveUsers && toRemoveUsers.length > 0) {
        registration_ids['remove'] = toRemoveUsers;
    }
    var json = {};
    json['registration_ids'] = registration_ids;
    return _request(url, JSON.stringify(json), header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'POST', 1, this.retryTimes, this.isDebug, callback);
}

function deleteTag(theTag, platform, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + TAG_PATH + "/" + theTag;
    if (null != platform) {
        url += "/?platform=" + platform;
    }
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'delete', 1, this.retryTimes, this.isDebug, callback);
}

function getAliasDeviceList(alias, platform, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + ALIAS_PATH + "/" + alias;
    if (null != platform) {
        url += "/?platform=" + platform;
    }
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'GET', 1, this.retryTimes, this.isDebug, callback);
}

function deleteAlias(alias, platform, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    var url = HOST_NAME_SSL + ALIAS_PATH + "/" + alias;
    if (null != platform) {
        url += "/?platform=" + platform;
    }
    return _request(url, null, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'delete', 1, this.retryTimes, this.isDebug, callback);
}

function validate(payload, callback) {
    var header = {
        'User-Agent' : USER_AGENT,
        'Connection' : 'Keep-Alive',
        'Charset' : 'UTF-8',
        'Content-Type' : 'application/json'
    };
    return _request(PUSH_API_URL + VALIDATE, payload, header, {
        user : this.appkey,
        pass : this.masterSecret
    }, 'POST', 1, this.retryTimes, this.isDebug, callback);
}

/**
 * @desc 网络请求工厂函数
 */
function _request(url, body, headers, auth, method, times, maxTryTimes, clientAlias, callback) {
    JUtil.DEBUG_INFO("Push URL :" + url);
    if (body){
        JUtil.DEBUG_INFO("Body :" + body);
    }
    JUtil.DEBUG_INFO("Headers :" + JSON.stringify(headers));
    JUtil.DEBUG_INFO("Auth :" + JSON.stringify(auth));
    JUtil.DEBUG_INFO("Method :" + method);
    JUtil.DEBUG_INFO("Times/MaxTryTimes : " + times + "/" + maxTryTimes);

    var _callback = function(err, res, body) {
      var extInfo = {
        'x-rate-limit-limit': res.headers['x-rate-limit-limit'],
        'x-rate-limit-remaining': res.headers['x-rate-limit-remaining'],
        'x-rate-limit-reset': res.headers['x-rate-limit-reset'],
      };
      if (err) {
          if (err.code == 'ETIMEDOUT' && err.syscall != 'connect') {
              // response timeout
              return callback(new JError.APIConnectionError(
                      'Response timeout. Your request to the server may have already received, please check whether or not to push',
                      true));
          } else if (err.code == 'ENOTFOUND') {
              // unknown host
              return callback(new JError.APIConnectionError('Known host : '
                      + url));
          }
          // other connection error
          if (times < maxTryTimes) {
              return _request(url, body, headers, auth, method, times + 1,
                      maxTryTimes, isDebug, callback);
          } else {
              return callback(new JError.APIConnectionError(
                      'Connect timeout. Please retry later.'));
          }
      }
      if (res.statusCode == 200) {
        if (body.length != 0) {
            JUtil.DEBUG_INFO("Push Success, response : " + body);
            JUtil.DEBUG_INFO('X-Rate-Limit : %j',extInfo);
            return callback(null, body, extInfo);
        } else {
            JUtil.DEBUG_INFO("Push Success, response : " + body);
            return callback(null, 200);
        }
      } else {
        JUtil.DEBUG_INFO("Push Fail, HttpStatusCode: " + res.statusCode + " result: " + JSON.stringify(body));
        body.app_name = clientAlias;
        callback(Error.apiError(JSON.stringify(body),body.error.code));
      }
    };

    Request({
        url : url,
        body : body,
        method:method.toUpperCase(),
        auth : {
            user : auth.user,
            pass : auth.pass
        },
        headers : headers,
        timeout : READ_TIMEOUT,
        json:true
    }, _callback);

}

JPushClient.prototype.sendPush = sendPush;
JPushClient.prototype.getReportReceiveds = getReportReceiveds;
JPushClient.prototype.push = push;
JPushClient.prototype.getDeviceTagAlias = getDeviceTagAlias;
JPushClient.prototype.updateDeviceTagAlias = updateDeviceTagAlias;
JPushClient.prototype.getTagList = getTagList;
JPushClient.prototype.isDeviceInTag = isDeviceInTag;
JPushClient.prototype.addRemoveDevicesFromTag = addRemoveDevicesFromTag;
JPushClient.prototype.deleteTag = deleteTag;
JPushClient.prototype.getAliasDeviceList = getAliasDeviceList;
JPushClient.prototype.deleteAlias = deleteAlias;
JPushClient.prototype.validate = validate;
JPushClient.prototype.getReportMessages = getReportMessages;
JPushClient.prototype.getReportUsers = getReportUsers;
// exports constants and methods
exports.ALL = JModel.ALL;
exports.DISABLE_SOUND = JModel.DISABLE_SOUND;
exports.DISABLE_BADGE = JModel.DISABLE_BADGE;
exports.tag = JModel.tag;
exports.tag_and = JModel.tag_and;
exports.alias = JModel.alias;
exports.registration_id = JModel.registration_id;
exports.ios = JModel.ios;
exports.android = JModel.android;
exports.winphone = JModel.winphone;
// error
exports.APIConnectionError = JError.APIConnectionError;
exports.APIRequestError = JError.APIRequestError;
exports.InvalidArgumentError = JError.InvalidArgumentError;
