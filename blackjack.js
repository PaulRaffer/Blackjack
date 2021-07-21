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

function freshDeck()
{
	var cards = [];
	Object.values(Suit).map(suit =>
	Object.values(Rank).map(rank =>
			cards.push(new Card(suit, rank))));
	return cards;
}


function freshDecks(n)
{
	return duplicate(freshDeck(), n);
}

function cardsToString(cards)
{
	var cardsStr = "";
	for (card of cards) {
		cardsStr += card.HTMLFront();
	}
	return cardsStr;
}

function cardsToString2(cards)
{
	var cardsStr = "";
	for (card of cards) {
		cardsStr += card.suit + card.rank + " ";
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
	constructor(
			player, htmlParentElement,
			bettingStrategy, playingStrategy,
			autoBet = false, autoPlay = false,
			hands = [], stake = 0)
	{
		this.htmlElement = document.createElement("div");
		this.infoHtmlElement = document.createElement("div");
		
		htmlParentElement.appendChild(this.htmlElement);
		this.player = player;
		this.bettingStrategy = bettingStrategy;
		this.playingStrategy = playingStrategy;
		this.autoBet = autoBet;
		this.autoPlay = autoPlay;
		
		this.hands = hands;
		this.stake = stake;
	}

	update()
	{
		this.htmlElement.innerHTML = "";
		this.infoHtmlElement.innerHTML = this.player.bankroll;
		this.htmlElement.appendChild(this.infoHtmlElement);
		this.hands.map(hand =>
				{
					this.htmlElement.appendChild(hand.htmlElement);
					hand.update();
				});
	}
}


class Hand {
	constructor(cards = [], stake = 0, resplitCount = 0)
	{
		this.htmlElement = document.createElement("div");
		
		this.cards = cards;
		this.stake = stake;
		this.resplitCount = resplitCount;
	}

	update()
	{
		this.htmlElement.innerHTML = cardsToString(this.cards) + cardsValue(this.cards)
				+ "; " + this.stake;
	}
}





// Blackjack

const rankValues = {
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
		value = combineElements(value, rankValues[card.rank]).filter(v => v <= max);
	}
	return [...new Set(value)];
}



function isSoft(cards)
{
	return cardsValue(cards).length == 2;
}

function isHard(cards)
{
	return cardsValue(cards).length == 1;
}

function isBust(cards)
{
	return cardsValue(cards).length == 0;
}


function isHandSoft(hand)
{
	return isSoft(hand.cards);
}

function isHandHard(hand)
{
	return isHard(hand.cards);
}

function isHandBust(hand)
{
	return isBust(hand.cards);
}

function hasHandNCards(hand, n)
{
	return hand.cards.length == n;
}

function isHandFresh(hand)
{
	return hand.resplitCount == 0 && hasHandNCards(hand, 2);
}

function isHandNatural(hand)
{
	return isHandFresh(hand) && cardsValue(hand.cards)[0] == 21;
}



class Payouts {
	constructor(win = 1, loss = -1, push = 0, natural = 3/2)
	{
		this.win = win;
		this.loss = loss;
		this.push = push;
		this.natural = natural;
	}
}


class Rules {
	constructor(
			payouts = new Payouts(), numRounds = Infinity,
			numDecks = 6, deckPenetration = .75, hitsSoft17 = false,
			canDoubleAfterSplit = true, resplitLimit = Infinity,
			surrender = false, europeanHoleCard = true)
	{
		this.payouts = payouts;
		this.numRounds = numRounds;
		this.numDecks = numDecks;
		this.deckPenetration = deckPenetration;
		this.hitsSoft17 = hitsSoft17;
		this.canDoubleAfterSplit = canDoubleAfterSplit;
		this.resplitLimit = resplitLimit;
		this.surrender = surrender;
		this.europeanHoleCard = europeanHoleCard;
	}
}


function canMakePlayingDecisionHit(hand, rules = new Rules())
{
	return true;
}

function canMakePlayingDecisionStand(hand, rules = new Rules())
{
	return true;
}

function canMakePlayingDecisionDouble(hand, rules = new Rules())
{
	return hasHandNCards(hand, 2)
			&& (hand.resplitCount == 0 || rules.canDoubleAfterSplit);
}

function canMakePlayingDecisionSplit(hand, rules = new Rules())
{
	return hasHandNCards(hand, 2)
			&& rankValues[hand.cards[0].rank] == rankValues[hand.cards[1].rank]
			&& hand.resplitCount < rules.resplitLimit;
}

function canMakePlayingDecisionSurrender(hand, rules = new Rules())
{
	return isHandFresh(hand);
}

function canMakePlayingDecision(hand, decision, rules = new Rules())
{
	switch (decision) {
	case hit:
		return canMakePlayingDecisionHit(hand, rules);
	case stand:
		return canMakePlayingDecisionStand(hand, rules);
	case double:
		return canMakePlayingDecisionDouble(hand, rules);
	case split:
		return canMakePlayingDecisionSplit(hand, rules);
	case surrender:
		return canMakePlayingDecisionSurrender(hand, rules);
	}
}


var nextFlag = false;

function next(n = true)
{
	nextFlag = n;
}



function canMakeBettingDecision(box, decision)
{
	return true;
}

function isCorrectBettingDecision(box, stake)
{
	return box.bettingStrategy ? box.bettingStrategy() == stake : true;
}

function confirmIncorrectBettingDecision(box, stake)
{
	return confirm(
			"Betting Strategy Error!\n\n" +
			

			"Your stake: " + stake + "\n" +
			"Correct stake (" + box.bettingStrategy.name + "): " + box.bettingStrategy() + "\n\n" +
			"Do you really want to continue?");
}

function makeBettingDecision(box, stake)
{
	return	phase == Phase.BETTING &&
			canMakeBettingDecision(box, stake) &&
			(isCorrectBettingDecision(box, stake) ||
			confirmIncorrectBettingDecision(box, stake));
}



function placeBet(box)
{
	var stake = document.getElementById("stake").value;
	if (makeBettingDecision(box, stake)) {
		box.stake = stake;
		next();
	}
}



function isCorrectPlayingDecision(hand, box, dealerHand, decision)
{
	return box.playingStrategy ? box.playingStrategy(hand, dealerHand) == decision : true;
}

function confirmIncorrectPlayingDecision(hand, box, dealerHand, decision)
{
	return confirm(
			"Playing Strategy Error!\n\n" +
			"Your hand: " + cardsToString2(hand.cards) + "= " + cardsValue(hand.cards) + "\n" +
			"Dealers hand: " + cardsToString2(dealerHand.cards) + "= " + cardsValue(dealerHand.cards) + "\n" +
			"Your decision: " + decision.name + "\n" +
			"Correct decision (" + box.playingStrategy.name + "): " + box.playingStrategy(hand, dealerHand).name + "\n\n" +
			"Do you really want to continue?");
}

function makePlayingDecision(hand, box, dealerHand, decision)
{
	return	phase == Phase.PLAYING &&
			canMakePlayingDecision(hand, decision) &&
			(isCorrectPlayingDecision(hand, box, dealerHand, decision) ||
			confirmIncorrectPlayingDecision(hand, box, dealerHand, decision));
}

function playingDecisionHit(hand, box, remainingCards)
{
	hand.cards.push(remainingCards.pop());
	hand.update();
	if (isBust(hand.cards)) {
		next();
	}
}

function hit(hand, box, dealerHand, remainingCards)
{
	if (makePlayingDecision(hand, box, dealerHand, hit)) {
		playingDecisionHit(hand, box, remainingCards);
	}
}

function stand(hand, box, dealerHand, remainingCards)
{
	if (makePlayingDecision(hand, box, dealerHand, stand)) {
		next();
	}
}

function double(hand, box, dealerHand, remainingCards)
{
	if (makePlayingDecision(hand, box, dealerHand, double)) {
		hand.stake *= 2;
		hand.cards.push(remainingCards.pop());
		hand.update();
		next();
	}
}

function split(hand, box, dealerHand, remainingCards)
{
	if (makePlayingDecision(hand, box, dealerHand, split)) {
		var hand2 = new Hand([hand.cards.pop()], box.stake, ++hand.resplitCount);
		box.hands.push(hand2);
		box.update();
	}
}

function surrender(hand, box, dealerHand, remainingCards)
{
	if (makePlayingDecision(hand, box, dealerHand, surrender)) {
		box.player.bankroll += -0.5 * hand.stake;
		hand.stake = 0;
		box.update();
		next();
	}
}














const Phase = {
	BETTING: 0,
	DEALING: 1,
	PLAYING: 2,
	SHOWDOWN: 3,
}


function flatBettingStrategy(stake)
{
	function flatBettingStrategy()
	{
		return stake;
	}
	return flatBettingStrategy;
}
function martingaleBettingStrategy()
{

}



function dealerS17Strategy(hand, dealerHand)
{
	if (cardsValue(hand.cards)[0] <= 16) {
		return hit;
	}
	else {
		return stand;
	}
}

function dealerH17Strategy(hand, dealerHand)
{
	if ((cardsValue(hand.cards)[0] <= 16)
		|| (isSoft(hand.cards) && cardsValue(hand.cards)[0] == 17)) {
		return hit;
	}
	else {
		return stand;
	}
}

function superEasyBasicStrategy(hand, dealerHand)
{
	if ((isHard(hand.cards) && ((cardsValue(hand.cards)[0] <= 16 && cardsValue(dealerHand.cards)[0] >= 7) || cardsValue(hand.cards)[0] <= 11))
		|| (isSoft(hand.cards) && cardsValue(hand.cards)[0] <= 17)) {
		return hit;
	}
	else {
		return stand;
	}
}



function noBustStrategy(hand, dealerHand)
{
	if (cardsValue(hand.cards)[0] <= 11) {
		return hit;
	}
	else {
		return stand;
	}
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








async function betting(box)
{
	next(false);
	if (box.autoBet && box.bettingStrategy) {
		box.stake = box.bettingStrategy();
	}
	else {
		await waitUntil(() => nextFlag);
	}
}

function dealing(box, remainingCards)
{
	if (box.stake >= 10) {
		box.hands = [new Hand([remainingCards.pop(), remainingCards.pop()], box.stake)];
		box.update();
	}
}

async function playing(box, dealerHand, remainingCards)
{
	for (handI = 0; handI < box.hands.length; handI++) {
		var hand = box.hands[handI];
		next(false);
		if (box.autoPlay && box.playingStrategy) {
			while(!nextFlag) {
				box.playingStrategy(hand, dealerHand)
						(hand, box, dealerHand, remainingCards);
			}
		}
		else {
			await waitUntil(() => nextFlag);
		}
	}
}


function showdown(box, dealerHand, rules = new Rules())
{
	for (handI = 0; handI < box.hands.length; handI++) {
		var hand = box.hands[handI];

		if (isHandNatural(hand.cards) && !isHandNatural(dealerHand.cards)) {
			box.player.bankroll += hand.stake * rules.payouts.natural;
		}
		else if (isBust(hand.cards) || cardsValue(hand.cards)[0] < cardsValue(dealerHand.cards)[0]) {
			box.player.bankroll += hand.stake * rules.payouts.loss;
		}
		else if (isBust(dealerHand.cards) || cardsValue(dealerHand.cards)[0] < cardsValue(hand.cards)[0]) {
			box.player.bankroll += hand.stake * rules.payouts.win;
		}
		else {
			box.player.bankroll += hand.stake * rules.payouts.push;
		}
	}
}


async function start(rules = new Rules())
{
	for (var r = 0; r < rules.numRounds; r++) {
		for (phase = Phase.BETTING; phase <= Phase.SHOWDOWN; phase++) {
			for (boxI = 0; boxI < playerBoxes.length; boxI++) {
				var box = playerBoxes[boxI];

				switch (phase) {
				case Phase.BETTING:
					await betting(box);
					break;
				case Phase.DEALING:
					dealing(box, remainingCards);
					break;
				case Phase.PLAYING:
					await playing(box, dealerBox.hands[0], remainingCards);
					break;

				case Phase.SHOWDOWN:
					showdown(box, dealerBox.hands[0], rules);
					break;
				}
				box.update();
			}
				
			switch (phase) {
			case Phase.DEALING:
				dealerBox.hands = [new Hand([remainingCards.pop()])];
				dealerBox.update();
				break;

			case Phase.PLAYING:
				next(false);
				while(!nextFlag) {
					dealerBox.playingStrategy(dealerBox.hands[0], dealerBox.hands[0])
							(dealerBox.hands[0], dealerBox, dealerBox.hands[0], remainingCards);
				}
				break;

			case Phase.SHOWDOWN:
				if (remainingCards.length <= (1 - rules.deckPenetration) * 52 * rules.numDecks) {
					remainingCards = freshDecks(rules.numDecks);
					shuffle(remainingCards);
				}
				break;
			}
		}
	}
}



var dealerBoxDiv = document.getElementById('dealer-box');
var dealer = new Player(1000000, true);
var dealerBox = new Box(dealer, dealerBoxDiv, undefined, dealerS17Strategy, true, true);

var playerBoxesDiv = document.getElementById('player-boxes');
var players = [new Player(10000), new Player(10000)];
var playerBoxes = [
		new Box(players[0], playerBoxesDiv, flatBettingStrategy(77), superEasyBasicStrategy, false, false),
		new Box(players[1], playerBoxesDiv, flatBettingStrategy(77), superEasyBasicStrategy, true, true)];


var boxI = 0;
var handI = 0;


var remainingCards = freshDecks(6);
var phase = Phase.BETTING;




function main()
{
	shuffle(remainingCards);
	start();
}
main();
