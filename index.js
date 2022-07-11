"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteLoader = exports.METHODS = void 0;

var _urlJoin = _interopRequireDefault(require("url-join"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var METHODS = {
  GET: 'get',
  // get data
  POST: 'post',
  // create data
  PUT: 'put',
  // cover date
  PATCH: 'patch',
  // update a part of data
  DELETE: 'delete' // remove data

};
exports.METHODS = METHODS;

var RouteLoader = /*#__PURE__*/function () {
  function RouteLoader(app) {
    _classCallCheck(this, RouteLoader);

    _defineProperty(this, "app", null);

    _defineProperty(this, "mixins", []);

    this.app = app;
  }

  _createClass(RouteLoader, [{
    key: "setRoute",
    value: function setRoute(rts) {
      var _this = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$rootPath = _ref.rootPath,
          rootPath = _ref$rootPath === void 0 ? '' : _ref$rootPath,
          _ref$rootMiddleware = _ref.rootMiddleware,
          rootMiddleware = _ref$rootMiddleware === void 0 ? [] : _ref$rootMiddleware;

      for (var i = 0; i < rts.length; i++) {
        var node = rts[i] || {};
        var subPath = node.path,
            _node$method = node.method,
            method = _node$method === void 0 ? METHODS.GET : _node$method,
            _node$middleware = node.middleware,
            middleware = _node$middleware === void 0 ? [] : _node$middleware,
            _node$children = node.children,
            children = _node$children === void 0 ? [] : _node$children,
            action = node.action,
            before = node.before;
        if (typeof subPath !== 'string') continue;
        var fullPath = (0, _urlJoin["default"])('/', rootPath, subPath);
        var middlewares = [].concat(_toConsumableArray(rootMiddleware), _toConsumableArray(middleware));

        if (action) {
          (function () {
            console.log("[".concat(method.toUpperCase(), "] registered:"), fullPath);
            var xaction = typeof action === 'string' ? require(action)["default"] : action;

            if (_this.mixins) {
              _this.mixins.forEach(function (mixin) {
                xaction = mixin(xaction);
              });
            }

            _this.app[method](fullPath, [].concat(_toConsumableArray(middlewares), [xaction]));
          })();
        }

        if (children && children.length) {
          this.setRoute(children, {
            rootPath: fullPath,
            rootMiddleware: middlewares
          });
        }
      }
    }
  }, {
    key: "addMixin",
    value: function addMixin(mixin) {
      this.mixins.push(mixin);
    }
  }]);

  return RouteLoader;
}();

exports.RouteLoader = RouteLoader;
