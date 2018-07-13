'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _apply = require('babel-runtime/core-js/reflect/apply');

var _apply2 = _interopRequireDefault(_apply);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp2;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('events'),
    EventEmitter = _require.EventEmitter;

module.exports = (_temp2 = _class = function (_EventEmitter) {
    (0, _inherits3.default)(View, _EventEmitter);

    function View() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, View);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = View.__proto__ || (0, _getPrototypeOf2.default)(View)).call.apply(_ref, [this].concat(args))), _this), _this.content = document.querySelector('#content'), _this.els = {}, _this.events = {}, _this.slurp = { attr: 'data-js', view: 'data-view', name: 'data-name', img: 'data-src' }, _this.subviewElements = [], _this.views = {}, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }
    //static Factory = require('Factory')


    (0, _createClass3.default)(View, [{
        key: 'animate',
        value: function animate(el, klass) {
            return new _promise2.default(function (resolve) {
                var onAnimationEnd = function onAnimationEnd(e) {
                    el.classList.remove(klass);
                    el.removeEventListener('animationend', onAnimationEnd);
                    resolve();
                };

                el.addEventListener('animationend', onAnimationEnd);
                el.classList.add(klass);
            });
        }
    }, {
        key: 'bindEvent',
        value: function bindEvent(key, event, el) {
            var _this2 = this;

            var els = el ? [el] : Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]],
                name = this.getEventMethodName(key, event);

            if (!this['_' + name]) this['_' + name] = function (e) {
                return _this2[name](e);
            };

            els.forEach(function (el) {
                return el.addEventListener(event || 'click', _this2['_' + name]);
            });
        }
    }, {
        key: 'delegateEvents',
        value: function delegateEvents(key, el) {
            var _this3 = this;

            var type = (0, _typeof3.default)(this.events[key]);

            if (type === "string") {
                this.bindEvent(key, this.events[key], el);
            } else if (Array.isArray(this.events[key])) {
                this.events[key].forEach(function (eventObj) {
                    return _this3.bindEvent(key, eventObj);
                });
            } else {
                this.bindEvent(key, this.events[key].event);
            }
        }
    }, {
        key: 'delete',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var container, parent;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.hide();

                            case 2:
                                container = this.els.container, parent = container.parentNode;

                                if (container && parent) parent.removeChild(container);
                                this.emit('deleted');

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _delete() {
                return _ref2.apply(this, arguments);
            }

            return _delete;
        }()
    }, {
        key: 'fadeInImage',
        value: function fadeInImage(el) {
            var _this4 = this;

            el.onload = function () {
                return _this4.onImgLoad(el);
            };
            el.setAttribute('src', el.getAttribute('data-src'));
        }
    }, {
        key: 'getEventMethodName',
        value: function getEventMethodName(key, event) {
            return 'on' + View.Util.capitalizeFirstLetter(key) + View.Util.capitalizeFirstLetter(event);
        }
    }, {
        key: 'getTemplateOptions',
        value: function getTemplateOptions() {
            return { user: this.user ? this.user.data : {}, model: this.model };
        }
    }, {
        key: 'handleLogin',
        value: function handleLogin() {
            var _this5 = this;

            View.Factory.create('login', { insertion: { el: document.querySelector('#content') } }).on("loggedIn", function () {
                return _this5.onLogin();
            });

            return this;
        }
    }, {
        key: 'hide',
        value: function hide() {
            return this.hideEl(this.els.container);
        }
    }, {
        key: 'hideEl',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(el) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this.isHidden(el)) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 2:
                                _context2.next = 4;
                                return this.animate(el, 'hide');

                            case 4:
                                el.classList.add('hidden');

                            case 5:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function hideEl(_x) {
                return _ref3.apply(this, arguments);
            }

            return hideEl;
        }()
    }, {
        key: 'hideSync',
        value: function hideSync() {
            this.els.container.classList.add('hidden');return this;
        }
    }, {
        key: 'htmlToFragment',
        value: function htmlToFragment(str) {
            return this.range.createContextualFragment(str);
        }
    }, {
        key: 'initialize',
        value: function initialize(opts) {
            (0, _assign2.default)(this, opts);

            if (this.requiresLogin && !this.user.isLoggedIn()) return this.handleLogin();
            if (this.user && !this.isAllowed(this.user)) return this.scootAway();

            return this.render();
        }
    }, {
        key: 'insertToDom',
        value: function insertToDom(fragment, options) {
            var insertion = typeof options.insertion === 'function' ? options.insertion() : options.insertion;

            insertion.method === 'insertBefore' ? insertion.el.parentNode.insertBefore(fragment, insertion.el) : insertion.el[insertion.method || 'appendChild'](fragment);
        }
    }, {
        key: 'isAllowed',
        value: function isAllowed(user) {
            if (!this.requiresRole) return true;

            var userRoles = new _set2.default(user.data.roles);

            if (typeof this.requiresRole === 'string') return userRoles.has(this.requiresRole);

            if (Array.isArray(this.requiresRole)) {
                var result = this.requiresRole.find(function (role) {
                    return userRoles.has(role);
                });

                return result !== undefined;
            }

            return false;
        }
    }, {
        key: 'isHidden',
        value: function isHidden(el) {
            return el ? el.classList.contains('hidden') : this.els.container.classList.contains('hidden');
        }
    }, {
        key: 'onImgLoad',
        value: function onImgLoad() {
            this.emit('imgLoaded', el);
            el.removeAttribute('data-src');
        }
    }, {
        key: 'onLogin',
        value: function onLogin() {
            if (!this.isAllowed(this.user)) return this.scootAway();
            this.render();
        }
    }, {
        key: 'onNavigation',
        value: function onNavigation() {
            return this.show().catch(View.Error);
        }
    }, {
        key: 'showNoAccess',
        value: function showNoAccess() {
            alert("No privileges, son");
            return this;
        }
    }, {
        key: 'postRender',
        value: function postRender() {
            return this;
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.data) this.model = (0, _create2.default)(this.Model, {}).constructor(this.data);

            this.slurpTemplate({
                insertion: this.insertion || { el: document.body },
                isView: true,
                template: (0, _apply2.default)(this.template, View.TemplateContext, [this.getTemplateOptions()])
            });

            this.els.container.classList.add(this.name);
            if (this.templateName) this.els.container.classList.add(this.templateName);
            if (this.klass) this.els.container.classList.add(this.klass);

            this.renderSubviews();

            if (this.size) {
                this.size();View.OptimizedResize.add(this.size.bind(this));
            }

            return this.postRender();
        }
    }, {
        key: 'removeChildren',
        value: function removeChildren(el) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }return this;
        }
    }, {
        key: 'renderSubviews',
        value: function renderSubviews() {
            var _this6 = this;

            this.subviewElements.forEach(function (obj) {
                var name = obj.name || obj.view;

                var opts = {};

                if (_this6.Views && _this6.Views[obj.view]) opts = (0, _typeof3.default)(_this6.Views[obj.view]) === "object" ? _this6.Views[obj.view] : (0, _apply2.default)(_this6.Views[obj.view], _this6, []);
                if (_this6.Views && _this6.Views[name]) opts = (0, _typeof3.default)(_this6.Views[name]) === "object" ? _this6.Views[name] : (0, _apply2.default)(_this6.Views[name], _this6, []);

                _this6.views[name] = View.Factory.create(obj.view, (0, _extends3.default)({ insertion: { el: obj.el, method: 'insertBefore' } }, opts));

                if (_this6.events.views) {
                    if (_this6.events.views[name]) _this6.events.views[name].forEach(function (arr) {
                        return _this6.views[name].on(arr[0], function (eventData) {
                            return (0, _apply2.default)(arr[1], _this6, [eventData]);
                        });
                    });else if (_this6.events.views[obj.view]) _this6.events.views[obj.view].forEach(function (arr) {
                        return _this6.views[name].on(arr[0], function (eventData) {
                            return (0, _apply2.default)(arr[1], _this6, [eventData]);
                        });
                    });
                }

                if (obj.el.classList.contains('hidden')) _this6.views[name].hideSync();
                obj.el.remove();
            });

            this.subviewElements = [];

            return this;
        }
    }, {
        key: 'scootAway',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return this.Toast.showMessage('error', 'You are not allowed here.');

                            case 3:
                                this.emit('navigate', '/');
                                _context3.next = 10;
                                break;

                            case 6:
                                _context3.prev = 6;
                                _context3.t0 = _context3['catch'](0);
                                View.Error(e);this.emit('navigate', '/');

                            case 10:
                                return _context3.abrupt('return', this);

                            case 11:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[0, 6]]);
            }));

            function scootAway() {
                return _ref4.apply(this, arguments);
            }

            return scootAway;
        }()
    }, {
        key: 'show',
        value: function show() {
            return this.showEl(this.els.container);
        }
    }, {
        key: 'showEl',
        value: function showEl(el) {
            el.classList.remove('hidden');return this.animate(el, 'show');
        }
    }, {
        key: 'showSync',
        value: function showSync() {
            this.els.container.classList.remove('hidden');return this;
        }
    }, {
        key: 'slurpEl',
        value: function slurpEl(el) {
            var key = el.getAttribute(this.slurp.attr) || 'container';

            this.els[key] = Array.isArray(this.els[key]) ? this.els[key].concat(el) : this.els[key] !== undefined ? [this.els[key], el] : el;

            el.removeAttribute(this.slurp.attr);

            if (this.events[key]) this.delegateEvents(key, el);
        }
    }, {
        key: 'slurpTemplate',
        value: function slurpTemplate(options) {
            var _this7 = this;

            var fragment = this.htmlToFragment(options.template),
                _slurp = this.slurp,
                attr = _slurp.attr,
                view = _slurp.view,
                name = _slurp.name,
                img = _slurp.img,
                selector = '[' + attr + ']',
                viewSelector = '[' + view + ']',
                imgSelector = '[' + img + ']',
                firstEl = fragment.querySelector('*');


            if (options.isView || firstEl.getAttribute(attr)) this.slurpEl(firstEl);

            [].concat((0, _toConsumableArray3.default)(fragment.querySelectorAll(selector + ', ' + viewSelector + ', ' + imgSelector))).forEach(function (el) {
                if (el.hasAttribute(attr)) {
                    _this7.slurpEl(el);
                } else if (el.hasAttribute(img)) {
                    _this7.fadeInImage(el);
                } else if (el.hasAttribute(view)) {
                    _this7.subviewElements.push({ el: el, view: el.getAttribute(view), name: el.getAttribute(name) });
                }
            });

            this.insertToDom(fragment, options);
        }
    }, {
        key: 'unbindEvent',
        value: function unbindEvent(key, event, el) {
            var _this8 = this;

            var els = el ? [el] : Array.isArray(this.els[key]) ? this.els[key] : [this.els[key]],
                name = this.getEventMethodName(key, event);

            els.forEach(function (el) {
                return el.removeEventListener(event || 'click', _this8['_' + name]);
            });
        }
    }]);
    return View;
}(EventEmitter), _class.Error = require('./lib/MyError'), _class.OptimizedResize = require('./lib/OptimizedResize'), _class.Util = require('./util/index'), _class.TemplateContext = require('./lib/TemplateContext'), _class.Xhr = require('./lib/Xhr'), _temp2);