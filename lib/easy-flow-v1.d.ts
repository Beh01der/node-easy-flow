export interface Handler {
    (context: any, state?: any, event?: any): any;
}
export declare class Transition {
    from: any;
    event: any;
    to: any;
    final: boolean;
    constructor(from: any, event: any, to: any, final: boolean);
}
export interface Context {
    state?: any;
    nextState?: any;
    nextStateFinal?: any;
    prevState?: any;
    lastEvent?: any;
    finished?: any;
    [others: string]: any;
}
export interface Configurator {
    (from: {
        (state, ...transitions: Transition[]);
    }, on: {
        (event, transition: Transition): Transition;
    }, to: {
        (state, ...transitions: Transition[]): Transition;
    }, finish: {
        (state, ...transitions: Transition[]): Transition;
    }, trigger: {
        (event, context: Context);
    }, whenEnter: {
        (state, handler: Handler);
    }, whenLeave: {
        (state, handler: Handler);
    }, whenEvent: {
        (event, handler: Handler);
    }): any;
}
export declare enum HandlerType {
    WHEN_ENTER = 0,
    WHEN_LEAVE = 1,
    WHEN_EVENT = 2,
}
export declare class HandlerRecord {
    handler: Handler;
    match: any;
    type: HandlerType;
    constructor(handler: Handler, match: any, type: HandlerType);
}
export declare function runAsync(callback: any): void;
export declare class EasyFlow {
    resolvedTransitions: Transition[];
    handlers: HandlerRecord[];
    initialState: any;
    debug: boolean;
    constructor(configurator: Configurator);
    start(context?: Context, initialState?: any): any;
    dumpTransitions(): void;
    private event(context, event);
    private enter(context, nextState);
    private leave(context);
}
export declare function create(configurator: Configurator): EasyFlow;
export declare function responseHandler(context: any, trigger: any, hint?: any, events?: any): (err: any, res?: any, body?: any) => void;
export declare function middleware(flow: EasyFlow): (req: any, res: any) => void;
