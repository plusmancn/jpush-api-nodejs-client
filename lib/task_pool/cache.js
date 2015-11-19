'use strict';
/**
 * 缓存层
 * created by plusman<liujianan@souche.com>
 * date 2015年11月17日下午1:29
 */

/***==============================内存方式==============================***/
var Memory = require('./store/memory.js');

var storeWayEnum = [
  'memory',
  'mongo',
  'redis',
  'memorycache'
];

function Cache(storeWay){
  storeWay = storeWay.toLowerCase();
  if(storeWayEnum.indexOf(storeWay) === -1){
    return throw new Error('only support '  + storeWayEnum.join(',') + 'storeWay');
  }

  switch(storeWay){
    case 'memory':
      this.flash = new Memory();
      break;
  }
}

Cache.prototype.add = function(value){
  this.flash.add(value);
};

module.exports = Cache;

