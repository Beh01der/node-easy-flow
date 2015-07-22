export interface Handler {
    (context, state?, event?)
}

export class Transition {
    constructor(public from, public event, public to, public final: boolean){
    }
}

export interface Context {
    state?;
    nextState?;
    nextStateFinal?;
    prevState?;
    lastEvent?;
    finished?;
}

interface Configurator {
    (from: {(state, ...transitions: Transition[])},
     on: {(event, transition: Transition): Transition},
     to: {(state, ...transitions: Transition[]): Transition},
     finish: {(state, ...transitions: Transition[]): Transition},
     trigger: {(event, context: Context)},
     whenEnter: {(state, handler: Handler)},
     whenLeave: {(state, handler: Handler)},
     whenEvent: {(event, handler: Handler)})
}

enum HandlerType {
    WHEN_ENTER,
    WHEN_LEAVE,
    WHEN_EVENT
}

class HandlerRecord {
    constructor(public handler: Handler, public match, public type: HandlerType) {
    }
}

function runAsync(callback) {
    process.nextTick(callback);
}

class EasyFlow {
    public resolvedTransitions: Transition[] = [];
    public handlers: HandlerRecord[] = [];
    public initialState;
    public debug = false;

    constructor(configurator: Configurator) {
        var to = (final: boolean) => {
            return (state, ...transitions) => {
                // to
                var result;
                transitions.forEach((transition) => {
                    if (!transition.to) {
                        transition.to = state;
                        result = transition;
                    } else if (!transition.from) {
                        transition.from = state;
                        this.resolvedTransitions.push(transition);
                    }
                });

                if (!result) {
                    result = new Transition(null, null, state, final);
                }

                return result;
            };
        };

        configurator(
            (state, ...transitions) => {
                // from
                this.initialState = state;
                transitions.forEach((transition) => {
                    if (!transition.from) {
                        transition.from = state;
                        this.resolvedTransitions.push(transition);
                    }
                });
            },
            (event, transition) => {
                // on
                transition.event = event;
                return transition;
            },
            to(false), // to
            to(true),  // finish
            (event, context) => {
                // trigger
                if (this.event(context, event)) {
                    if (context.finished) {
                        console.log('Warning: trying to exit final state %s', context.state);
                        return;
                    }

                    this.leave(context);
                    this.enter(context, context.nextState);
                } else {
                    console.log('Warning: invalid event triggered %s in state %s', event, context.state);
                }
            },
            (state, handler) => {
                // whenEnter
                this.handlers.push(new HandlerRecord(handler, state, HandlerType.WHEN_ENTER));
            },
            (state, handler) => {
                // whenLeave
                this.handlers.push(new HandlerRecord(handler, state, HandlerType.WHEN_LEAVE));
            },
            (event, handler) => {
                // whenEvent
                this.handlers.push(new HandlerRecord(handler, event, HandlerType.WHEN_EVENT));
            }
        );
    }

    public start(context: Context = {}, initialState?): any {
        this.enter(context, initialState || this.initialState);
        return context;
    }

    public dumpTransitions() {
        this.resolvedTransitions.forEach(t => {
            console.log("%s => (%s) => %s", t.from, t.event, t.to + (t.final ? ' (final)' : ''));
        });
    }

    private event(context: Context, event): boolean {
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

            this.handlers.forEach(handler => {
                if (handler.type === HandlerType.WHEN_EVENT && handler.match === event) {
                    runAsync(() => {
                        handler.handler(context, context.state, event);
                    });
                }
            });
        }

        return !!matchedTransition;
    }

    private enter(context: Context, nextState) {
        runAsync(() => {
            context.state = nextState;
            if (this.debug) {
                console.log('Debug: entered state %s', nextState);
            }

            if (context.nextStateFinal) {
                context.finished = true;
                if (this.debug) {
                    console.log('Debug: context finished');
                }
            }

            this.handlers.forEach(handler => {
                if (handler.type === HandlerType.WHEN_ENTER && handler.match === nextState) {
                    runAsync(() => {
                        handler.handler(context, context.state, context.lastEvent);
                    });
                }
            });
        });
    }

    private leave(context: Context) {
        if (context.state) {
            runAsync(() => {
                context.prevState = context.state;

                this.handlers.forEach(handler => {
                    if (handler.type === HandlerType.WHEN_LEAVE && handler.match === context.prevState) {
                        runAsync(() => {
                            handler.handler(context, context.state, context.lastEvent);
                        });
                    }
                });
            });
        }
    }
}

export function create(configurator: Configurator): EasyFlow {
    return new EasyFlow(configurator);
}

export function responseHandler(context, trigger, hint?, events?) {
    return (err, res?, body?) => {
        if (!err && ((res && res.statusCode && res.statusCode > 299) || (body && body.code && body.code.indexOf('ERROR') !=-1))) {
            err = res.statusCode + ': ' + body.code;
            if (body && body.message) {
                err += ': ' + body.message;
            }
            err = {message: err};
        }

        context.err = err;
        context.res = res;
        context.body = body;

        if (!events){
            events = ['success', 'error'];
        }

        if (err) {
            console.log('Error handled by responseHandler while %s: %s', hint, err.message);
        }

        trigger(err && events.length > 1 ? events[1] : events[0], context);
    };
}

export function middleware(flow: EasyFlow) {
    return (req, res) => {
        flow.start({originalReq: req, originalRes: res});
    };
}