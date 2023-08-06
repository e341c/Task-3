const crypto = require('crypto');
const _ = require('lodash');
const readline = require('readline');
const Table = require('cli-table3');

class Valid {
    constructor(moves) {
        this.moves = moves
    }

    hasDuplicates() {
        return (new Set(this.moves)).size !== this.moves.length;
    }

    exitProgramm() {
        if (this.hasDuplicates(moves)) {
            console.log("The input contains duplicate moves. Please provide unique moves.");
            process.exit(1);
        } else if (this.moves.length < 3 || this.moves.length % 2 == 0) {
            console.log("This input is less than 3 or has an even number of inputs. Please enter more than 3 values, the number of which will be odd.");
            process.exit(2);
        }
    }

}

class Random {
    static getRandomInt(arr) {
        const randomElem = _.sample(arr)
        return randomElem
    }

    static generateRandomKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

class HMAC {
    static generateHMAC(key, data) {
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(data);
        return hmac.digest('hex');
    }
}

class Help {
    constructor(moves) {
        this.moves = moves
    }

    GenerateTable() {
        const table = new Table();

        const headers = ['v PC\\User >']

        this.moves.map((row) => {
            headers.push(row)
        })
        table.push(headers);

        const results = (choice, choices) => {
            const halfLength = Math.floor(choices.length / 2);
            const startI = (choices.indexOf(choice) + 1) % choices.length;
            const winners = [];
            for (let i = startI; winners.length < halfLength; i = (i + 1) % choices.length) {
                winners.push(choices[i]);
            }

            const row = [];
            choices.forEach(item => {
                if (item === choice) {
                    row.push('Draw');
                } else if (winners.includes(item)) {
                    row.push('Win');
                } else {
                    row.push('Lose');
                }
            });

            return row;
        };


        this.moves.forEach(move => {
            const row = [move, ...results(move, this.moves)];
            table.push(row);
        });

        console.log(table.toString());
    }
}

class Result {
    static winLose(arr, move) {
        const halfLength = Math.floor(arr.length / 2);
        const startI = (move + 1) % arr.length;
        const endI = (startI + halfLength) % arr.length;
        const winners = [];
        for (let i = startI; i !== endI; i = (i + 1) % arr.length) {
            winners.push(arr[i]);
        }

        return winners
    }

    static findWinner(userMove, compMove, winnersUser) {
        if (userMove == compMove) return 'Draw!'
        return _.includes(winnersUser, compMove) ? 'You win!' : 'Computer win!'
    }
}

class Game {
    constructor(moves, rl) {
        this.moves = moves
        this.rl = rl
    }

    play() {
        const compMove = Random.getRandomInt(this.moves);
        const key = Random.generateRandomKey();
        const hmac = HMAC.generateHMAC(key, compMove);

        console.log('----------------');
        console.log('HMAC: ', hmac);
        console.log('Available moves:');
        this.moves.map((item, index) => {
            console.log(index + 1, ' - ', item);
        })
        console.log('0 - exit');
        console.log('? - help');

        this.rl.question('Enter your move: ', (userChoice) => {
            const userMove = this.moves[userChoice - 1]
            const winnersUser = Result.winLose(this.moves, _.indexOf(this.moves, userMove))
            const winnersComp = Result.winLose(this.moves, _.indexOf(this.moves, compMove))
            if (userChoice === "") {
                this.play()
                return
            } else if (userChoice == 0) {
                this.rl.close();
            } else if (userChoice == '?') {
                const help = new Help(this.moves)
                help.GenerateTable()
                this.play()
                return
            } else if (userChoice >= 1 && userChoice < (this.moves.length + 1)) {
                console.log('Your move:', userMove);
                console.log('Computer move:', compMove);
                console.log(Result.findWinner(userMove, compMove, winnersUser, winnersComp));
                console.log('HMAC key:', key);
                this.play()
                return
            } else {
                console.log('Incorrect value');
                this.play()
                return
            }
        })
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const moves = process.argv.slice(2);
const valid = new Valid(moves)
valid.exitProgramm(valid.hasDuplicates())
const game = new Game(moves, rl);
game.play();