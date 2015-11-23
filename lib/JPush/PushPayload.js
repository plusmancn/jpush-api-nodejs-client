/**
 * PushPayload
 */

var JError = require('./JPushError');
var JUtil = require('./util');
var _ = require('lodash');


function PushPayload(client) {
    this.client = client;
    this.payload = {};
}


function setPlatform() {
    if (arguments.length < 1) {
        throw new JError.InvalidArgumentError("platform's args cannot all be null");
    }
    var platform, i;
    if (arguments.length == 1 && arguments[0] === ALL) {
        platform = ALL;
    } else if (arguments.length == 1 && typeof  arguments[0] == 'object') {
        platform = [];
        for(i=0; i<arguments[0].length; i++) {
            if (VALID_DEVICE_TYPES.indexOf(arguments[0][i]) != -1) {
                if (platform.indexOf(arguments[0][i]) == -1) {
                    platform.push(arguments[0][i]);
                }
            } else {
                throw new JError.InvalidArgumentError("Invalid device type '" + arguments[0][i] + "', platform can only be set to 'android', 'ios' or 'winphone'");
            }
        }
    } else {
        platform = [];
        for(i=0; i<arguments.length; i++) {
            if (VALID_DEVICE_TYPES.indexOf(arguments[i]) != -1) {
                if (platform.indexOf(arguments[i]) == -1) {
                    platform.push(arguments[i]);
                }
            } else {
                throw new JError.InvalidArgumentError("Invalid device type '" + arguments[i] + "', platform can only be set to 'android', 'ios' or 'winphone'");
            }
        }
    }
    this.payload = JUtil.extend(this.payload, {'platform' : platform});
    return this;
}


function buildAudience(args, title) {
    if (args.length < 1) {
        throw new JError.InvalidArgumentError("Should be set at least ont " + title);
    }
    var payload = [], i;
    if (args.length == 1 && typeof args[0] === 'string') {
        var tags_t = args[0].split(',');
        for (i=0; i<tags_t.length; i++) {
            if (tags_t[i].trim().length > 0) {
                payload.push(tags_t[i].trim());
            }
        }
        if (payload.length < 1) {
            throw new JError.InvalidArgumentError("Should be set at least ont " + title);
        }
    } else if (args.length == 1 && Array.isArray(args[0])) {
        for (i=0; i< args[0].length; i++) {
            if (typeof args[0][i] != 'string') {
                throw new JError.InvalidArgumentError("Invalid " + title + ' at index ' + i + ', ' +  title + ' can only be set to the String');
            }
            payload.push(args[0][i]);
        }
    } else {
        for (i=0; i<args.length; i++) {
            if (typeof args[i] != 'string') {
                throw new JError.InvalidArgumentError("Invalid " + title + ' at argument ' + i + ', ' +  title + ' can only be set to the String');
            }
            payload.push(args[i]);
        }
    }
    return payload;
}

/**
 * @desc 支持逗号分隔的字符串，数组，字符串类型。
 */
function alias() {
    return {'alias' : buildAudience(arguments, 'alias')};
}

function tag() {
    return {'tag' : buildAudience(arguments, 'tag')};
}

function tag_and() {
    return {'tag_and' : buildAudience(arguments, 'tag_and')};
}

function registration_id () {
    return {'registration_id' : buildAudience(arguments, 'registration_id')};
}

function setAudience() {
    if (arguments.length < 1) {
        throw new JError.InvalidArgumentError("audience must be set");
    }
    var audience;
    if (arguments.length  == 1 && arguments[0] === ALL) {
        audience = ALL;
    } else {
        audience = {};
        for (var i=0; i<arguments.length; i++) {
            audience = JUtil.extend(audience, arguments[i]);
        }
    }
    this.payload = JUtil.extend(this.payload, {'audience' : audience});
    return this;
}

function android(alert, title, builder_id, extras) {
    if (!alert || typeof alert != 'string') {
        throw new JError.InvalidArgumentError("android.alert is require and can only be set to the String");
    }
    var android = {'alert' : alert};

    if (title != null) {
        if (typeof title != 'string') {
           throw new JError.InvalidArgumentError("Invalid android.title, it can only be set to the String");
        }
        android['title'] = title;
    }

    if (builder_id != null) {
        if (typeof builder_id != 'number') {
            throw new JError.InvalidArgumentError("Invalid android.builder_id, it can only be set to the Number");
        }
        android['builder_id'] = builder_id;
    }

    if (extras != null) {
        if (typeof extras != 'object') {
            throw new JError.InvalidArgumentError("Invalid android.extras");
        }
        android['extras'] = extras;
    }
    return {'android' : android};
}

function ios(alert, sound, badge, contentAvailable, extras, category) {
    if (!alert || typeof alert != 'string') {
        throw new JError.InvalidArgumentError("ios.alert is require and can only be set to the String");
    }
    var ios = {'alert' : alert};

    if (sound != null) {
        if (typeof sound != 'string') {
            throw new JError.InvalidArgumentError("Invalid ios.sound, it can only be set to the String");
        }
        if (sound != DISABLE_SOUND) {
            ios['sound'] = sound;
        }
    } else {
        ios['sound'] = "";
    }

    if (badge != null) {
        if (badge != DISABLE_BADGE) {
            ios['badge'] = badge;
        }
    } else {
        ios['badge'] = '+1';
    }

    if (contentAvailable != null) {
        if (typeof contentAvailable != 'boolean') {
            throw new JError.InvalidArgumentError("Invalid ios.contentAvailable, it can only be set to the Boolean");
        }
        if (contentAvailable) {
            ios['content-available'] = 1;
        }
    }

    if (extras != null) {
        if (typeof extras != 'object') {
            throw new JError.InvalidArgumentError("Invalid ios.extras");
        }
        ios['extras'] = extras;
    }
    if (category != null) {
    	ios['category'] = category;
    }
    return {"ios" : ios};
}

function winphone(alert, title, openPage, extras) {
    if (!alert || typeof alert != 'string') {
        throw new JError.InvalidArgumentError("winphone.alert is require and can only be set to the String");
    }

    var winphone = {'alert' : alert};

    if (title != null) {
        if (typeof title != 'string') {
            throw new JError.InvalidArgumentError("Invalid winphone.title, it can only be set to the String");
        }
        winphone['title'] = title;
    }

    if (openPage != null) {
        if (typeof openPage != 'string') {
            throw new JError.InvalidArgumentError("Invalid winphone.openPage, it can only be set to the String");
        }
        winphone['_open_page'] = openPage;
    }

    if (extras != null) {
        if (typeof extras != 'object') {
            throw new JError.InvalidArgumentError("Invalid winphone.extras");
        }
        winphone['extras'] = extras;
    }

    return {'winphone' : winphone};
}

/**
 * @desc 设置notification主体
 * @param {String} args.alert 通知标题
 * IOS 参数合集
 * @param {Boolean} `args.ios.content-available` 推送唤醒
 * @param {String} args.ios.category 通知栏交互索引
 * @param {String} args.ios.extras.p 协议
 * Android 参数合集
 * @param {String} args.android.extras.p 协议
 * @param {String} args.android.extras.dev 是否是开发环境
 */
function setNotification(args) {
  var notification = this.payload.notification || {
    alert:'a message send by jpush-api-nodejs-client-plus'
  };

  notification = _.defaultsDeep(args,notification);
  this.payload = JUtil.extend(this.payload, {'notification' : notification});
  return this;
}

/**
 * @desc 设置消息自定义体
 * @param {String} msg_content 消息内容
 * @param {String} title 标题
 * @param {String} content_type 类型
 * @param {JSON} extras 拓展字段
 */
function setMessage(args) {
  var message = this.payload.message || {};
  message = _.defaultsDeep(args,message);
  this.payload = JUtil.extend(this.payload, {'message' : message});
  return this;
}

function generateSendno() {
    return(MIN_SENDNO + Math.round(Math.random() * (MAX_SENDNO - MIN_SENDNO)));
}

/**
 * @desc 参数改成字典样式，
 * @param options.sendno
 * @param options.time_to_live
 * @param options.override_msg_id
 * @param options.apns_production
 * @param options.big_push_duration
 */
function setOptions(args) {
    var options = this.payload.options || {
      sendno:generateSendno(),
      apns_production:false,
    };
    options = _.defaultsDeep(args,options);
    this.payload = JUtil.extend(this.payload, {'options' : options});
    return this;
}

function toJSON() {
    /*
    if (this.payload.notification && this.payload.notification.ios) {
        this.payload.notification.ios = JUtil.extend({'sound':'', badge:1}, this.payload.notification.ios);
    }
    */
    this.payload.options = JUtil.extend({'sendno':generateSendno(), 'apns_production':false}, this.payload.options);

    return JSON.stringify(this.payload);
}

function send(callback) {
    validate(this.payload);
    var body = this.toJSON();
    return this.client.sendPush(body, callback);
}

function sendValidate(callback) {
	validate(this.payload);
	var body = this.toJSON();
	return this.client.validate(body, callback);
}
/**
 * Verify the payload legitimacy, it will call by this.send()
 * @param payload
 */
function validate(payload) {
    JUtil.DEBUG_INFO('validate payload %j',payload);
    var notification = payload.notification,
        message = payload.message;
    if (!notification && !message) {
        throw new JError.InvalidArgumentError('Either or both notification and message must be set.');
    }
}

function calculateLength(str) {
    var ch, st, re = [];
    for (var i = 0; i < str.length; i++ ) {
        ch = str.charCodeAt(i);
        st = [];
        do {
            st.push( ch & 0xFF );
            ch = ch >> 8;
        }
        while ( ch );
        re = re.concat( st.reverse() );
    }
    // return an array of bytes
    return re.length;
}

function isIosExceedLength() {
    var ios,
        notification = this.payload.notification,
        message = this.payload.message;
    var alert = notification.alert ? notification.alert : '';
    ios = calculateLength(JSON.stringify(JUtil.extend({'alert': alert}, notification.ios)));

    if (message != null) {
        var msgLen = calculateLength(JSON.stringify(message));
        return msgLen >= 1000;
    }
    return ios >= 2000;
}

function isGlobalExceedLength(){
    var android = 0, winphone = 0, ios = false;
    var notification = this.payload.notification,
        message = this.payload.message,
        platform = this.payload.platform;

    var hasIOS = true;
    if (platform != ALL) {
        hasIOS = false;
        for (var i=0; i<platform.length; i++) {
            if (platform[i] == 'ios') {
                hasIOS = true;
                break;
            }
        }
    }

    if (hasIOS) {
        ios = this.isIosExceedLength();
    }

    if (notification != null) {
        var alert = notification.alert ? notification.alert : '';
        winphone = calculateLength(JSON.stringify(JUtil.extend({'alert': alert}, notification.winphone)));
        android = calculateLength(JSON.stringify(JUtil.extend({'alert': alert}, notification.android)));
    }
    if (message != null) {
        var msg_length = calculateLength(JSON.stringify(message));
        winphone += msg_length;
        android += msg_length;
    }
    return ios || winphone > 1000 || android > 1000;
}




// ------ PushPayload prototype
PushPayload.prototype.setPlatform = setPlatform;
PushPayload.prototype.setAudience = setAudience;
PushPayload.prototype.setNotification = setNotification;
PushPayload.prototype.setMessage = setMessage;
PushPayload.prototype.setOptions = setOptions;
PushPayload.prototype.toJSON = toJSON;
PushPayload.prototype.send = send;
PushPayload.prototype.isIosExceedLength = isIosExceedLength;
PushPayload.prototype.isGlobalExceedLength = isGlobalExceedLength;
PushPayload.prototype.sendValidate = sendValidate;
// ------ private constant define ------
var VALID_DEVICE_TYPES = ["ios", "android", "winphone"];
var DISABLE_SOUND = 'DISABLE_SOUND'
var DISABLE_BADGE = -1;
var MIN_SENDNO = 100000;
var MAX_SENDNO = 4294967294;
var ALL = 'all';

// ------ exports constants and methods -------
exports.ALL = ALL;
exports.DISABLE_SOUND = DISABLE_SOUND;
exports.DISABLE_BADGE = DISABLE_BADGE;
exports.tag = tag;
exports.tag_and = tag_and;
exports.alias = alias;
exports.registration_id = registration_id;
exports.ios = ios;
exports.android = android;
exports.winphone = winphone;
//class
exports.PushPayload = PushPayload;




