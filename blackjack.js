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




class Player {
	constructor(bankroll)
	{
		this.bankroll = bankroll;
	}
}

function moneyToString(money)
{
	return "<span class=\"money\">"+money+"</span>";
}

function toggleBoxInfo(element)
{
	//let HTMLElement = document.getElementById("box"+id+"-info");
	element.style.display =
			element.style.display == "none" ||
			element.style.display == ""
					? "block" : "none";

}

function isObject(x)
{
	return typeof x === 'object' && x !== null;
}


function updateBoxPlayerBankroll(boxId, bankroll)
{
	bankroll;
}

function typeToInputType(type)
{
	switch (type) {
	case "boolean":
		return "checkbox";
	default:
		return type;
	}
}


function getInputValue(input)
{
	if (input.type == "checkbox") {
		return input.checked;
	}
	else if (input.type == "number") {
		return input.value;
	}
	else {
		return input.value;
	}
}

function setInputValue(input, value)
{
	if (input.type == "checkbox") {
		input.checked = value;
	}
	else {
		input.value = value;
	}
}

var createTableCount = 0;
function createTable(object, editable = false, displayIcons = { "none": ">", "block": "v" })
{
	let div = document.createElement("div");

	let propertiesTable = document.createElement("table");
	propertiesTable.className = "properties";
	for (let p in object)
	{
		let propertyTR = document.createElement("tr");
		let propertyTD1 = document.createElement("td");
		let propertyName = document.createElement("label");
		propertyName.htmlFor = "table"+createTableCount+"-"+p+"-input";
		propertyName.innerHTML = p+":";
		propertyTD1.appendChild(propertyName);

		let propertyTD2 = document.createElement("td");
		let propertyValue = null;
		if (isObject(object[p])) {
			propertyValue = createTable(object[p]);
		}
		else {
			propertyValue = document.createElement("input");
			propertyValue.id = "table"+createTableCount+"-"+p+"-input";
			propertyValue.className = p+"-input";
			propertyValue.type = typeToInputType(typeof object[p]);
			setInputValue(propertyValue, object[p]);
			propertyValue.onchange = event => object[p] = getInputValue(propertyValue);
		}	
		propertyTD2.appendChild(propertyValue);
		propertyTR.appendChild(propertyTD1);
		propertyTR.appendChild(propertyTD2);
		propertiesTable.appendChild(propertyTR);
	}

	let toggleTableButton = document.createElement("button");
	toggleTableButton.className = "toggle";
	toggleTableButton.onclick = () =>
			{
				propertiesTable.style.display =
						propertiesTable.style.display == "none" ?
								"block" : "none";
				toggleTableButton.innerText = displayIcons[propertiesTable.style.display];
			};
	propertiesTable.style.display = "none";
	toggleTableButton.innerText = displayIcons[propertiesTable.style.display];


	let removeObjectButton = document.createElement("button");
	removeObjectButton.className = "remove-object-button";
	removeObjectButton.onclick = () =>
			{
			};
	propertiesTable.style.display = "none";
	removeObjectButton.innerText = "-";


	div.appendChild(toggleTableButton);
	div.appendChild(removeObjectButton);
	div.appendChild(propertiesTable);

	createTableCount++;
	return div;
}

class Box {
	static count = 0;

	constructor(
			player, htmlParentElement,
			bettingStrategy, autoBet = false, warnOnBettingError = false,
			playingStrategy, autoPlay = false, warnOnPlayingError = false,
			countingStrategy, runningCount = 0,
			hands = [], stake = 0, id = Box.count++)
	{
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
		this.id = id;
		

		let propertiesTable = createTable(this);
		



		this.settingsDiv = document.createElement("div");
		this.settingsDiv.id = "box"+id+"-info";
		this.settingsDiv.className = "box-info";

		this.settingsDiv.appendChild(propertiesTable);


		this.handsDiv = document.createElement("div");
		this.handsDiv.className = "hands";

		this.infoDiv = document.createElement("div");
		this.infoDiv.innerHTML =
				"<table class=\"properties\">"+
					"<tr><td>Bankroll:</td><td><span id=\"bankroll-info\" class=\"money\"></span></td></tr>"+
					"<tr><td>Running:</td><td id=\"running-count-info\"></td></tr>"+
				"</table>";


		this.HTMLElement = document.createElement("div");
		htmlParentElement.appendChild(this.HTMLElement);
		this.HTMLElement.className = "box";

		this.HTMLElement.innerHTML = "";
		this.HTMLElement.appendChild(this.handsDiv);
		this.HTMLElement.appendChild(this.infoDiv);
		this.HTMLElement.appendChild(this.settingsDiv);

		this.update();
	}

	update()
	{
		let bankrollInfo = this.infoDiv.querySelector("#bankroll-info");
		bankrollInfo.innerText = this.player.bankroll;
		let runningCountInfo = this.infoDiv.querySelector("#running-count-info");
		runningCountInfo.innerText = this.runningCount;

		this.handsDiv.innerHTML = "";
		this.hands.map(hand =>
				{
					this.handsDiv.appendChild(hand.HTMLElement);
					hand.update();
				});
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
		const value = cardsValues(this.cards);
		this.HTMLElement.innerHTML =
				cardsToString(this.cards) +
				"<table class=\"properties\">"+
					"<tr><td>Value:</td><td>"+value+ (value.every(v => v > 21) ? " (Bust)" : "") +"</td></tr>"+
					"<tr><td>Stake:</td><td>"+moneyToString(this.stake)+"</td></tr>"+
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


function cardsValues(cards)
{
	var value = [0];
	for (card of cards) {
		value = combineElements(value, rankValues[card.rank]);
	}
	return [...new Set(value)];
}

function validCardsValues(cards)
{
	return cardsValues(cards).filter(v => v <= 21);
}

function bestCardsValue(cards)
{
	return validCardsValues(cards)[0];
}


function validHandValues(hand)
{
	return validCardsValues(hand.cards);
}

function bestHandValue(hand)
{
	return bestCardsValue(hand.cards);
}



function isSoft(cards)
{
	return validCardsValues(cards).length == 2;
}

function isHard(cards)
{
	return validCardsValues(cards).length == 1;
}

function isBust(cards)
{
	return cardsValues(cards).every(v => v > 21);
}

function hasNCards(n)
{
	return cards => cards.length == n;
}

function isPair(cards)
{
	return hasNCards(2)(cards) && cards[0].rank == cards[1].rank;
}

function isValuePair(cards)
{
	return hasNCards(2)(cards) && rankValues[cards[0].rank][0] == rankValues[cards[1].rank][0];
}

function isValueN(n)
{
	return cards => bestCardsValue(cards) == n;
}

const isValue21 = isValueN(21);

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
	return hand.resplitCount == 0 && hasHandNCards(2)(hand);
}

function isHandPair(hand)
{
	return isPair(hand.cards);
}

function isHandValuePair(hand)
{
	return isValuePair(hand.cards);
}

function isHandValue21(hand)
{
	return isValue21(hand.cards);
}

function isHandNatural(hand)
{
	return isHandFresh(hand) && isHandValue21(hand);
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
			limits = { min: 10, max: 100 }, payouts = new Payouts(), numRounds = Infinity,
			numDecks = 6, deckPenetration = .75, hitsSoft17 = false,
			canDoubleAfterSplit = true, resplitLimit = Infinity,
			surrender = false, europeanHoleCard = true)
	{
		this.limits = limits;
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
	return isHandValuePair(hand)
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
			"Your hand: " + cardsToString2(hand.cards) + "= " + validHandValues(hand) + "\n" +
			"Dealers hand: " + cardsToString2(dealerHand.cards) + "= " + validHandValues(dealerHand) + "\n" +
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
	if (isHandBust(hand)) {
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
		while (hand.cards.length < 2){
			playingDecisionHit(hand, box, remainingCards);
		}
		box.update();
	}
}

function surrender(hand, box, dealerHand, remainingCards)
{
	if (makePlayingDecision(hand, box, dealerHand, surrender)) {
		box.player.bankroll -= 0.5 * hand.stake;
		box.update();
		next();
	}
}









const surrenderHit = (hand, rules) => canMakePlayingDecisionDouble(hand, rules) ? surrender : hit;

	const doubleHit = (hand, rules) => canMakePlayingDecisionDouble(hand, rules) ? double : hit;
	const doubleStand = (hand, rules) => canMakePlayingDecisionDouble(hand, rules) ? double : stand;




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
	if (cardsValues(hand.cards)[0] <= 16) {
		return hit;
	}
	else {
		return stand;
	}
}

function dealerH17Strategy(hand, dealerHand)
{
	if ((cardsValues(hand.cards)[0] <= 16)
		|| (isSoft(hand.cards) && cardsValues(hand.cards)[0] == 17)) {
		return hit;
	}
	else {
		return stand;
	}
}

function superEasyBasicStrategy(hand, dealerHand)
{
	if ((isHard(hand.cards) && ((cardsValues(hand.cards)[0] <= 16 && cardsValues(dealerHand.cards)[0] >= 7) || cardsValues(hand.cards)[0] <= 11))
		|| (isSoft(hand.cards) && cardsValues(hand.cards)[0] <= 17)) {
		return hit;
	}
	else {
		return stand;
	}
}

function basicStrategySplit(hand, dealerHand, rules)
{
	const dealerHandValue = bestHandValue(dealerHand);
	if (isHandValuePair(hand)) {
		const cardValue = rankValues[hand.cards[0].rank];
		console.log("pair: "+cardValue);
		switch (cardValue[0]) {
		case 11:
		case 8:
			return split;
		case 9:
			if (dealerHandValue <= 9 && dealerHandValue != 7) {
				return split;
			}
			break;
		case 7:
			if (dealerHandValue <= 7) {
				return split;
			}
			break;
		case 6:
			if ((dealerHandValue >= 3 && dealerHandValue <= 7)
			|| (dealerHandValue == 2 && rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		case 4:
			if ((dealerHandValue >= 5 && dealerHandValue <= 7) && rules.canDoubleAfterSplit) {
				return split;
			}
			break;
		case 3:
		case 2:
			if ((dealerHandValue >= 4 && dealerHandValue <= 7)
			|| (dealerHandValue >= 2 && dealerHandValue <= 3 && rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		}
	}
	return undefined;
}



function basicStrategy(hand, dealerHand, rules = new Rules())
{
	let decision = basicStrategySplit(hand, dealerHand, rules);
	
	const handValue = bestHandValue(hand);
	const dealerHandValue = bestHandValue(dealerHand);

	return	decision ?
				decision :
			isHandSoft(hand) ?
				handValue == 20 ? stand :
				handValue == 19 ?
					dealerHandValue == 6 ? doubleStand(hand, rules) : stand :
				handValue == 18 ?
					dealerHandValue <= 6 ? doubleStand(hand, rules) :
					dealerHandValue <= 8 ? stand : hit :
				handValue == 17 ?
					dealerHandValue >= 3 && dealerHandValue <= 6 ? doubleHit(hand, rules) : hit :
				handValue <= 16 && handValue >= 15 ?
					dealerHandValue >= 4 && dealerHandValue <= 6 ? doubleHit(hand, rules) : hit :
				handValue <= 14 && handValue >= 13 ?
					dealerHandValue >= 5 && dealerHandValue <= 6 ? doubleHit(hand, rules) : hit :
				undefined :
			isHandHard(hand) ?
				handValue == 16 && dealerHandValue >= 9 && dealerHandValue <= 11 ? surrenderHit(hand, rules) :
				handValue == 15 && dealerHandValue == 10 ? surrenderHit(hand, rules) :
				handValue >= 17 ? stand :
				handValue <= 16 && handValue >= 13 ?
					dealerHandValue <= 6 ? stand : hit :
				handValue == 12 ?
					dealerHandValue >= 4 && dealerHandValue <= 6 ? stand : hit :
				handValue == 11 ? doubleHit(hand, rules) :
				handValue == 10 ?
					dealerHandValue <= 9 ? doubleHit(hand, rules) : hit :
				handValue == 9 ?
					dealerHandValue >= 3 && dealerHandValue <= 6 ? doubleHit(hand, rules) : hit :
				handValue <= 8 ? hit :
				undefined :
			undefined;
}



function noBustStrategy(hand, dealerHand)
{
	if (cardsValues(hand.cards)[0] <= 11) {
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
		while (hand.cards.length < 2){
			playingDecisionHit(hand, box, remainingCards);
		}
		next(false);
		if (box.autoPlay && box.playingStrategy) {
			while(!(nextFlag || isHandValue21(hand))) {
				box.playingStrategy(hand, dealerHand)
						(hand, box, dealerHand, remainingCards);
			}
		}
		else {
			await waitUntil(() => nextFlag || isHandValue21(hand));
		}
		hand.HTMLElement.classList.remove("current");
	}
}


function showdown(box, dealerBox, rules = new Rules())
{
	let dealerHand = dealerBox.hands[0];
	for (handI = 0; handI < box.hands.length; handI++) {
		var hand = box.hands[handI];

		hand.HTMLElement.classList.add("current");
		let profit = 0;
		if (isHandNatural(hand) && !isHandNatural(dealerHand.cards)) {
			profit = hand.stake * rules.payouts.natural;
		}
		else if (isHandBust(hand) || bestHandValue(hand) < bestHandValue(dealerHand)) {
			profit = hand.stake * rules.payouts.loss;
		}
		else if (isHandBust(dealerHand) || bestHandValue(dealerHand) < bestHandValue(hand)) {
			profit = hand.stake * rules.payouts.win;
		}
		else {
			profit = hand.stake * rules.payouts.push;
		}
		box.player.bankroll += profit;
		dealerBox.player.bankroll -= profit;
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
					let bettingInput = document.getElementById("betting-input");
					bettingInput.classList.remove("disabled");
					await betting(box);
					bettingInput.classList.add("disabled");
					break;
				case Phase.DEALING:
					dealing(box, remainingCards);
					break;
				case Phase.PLAYING:
					let playingInput = document.getElementById("playing-input");
					playingInput.classList.remove("disabled");
					await playing(box, dealerBox.hands[0], remainingCards);
					playingInput.classList.add("disabled");
					break;

				case Phase.SHOWDOWN:
					showdown(box, dealerBox, rules);
					dealerBox.update();
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
				box.update();
			});
}

function drawAndCountCard(cards, boxes)
{
	const card = drawCard(cards);
	countCard(card, boxes);
	return card;
}



function hiLoCountingStrategy(card)
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
var dealer = new Player(0);
var dealerBox = new Box(dealer, dealerBoxDiv,
		undefined, true, false,
		dealerS17Strategy, true, false);

var playerBoxesDiv = document.getElementById('player-boxes');
var player = new Player(10000);
var playerBoxes = [
		new Box(player, playerBoxesDiv,
				undefined, false, false,
				basicStrategy, false, true,
				hiLoCountingStrategy)];


var boxI = 0;
var handI = 0;


var remainingCards = freshShuffledDecks(6);
var phase = Phase.BETTING;

var rules = new Rules();


let stakeInput = document.getElementById("stake");
stakeInput.min = rules.limits.min;
stakeInput.max = rules.limits.max;
stakeInput.placeholder = rules.limits.min+"<x<"+rules.limits.max;
stakeInput.value = rules.limits.min;

let placeBetButton = document.getElementById("place-bet-button");
placeBetButton.onclick = () => placeBet(playerBoxes[boxI]);

let hitButton = document.getElementById("hit-button");
hitButton.onclick = () => hit(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards);

let standButton = document.getElementById("stand-button");
standButton.onclick = () => stand(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards);

let doubleButton = document.getElementById("double-button");
doubleButton.onclick = () => double(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards);

let splitButton = document.getElementById("split-button");
splitButton.onclick = () => split(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards);

let surrenderButton = document.getElementById("surrender-button");
surrenderButton.onclick = () => surrender(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards);

let nextButton = document.getElementById("next-button");
nextButton.onclick = next;


let playingInput = document.getElementById("playing-input");
playingInput.classList.add("disabled");


let addPlayerBoxButton = document.getElementById("add-player-box-button");
addPlayerBoxButton.onclick = () =>
		{
			let player = new Player(10000);
			playerBoxes.push(new Box(player, playerBoxesDiv));
		}

function main()
{
	start();
}
main();
