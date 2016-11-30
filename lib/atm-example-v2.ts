import { EasyFlow, from, on, to, finish, whenEnter } from './easy-flow-v2';
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class AtmFlow extends EasyFlow {
    constructor() {
        super();

        const SHOWING_WELCOME = 'SHOWING_WELCOME',
            WAITING_FOR_PIN = 'WAITING_FOR_PIN',
            CHECKING_PIN = 'CHECKING_PIN',
            RETURNING_CARD = 'RETURNING_CARD',
            SHOWING_MAIN_MENU = 'SHOWING_MAIN_MENU',
            SHOWING_PIN_INVALID = 'SHOWING_PIN_INVALID',
            SHOWING_CARD_LOCKED = 'SHOWING_CARD_LOCKED',
            SHOWING_BALANCE = 'SHOWING_BALANCE',
            SHOWING_WITHDRAW_MENU = 'SHOWING_WITHDRAW_MENU',
            SHOWING_TAKE_CASH = 'SHOWING_TAKE_CASH',
            TERMINATED = 'TERMINATED';

        const cardPresent = 'cardPresent',
            cardExtracted = 'cardExtracted',
            pinProvided = 'pinProvided',
            pinValid = 'pinValid',
            pinInvalid = 'pinInvalid',
            tryAgain = 'tryAgain',
            noMoreTries = 'noMoreTries',
            cancel = 'cancel',
            confirm = 'confirm',
            menuShowBalance = 'menuShowBalance',
            menuWithdrawCash = 'menuWithdrawCash',
            menuExit = 'menuExit',
            switchOff = 'switchOff',
            cashExtracted = 'cashExtracted';

        from(SHOWING_WELCOME,
            on(cardPresent, to(WAITING_FOR_PIN,
                on(pinProvided, to(CHECKING_PIN,
                    on(pinValid, to(SHOWING_MAIN_MENU,
                        on(menuShowBalance, to(SHOWING_BALANCE,
                            on(cancel, to(SHOWING_MAIN_MENU))
                        )),
                        on(menuWithdrawCash, to(SHOWING_WITHDRAW_MENU,
                            on(cancel, to(SHOWING_MAIN_MENU)),
                            on(confirm, to(SHOWING_TAKE_CASH,
                                on(cashExtracted, to(SHOWING_MAIN_MENU))
                            ))
                        )),
                        on(menuExit, to(RETURNING_CARD))
                    )),
                    on(pinInvalid, to(SHOWING_PIN_INVALID,
                        on(tryAgain, to(WAITING_FOR_PIN)),
                        on(noMoreTries, to(SHOWING_CARD_LOCKED,
                            on(confirm, to(SHOWING_WELCOME))
                        )),
                        on(cancel, to(RETURNING_CARD))
                    ))
                )),
                on(cancel, to(RETURNING_CARD,
                    on(cardExtracted, to(SHOWING_WELCOME))
                ))
            )),
            on(switchOff, finish(TERMINATED))
        );

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

        whenEnter(SHOWING_MAIN_MENU, (context) => {
            console.log('\n\n*** Main Menu ***\n');
            rl.question('Select your option and press [Enter]...\n1 See my balance\n2 Get cash\n3 Exit\n', (option) => {
                switch (option) {
                    case '1':
                        this.trigger(menuShowBalance, context);
                        break;
                    case '2':
                        this.trigger(menuWithdrawCash, context);
                        break;
                    case '3':
                        this.trigger(menuExit, context);
                }
            });
        });

        whenEnter(SHOWING_BALANCE, (context) => {
            console.log('\n\n*** Showing Balance ***\n');
            console.log('You currently have %d on your account', context.balance);
            rl.question('Press [Enter] to continue...\n', () => {
                this.trigger(cancel, context);
            });
        });

        whenEnter(SHOWING_WITHDRAW_MENU, (context) => {
            console.log('\n\n*** Withdraw Cash ***\n---------------');
            rl.question('How much cash do you want to withdraw?\n1 for $50\n2 for $100\n3 for $200\n4 to cancel\n' +
                'Choose your option and press [Enter] to confirm...\n', (option) => {

                let amt;
                switch (option) {
                    case '1':
                        amt = 50;
                        break;
                    case '2':
                        amt = 100;
                        break;
                    case '3':
                        amt = 200;
                }

                if (!amt) {
                    this.trigger(cancel, context);
                } else {
                    context.withdrawAmt = amt;
                    this.trigger(confirm, context);
                }
            });
        });

        whenEnter(SHOWING_TAKE_CASH, (context) => {
            console.log('\n\n*** Take your cash ***\n');
            console.log('Please, take your cash');
            rl.question('Take my ' + context.withdrawAmt + ' - press [Enter]...\n', () => {
                context.balance -= context.withdrawAmt;
                this.trigger(cashExtracted, context);
            });

        });

        whenEnter(SHOWING_PIN_INVALID, (context) => {
            console.log('\n\n*** Invalid PIN ***\n');
            console.log('You entered invalid PIN.\n(%d attempts left)', 3 - context.invalidPinCounter);
            if (context.invalidPinCounter < 3) {
                rl.question('Choose your option and press [Enter]...\n1 Try again\n2 Cancel\n', (option) => {
                    this.trigger(option == 1 ? tryAgain : cancel, context);
                })
            } else {
                rl.question('Press [Enter] to continue...\n', () => {
                    this.trigger(noMoreTries, context);
                });
            }
        });

        whenEnter(SHOWING_CARD_LOCKED, (context) => {
            console.log('\n\n*** Your Card has been locked ***\n');
            console.log('You have entered invalid PIN 3 times so I swallowed your card.\nMmm... Yummy ;)\n');
            rl.question('Press [Enter] to continue...\n', () => {
                this.trigger(confirm, context);
            });
        });

        whenEnter(RETURNING_CARD, (context) => {
            console.log('\n\n*** Returning Card ***\n');
            console.log('Thanks for using our ATM');
            rl.question('Please take your card - press [Enter]...\n', () => {
                this.trigger(cardExtracted, context);
            });
        });

        whenEnter(TERMINATED, (context) => {
            console.log('Terminating ATM');
            rl.close();
        });
    }
}

let flow = new AtmFlow();
flow.dumpTransitions();
flow.start({ balance: 1000 });

