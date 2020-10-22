"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/* eslint-disable import/first */
// @ts-nocheck
var dotenv_1 = require("dotenv");
var path = require("path");
if (process.env.PROD) {
    dotenv_1["default"].config({ path: path.resolve(__dirname, '../', 'secrets', '.env.production') });
}
else {
    dotenv_1["default"].config({ path: path.resolve(__dirname, '../', 'secrets', '.env.development') });
}
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var soundcloud_downloader_1 = require("soundcloud-downloader");
var body_parser_1 = require("body-parser");
var axios_1 = require("axios");
var bluebird_1 = require("bluebird");
var app = express_1["default"]();
var axiosInstance = axios_1["default"].create({
    timeout: parseInt(process.env.AXIOS_TIMEOUT)
});
soundcloud_downloader_1["default"].setAxiosInstance(axiosInstance);
app.use(body_parser_1["default"].json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});
var appendURL = function (url) {
    var params = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        params[_i - 1] = arguments[_i];
    }
    var u = new URL(url);
    params.forEach(function (val, idx) {
        if (idx % 2 === 0)
            u.searchParams.append(val, params[idx + 1]);
    });
    return u.href;
};
var getMediaURL = function (url, clientID) { return __awaiter(void 0, void 0, Promise, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axiosInstance.get(appendURL(url, 'client_id', clientID), {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
                        Accept: '*/*',
                        'Accept-Encoding': 'gzip, deflate, br'
                    },
                    withCredentials: true
                })];
            case 1:
                res = _a.sent();
                if (!res.data.url)
                    throw new Error("Invalid response from Soundcloud. Check if the URL provided is correct: " + url);
                return [2 /*return*/, res.data.url];
        }
    });
}); };
var getMediaURLMany = function (clientID, tracks, concurrency) {
    if (concurrency === void 0) { concurrency = 15; }
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bluebird_1["default"].map(tracks, function (track) { return __awaiter(void 0, void 0, void 0, function () {
                    var url;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, getMediaURL(track.url, clientID)];
                            case 1:
                                url = _a.sent();
                                return [2 /*return*/, { title: track.title, url: url, hls: track.hls }];
                        }
                    });
                }); }, { concurrency: concurrency })];
        });
    });
};
var getImgURL = function (url) {
    if (!url)
        return false;
    return url.slice(0, url.lastIndexOf('-')).concat('-t500x500.jpg');
};
app.post('/track', [express_validator_1.body('url').not().isEmpty().isURL().trim()], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _body, trackInfo, media, mediaURL, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _body = req.body;
                if (!soundcloud_downloader_1["default"].isValidUrl(_body.url)) {
                    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, soundcloud_downloader_1["default"].getInfo(_body.url)];
            case 2:
                trackInfo = _a.sent();
                media = trackInfo.media.transcodings[0];
                return [4 /*yield*/, getMediaURL(media.url, soundcloud_downloader_1["default"]._clientID)];
            case 3:
                mediaURL = _a.sent();
                res.status(200).json({ url: mediaURL, title: trackInfo.title, author: trackInfo.user, imageURL: getImgURL(trackInfo.artwork_url) || getImgURL(trackInfo.user.avatar_url) });
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                if (err_1.code === 'ECONNABORTED') {
                    res.status(408);
                    return [2 /*return*/];
                }
                res.status(500);
                res.send({ err: 'Internal server error occurred' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/playlist', [express_validator_1.body('url').not().isEmpty().isURL().trim()], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _body, setInfo, urls, mediaURLS, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _body = req.body;
                if (!(_body.url.includes('playlist') || _body.url.includes('sets'))) {
                    res.status(422).json({ err: 'URL is not a playlist' });
                    return [2 /*return*/];
                }
                if (!soundcloud_downloader_1["default"].isValidUrl(_body.url)) {
                    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, soundcloud_downloader_1["default"].getSetInfo(_body.url)];
            case 2:
                setInfo = _a.sent();
                if (setInfo.tracks.length > 100) {
                    res.status(403).send({ err: 'That playlist has too many tracks', count: setInfo.tracks.length });
                    return [2 /*return*/];
                }
                urls = setInfo.tracks.map(function (track) { return ({
                    title: track.title,
                    url: track.media.transcodings[0].url,
                    hls: !track.media.transcodings[0].url.includes('progressive')
                }); });
                return [4 /*yield*/, getMediaURLMany(soundcloud_downloader_1["default"]._clientID, urls)];
            case 3:
                mediaURLS = _a.sent();
                res.status(200).json({ url: _body.url, title: setInfo.title, tracks: mediaURLS, author: setInfo.user, imageURL: getImgURL(setInfo.artwork_url) || getImgURL(setInfo.user.avatar_url) });
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                if (err_2.code === 'ECONNABORTED') {
                    res.status(408);
                    return [2 /*return*/];
                }
                console.log(err_2);
                res.status(500);
                res.send({ err: 'Internal server error occurred' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var port = process.env.port || 8080;
console.log('Server listening on: ' + port);
app.listen(port);
