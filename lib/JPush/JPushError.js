/**
 * JPush Error
 */


exports.APIConnectionError = APIConnectionError;
exports.APIRequestError = APIRequestError;
exports.InvalidArgumentError = InvalidArgumentError;


function APIConnectionError(message, isResponseTimeout) {
    Error.call(this, message);
    this.name = "APIConnectionError";
    this.message = message;
    this.isResponseTimeout = isResponseTimeout || false;
}



function APIRequestError(httpCode, response) {
    var message = "Push Fail, HttpStatusCode: " + httpCode + " result: " + JSON.stringify(response);
    Error.call(this, message);
    this.name = "APIRequestError";
    this.message = message;
    this.httpCode = httpCode;
    this.response = response;
}


function InvalidArgumentError(message) {
    Error.call(this, message);
    this.name = "InvalidArgumentError";
    this.message = message;
}


/***==============================新版==============================***/
var APIError = function(msg, code){
  this.name = 'APIError';
  this.message = msg || 'APIError';
  this.code = code || null;
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
};
APIError.prototype.__proto__ = Error.prototype;
Error.apiError = function(msg, code){
   return new APIError(msg, code);
}
exports.APIError = APIError;


var ValidateError = function(msg, code) {
    this.name = 'ValidateError';
    this.message = msg || 'ValidateError';
    this.code = code || null;
};
ValidateError.prototype.__proto__ = Error.prototype; /* jshint ignore: line */
Error.validateError = function(msg, code) {
    return new ValidateError(msg, code);
};
exports.ValidateError = ValidateError;
