"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteLoader = exports.METHODS = void 0;

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

function normalize(strArray) {
  var resultArray = [];

  if (strArray.length === 0) {
    return '';
  }

  if (typeof strArray[0] !== 'string') {
    throw new TypeError('Url must be a string. Received ' + strArray[0]);
  } // If the first part is a plain protocol, we combine it with the next part.


  if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
    strArray[0] = strArray.shift() + strArray[0];
  } // There must be two or three slashes in the file protocol, two slashes in anything else.


  if (strArray[0].match(/^file:\/\/\//)) {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
  } else {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
  }

  for (var i = 0; i < strArray.length; i++) {
    var component = strArray[i];

    if (typeof component !== 'string') {
      throw new TypeError('Url must be a string. Received ' + component);
    }

    if (component === '') {
      continue;
    }

    if (i > 0) {
      // Removing the starting slashes for each component but the first.
      component = component.replace(/^[\/]+/, '');
    }

    if (i < strArray.length - 1) {
      // Removing the ending slashes for each component but the last.
      component = component.replace(/[\/]+$/, '');
    } else {
      // For the last component we will combine multiple slashes to a single one.
      component = component.replace(/[\/]+$/, '/');
    }

    resultArray.push(component);
  }

  var str = resultArray.join('/'); // Each input component is now separated by a single slash except the possible first plain protocol part.
  // remove trailing slash before parameters or hash

  str = str.replace(/\/(\?|&|#[^!])/g, '$1'); // replace ? in parameters with &

  var parts = str.split('?');
  str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');
  return str;
}

function urlJoin() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var parts = Array.from(Array.isArray(args[0]) ? args[0] : args);
  return normalize(parts);
}

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
        var fullPath = urlJoin('/', rootPath, subPath);
        var middlewares = [].concat(_toConsumableArray(rootMiddleware), _toConsumableArray(middleware));

        if (action) {
          (function () {
            console.log("[".concat(method.toUpperCase(), "] registered:"), fullPath);
            var xaction = action;

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
