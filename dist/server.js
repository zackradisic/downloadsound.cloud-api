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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var express_validator_1 = require("express-validator");
var soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
var body_parser_1 = __importDefault(require("body-parser"));
var axios_1 = __importDefault(require("axios"));
var app = express_1["default"]();
var axiosInstance = axios_1["default"].create({
    timeout: 1000
});
soundcloud_downloader_1["default"].setAxiosInstance(axiosInstance);
app.use(body_parser_1["default"].json());
app.post('/track', [express_validator_1.body('url').not().isEmpty().isURL().trim()], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _body, trackInfo, media, err_1;
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
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, soundcloud_downloader_1["default"].getInfo(_body.url)];
            case 2:
                trackInfo = _a.sent();
                media = trackInfo.media.transcodings[0];
                res.status(200).json({ url: media.url });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log(err_1);
                res.status(500);
                res.send({ err: 'Internal server error occurred' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/playlist', [express_validator_1.body('url').not().isEmpty().isURL().trim()], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _body, setInfo, urls, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _body = req.body;
                if (!_body.url.includes('playlist')) {
                    res.status(422).json({ err: 'URL is not a playlist' });
                    return [2 /*return*/];
                }
                if (!soundcloud_downloader_1["default"].isValidUrl(_body.url)) {
                    res.status(422).send({ err: 'URL is not a valid SoundCloud URL' });
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, soundcloud_downloader_1["default"].getSetInfo(_body.url)];
            case 2:
                setInfo = _a.sent();
                urls = setInfo.tracks.map(function (track) { return track.media.transcodings[0]; }).map(function (transcodings) { return transcodings.url; });
                res.status(200).json(urls);
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.log(err_2);
                res.status(500);
                res.send({ err: 'Internal server error occurred' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
console.log('Server listening on 3000 FUCK');
app.listen(3000);
