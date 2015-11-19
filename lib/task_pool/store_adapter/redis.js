'use strict';
/**
 * Redis存储
 * created by plusman<liujianan@souche.com>
 * date 2015年11月17日下午4:45
 */
var redis = require('redis');
var CONFIG = require('../../../config/config.js');

function Redis(port,host){
  this.rclient = redis.crateClient(CONFIG.redis.port,CONFIG.redis.host);
}

Redis.prototype.add = function(value){
  var key = CONFIG.kv_prefix + value.pool_id + '_' + value.task_id;
  this.rclient.hset(key,value);
}


