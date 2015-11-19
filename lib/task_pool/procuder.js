'use strict';
/**
 * 任务信息描述
 * created by plusman<liujianan@souche.com>
 * date 2015年11月16日下午8:39
 */

var Cache = require('./cache.js');
var cacheMemory = new Cache('memory');

// 任务过期时间，默认48小时
var cacheExpireTime = 2 * 24 * 3600e3;

function Producer(pool_id, task_id ,body){
  this.pool_id = pool_id || undefined; // 归属于哪个任务池
  this.task_id = task_id || undefined;
  this.is_done = false; // 任务是否完成
  this.expire_time = ( (Date.now() + cacheExpireTime)/1000 ).toFixed(0); // 过期时间，unix时间戳
  this.body = body || {};
}

/**
 * @desc 设置任务已经完成
 */
Producer.prototype.setDone = function(){

}

/**
 * @desc 删除任务
 */
Producer.prototype.delete = function(){

}

/**
 * @desc 添加任务
 */
Producer.prototype.save = function(){
  cacheMemory.add({
    pool_id:this.pool_id,
    task_id:this.task_id,
    is_done:this.is_done,
    expire_time:this.expire_time,
    body:this.body
  });
}

/**
 * @desc 更新任务
 */
Producer.prototype.update = function(){

}

/**
 * @desc 删除任务
 */
Producer.prototype.delete = function(){

}

module.exports = Producer;
