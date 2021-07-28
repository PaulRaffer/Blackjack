// Copyright (c) 2021 Paul Raffer


const PlayerDecision = {
	HIT: 'H',
	STAND: 'S',
	DOUBLE: 'D',
	SPLIT: 'P',
	SURRENDER: 'R',
}

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


class Player {
	constructor(bankroll)
	{
		this.bankroll = bankroll;
	}
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
		

		let propertiesTable = createTable(this, {
				bettingStrategy: [flatBettingStrategy(10).name],
				playingStrategy: [basicStrategy.name, superEasyBasicStrategy.name, dealerS17Strategy.name, dealerH17Strategy.name],
				countingStrategy: [hiLoCountingStrategy.name, koCountingStrategy.name]});
		



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




var nextFlag = false;

function next(n = true)
{
	nextFlag = n;
}




function canMakeBettingDecision(box, stake, rules)
{
	return true;
}


function isCorrectBettingDecision(box, stake, rules)
{
	return box.bettingStrategy ? box.bettingStrategy(rules) == stake : true;
}


function confirmIncorrectBettingDecision(box, stake, rules)
{
	return confirm(
			"Betting Strategy Error!\n\n" +
			

			"Your stake: " + stake + "\n" +
			"Correct stake (" + box.bettingStrategy.name + "): " + box.bettingStrategy(rules) + "\n\n" +
			"Do you really want to continue?");
}


function makeBettingDecision(box, stake, rules)
{
	return	phase == Phase.BETTING &&
			canMakeBettingDecision(box, stake, rules) &&
			(isCorrectBettingDecision(box, stake, rules) ||
			!box.warnOnBettingError ||
			confirmIncorrectBettingDecision(box, stake, rules));
}



function placeBet(box, rules)
{
	var stake = document.getElementById("stake").value;
	if (makeBettingDecision(box, stake, rules)) {
		box.stake = stake;
		next();
	}
}






function canMakePlayingDecisionHit(hand, rules)
{
	return true;
}

function canMakePlayingDecisionStand(hand, rules)
{
	return true;
}

function canMakePlayingDecisionDouble(hand, rules)
{
	return hasHandNCards(2)(hand)
			&& (hand.resplitCount == 0 || rules.canDoubleAfterSplit);
}

function canMakePlayingDecisionSplit(hand, rules)
{
	return isHandValuePair(hand)
			&& hand.resplitCount < rules.resplitLimit;
}

function canMakePlayingDecisionSurrender(hand, rules)
{
	return isHandFresh(hand);
}

function canMakePlayingDecision(hand, decision, rules)
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


function isCorrectPlayingDecision(hand, box, dealerHand, decision, rules)
{
	return box.playingStrategy ? box.playingStrategy(hand, dealerHand, rules) == decision : true;
}


function confirmIncorrectPlayingDecision(hand, box, dealerHand, decision, rules)
{
	return confirm(
			"Playing Strategy Error!\n\n" +
			"Your hand: " + cardsToString2(hand.cards) + "= " + validHandValues(hand) + "\n" +
			"Dealers hand: " + cardsToString2(dealerHand.cards) + "= " + validHandValues(dealerHand) + "\n" +
			"Your decision: " + decision.name + "\n" +
			"Correct decision (" + box.playingStrategy.name + "): " + box.playingStrategy(hand, dealerHand, rules).name + "\n\n" +
			"Do you really want to continue?");
}


function makePlayingDecision(hand, box, dealerHand, decision, rules)
{
	return	phase == Phase.PLAYING &&
			canMakePlayingDecision(hand, decision, rules) &&
			(isCorrectPlayingDecision(hand, box, dealerHand, decision, rules) ||
			!box.warnOnPlayingError ||
			confirmIncorrectPlayingDecision(hand, box, dealerHand, decision, rules));
}










function playingDecisionHit(hand, box, remainingCards)
{
	hand.cards.push(drawAndCountCard(remainingCards, playerBoxes));
	hand.update();
	if (isHandBust(hand)) {
		next();
	}
}

function hit(hand, box, dealerHand, remainingCards, rules)
{
	if (makePlayingDecision(hand, box, dealerHand, hit, rules)) {
		playingDecisionHit(hand, box, remainingCards);
	}
}


function stand(hand, box, dealerHand, remainingCards, rules)
{
	if (makePlayingDecision(hand, box, dealerHand, stand, rules)) {
		next();
	}
}


function double(hand, box, dealerHand, remainingCards, rules)
{
	if (makePlayingDecision(hand, box, dealerHand, double, rules)) {
		hand.stake *= 2;
		hand.cards.push(drawAndCountCard(remainingCards, playerBoxes));
		hand.update();
		next();
	}
}

const doubleHit = (hand, rules) => canMakePlayingDecisionDouble(hand, rules) ? double : hit;
const doubleStand = (hand, rules) => canMakePlayingDecisionDouble(hand, rules) ? double : stand;


function split(hand, box, dealerHand, remainingCards, rules)
{
	if (makePlayingDecision(hand, box, dealerHand, split, rules)) {
		var hand2 = new Hand([hand.cards.pop()], box.stake, ++hand.resplitCount);
		box.hands.push(hand2);
		while (hand.cards.length < 2){
			playingDecisionHit(hand, box, remainingCards);
		}
		box.update();
	}
}


function surrender(hand, box, dealerHand, remainingCards, rules)
{
	if (makePlayingDecision(hand, box, dealerHand, surrender, rules)) {
		box.player.bankroll -= 0.5 * hand.stake;
		box.update();
		next();
	}
}

const surrenderHit = (hand, rules) => canMakePlayingDecisionDouble(hand, rules) ? surrender : hit;







function autoMove(hand, box, dealerHand, remainingCards, rules)
{
	next(false);
	if (phase == Phase.BETTING) {
		box.stake = box.bettingStrategy(rules);
	}
	else if(phase == Phase.PLAYING) {
		while(!(nextFlag || isHandValue21(hand))) {
			box.playingStrategy(hand, dealerHand, rules)
					(hand, box, dealerHand, remainingCards, rules);
		}
	}
	next();
}

function autoStep(hand, box, dealerHand, remainingCards, rules)
{
	next(false);
	if (phase == Phase.BETTING) {
		box.stake = box.bettingStrategy(rules);
		next();
	}
	else if(phase == Phase.PLAYING) {
		box.playingStrategy(hand, dealerHand, rules)
				(hand, box, dealerHand, remainingCards, rules);
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
	function flatBettingStrategy(rules)
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

function superEasyBasicStrategy(hand, dealerHand, rules)
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
	if (canMakePlayingDecisionSplit(hand, rules)) {
		const cardValue = rankValues[hand.cards[0].rank];
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



function basicStrategy(hand, dealerHand, rules)
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

function koCountingStrategy(card)
{
	const value = rankValues[card.rank][0];
	return	value <=  7 ? +1 :
			value >= 10 ? -1 :
			0;
}




function trueCountConversion(runningCount, numRemainingCards)
{
	const remainingDecks = numRemainingCards / 52;
	const trueCount = runningCount / remainingDecks;
	return trueCount;
}



function resetRunningCounts(boxes)
{
	boxes.forEach(box => box.runningCount = 0);
}



async function betting(box, rules)
{
	next(false);
	if (box.autoBet && box.bettingStrategy) {
		box.stake = box.bettingStrategy(rules);
	}
	else {
		await waitUntil(() => nextFlag);
	}
}

function dealing(box, remainingCards, rules)
{
	if (box.stake >= 10) {
		box.hands = [new Hand([drawAndCountCard(remainingCards, playerBoxes), drawAndCountCard(remainingCards, playerBoxes)], box.stake)];
		box.update();
	}
}

async function playing(box, dealerHand, remainingCards, rules)
{
	for (handI = 0; handI < box.hands.length; handI++) {
		var hand = box.hands[handI];

		hand.HTMLElement.classList.add("current");
		while (hand.cards.length < 2) {
			playingDecisionHit(hand, box, remainingCards);
		}
		next(false);
		if (box.autoPlay && box.playingStrategy) {
			while(!(nextFlag || isHandValue21(hand))) {
				box.playingStrategy(hand, dealerHand, rules)
						(hand, box, dealerHand, remainingCards, rules);
			}
		}
		else {
			await waitUntil(() => nextFlag || isHandValue21(hand));
		}
		hand.HTMLElement.classList.remove("current");
	}
}


function showdown(box, dealerBox, rules)
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


async function start(table)
{
	for (var r = 0; r < table.rules.numRounds; r++) {
		for (phase = Phase.BETTING; phase <= Phase.SHOWDOWN; phase++) {

			for (boxI = 0; boxI < playerBoxes.length; boxI++) {
				var box = playerBoxes[boxI];

				box.HTMLElement.classList.add("current");
				switch (phase) {
				case Phase.BETTING:
					let bettingInput = document.getElementsByClassName("betting-input");
					Array.from(bettingInput).forEach(e => e.classList.remove("disabled"));
					await betting(box, table.rules);
					Array.from(bettingInput).forEach(e => e.classList.add("disabled"));
					break;
				case Phase.DEALING:
					dealing(box, remainingCards, table.rules);
					break;
				case Phase.PLAYING:
					let playingInput = document.getElementsByClassName("playing-input");
					Array.from(playingInput).forEach(e => e.classList.remove("disabled"));
					await playing(box, dealerBox.hands[0], remainingCards, table.rules);
					Array.from(playingInput).forEach(e => e.classList.add("disabled"));
					break;
				case Phase.SHOWDOWN:
					showdown(box, dealerBox, table.rules);
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
				if (remainingCards.length <= (1 - table.rules.deckPenetration) * 52 * table.rules.numDecks) {
					remainingCards = freshShuffledDecks(table.rules.numDecks);
					resetRunningCounts(playerBoxes);
				}
				await sleep(100);
				break;
			}
			dealerBox.HTMLElement.classList.remove("current");
		}
	}
}




var dealerBoxDiv = document.getElementById('dealer-box');
var dealer = new Player(0);
var dealerBox = new Box(dealer, dealerBoxDiv,
		undefined, false, false,
		dealerS17Strategy, true, false);

var playerBoxesDiv = document.getElementById('player-boxes');
var player = new Player(10000);
var playerBoxes = [
		new Box(player, playerBoxesDiv,
				flatBettingStrategy(10), false, false,
				basicStrategy, false, true,
				hiLoCountingStrategy)];


var boxI = 0;
var handI = 0;


var remainingCards = freshShuffledDecks(6);
var phase = Phase.BETTING;


class Table {
	constructor(rules = new Rules(), phase = Phase.BETTING)
	{
		this.rules = rules;
		this.phase = phase;
	}
}

var table = new Table();



let stakeInput = document.getElementById("stake");
stakeInput.min = table.rules.limits.min;
stakeInput.max = table.rules.limits.max;
stakeInput.placeholder = table.rules.limits.min+"<x<"+table.rules.limits.max;
stakeInput.value = table.rules.limits.min;

let placeBetButton = document.getElementById("place-bet-button");
placeBetButton.onclick = () => placeBet(playerBoxes[boxI], table.rules);

let hitButton = document.getElementById("hit-button");
hitButton.onclick = () => hit(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);

let standButton = document.getElementById("stand-button");
standButton.onclick = () => stand(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);

let doubleButton = document.getElementById("double-button");
doubleButton.onclick = () => double(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);

let splitButton = document.getElementById("split-button");
splitButton.onclick = () => split(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);

let surrenderButton = document.getElementById("surrender-button");
surrenderButton.onclick = () => surrender(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);

let nextButton = document.getElementById("next-button");
nextButton.onclick = next;

let autoMoveButton = document.getElementById("auto-move-button");
autoMoveButton.onclick = () => autoMove(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);

let autoStepButton = document.getElementById("auto-step-button");
autoStepButton.onclick = () => autoStep(playerBoxes[boxI].hands[handI], playerBoxes[boxI], dealerBox.hands[0], remainingCards, table.rules);


let playingInput = document.getElementsByClassName("playing-input");
Array.from(playingInput).forEach(e => e.classList.add("disabled"));


let addPlayerBoxButton = document.getElementById("add-player-box-button");
addPlayerBoxButton.onclick = () =>
		{
			let player = new Player(10000);
			playerBoxes.push(
					new Box(player, playerBoxesDiv,
							flatBettingStrategy(10), false, false,
							basicStrategy, false, true,
							hiLoCountingStrategy));
		}

let tableSettings = createTable(table);

let tableDiv = document.getElementById("table-settings");
tableDiv.appendChild(tableSettings);

function main()
{
	start(table);
}
main();
