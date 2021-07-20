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
	constructor(player, htmlParentElement)
	{
		this.htmlElement = document.createElement("div");
		htmlParentElement.appendChild(this.htmlElement);
		this.player = player;
	}
}


class Hand {
	constructor(box, strategy, cards = [], stake = 0)
	{
		this.box = box;
		this.strategy = strategy;
		this.cards = cards;
		this.stake = stake;
	}

	update()
	{
		this.box.htmlElement.innerHTML = cardsToString(this.cards) + cardsValue(this.cards);
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


function dealerStrategyS17(hand, dealerHand, remainingCards)
{
	while (cardsValue(hand.cards)[0] <= 16) {
		hit(hand, remainingCards);
	}
	stand();
}

function dealerStrategyH17(hand, dealerHand, remainingCards)
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



var dealerBoxDiv = document.getElementById('dealer-box');
var dealer = new Player(1000000, true);
var dealerBox = new Box(dealer, dealerBoxDiv);
var dealerHand = new Hand(dealerBox, dealerStrategyS17);

var playerBoxesDiv = document.getElementById('player-boxes');
var players = [new Player(10000), new Player(10000)];
var playerBoxes = [new Box(players[0], playerBoxesDiv), new Box(players[1], playerBoxesDiv)];
var playerHands = [new Hand(playerBoxes[0]), new Hand(playerBoxes[1], superEasyBasicStrategy)];

var hands = playerHands.concat(dealerHand);

const Phase = {
	PLAYERS: 'players',
	DEALER: 'dealer',
}

var phase = Phase.PLAYERS;

var handI = 0;

function deal()
{
	playerHands.map(hand => hand.cards = []);
	dealerHand.cards = [];
	playerHands.map(hand => hit(hand, remainingCards));
	playerHands.map(hand => hit(hand, remainingCards));
	hit(dealerHand, remainingCards);
}

function dealer(remainingCards)
{
	while (cardsValue(dealerHand.cards)[0] <= 16) {
		hit(dealerHand, remainingCards);
	}
	stand();
}

function hit(hand, remainingCards)
{
	hand.cards.push(remainingCards.pop());

	hand.update();

	if (busted(hand.cards)) {
		makeMove(++handI);
	}
}


function stand()
{
	makeMove(++handI);
}

function makeMove(handI)
{
	var hand = hands[handI];

	if (hand.strategy) {
		hand.strategy(hand, dealerHand, remainingCards);
	}
}

function placeBet()
{
	var stake = document.getElementById("stake");

}



	

var playerBankroll = 10000;

	var remainingCards = decks(6);
	shuffle(remainingCards);

	while (remainingCards.length > 100) {
		//placeBet();
		deal();
		makeMove(handI);
	}

