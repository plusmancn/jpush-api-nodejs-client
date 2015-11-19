'use strict';
/**
 * 内存适配器
 * created by plusman<liujianan@souche.com>
 * date 2015年11月17日下午1:35
 */
function Memory(){
  this.flash = [];
}

Memory.prototype.add = function(value){
  this.flash.push(value);
};

