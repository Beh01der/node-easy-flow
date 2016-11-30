"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var easy_flow_v2_1 = require('./easy-flow-v2');
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var AtmFlow = (function (_super) {
    __extends(AtmFlow, _super);
    function AtmFlow() {
        var _this = this;
        _super.call(this);
        var SHOWING_WELCOME = 'SHOWING_WELCOME', WAITING_FOR_PIN = 'WAITING_FOR_PIN', CHECKING_PIN = 'CHECKING_PIN', RETURNING_CARD = 'RETURNING_CARD', SHOWING_MAIN_MENU = 'SHOWING_MAIN_MENU', SHOWING_PIN_INVALID = 'SHOWING_PIN_INVALID', SHOWING_CARD_LOCKED = 'SHOWING_CARD_LOCKED', SHOWING_BALANCE = 'SHOWING_BALANCE', SHOWING_WITHDRAW_MENU = 'SHOWING_WITHDRAW_MENU', SHOWING_TAKE_CASH = 'SHOWING_TAKE_CASH', TERMINATED = 'TERMINATED';
        var cardPresent = 'cardPresent', cardExtracted = 'cardExtracted', pinProvided = 'pinProvided', pinValid = 'pinValid', pinInvalid = 'pinInvalid', tryAgain = 'tryAgain', noMoreTries = 'noMoreTries', cancel = 'cancel', confirm = 'confirm', menuShowBalance = 'menuShowBalance', menuWithdrawCash = 'menuWithdrawCash', menuExit = 'menuExit', switchOff = 'switchOff', cashExtracted = 'cashExtracted';
        easy_flow_v2_1.from(SHOWING_WELCOME, easy_flow_v2_1.on(cardPresent, easy_flow_v2_1.to(WAITING_FOR_PIN, easy_flow_v2_1.on(pinProvided, easy_flow_v2_1.to(CHECKING_PIN, easy_flow_v2_1.on(pinValid, easy_flow_v2_1.to(SHOWING_MAIN_MENU, easy_flow_v2_1.on(menuShowBalance, easy_flow_v2_1.to(SHOWING_BALANCE, easy_flow_v2_1.on(cancel, easy_flow_v2_1.to(SHOWING_MAIN_MENU)))), easy_flow_v2_1.on(menuWithdrawCash, easy_flow_v2_1.to(SHOWING_WITHDRAW_MENU, easy_flow_v2_1.on(cancel, easy_flow_v2_1.to(SHOWING_MAIN_MENU)), easy_flow_v2_1.on(confirm, easy_flow_v2_1.to(SHOWING_TAKE_CASH, easy_flow_v2_1.on(cashExtracted, easy_flow_v2_1.to(SHOWING_MAIN_MENU)))))), easy_flow_v2_1.on(menuExit, easy_flow_v2_1.to(RETURNING_CARD)))), easy_flow_v2_1.on(pinInvalid, easy_flow_v2_1.to(SHOWING_PIN_INVALID, easy_flow_v2_1.on(tryAgain, easy_flow_v2_1.to(WAITING_FOR_PIN)), easy_flow_v2_1.on(noMoreTries, easy_flow_v2_1.to(SHOWING_CARD_LOCKED, easy_flow_v2_1.on(confirm, easy_flow_v2_1.to(SHOWING_WELCOME)))), easy_flow_v2_1.on(cancel, easy_flow_v2_1.to(RETURNING_CARD)))))), easy_flow_v2_1.on(cancel, easy_flow_v2_1.to(RETURNING_CARD, easy_flow_v2_1.on(cardExtracted, easy_flow_v2_1.to(SHOWING_WELCOME)))))), easy_flow_v2_1.on(switchOff, easy_flow_v2_1.finish(TERMINATED)));
        easy_flow_v2_1.whenEnter(SHOWING_WELCOME, function (context) {
            console.log('\n\n*** Welcome ***\n');
            context.invalidPinCounter = 0;
            rl.question('Select your option and press [Enter]...\n 1 Insert card\n 2 Terminate ATM\n', function (option) {
                _this.trigger(option == 1 ? cardPresent : switchOff, context);
            });
        });
        easy_flow_v2_1.whenEnter(WAITING_FOR_PIN, function (context) {
            console.log('\n\n*** Waiting for PIN ***\n');
            rl.question('Please enter your PIN and press [Enter] or just press [Enter] to cancel (current PIN is 1234)...\n', function (pin) {
                if (pin.length === 4) {
                    context.pin = pin;
                    _this.trigger(pinProvided, context);
                }
                else {
                    _this.trigger(cancel, context);
                }
            });
        });
        easy_flow_v2_1.whenEnter(CHECKING_PIN, function (context) {
            if (context.pin == 1234) {
                _this.trigger(pinValid, context);
            }
            else {
                context.invalidPinCounter = context.invalidPinCounter + 1 || 1;
                _this.trigger(pinInvalid, context);
            }
        });
        easy_flow_v2_1.whenEnter(SHOWING_MAIN_MENU, function (context) {
            console.log('\n\n*** Main Menu ***\n');
            rl.question('Select your option and press [Enter]...\n1 See my balance\n2 Get cash\n3 Exit\n', function (option) {
                switch (option) {
                    case '1':
                        _this.trigger(menuShowBalance, context);
                        break;
                    case '2':
                        _this.trigger(menuWithdrawCash, context);
                        break;
                    case '3':
                        _this.trigger(menuExit, context);
                }
            });
        });
        easy_flow_v2_1.whenEnter(SHOWING_BALANCE, function (context) {
            console.log('\n\n*** Showing Balance ***\n');
            console.log('You currently have %d on your account', context.balance);
            rl.question('Press [Enter] to continue...\n', function () {
                _this.trigger(cancel, context);
            });
        });
        easy_flow_v2_1.whenEnter(SHOWING_WITHDRAW_MENU, function (context) {
            console.log('\n\n*** Withdraw Cash ***\n---------------');
            rl.question('How much cash do you want to withdraw?\n1 for $50\n2 for $100\n3 for $200\n4 to cancel\n' +
                'Choose your option and press [Enter] to confirm...\n', function (option) {
                var amt;
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
                    _this.trigger(cancel, context);
                }
                else {
                    context.withdrawAmt = amt;
                    _this.trigger(confirm, context);
                }
            });
        });
        easy_flow_v2_1.whenEnter(SHOWING_TAKE_CASH, function (context) {
            console.log('\n\n*** Take your cash ***\n');
            console.log('Please, take your cash');
            rl.question('Take my ' + context.withdrawAmt + ' - press [Enter]...\n', function () {
                context.balance -= context.withdrawAmt;
                _this.trigger(cashExtracted, context);
            });
        });
        easy_flow_v2_1.whenEnter(SHOWING_PIN_INVALID, function (context) {
            console.log('\n\n*** Invalid PIN ***\n');
            console.log('You entered invalid PIN.\n(%d attempts left)', 3 - context.invalidPinCounter);
            if (context.invalidPinCounter < 3) {
                rl.question('Choose your option and press [Enter]...\n1 Try again\n2 Cancel\n', function (option) {
                    _this.trigger(option == 1 ? tryAgain : cancel, context);
                });
            }
            else {
                rl.question('Press [Enter] to continue...\n', function () {
                    _this.trigger(noMoreTries, context);
                });
            }
        });
        easy_flow_v2_1.whenEnter(SHOWING_CARD_LOCKED, function (context) {
            console.log('\n\n*** Your Card has been locked ***\n');
            console.log('You have entered invalid PIN 3 times so I swallowed your card.\nMmm... Yummy ;)\n');
            rl.question('Press [Enter] to continue...\n', function () {
                _this.trigger(confirm, context);
            });
        });
        easy_flow_v2_1.whenEnter(RETURNING_CARD, function (context) {
            console.log('\n\n*** Returning Card ***\n');
            console.log('Thanks for using our ATM');
            rl.question('Please take your card - press [Enter]...\n', function () {
                _this.trigger(cardExtracted, context);
            });
        });
        easy_flow_v2_1.whenEnter(TERMINATED, function (context) {
            console.log('Terminating ATM');
            rl.close();
        });
    }
    return AtmFlow;
}(easy_flow_v2_1.EasyFlow));
var flow = new AtmFlow();
flow.dumpTransitions();
flow.start({ balance: 1000 });
//# sourceMappingURL=atm-example-v2.js.map