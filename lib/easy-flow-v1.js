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
var EasyFlow = (function () {
    function EasyFlow(configurator) {
        var _this = this;
        this.resolvedTransitions = [];
        this.handlers = [];
        this.debug = false;
        var to = function (final) {
            return function (state) {
                var transitions = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    transitions[_i - 1] = arguments[_i];
                }
                // to
                var result;
                transitions.forEach(function (transition) {
                    if (!transition.to) {
                        transition.to = state;
                        result = transition;
                    }
                    else if (!transition.from) {
                        transition.from = state;
                        _this.resolvedTransitions.push(transition);
                    }
                });
                if (!result) {
                    result = new Transition(null, null, state, final);
                }
                return result;
            };
        };
        configurator(function (state) {
            var transitions = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                transitions[_i - 1] = arguments[_i];
            }
            // from
            _this.initialState = state;
            transitions.forEach(function (transition) {
                if (!transition.from) {
                    transition.from = state;
                    _this.resolvedTransitions.push(transition);
                }
            });
        }, function (event, transition) {
            // on
            transition.event = event;
            return transition;
        }, to(false), // to
        to(true), // finish
        function (event, context) {
            // trigger
            if (_this.event(context, event)) {
                if (context.finished) {
                    console.log('Warning: trying to exit final state %s', context.state);
                    return;
                }
                _this.leave(context);
                _this.enter(context, context.nextState);
            }
            else {
                console.log('Warning: invalid event triggered %s in state %s', event, context.state);
            }
        }, function (state, handler) {
            // whenEnter
            _this.handlers.push(new HandlerRecord(handler, state, HandlerType.WHEN_ENTER));
        }, function (state, handler) {
            // whenLeave
            _this.handlers.push(new HandlerRecord(handler, state, HandlerType.WHEN_LEAVE));
        }, function (event, handler) {
            // whenEvent
            _this.handlers.push(new HandlerRecord(handler, event, HandlerType.WHEN_EVENT));
        });
    }
    EasyFlow.prototype.start = function (context, initialState) {
        if (context === void 0) { context = {}; }
        this.enter(context, initialState || this.initialState);
        return context;
    };
    EasyFlow.prototype.dumpTransitions = function () {
        this.resolvedTransitions.forEach(function (t) {
            console.log("%s => (%s) => %s", t.from, t.event, t.to + (t.final ? ' (final)' : ''));
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
                console.log('Debug: triggered event %s', event);
            }
            this.handlers.forEach(function (handler) {
                if (handler.type === HandlerType.WHEN_EVENT && handler.match === event) {
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
            context.state = nextState;
            if (_this.debug) {
                console.log('Debug: entered state %s', nextState);
            }
            if (context.nextStateFinal) {
                context.finished = true;
                if (_this.debug) {
                    console.log('Debug: context finished');
                }
            }
            _this.handlers.forEach(function (handler) {
                if (handler.type === HandlerType.WHEN_ENTER && handler.match === nextState) {
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
                    if (handler.type === HandlerType.WHEN_LEAVE && handler.match === context.prevState) {
                        runAsync(function () {
                            handler.handler(context, context.state, context.lastEvent);
                        });
                    }
                });
            });
        }
    };
    return EasyFlow;
}());
exports.EasyFlow = EasyFlow;
function create(configurator) {
    return new EasyFlow(configurator);
}
exports.create = create;
function responseHandler(context, trigger, hint, events) {
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
            console.log('Error handled by responseHandler while %s: %s', hint, err.message);
        }
        trigger(err && events.length > 1 ? events[1] : events[0], context);
    };
}
exports.responseHandler = responseHandler;
function middleware(flow) {
    return function (req, res) {
        flow.start({ originalReq: req, originalRes: res });
    };
}
exports.middleware = middleware;
//# sourceMappingURL=easy-flow-v1.js.map