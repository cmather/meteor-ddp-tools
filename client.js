#!/usr/bin/env node

var DDPClient = require('ddp')
  , readline = require('readline')
  , client
  , util = require('util');

if (process.platform === 'win32') {
  var rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', function () {
    process.emit('SIGINT');
  });
}

var Client = function (onConnect) {
  if (!(this instanceof Client))
    return new Client(onConnect);

  DDPClient.prototype.constructor.call(this, {
    host: process.env.DDP_HOST,
    port: +process.env.DDP_PORT,
    path: process.env.DDP_PATH,
    use_ssl: process.env.DDP_USE_SSL == 'false' ? false : true,
    auto_reconnect: process.env.DDP_AUTO_RECONNECT == 'false' ? false : true,
    auto_reconnect_timer: +process.env.DDP_AUTO_RECONNECT_TIMER
  });

  this.setup(onConnect);
};

util.inherits(Client, DDPClient);

Client.prototype.close = function () {
  console.log('');
  console.log('Closing DDP connection');
  DDPClient.prototype.close.call(this);
};

Client.prototype.setup = function (onConnect) {
  var client = this;

  this.connect(function (err) {
    if (err) {
      console.log('Connection error: ', err);
      process.exit(1);
    }

    return onConnect.call(this);
  });

  this.on('message', function (msg) {
    console.log('[msg]: ' + msg);
  });

  this.on('socket-close', function (code, message) {
    console.log('[socket closed]: ', code, message);
    process.exit(1);
  });

  this.on('socket-error', function (error) {
    console.log('[socket error]: ', error && error.toString());
    process.exit(1);
  });

  process.on('SIGINT', function () {
    client.close();
  });
};

module.exports = Client;
