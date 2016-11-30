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
    state?: string;
    nextState?: string;
    nextStateFinal?: boolean;
    prevState?: string;
    lastEvent?: string;
    finished?: boolean;
    events?: string[];
    [others: string]: any;
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
export declare function from(state: any, ...transitions: Transition[]): void;
export declare function on(event: any, transition: Transition): Transition;
export declare function to(state: any, ...transitions: any[]): Transition;
export declare function finish(state: any, ...transitions: any[]): Transition;
export declare function whenEnter(state: any, handler: Handler): void;
export declare function whenLeave(state: any, handler: Handler): void;
export declare function whenEvent(event: any, handler: Handler): void;
export declare class EasyFlow {
    static currentInstance: any;
    static silent: boolean;
    resolvedTransitions: Transition[];
    handlers: HandlerRecord[];
    initialState: any;
    debug: boolean;
    printLogs: boolean;
    constructor();
    start(context?: Context, initialState?: any): any;
    trigger(event: any, context: Context): void;
    whenEnter(state: any, handler: Handler): void;
    whenLeave(state: any, handler: Handler): void;
    whenEvent(event: any, handler: Handler): void;
    dumpTransitions(): void;
    event(context: Context, event: any): boolean;
    enter(context: Context, nextState: any): void;
    leave(context: Context): void;
    middleware(): (req: any, res: any) => void;
    responseHandler(context: any, hint?: any, events?: any): (err: any, res?: any, body?: any) => void;
}
