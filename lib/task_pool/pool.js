'use strict';
/**
 * 任务池
 * created by plusman<liujianan@souche.com>
 * date 2015年11月16日下午8:39
 */

var JUtil = require('../JPush/util.js');
var Producer = require('./procuder.js');

function Pool(pool_id,maxLength,speed,cacheLayer){
  this.maxLength = maxLength;
  this.AddCounter = 1;
  this.speed = 4000 || speed; // 每间隔1000ms触发函数
  this.ToID = undefined; // 定时器当前ID
  this.pool_id = pool_id;
}

/***==============================控制器==============================***/
/**
 * @desc 获取任务进程负荷
 */
Pool.prototype.getLoad = function(){
  return {
    speed:this.speed
  };
}

/**
 * @desc 暂停任务池
 */
Pool.prototype.pause = function(){
  clearTimeout(this.ToID);
}

/**
 * @desc 继续任务
 * @param {Function} hook 任务池会根据speed定时触发hook
 * @param {Integer} speed 触发间隔
 */
Pool.prototype.start = function(hook){
  this.timer(hook);
}

/**
 * @desc 关闭任务池，取消任务
 */
Pool.prototype.stop = function(){
  this.pause();
}

/**
 * @desc 设置消费速率
 * @param {Integer} speed 触发间隔
 */
Pool.prototype.setSpeed = function(speed){
  this.speed = speed;
}

/**
 * @desc 加快消费速率
 * @param {Integer} Rise 升幅
 */
Pool.prototype.higherSpeed = function(Rise){
  this.speed -= Rise;
}

/**
 * @desc 减慢消费速率
 * @param {Integer} Drop 降幅
 */
Pool.prototype.lowerSpeed = function(Drop){
  this.speed += Drop;
}

/**
 * @desc 定时器
 * @param {Function} hook 任务池会根据speed定时触发hook
 */
Pool.prototype.timer = function(hook){
  this.ToID = setTimeout(this.timer.bind(this), this.speed,hook);
  JUtil.DEBUG_INFO(this.ToID);
  hook(this.ToID);
};


/***==============================任务描述==============================***/
/**
 * @desc 添加任务
 */
Pool.prototype.addTask = function(body,callback){
  new Producer(this.pool_id,body).save();
};

module.exports = Pool;
