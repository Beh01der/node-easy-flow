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

## Version 2 notes
**node-easy-flow** has recently been updated to version 2 which is not completely backward-compatible.
If you want to keep using version 1, please use this **require** statement
```javascript
var EasyFlow = require('node-easy-flow/lib/easy-flow-v1');
```
and refer to [v1 docs](./README-v1.md).
Rest of the document describes **node-easy-flow** version 2. 
     
## Quick start
**node-easy-flow** version 2 is built using TypeScript to be used in TypeScript projects (even though is can be used with JavaScript as well).
FSM is defined with `node-easy-flow` through combination of transitions and handlers
```typescript
import { EasyFlow, from, on, to, finish, whenEnter } from 'node-easy-flow';

class AtmFlow extends EasyFlow {
    constructor() {
        super();

        // states
        const SHOWING_WELCOME = 'SHOWING_WELCOME',
            WAITING_FOR_PIN = 'WAITING_FOR_PIN',
            CHECKING_PIN = 'CHECKING_PIN',
            SHOWING_MAIN_MENU = 'SHOWING_MAIN_MENU',
            SHOWING_BALANCE = 'SHOWING_BALANCE',
            ...

        // events
        const cardPresent = 'cardPresent',
            pinProvided = 'pinProvided',
            pinValid = 'pinValid',
            pinInvalid = 'pinInvalid',
            cancel = 'cancel',
            menuShowBalance = 'menuShowBalance',
            switchOff = 'switchOff',
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
                    )),
                    ...
                )),
                ...
            )),
            ...
        );

        // handler definitions
        whenEnter(SHOWING_WELCOME, (context) => {
            console.log('\n\n*** Welcome ***\n');
            context.invalidPinCounter = 0;
            rl.question('Select your option and press [Enter]...\n 1 Insert card\n 2 Terminate ATM\n', (option) => {
                this.trigger(option == 1 ? cardPresent : switchOff, context);
            });
        });

        whenEnter(WAITING_FOR_PIN, (context) => {
            console.log('\n\n*** Waiting for PIN ***\n');
            rl.question('Please enter your PIN and press [Enter] or just press [Enter] to cancel (current PIN is 1234)...\n', (pin) => {
                if (pin.length === 4) {
                    context.pin = pin;
                    this.trigger(pinProvided, context);
                } else {
                    this.trigger(cancel, context);
                }
            });
        });

        whenEnter(CHECKING_PIN, (context) => {
            if (context.pin == 1234) {
                this.trigger(pinValid, context);
            } else {
                context.invalidPinCounter = context.invalidPinCounter + 1 || 1;
                this.trigger(pinInvalid, context);
            }
        });

        ...
    }
}
    
```

Then it can be started using `context` object
```typescript

let flow = new AtmFlow();
flow.start({ balance: 1000 });

```
See full example [here](https://github.com/Beh01der/node-easy-flow/blob/master/lib/atm-example-v2.ts)

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
