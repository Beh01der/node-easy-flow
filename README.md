# node-easy-flow

Simple and easy to use Finite State Machine (FSM) for Node.js (similar to EasyFlow for Java).

This library greatly simplifies development of asynchronous event-driven applications. 

Thanks to its convenient hierarchical transition builder, logic of complex applications remains clear and application itself manageable.

Usecase for `node-easy-flow` is somehow similar to `async.series()` or `async.waterfall()` (see [here](https://github.com/caolan/async)), only `node-easy-flow` is more suitable for handling complex, non-linear logic.
     
## Install
Install locally
```
npm install node-easy-flow
```

## Quick start
FSM is defined with `node-easy-flow` through combination of transitions and handlers
```javascript
var EasyFlow = require('node-easy-flow');

var flow = EasyFlow.create(function (from, on, to, finish, trigger, whenEnter) {
    // states
    var SHOWING_WELCOME = 'SHOWING_WELCOME',
        WAITING_FOR_PIN = 'WAITING_FOR_PIN',
        CHECKING_PIN = 'CHECKING_PIN',
        SHOWING_MAIN_MENU = 'SHOWING_MAIN_MENU',
        SHOWING_BALANCE = 'SHOWING_BALANCE',
        ...

    // events
    var cardPresent = 'cardPresent',
        pinProvided = 'pinProvided',
        pinValid = 'pinValid',
        cancel = 'cancel',
        menuShowBalance = 'menuShowBalance',
        ...

    // transition definitions
    from(SHOWING_WELCOME,
        on(cardPresent, to(WAITING_FOR_PIN,
            on(pinProvided, to(CHECKING_PIN,
                on(pinValid, to(SHOWING_MAIN_MENU,
                    on(menuShowBalance, to(SHOWING_BALANCE,
                        on(cancel, to(SHOWING_MAIN_MENU))
                    )),
                    ...
                ))
                ...
            ))
            ...
        ))
        ...
    );

    // handler definitions
    whenEnter(SHOWING_WELCOME, function (context) {
        console.log('\n\n*** Welcome ***\n');
        context.invalidPinCounter = 0;
        rl.question('Select your option and press [Enter]...\n 1 Insert card\n 2 Terminate ATM\n', function (option) {
            trigger(option == 1 ? cardPresent : switchOff, context);
        });
    });

    whenEnter(WAITING_FOR_PIN, function (context) {
        console.log('\n\n*** Waiting for PIN ***\n');
        rl.question('Please enter your PIN and press [Enter] or just press [Enter] to cancel (current PIN is 1234)...\n', function (pin) {
            if (pin.length === 4) {
                context.pin = pin;
                trigger(pinProvided, context);
            } else {
                trigger(cancel, context);
            }
        });
    });
    ...
});
    
```

Then it can be started using `context` object
```javascript

flow.start({ balance: 1000 });

```
See full example [here](https://github.com/Beh01der/node-easy-flow/blob/master/lib/atm-example.js)

## See also
[EasyFlow for Java](https://github.com/Beh01der/EasyFlow)

## License 
**ISC License (ISC)**

Copyright (c) 2015, Andrey Chausenko <andrey.chausenko@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
