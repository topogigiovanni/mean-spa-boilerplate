'use strict';

const path = require('path');
const fs = require('fs');
const async = require('async');
const curl = require('curlrequest');

const Error = require('../models/Error');
const CustomEvent = require('../models/CustomEvent');
const App = require('../models/App');

const requestHelper = require('../helpers/request');

exports.ensureAppAuthority = function(request, response, next) {
	let appId = request.params.appId || null;
	let isAuthenticated = request.isAuthenticated();

	if (!!appId && !!isAuthenticated) {

		response.cookie('currentAppId', appId);

		var user = request.user;
		App.findOne({
			appId: appId,
			_userId: user._id
		}, function(err, app) {

			if (!app) {
				return response.status(401).send({
					msg: 'App no found'
				});
			}

			request.app = app;

			next();

		});

	} else {
		return response.status(401).send();
	}

}

/**
 * GET /
 */
exports.dashboard = function(request, response) {
	// limpa cookie de primeiro acesso ao index por segurança
	response.cookie('token', '', { expires: new Date() });
	response.send('Dashboard index');
};

/**
 * GET /errors
 */
exports.errors = function(request, response) {
	// limpa cookie de primeiro acesso ao index por segurança
	response.cookie('token', '', { expires: new Date() });
	response.send('Dashboard index');
};

//////////////////////////////////////////////////////////////
/**
 * POST /error
 */
exports.error = function(request, response) {
	let errorData = requestHelper.parseBase64(request.body.data);

	var error = new Error({
		data: errorData.error,
		appId: errorData.id
	});

	error.save(function(err) {
		response.send({
			error: error
		});
	});
};

/**
 * GET /error/:trace
 */
exports.errorTrace = function(request, response) {
	//let errorData = requestHelper.parseBase64(request.params.trace);
	let errorData = request.collectedData;

	var error = new Error({
		data: errorData.data,
		appId: errorData.id
	});

	error.save(function(err) {
		response.writeHead(200, {
			'Content-Type': 'image/gif'
		});

		response.end(fs.readFileSync(path.join(__dirname, '../public/static/images', 'pixel.gif')), 'binary');
	});
};

/**
 * POST /custom
 */
exports.customEvent = function(request, response) {
	//let event = requestHelper.parseBase64(request.body.data);
	let event = request.collectedData;

	var customEvent = new CustomEvent({
		data: event.data.data,
		eventName: event.data.eventName,
		appId: event.id
	});

	customEvent.save(function(err) {
		response.send({
			customEvent: customEvent
		});
	});
};

/**
 * GET /custom/:trace
 */
exports.customEventTrace = function(request, response) {
	//let event = requestHelper.parseBase64(request.params.trace);
	let event = request.collectedData;
	//console.log(event);
	//return;

	var customEvent = new CustomEvent({
		data: event.data.data,
		eventName: event.data.eventName,
		appId: event.id
	});

	customEvent.save(function(err) {
		response.writeHead(200, {
			'Content-Type': 'image/gif'
		});

		response.end(fs.readFileSync(path.join(__dirname, '../public/static/images', 'pixel.gif')), 'binary');
	});
};
