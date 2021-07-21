// Copyright (c) 2021 Paul Raffer





// General Purpose

function shuffle(array)
{
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function duplicate(array, n)
{
	var result = [];
	for (i = 0; i < n; i++) {
		result = result.concat(array);
	}
	return result;
}

function combineElements(arrayA, arrayB, op = (a, b) => a + b)
{
	var result = [];
	for (a of arrayA) {
		for (b of arrayB) {
			result.push(op(a, b));
		}
	}
	return result;
}

function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms));
}





// Card Games

const Suit = {
	SPADES: '♠',
	HEARTS: '♥',
	DIAMONDS: '♦',
	CLUBS: '♣',
}

const Rank = {
	ACE: 'A',
	TWO: '2',
	THREE: '3',
	FOUR: '4',
	FIVE: '5',
	SIX: '6',
	SEVEN: '7',
	EIGHT: '8',
	NINE: '9',
	TEN: 'T',
	JACK: 'J',
	QUEEN: 'Q',
	KING: 'K',
}

function suitToHTMLUnicodeCardPart(suit)
{
	switch (suit) {
	case Suit.SPADES:
		return 'A';
	case Suit.HEARTS:
		return 'B';
	case Suit.DIAMONDS:
		return 'C';
	case Suit.CLUBS:
		return 'D';
	}
}

function rankToHTMLUnicodeCardPart(rank)
{
	switch (rank) {
	case Rank.ACE:
		return '1';
	case Rank.TEN:
		return 'A';
	case Rank.JACK:
		return 'B';
	case Rank.QUEEN:
		return 'D';
	case Rank.KING:
		return 'E';
	default:
		return rank;
	}
}

class Card {
	constructor(suit, rank)
	{
		this.suit = suit;
		this.rank = rank;
	}

	HTMLFront()
	{
		return '&#x1F0'
				+ suitToHTMLUnicodeCardPart(this.suit)
				+ rankToHTMLUnicodeCardPart(this.rank)
				+ ';';
	}

	HTMLBack()
	{
		return '&#x1F0A0;';
	}
}

function deck()
{
	var cards = [];
	Object.values(Suit).map(suit =>
	Object.values(Rank).map(rank =>
			cards.push(new Card(suit, rank))));
	return cards;
}


function decks(n)
{
	return duplicate(deck(), n);
}

function cardsToString(cards)
{
	var cardsStr = "";
	for (card of cards) {
		cardsStr += card.HTMLFront();
	}
	return cardsStr;
}



const PlayerDecision = {
	HIT: 'H',
	STAND: 'S',
	DOUBLE: 'D',
	SPLIT: 'P',
	SURRENDER: 'R',
}

for (a of Object.values(PlayerDecision)) {
	console.log(a);
}



class Player {
	constructor(bankroll, computer = false)
	{
		this.bankroll = bankroll;
		this.computer = computer;
	}
}

class Box {
	constructor(player, htmlParentElement, strategy)
	{
		this.htmlElement = document.createElement("div");
		htmlParentElement.appendChild(this.htmlElement);
		this.player = player;
		this.strategy = strategy;
	}
}


class Hand {
	constructor(box, cards = [], stake = 0)
	{
		this.box = box;
		this.htmlElement = document.createElement("div");
		this.box.htmlElement.appendChild(this.htmlElement);
		this.cards = cards;
		this.stake = stake;
	}

	update()
	{
		this.htmlElement.innerHTML = cardsToString(this.cards) + cardsValue(this.cards)
				+ "; " + this.stake + ", " + this.box.player.bankroll;
	}
}





// Blackjack

const blackjackRankValues = {
	'A': [11, 1],
	'2': [ 2],
	'3': [ 3],
	'4': [ 4],
	'5': [ 5],
	'6': [ 6],
	'7': [ 7],
	'8': [ 8],
	'9': [ 9],
	'T': [10],
	'J': [10],
	'Q': [10],
	'K': [10],
};


function cardsValue(cards, max = 21)
{
	var value = [0];
	for (card of cards) {
		value = combineElements(value, blackjackRankValues[card.rank]).filter(v => v <= max);
	}
	return [...new Set(value)];
}


function soft(cards)
{
	return cardsValue(cards).length == 2;
}

function hard(cards)
{
	return cardsValue(cards).length == 1;
}

function busted(cards)
{
	return cardsValue(cards).length == 0;
}

function blackjack(cards)
{
	return cards.length == 2 && cardsValue(cards)[0] == 21;
}




class Rules {
	constructor(
			numDecks = 6, hitSoft17 = false,
			doubleAfterSplit = true, surrender = false,
			europeanHoleCard = true)
	{
		this.numDecks = numDecks;
		this.hitSoft17 = hitSoft17;
		this.doubleAfterSplit = doubleAfterSplit;
		this.surrender = surrender;
		this.europeanHoleCard = europeanHoleCard;
	}

}


function dealerS17Strategy(hand, dealerHand, remainingCards)
{
	while (cardsValue(hand.cards)[0] <= 16) {
		hit(hand, remainingCards);
	}
	stand();
}

function dealerH17Strategy(hand, dealerHand, remainingCards)
{
	while ((cardsValue(hand.cards)[0] <= 16)
		|| (soft(hand.cards) && cardsValue(hand.cards)[0] == 17)) {
		hit(hand, remainingCards);
	}
	stand();
}

function superEasyBasicStrategy(hand, dealerHand, remainingCards)
{
	while ((hard(hand.cards) && ((cardsValue(hand.cards)[0] <= 16 && cardsValue(dealerHand.cards)[0] >= 7) || cardsValue(hand.cards)[0] <= 11))
		|| (soft(hand.cards) && cardsValue(hand.cards)[0] <= 17)) {
		hit(hand, remainingCards);
	}
	stand();
}



function noBustStrategy(hand, dealerHand, remainingCards)
{
	while (cardsValue(hand.cards)[0] <= 11) {
		hit(hand, remainingCards);
	}
	stand();
}



class CardCountingStrategy {
	constructor(
			name, cardValues,
			bettingCorrelation, playingEfficiency, insuranceCorrelation,
			ease, balanced, suitAware, compromiseIndexes, level)
	{
		this.name = name;
		this.cardValues = cardValues;
		this.bettingCorrelation = bettingCorrelation;
		this.playingEfficiency = playingEfficiency;
		this.insuranceCorrelation = insuranceCorrelation;
		this.ease = ease;
		this.balanced = balanced;
		this.suitAware = suitAware;
		this.compromiseIndexes = compromiseIndexes;
		this.level = level;
	}
}

const HiLo = new CardCountingStrategy("HiLo", {
	'A': -1,
	'2': +1,
	'3': +1,
	'4': +1,
	'5': +1,
	'6': +1,
	'7':  0,
	'8':  0,
	'9':  0,
	'T': -1,
	'J': -1,
	'Q': -1,
	'K': -1,
}, .97, .63, .76, 6, true, false, false, 1);





const Phase = {
	BETTING: 0,
	DEALING: 1,
	PLAYING: 2,
	SHOWDOWN: 3,
}







function placeBet()
{
	if (phase == Phase.BETTING) {
		var stake = document.getElementById("stake").value;
		playerHands[handI].stake = stake;
		nextPlayerFlag = true;
	}
}




function hit(hand, remainingCards)
{
	if (phase == Phase.PLAYING) {
		hand.cards.push(remainingCards.pop());

		hand.update();

		if (busted(hand.cards)) {
			nextPlayerFlag = true;
		}
	}
}

function stand()
{
	if (phase == Phase.PLAYING) {
		nextPlayerFlag = true;
	}
}

function double()
{
	if (phase == Phase.PLAYING) {
		playerHands[handI].stake *= 2;

		playerHands[handI].cards.push(remainingCards.pop());

		playerHands[handI].update();

		nextPlayerFlag = true;
	}
}
/*
function split()
{
	if (phase == Phase.PLAYING) {
		playerHands[handI].stake;

		playerHands[handI].cards.push(remainingCards.pop());

		new Hand(playerHands[handI].cards.pop());

		playerHands[handI].update();

		nextPlayerFlag = true;
	}
}*/

function surrender()
{
	if (phase == Phase.PLAYING) {
		playerHands[handI].box.player.bankroll += -0.5 * playerHands[handI].stake;
		playerHands[handI].stake = 0;

		playerHands[handI].update();

		nextPlayerFlag = true;
	}
}
const waitUntil = (condition) => {
    return new Promise((resolve) => {
        let interval = setInterval(() => {
            if (!condition()) {
                return
            }

            clearInterval(interval)
            resolve()
        }, 100)
    })
}

var nextPlayerFlag = false;



function showdown(hand)
{
	if (blackjack(hand.cards)) {
		hand.box.player.bankroll += 1.5 * hand.stake;
	}
	else if (busted(hand.cards) || cardsValue(hand.cards)[0] < cardsValue(dealerHand.cards)[0]) {
		hand.box.player.bankroll += -1 * hand.stake;
	}
	else if (cardsValue(hand.cards)[0] > cardsValue(dealerHand.cards)[0]) {
		hand.box.player.bankroll += 1 * hand.stake;
	}
	hand.update();
}


async function start()
{
	while (true) {
		for (handI = 0; handI < playerHands.length; handI++) {
			var hand = playerHands[handI];

			switch (phase) {
			case Phase.BETTING:
				nextPlayerFlag = false;
				await waitUntil(() => nextPlayerFlag);
				break;

			case Phase.DEALING:
				hand.cards = (hand.stake < 10) ? [] :
						[remainingCards.pop(), remainingCards.pop()];
				hand.update();
				break;

			case Phase.PLAYING:
				if (hand.box.strategy) {
					hand.box.strategy(hand, dealerHand, remainingCards);
				}
				else {
					nextPlayerFlag = false;
					await waitUntil(() => nextPlayerFlag);
				}
				break;

			case Phase.SHOWDOWN:
				showdown(hand);
				break;
			}
		}
		
		switch (phase) {
		case Phase.DEALING:
			dealerHand.cards = [remainingCards.pop()];
			dealerHand.update();
			break;

		case Phase.PLAYING:
			dealerHand.box.strategy(dealerHand, dealerHand, remainingCards);
			break;
		}

		if (++phase > Phase.SHOWDOWN) {
			phase = Phase.BETTING;
		}

		console.log(phase);
	}
}



class Table {

};


var dealerBoxDiv = document.getElementById('dealer-box');
var dealer = new Player(1000000, true);
var dealerBox = new Box(dealer, dealerBoxDiv, dealerS17Strategy);
var dealerHand = new Hand(dealerBox);

var playerBoxesDiv = document.getElementById('player-boxes');
var players = [new Player(10000), new Player(10000)];
var playerBoxes = [new Box(players[0], playerBoxesDiv), new Box(players[1], playerBoxesDiv, superEasyBasicStrategy)];
var playerHands = [new Hand(playerBoxes[0]), new Hand(playerBoxes[1])];

var hands = playerHands.concat(dealerHand);

var handI = 0;


var remainingCards = decks(6);
var phase = Phase.BETTING;




function main()
{
	shuffle(remainingCards);
	inRound = false;

	start(handI);
}
main();
