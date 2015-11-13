/**
 * @author: JPush <plusmancn@gmail.com>
 * @Date: 2015-11-13
 * @version: 4.0.0
 */

// 基础推送服务
module.exports.push = require('./lib/JPush/JPush.js');
// 推送队列服务
module.exports.queue = function(){};
// 模块推送性能监控盘
module.exports.dashboard = function(){};
