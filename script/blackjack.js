// Copyright (c) 2021 Paul Raffer


const PlayerDecision = [ hit, stand, double, split, surrender ]

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
			numDecks = 6, deckPenetration = .75,
			canDoubleAfterSplit = true, resplitLimit = Infinity,
			canSurrender = false, europeanHoleCard = true)
	{
		this.limits = limits;
		this.payouts = payouts;
		this.numRounds = numRounds;
		this.numDecks = numDecks;
		this.deckPenetration = deckPenetration;
		this.canDoubleAfterSplit = canDoubleAfterSplit;
		this.resplitLimit = resplitLimit;
		this.canSurrender = canSurrender;
		this.europeanHoleCard = europeanHoleCard;
	}
}


class Player {
	constructor(bankroll)
	{
		this.bankroll = bankroll;
	}
}

class BoxTimeouts {
	constructor(autoBet = 0, deal = 0, autoPlay = 0, showdown = 0)
	{
		this.autoBet = autoBet;
		this.deal = deal;
		this.autoPlay = autoPlay;
		this.showdown = showdown;
	}
}

const strategies = {
	bettingStrategy: [flatBettingStrategy(10), flatBettingStrategy(100), flatBettingStrategy(1000)],
	playingStrategy: [basicStrategy, superEasyBasicStrategy, noBustStrategy, dealerS17Strategy, dealerH17Strategy],
	countingStrategy: [hiLoCountingStrategy, koCountingStrategy]
};

class Box {
	static count = 0;

	constructor(
			player, htmlParentElement,
			bettingStrategy, autoBet = false, warnOnBettingError = false,
			playingStrategy, autoPlay = false, warnOnPlayingError = false,
			countingStrategy,
			timeouts = new BoxTimeouts(),
			runningCount = 0,
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
		this.timeouts = timeouts;
		this.runningCount = runningCount;
		this.hands = hands;
		this.stake = stake;
		this.id = id;
		

		let propertiesTable = createObjectControl(this, strategies);
		
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

	clearHands()
	{
		this.hands.map(hand =>
				{
					this.handsDiv.removeChild(hand.HTMLElement);
				});
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



var nextFlag = false;

function next(n = true)
{
	nextFlag = n;
}




function canMakeBettingDecision(box, stake, rules)
{
	return stake >= rules.limits.min && stake <= rules.limits.max;
}


function alertIllegalBettingDecision(box, stake, rules)
{
	console.log("Hallo");
	return alert(
			"Illegal Betting Decision!\n\n" +
			"Your stake: " + stake + "$\n" +
			"Limits: " + rules.limits.min+"$..."+rules.limits.max+"$");
}


function isCorrectBettingDecision(box, stake, rules)
{
	return box.bettingStrategy ? box.bettingStrategy(rules) == stake : true;
}


function confirmIncorrectBettingDecision(box, stake, rules)
{
	return confirm(
			"Betting Strategy Error!\n\n" +
			

			"Your stake: " + stake + "$\n" +
			"Correct stake (" + box.bettingStrategy.name + "): " + box.bettingStrategy(rules) + "\n\n" +
			"Do you really want to continue?");
}


function makeBettingDecision(box, stake, rules)
{
	return	phase == Phase.BETTING &&
			(canMakeBettingDecision(box, stake, rules) || alertIllegalBettingDecision(box, stake, rules)) &&
			(isCorrectBettingDecision(box, stake, rules) ||
			!box.warnOnBettingError ||
			confirmIncorrectBettingDecision(box, stake, rules));
}


function placeBet(stake) {
	return (box, rules) => {
		if (makeBettingDecision(box, stake, rules)) {
			box.stake = stake;
			next();
		}
	}
}

function placeBetOnClick(box, rules)
{
	var stake = document.getElementById("stake").value;
	placeBet(stake)(box, rules);
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
	return isHandFresh(hand)
			&& rules.canSurrender;
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


function alertIllegalPlayingDecision(hand, box, dealerHand, decision, rules)
{
	return alert(
			"Illegal Playing Decision!\n\n" +
			"Your hand: " + cardsToString2(hand.cards) + "= " + validHandValues(hand) + "\n" +
			"Dealers hand: " + cardsToString2(dealerHand.cards) + "= " + validHandValues(dealerHand) + "\n" +
			"Your decision: " + decision.name);
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
			(canMakePlayingDecision(hand, decision, rules) || alertIllegalPlayingDecision(hand, box, dealerHand, decision, rules)) &&
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

const surrenderHit = (hand, rules) => canMakePlayingDecisionSurrender(hand, rules) ? surrender : hit;







function autoMove(hand, box, dealerHand, remainingCards, rules)
{
	next(false);
	if (phase == Phase.BETTING) {
		box.bettingStrategy(rules)(box, rules);
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
		box.bettingStrategy(rules)(box, rules);
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
		return placeBet(stake);
	}
	return flatBettingStrategy;
}

function flatBettingStrategyMin(rules)
{
	return flatBettingStrategy(rules.limits.min);
}

function flatBettingStrategyMax(rules)
{
	return flatBettingStrategy(rules.limits.max);
}


function martingaleBettingStrategy()
{
	//TODO
}



function playingStrategyToTable(strategy, rules)
{
	const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'];
	const softRanks = ['2', '3', '4', '5', '6', '7', '8', '9'];

	let strategyTable = document.createElement("table");

	// Pairs
	{
		let strategyTRdealerHandValue = document.createElement("tr");
		let strategyTDTitle = document.createElement("td");
		strategyTDTitle.innerText = "Pairs";
		strategyTRdealerHandValue.appendChild(strategyTDTitle);
		for (dealerRank of ranks) {
			let strategyTDhandValue = document.createElement("td");
			strategyTDhandValue.innerText = dealerRank;
			strategyTRdealerHandValue.appendChild(strategyTDhandValue);
		}
		strategyTable.appendChild(strategyTRdealerHandValue);
	}
	for (rank of ranks) {
		let strategyTR = document.createElement("tr");
		
		let cards = [new Card(undefined, rank), new Card(undefined, rank)];
		let hand = new Hand(cards);

		let strategyTDhandValue = document.createElement("td");
		strategyTDhandValue.innerText = rank+","+rank;
		strategyTR.appendChild(strategyTDhandValue);

		for (dealerRank of ranks) {
			let dealerCards = [new Card(undefined, dealerRank)];
			let dealerHand = new Hand(dealerCards);

			let strategyTD = document.createElement("td");
			const correctDecision = strategy(hand, dealerHand, rules);
			if (correctDecision)
				strategyTD.className = strategyTD.innerText = correctDecision.name;

			strategyTR.appendChild(strategyTD);
		}
		strategyTable.appendChild(strategyTR);
	}


	// Soft Totals
	{
		let strategyTRdealerHandValue = document.createElement("tr");
		let strategyTDTitle = document.createElement("td");
		strategyTDTitle.innerText = "Soft";
		strategyTRdealerHandValue.appendChild(strategyTDTitle);
		for (dealerRank of ranks) {
			let strategyTDhandValue = document.createElement("td");
			strategyTDhandValue.innerText = dealerRank;
			strategyTRdealerHandValue.appendChild(strategyTDhandValue);
		}
		strategyTable.appendChild(strategyTRdealerHandValue);
	}
	for (rank of softRanks) {
		let strategyTR = document.createElement("tr");
		
		let cards = [new Card(undefined, 'A'), new Card(undefined, rank)];
		let hand = new Hand(cards);

		let strategyTDhandValue = document.createElement("td");
		strategyTDhandValue.innerText = 'A'+","+rank;
		strategyTR.appendChild(strategyTDhandValue);

		for (dealerRank of ranks) {
			let dealerCards = [new Card(undefined, dealerRank)];
			let dealerHand = new Hand(dealerCards);

			let strategyTD = document.createElement("td");
			const correctDecision = strategy(hand, dealerHand, rules);
			if (correctDecision)
				strategyTD.className = strategyTD.innerText = correctDecision.name;

			strategyTR.appendChild(strategyTD);
		}
		strategyTable.appendChild(strategyTR);
	}


	// Hard Totals
	{
		let strategyTRdealerHandValue = document.createElement("tr");
		let strategyTDTitle = document.createElement("td");
		strategyTDTitle.innerText = "Hard";
		strategyTRdealerHandValue.appendChild(strategyTDTitle);
		for (dealerRank of ranks) {
			let strategyTDhandValue = document.createElement("td");
			strategyTDhandValue.innerText = dealerRank;
			strategyTRdealerHandValue.appendChild(strategyTDhandValue);
		}
		strategyTable.appendChild(strategyTRdealerHandValue);
	}
	let cardRanks = [3, 2];
	let c = 0;
	while (cardRanks[1] <= 8) {
		let strategyTR = document.createElement("tr");
		
		let cards = [new Card(undefined, cardRanks[0]), new Card(undefined, cardRanks[1])];
		let hand = new Hand(cards);

		let strategyTDhandValue = document.createElement("td");
		strategyTDhandValue.innerText = cardRanks[0]+cardRanks[1];
		strategyTR.appendChild(strategyTDhandValue);

		for (dealerRank of ranks) {
			let dealerCards = [new Card(undefined, dealerRank)];
			let dealerHand = new Hand(dealerCards);

			let strategyTD = document.createElement("td");
			const correctDecision = strategy(hand, dealerHand, rules);
			if (correctDecision)
				strategyTD.className = strategyTD.innerText = correctDecision.name;

			strategyTR.appendChild(strategyTD);
		}
		strategyTable.appendChild(strategyTR);

		cardRanks[c]++;
		if (cardRanks[c] >= 10)
			cardRanks[c] = 'T';
		c = c == 0 ? 1 : 0;
	}



	return strategyTable;
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
			if ((dealerHandValue >= 3 && dealerHandValue <= 6)
			|| (dealerHandValue == 2 && rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		case 4:
			if ((dealerHandValue >= 5 && dealerHandValue <= 6) && rules.canDoubleAfterSplit) {
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
		await waitFor(box.timeouts.autoBet);
		box.bettingStrategy(rules)(box, rules);
	}
	else {
		let bettingInput = document.getElementsByClassName("betting-input");
		Array.from(bettingInput).forEach(e => e.classList.remove("disabled"));
		
		await waitUntil(() => nextFlag);

		Array.from(bettingInput).forEach(e => e.classList.add("disabled"));
	}
}

async function dealing(box, remainingCards, rules)
{
	await waitFor(box.timeouts.deal);
	if (box.stake >= rules.limits.min && box.stake <= rules.limits.max) {
		box.clearHands();
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
				await waitFor(box.timeouts.autoPlay);
				box.playingStrategy(hand, dealerHand, rules)
						(hand, box, dealerHand, remainingCards, rules);
			}
		}
		else {
			let playingInput = document.getElementsByClassName("playing-input");
			Array.from(playingInput).forEach(e => e.classList.remove("disabled"));
			PlayerDecision.forEach(decision => {
				if (canMakePlayingDecision(hand, decision, rules)) {
					let button = document.getElementById(decision.name+"-button");
					button.classList.remove("disabled");
				}
			});

			await waitUntil(() => nextFlag || isHandValue21(hand));

			Array.from(playingInput).forEach(e => e.classList.add("disabled"));
			Array.from(playingInput).forEach(e =>
			Array.from(e.children).forEach(c =>
				c.classList.add("disabled")));
		}
		hand.HTMLElement.classList.remove("current");
	}
}


async function showdown(box, dealerBox, rules)
{
	await waitFor(box.timeouts.showdown);
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
					await betting(box, table.rules);
					break;
				case Phase.DEALING:
					await dealing(box, remainingCards, table.rules);
					break;
				case Phase.PLAYING:
					await playing(box, dealerBox.hands[0], remainingCards, table.rules);
					break;
				case Phase.SHOWDOWN:
					await showdown(box, dealerBox, table.rules);
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
				await waitFor(table.timeouts.betweenRounds);
				if (remainingCards.length <= (1 - table.rules.deckPenetration) * 52 * table.rules.numDecks) {
					resetRunningCounts(playerBoxes);
					remainingCards = freshShuffledDecks(table.rules.numDecks);
					await waitFor(table.timeouts.shuffling);
				}
				break;
			}
			dealerBox.HTMLElement.classList.remove("current");
		}
	}
}


class TableTimeouts {
	constructor(betweenRounds = 0, shuffling = 0)
	{
		this.betweenRounds = betweenRounds;
		this.shuffling = shuffling;
	}
}


class Table {
	constructor(rules = new Rules(), timeouts = new TableTimeouts(), phase = Phase.BETTING)
	{
		this.rules = rules;
		this.timeouts = timeouts;
		this.phase = phase;
	}
}

var table = new Table();


var boxesDiv = document.getElementById("boxes");

var dealer = new Player(0);
var dealerBox = new Box(dealer, boxesDiv,
		undefined, false, false,
		dealerS17Strategy, true, false);
dealerBox.HTMLElement.classList.add("dealer");

var player = new Player(10000);
var playerBoxes = [
		new Box(player, boxesDiv,
				flatBettingStrategyMin(table.rules), false, false,
				basicStrategy, false, true,
				hiLoCountingStrategy)];


var boxI = 0;
var handI = 0;


var remainingCards = freshShuffledDecks(6);
var phase = Phase.BETTING;






let stakeInput = document.getElementById("stake");
/*stakeInput.min = table.rules.limits.min;
stakeInput.max = table.rules.limits.max;
stakeInput.placeholder = table.rules.limits.min+"<x<"+table.rules.limits.max;*/
stakeInput.value = table.rules.limits.min;

let placeBetButton = document.getElementById("place-bet-button");
placeBetButton.onclick = () => placeBetOnClick(playerBoxes[boxI], table.rules);

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
Array.from(playingInput).forEach(e =>
Array.from(e.children).forEach(c =>
	c.classList.add("disabled")));


let addPlayerBoxButton = document.getElementById("add-player-box-button");
addPlayerBoxButton.onclick = () =>
		{
			let player = new Player(10000);
			playerBoxes.push(
					new Box(player, boxesDiv,
							flatBettingStrategyMin(table.rules), false, false,
							basicStrategy, false, true,
							hiLoCountingStrategy));
		}

let tableSettings = createObjectControl(table);

let tableDiv = document.getElementById("table-settings");
tableDiv.appendChild(tableSettings);


function main()
{
	start(table);
}
main();
