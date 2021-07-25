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
	var cardsStr = "<span class=\"cards\">";
	for (card of cards) {
		cardsStr += "<span class=\"card "+card.suit+"\">"+card.HTMLFront()+"</span>";
	}
	cardsStr += "</span>";
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
	constructor(bankroll)
	{
		this.bankroll = bankroll;
	}
}

function toggleBoxProperties(HTMLElement)
{
	if (HTMLElement.display == "none")
		HTMLElement.display = "block";
	else
		HTMLElement.display = "none";
}

class Box {
	constructor(
			player, htmlParentElement,
			bettingStrategy, autoBet = false, warnOnBettingError = false,
			playingStrategy, autoPlay = false, warnOnPlayingError = false,
			countingStrategy, runningCount = 0,
			hands = [], stake = 0)
	{
		this.HTMLElement = document.createElement("div");
		this.HTMLElement.className = "box";
		htmlParentElement.appendChild(this.HTMLElement);
		this.infoHTMLElement = document.createElement("div");
		this.handsHTMLElement = document.createElement("div");
		this.handsHTMLElement.className = "hands";

		this.player = player;
		this.bettingStrategy = bettingStrategy;
		this.autoBet = autoBet;
		this.warnOnBettingError = warnOnBettingError;
		this.playingStrategy = playingStrategy;
		this.autoPlay = autoPlay;
		this.warnOnPlayingError = warnOnPlayingError;
		this.countingStrategy = countingStrategy;
		this.runningCount = runningCount;
		this.hands = hands;
		this.stake = stake;
	}

	update()
	{
		this.HTMLElement.innerHTML =
				"<button class=\"toggle\" onclick=\"toggleBoxProperties()\">⚙</button>";

		this.infoHTMLElement.innerHTML =
				"<table class=\"properties \">"+
					"<tr><td>Bankroll:</td><td>"+this.player.bankroll+"$</td></tr>"+
					"<tr><td>Betting Strategy:</td><td>" + (this.bettingStrategy ? this.bettingStrategy.name : "") + "</td></tr>"+
					"<tr><td>Auto Bet:</td><td>"+this.autoBet+"</td></tr>"+
					"<tr><td>Warn On Betting Error:</td><td>"+this.warnOnBettingError+"</td></tr>"+
					"<tr><td>Running Count:</td><td>"+this.runningCount+"</td></tr>"+
				"</table>";
		this.HTMLElement.appendChild(this.infoHTMLElement);

		this.handsHTMLElement.innerHTML = "";
		this.hands.map(hand =>
				{
					this.handsHTMLElement.appendChild(hand.HTMLElement);
					hand.update();
				});
		this.HTMLElement.appendChild(this.handsHTMLElement);
	}
}


class Hand {
	constructor(cards = [], stake = 0, resplitCount = 0)
	{
		this.HTMLElement = document.createElement("div");
		this.HTMLElement.className = "hand";
		this.cards = cards;
		this.stake = stake;
		this.resplitCount = resplitCount;
	}

	update()
	{
		this.HTMLElement.innerHTML =
				cardsToString(this.cards) +
				"<table class=\"hand-info\">" + 
					"<tr><td>Value:</td><td>"+cardsValue(this.cards)+"</td></tr>"+
					"<tr><td>Stake:</td><td>"+this.stake+"</td></tr>"+
				"</table>";
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

function hasNCards(n)
{
	return cards => cards.length == n;
}

function isPair(cards)
{
	return hasNCards(cards, 2) && cards[0].rank == cards[1].rank;
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

function hasHandNCards(n)
{
	return hand => hasNCards(n)(hand.cards);
}

function isHandFresh(hand)
{
	return hand.resplitCount == 0 && hasHandNCards(21)(hand);
}

function isHandPair(hand)
{
	return isPair(hand.cards);
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
	return hasHandNCards(2)(hand)
			&& (hand.resplitCount == 0 || rules.canDoubleAfterSplit);
}

function canMakePlayingDecisionSplit(hand, rules = new Rules())
{
	return hasHandNCards(2)(hand)
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
			!box.warnOnBettingError ||
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
			!box.warnOnPlayingError ||
			confirmIncorrectPlayingDecision(hand, box, dealerHand, decision));
}

function playingDecisionHit(hand, box, remainingCards)
{
	hand.cards.push(drawAndCountCard(remainingCards, playerBoxes));
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
		hand.cards.push(drawAndCountCard(remainingCards, playerBoxes));
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

function basicStrategy(hand, dealerHand, rules = new Rules())
{
	const dealerHandValue = cardsValue(dealerHand.cards)[0];
	if (isHandValuePair(hand)) {
		const cardValue = rankValues[hand.cards[0].rank];
		switch (cardValue) {
		case [11, 1]:
		case [8]:
			return split;
		case [9]:
			if (dealerHandValue <= 9 && dealerHandValue != 7) {
				return split;
			}
			break;
		case [7]:
			if (dealerHandValue <= 7) {
				return split;
			}
			break;
		case [6]:
			if ((dealerHandValue >= 3 && dealerHandValue <= 7)
			|| (dealerHandValue == 2 && rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		case [4]:
			if ((dealerHandValue >= 5 && dealerHandValue <= 7) && rules.canDoubleAfterSplit) {
				return split;
			}
			break;
		case [3]:
		case [2]:
			if ((dealerHandValue >= 4 && dealerHandValue <= 7)
			|| (dealerHandValue >= 2 && dealerHandValue <= 3 && rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		}
	}
	
	const handValue = cardsValue(hand.cards)[0];
	if (isHandSoft(hand)) {
		switch (handValue) {
			
		}
	}
	else if (isHandHard(hand)) {
		
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







/*
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
*/







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
		box.hands = [new Hand([drawAndCountCard(remainingCards, playerBoxes), drawAndCountCard(remainingCards, playerBoxes)], box.stake)];
		box.update();
	}
}

async function playing(box, dealerHand, remainingCards)
{
	for (handI = 0; handI < box.hands.length; handI++) {
		var hand = box.hands[handI];

		hand.HTMLElement.classList.add("current");
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
		hand.HTMLElement.classList.remove("current");
	}
}


function showdown(box, dealerHand, rules = new Rules())
{
	for (handI = 0; handI < box.hands.length; handI++) {
		var hand = box.hands[handI];

		hand.HTMLElement.classList.add("current");
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
		hand.HTMLElement.classList.remove("current");
	}
}


async function start(rules = new Rules())
{
	for (var r = 0; r < rules.numRounds; r++) {
		for (phase = Phase.BETTING; phase <= Phase.SHOWDOWN; phase++) {
			for (boxI = 0; boxI < playerBoxes.length; boxI++) {
				var box = playerBoxes[boxI];

				box.HTMLElement.classList.add("current");
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
				box.HTMLElement.classList.remove("current");
				box.update();
			}
			
			dealerBox.HTMLElement.classList.add("current");
			switch (phase) {
			case Phase.DEALING:
				dealerBox.hands = [new Hand([drawAndCountCard(remainingCards, playerBoxes)])];
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
					remainingCards = freshShuffledDecks(rules.numDecks);
					resetRunningCounts(boxes);
				}
				break;
			}
			dealerBox.HTMLElement.classList.remove("current");
		}
	}
}

function freshShuffledDecks(n)
{
	let decks = freshDecks(n);
	shuffle(decks);
	return decks;
}

function drawCard(cards)
{
	return cards.pop();
}

function countCard(card, boxes)
{
	boxes.map(box =>
			{
				if (box.countingStrategy)
					box.runningCount += box.countingStrategy(card);
			});
}

function drawAndCountCard(cards, boxes)
{
	const card = drawCard(cards);
	countCard(card, boxes);
	return card;
}



function HiLoCountingStrategy(card)
{
	const value = rankValues[card.rank][0];
	return	value <=  6 ? +1 :
			value >= 10 ? -1 :
			0;
}

function trueCountConversion(runningCount, numRemainingCards)
{
	const remainingDecks = numRemainingCards / 52;
	const trueCount = runningCount / remainingDecks;
	return trueCount;
}


var dealerBoxDiv = document.getElementById('dealer-box');
var dealer = new Player(1000000, true);
var dealerBox = new Box(dealer, dealerBoxDiv,
		undefined, false, false,
		dealerS17Strategy, true, true);

var playerBoxesDiv = document.getElementById('player-boxes');
var players = [new Player(10000), new Player(10000)];
var playerBoxes = [
		new Box(players[0], playerBoxesDiv,
				flatBettingStrategy(77), false, false,
				superEasyBasicStrategy, false, true,
				HiLoCountingStrategy),
		new Box(players[1], playerBoxesDiv,
				flatBettingStrategy(77), true, true,
				superEasyBasicStrategy, true, true,
				HiLoCountingStrategy)];


var boxI = 0;
var handI = 0;


var remainingCards = freshShuffledDecks(6);
var phase = Phase.BETTING;




function main()
{
	start();
}
main();
