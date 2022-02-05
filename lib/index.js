"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PasswordController = (function () {
  function PasswordController(log, service, decrypt) {
    this.log = log;
    this.service = service;
    this.decrypt = decrypt;
    this.change = this.change.bind(this);
    this.reset = this.reset.bind(this);
    this.forgot = this.forgot.bind(this);
  }
  PasswordController.prototype.change = function (req, res) {
    var _this = this;
    var pass = req.body;
    if (!pass.username || pass.username.length === 0 || !pass.password || pass.password.length === 0) {
      return res.status(401).end('username and password cannot be empty');
    }
    if (pass.step && pass.step > 1 && (!pass.passcode || pass.passcode.length === 0)) {
      return res.status(401).end('passcode cannot be empty');
    }
    if (this.decrypt) {
      var p = this.decrypt(pass.password);
      if (p === undefined) {
        return res.status(401).end('cannot decrypt new password');
      } else {
        pass.password = p;
      }
      var o = this.decrypt(pass.currentPassword);
      if (o === undefined) {
        return res.status(401).end('cannot decrypt current password');
      } else {
        pass.currentPassword = o;
      }
    }
    this.service.change(pass)
      .then(function (r) { return res.status(200).json(r).end(); })
      .catch(function (err) { return handleError(err, res, _this.log); });
  };
  PasswordController.prototype.forgot = function (req, res) {
    var _this = this;
    var contact = '';
    if (req.method === 'GET') {
      var i = req.originalUrl.lastIndexOf('/');
      if (i > 0) {
        contact = req.originalUrl.substr(i + 1);
      } else {
        return res.status(401).end('contact cannot be empty');
      }
    } else {
      if (req.body == null || req.body === '') {
        return res.status(401).end('body cannot be empty');
      }
      contact = req.body.contact;
    }
    this.service.forgot(contact)
      .then(function (r) { return res.status(200).json(r).end(); })
      .catch(function (err) { return handleError(err, res, _this.log); });
  };
  PasswordController.prototype.reset = function (req, res) {
    var _this = this;
    var pass = req.body;
    if (!pass.username || pass.username.length === 0) {
      return res.status(401).end('username cannot be empty');
    }
    if (!pass.password || pass.password.length === 0) {
      return res.status(401).end('password cannot be empty');
    }
    if (!pass.passcode || pass.passcode.length === 0) {
      return res.status(401).end('passcode cannot be empty');
    }
    if (this.decrypt) {
      var p = this.decrypt(pass.password);
      if (p === undefined) {
        return res.status(401).end('cannot decrypt new password');
      } else {
        pass.password = p;
      }
    }
    this.service.reset(pass)
      .then(function (r) { return res.status(200).json(r).end(); })
      .catch(function (err) { return handleError(err, res, _this.log); });
  };
  return PasswordController;
}());
exports.PasswordController = PasswordController;
exports.Controller = PasswordController;
exports.PasswordHandler = PasswordController;
exports.Handler = PasswordController;
function handleError(err, res, log) {
  if (log) {
    log(toString(err));
    res.status(500).end('Internal Server Error');
  } else {
    res.status(500).end(toString(err));
  }
}
exports.handleError = handleError;
function toString(v) {
  return typeof v === 'string' ? v : JSON.stringify(v);
}
exports.toString = toString;
