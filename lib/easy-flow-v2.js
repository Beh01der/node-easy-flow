"use strict";
var Transition = (function () {
    function Transition(from, event, to, final) {
        this.from = from;
        this.event = event;
        this.to = to;
        this.final = final;
    }
    return Transition;
}());
exports.Transition = Transition;
(function (HandlerType) {
    HandlerType[HandlerType["WHEN_ENTER"] = 0] = "WHEN_ENTER";
    HandlerType[HandlerType["WHEN_LEAVE"] = 1] = "WHEN_LEAVE";
    HandlerType[HandlerType["WHEN_EVENT"] = 2] = "WHEN_EVENT";
})(exports.HandlerType || (exports.HandlerType = {}));
var HandlerType = exports.HandlerType;
var HandlerRecord = (function () {
    function HandlerRecord(handler, match, type) {
        this.handler = handler;
        this.match = match;
        this.type = type;
    }
    return HandlerRecord;
}());
exports.HandlerRecord = HandlerRecord;
function runAsync(callback) {
    process.nextTick(callback);
}
exports.runAsync = runAsync;
function from(state) {
    var transitions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        transitions[_i - 1] = arguments[_i];
    }
    var t = EasyFlow.currentInstance;
    t.initialState = state;
    transitions.forEach(function (transition) {
        if (!transition.from) {
            transition.from = state;
            t.resolvedTransitions.push(transition);
        }
    });
}
exports.from = from;
function on(event, transition) {
    transition.event = event;
    return transition;
}
exports.on = on;
function to_(final, state) {
    var transitions = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        transitions[_i - 2] = arguments[_i];
    }
    var result;
    var t = EasyFlow.currentInstance;
    transitions.forEach(function (transition) {
        if (!transition.to) {
            transition.to = state;
            result = transition;
        }
        else if (!transition.from) {
            transition.from = state;
            t.resolvedTransitions.push(transition);
        }
    });
    if (!result) {
        result = new Transition(null, null, state, final);
    }
    return result;
}
function to(state) {
    var transitions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        transitions[_i - 1] = arguments[_i];
    }
    return to_.apply(null, [false, state].concat(transitions));
}
exports.to = to;
function finish(state) {
    var transitions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        transitions[_i - 1] = arguments[_i];
    }
    return to_.apply(null, [true, state].concat(transitions));
}
exports.finish = finish;
function whenEnter(state, handler) {
    EasyFlow.currentInstance.whenEnter(state, handler);
}
exports.whenEnter = whenEnter;
function whenLeave(state, handler) {
    EasyFlow.currentInstance.whenLeave(state, handler);
}
exports.whenLeave = whenLeave;
function whenEvent(event, handler) {
    EasyFlow.currentInstance.whenEvent(event, handler);
}
exports.whenEvent = whenEvent;
var EasyFlow = (function () {
    function EasyFlow() {
        this.resolvedTransitions = [];
        this.handlers = [];
        this.debug = false;
        this.printLogs = !EasyFlow.silent;
        EasyFlow.currentInstance = this;
    }
    EasyFlow.prototype.start = function (context, initialState) {
        if (context === void 0) { context = {}; }
        this.enter(context, initialState || this.initialState);
        return context;
    };
    EasyFlow.prototype.trigger = function (event, context) {
        if (this.event(context, event)) {
            if (context.finished) {
                if (this.printLogs)
                    console.log('Warning: trying to exit final state %s', context.state);
                return;
            }
            this.leave(context);
            this.enter(context, context.nextState);
        }
        else {
            if (this.printLogs)
                console.log('Warning: invalid event triggered %s in state %s', event, context.state);
        }
    };
    EasyFlow.prototype.whenEnter = function (state, handler) {
        this.handlers.push(new HandlerRecord(handler, state, HandlerType.WHEN_ENTER));
    };
    EasyFlow.prototype.whenLeave = function (state, handler) {
        this.handlers.push(new HandlerRecord(handler, state, HandlerType.WHEN_LEAVE));
    };
    EasyFlow.prototype.whenEvent = function (event, handler) {
        this.handlers.push(new HandlerRecord(handler, event, HandlerType.WHEN_EVENT));
    };
    EasyFlow.prototype.dumpTransitions = function () {
        var _this = this;
        this.resolvedTransitions.forEach(function (t) {
            if (_this.printLogs)
                console.log("%s => (%s) => %s%s", t.from, t.event, t.to, t.final ? ' (final)' : '');
        });
    };
    EasyFlow.prototype.event = function (context, event) {
        var matchedTransition;
        for (var i = 0; i < this.resolvedTransitions.length; i++) {
            var transition = this.resolvedTransitions[i];
            if (context.state === transition.from && event === transition.event) {
                context.nextState = transition.to;
                context.nextStateFinal = transition.final;
                context.lastEvent = event;
                matchedTransition = transition;
                break;
            }
        }
        if (matchedTransition) {
            if (this.debug) {
                if (this.printLogs)
                    console.log('Debug: triggered event %s', event);
            }
            this.handlers.forEach(function (handler) {
                if (handler.type === HandlerType.WHEN_EVENT && (handler.match === '*' || handler.match === event)) {
                    runAsync(function () {
                        handler.handler(context, context.state, event);
                    });
                }
            });
        }
        return !!matchedTransition;
    };
    EasyFlow.prototype.enter = function (context, nextState) {
        var _this = this;
        runAsync(function () {
            context.events = [];
            context.state = nextState;
            _this.resolvedTransitions.forEach(function (transition) {
                if (context.state === transition.from) {
                    context.events.push(transition.event);
                }
            });
            if (_this.debug) {
                if (_this.printLogs)
                    console.log('Debug: entered state %s', nextState);
            }
            if (context.nextStateFinal) {
                context.finished = true;
                if (_this.debug) {
                    if (_this.printLogs)
                        console.log('Debug: context finished');
                }
            }
            _this.handlers.forEach(function (handler) {
                if (handler.type === HandlerType.WHEN_ENTER && (handler.match === '*' || handler.match === nextState)) {
                    runAsync(function () {
                        handler.handler(context, context.state, context.lastEvent);
                    });
                }
            });
        });
    };
    EasyFlow.prototype.leave = function (context) {
        var _this = this;
        if (context.state) {
            runAsync(function () {
                context.prevState = context.state;
                _this.handlers.forEach(function (handler) {
                    if (handler.type === HandlerType.WHEN_LEAVE && (handler.match === '*' || handler.match === context.prevState)) {
                        runAsync(function () {
                            handler.handler(context, context.state, context.lastEvent);
                        });
                    }
                });
            });
        }
    };
    EasyFlow.prototype.middleware = function () {
        var _this = this;
        return function (req, res) {
            _this.start({ originalReq: req, originalRes: res });
        };
    };
    EasyFlow.prototype.responseHandler = function (context, hint, events) {
        var _this = this;
        return function (err, res, body) {
            if (!err && ((res && res.statusCode && res.statusCode > 299) || (body && body.code && body.code.indexOf('ERROR') != -1))) {
                err = res.statusCode + ': ' + body.code;
                if (body && body.message) {
                    err += ': ' + body.message;
                }
                err = { message: err };
            }
            context.err = err;
            context.res = res;
            context.body = body;
            if (!events) {
                events = ['success', 'error'];
            }
            if (err) {
                if (_this.printLogs)
                    console.log('Error handled by responseHandler while %s: %s', hint, err.message);
            }
            _this.trigger(err && events.length > 1 ? events[1] : events[0], context);
        };
    };
    EasyFlow.silent = false;
    return EasyFlow;
}());
exports.EasyFlow = EasyFlow;
//# sourceMappingURL=easy-flow-v2.js.map