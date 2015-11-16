'use strict';
/**
 * @desc md5 hash 性能测试
 */

var crypto = require('crypto');
var DEBUG_MD5 = require('debug')('md5');

console.time('15W MD5 TEST');
for(let i=0;i<5e5;i++){
  var md5 = crypto.createHash('md5');
  md5.update('18667903755');
  var result = md5.digest('hex');
  DEBUG_MD5('Time %d was %s',i,result);
}
console.timeEnd('15W MD5 TEST');

// 关闭log，时间在 700ms左右，性能还是很ok的。
