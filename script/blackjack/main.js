// Copyright (c) 2021 Paul Raffer


const debug = false;


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

const has2Cards = hasNCards(2);


function isRankPair(cards)
{
	return has2Cards(cards) && cards[0].rank == cards[1].rank;
}

function isValuePair(cards)
{
	return has2Cards(cards) && rankValues[cards[0].rank][0] == rankValues[cards[1].rank][0];
}





class HandView extends View {

	constructor(hand, htmlParentElement)
	{
		super(hand, htmlParentElement);

		this.htmlElement.innerHTML =
			"<span id=\"cards-view\"></span>"+
			"<table class=\"properties\">"+
				"<tr><td>Value:</td><td id=\"value-info\"></td></tr>"+
				"<tr><td>Stake:</td><td id=\"stake-info\"></td></tr>"+
			"</table>";

		this.htmlElement.className = "hand";

		hand.update = () =>
		{
			const value = cardsValues(hand.cards);

			let cards =
			this.htmlElement.querySelector("#cards-view");
			cards.innerHTML = cardsToString(hand.cards);

			let valueInfo =
				this.htmlElement.querySelector("#value-info");
			valueInfo.innerText = value + (value.every(v => v > 21) ? " (Bust)" : "");

			let stakeInfo =
				this.htmlElement.querySelector("#stake-info");
			stakeInfo.innerHTML = moneyToString(hand.stake);
		};

		hand.update();
	}

}

class Hand {

	constructor(cards = [], stake = 0, resplitCount = 0)
	{
		this.cards = cards;
		this.stake = stake;
		this.resplitCount = resplitCount;
	}

}
	

function isHandSplitablePair(rules)
{
	return rules.canSplitSameRankOnly ? isRankPair : isValuePair;
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

const hasHand2Cards = hasHandNCards(2);


function isHandFresh(hand)
{
	return hand.resplitCount == 0 && hasHand2Cards(hand);
}

function isHandRankPair(hand)
{
	return isRankPair(hand.cards);
}

function isHandValuePair(hand)
{
	return isValuePair(hand.cards);
}

function isHandSplitablePair(rules)
{
	return rules.canSplitSameRankOnly ? isHandRankPair : isHandValuePair;
}

function isHandValue21(hand)
{
	return isValue21(hand.cards);
}

function isHandNatural(hand)
{
	return isHandFresh(hand) && isHandValue21(hand);
}

function isHandSplit(hand)
{
	return hand.resplitCount > 0;
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
		limits = { min: 10, max: 100 },
		payouts = new Payouts(), numRounds = Infinity,
		numDecks = 6, deckPenetration = .75,
		resplitLimit = Infinity,
		canDoubleAfterSplit = true,
		canSplitSameRankOnly = false,
		canResplitAces = true,
		canHitSplitAces = false,
		canSurrender = false,
		europeanHoleCard = true)
	{
		this.limits = limits;
		this.payouts = payouts;
		this.numRounds = numRounds;
		this.numDecks = numDecks;
		this.deckPenetration = deckPenetration;
		this.resplitLimit = resplitLimit;
		this.canDoubleAfterSplit = canDoubleAfterSplit;
		this.canSplitSameRankOnly = canSplitSameRankOnly;
		this.canResplitAces = canResplitAces;
		this.canHitSplitAces = canHitSplitAces;
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

	constructor(player,
		bettingStrategy, autoBet = false, warnOnBettingError = false,
		playingStrategy, autoPlay = false, warnOnPlayingError = false,
		countingStrategy,
		timeouts = new BoxTimeouts(),
		runningCount = 0,
		hands = [], stake = 0)
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
	}

	async bet_(table) { return this.bet(table); }
	async deal_(table) { return this.deal(table); }
	async play_(table) { return this.play(table); }
	async showdown_(table) { return this.showdown(table); }
}

class PlayerBox extends Box {

	async bet(table)
	{
		next(false);
		if (this.autoBet && this.bettingStrategy) {
			await waitFor(this.timeouts.autoBet);
			this.bettingStrategy(table.rules)(this, table.rules);
		}
		else {
			let bettingInput = document.getElementById("betting-input");
			bettingInput.classList.remove("disabled");
			
			await waitUntil(() => nextFlag);
	
			bettingInput.classList.add("disabled");
		}
	}
	
	async deal(table)
	{
		await waitFor(this.timeouts.deal);
		if (this.stake >= table.rules.limits.min &&
			this.stake <= table.rules.limits.max) {
			this.hands = [new Hand(
				[drawAndCountCard(table.remainingCards, table.playerBoxes),
				drawAndCountCard(table.remainingCards, table.playerBoxes)],
				this.stake)];
				this.update();
		}
	}
	
	async play(table)
	{
		for (table.current.hand of this.hands) {
			table.current.hand.setCurrent(true);
	
			const data = table.playingDecisionData();
	
			while (table.current.hand.cards.length < 2) {
				new Hit(data).execute();
			}
			next(false);
			
			await (this.autoPlay && this.playingStrategy ? 
				autoPlay : manuPlay)(data);
			
			table.current.hand.setCurrent(false);
		}
	}
	
	async showdown(table)
	{
		await waitFor(this.timeouts.showdown);
		let dealerHand = table.dealerBox.hands[0];
		for (table.current.hand of this.hands) {
			table.current.hand.setCurrent(true);
	
			const profit = table.current.hand.stake *
				payout(table.current.hand, dealerHand, table.rules);
			moveMoney(profit, this, table.dealerBox);
	
			table.current.hand.setCurrent(false);
		};
		table.dealerBox.update();
	}

}



class BoxView extends View {

constructor(box, htmlParentElement)
{
	super(box, htmlParentElement);

	let propertiesTable = createObjectControl(box, strategies);
	
	this.settingsDiv = document.createElement("div");
	this.settingsDiv.className = "box-info";

	this.settingsDiv.appendChild(propertiesTable);


	this.handsDiv = document.createElement("div");
	this.handsDiv.className = "hands";

	this.infoDiv = document.createElement("div");
	this.infoDiv.innerHTML =
		"<table class=\"properties\">"+
			"<tr><td>Bankroll:</td><td id=\"bankroll-info\" class=\"money\"></td></tr>"+
			"<tr><td>Running:</td><td id=\"running-count-info\"></td></tr>"+
		"</table>";


	this.htmlElement.className = "box";

	this.htmlElement.appendChild(this.handsDiv);
	this.htmlElement.appendChild(this.infoDiv);
	this.htmlElement.appendChild(this.settingsDiv);

	box.update = () =>
	{
		let bankrollInfo =
			this.infoDiv.querySelector("#bankroll-info");
		bankrollInfo.innerText = box.player.bankroll;

		let runningCountInfo =
			this.infoDiv.querySelector("#running-count-info");
		runningCountInfo.innerText = box.runningCount;
	
		this.handsDiv.innerHTML = "";
		box.hands.forEach(hand =>
			new HandView(hand, this.handsDiv));
	};

	box.update();
}

}



var nextFlag = false;

function next(n = true)
{
	nextFlag = n;
}












async function autoMove(data)
{
	next(false);
	if (table.current.phase == Phase.BETTING) {
		data.box.bettingStrategy(data.rules)(data.box, data.rules);
	}
	else if (table.current.phase == Phase.PLAYING) {
		await autoPlay(data);
	}
	next();
}

function autoStep(data)
{
	next(false);
	if (table.current.phase == Phase.BETTING) {
		data.box.bettingStrategy(data.rules)(data.box, data.rules);
		next();
	}
	else if (table.current.phase == Phase.PLAYING) {
		data.box.playingStrategy(data).make();
	}
}







const Phase = {
	BETTING: new Box().bet_,
	DEALING: new Box().deal_,
	PLAYING: new Box().play_,
	SHOWDOWN: new Box().showdown_,
};




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




function enablePlayingButtons(data)
{
	let playingInput = document.getElementById("playing-input");
	playingInput.classList.remove("disabled");
	Object.values(PlayingDecisions).forEach(Decision =>
		new Decision(data).updateButton());

}

function disablePlayingButtons()
{
	let playingInput = document.getElementById("playing-input");
	playingInput.classList.add("disabled");
}

async function autoPlay(data)
{
	while (!(nextFlag || isHandValue21(data.hand))) {
		await waitFor(data.box.timeouts.autoPlay);
		data.box.playingStrategy(data).make();
	}
}

async function manuPlay(data)
{
	enablePlayingButtons(data);
	await waitUntil(() => nextFlag || isHandValue21(data.hand));
	disablePlayingButtons();
}



function dealingDealer(playerBoxes, dealerBox, remainingCards)
{
	dealerBox.hands = [new Hand([
		drawAndCountCard(remainingCards, playerBoxes)])];
	dealerBox.update();
}

function playingDealer(dealerBox, remainingCards)
{
	next(false);
	while (!nextFlag) {
		dealerBox.playingStrategy(new PlayingDecisionData(
			table.rules, dealerBox.hands[0], dealerBox,
			dealerBox.hands[0], remainingCards)).make();
	}
}

async function showdownDealer(table)
{
	await waitFor(table.timeouts.betweenRounds);
	if (isCutCardReached(table)) {
		resetRunningCounts(table.playerBoxes);
		table.remainingCards =
			freshShuffledDecks(table.rules.numDecks);
		await waitFor(table.timeouts.shuffling);
	}
}



function isHandOnlyNatural(hand, hand2)
{
	return isHandNatural(hand) && !isHandNatural(hand2);
}

function isHandBustOrLess(hand, hand2)
{
	return isHandBust(hand) || bestHandValue(hand) < bestHandValue(hand2);
}

function payout(hand, dealerHand, rules)
{
	return isHandOnlyNatural(hand, dealerHand) ?
			rules.payouts.natural :
		isHandBustOrLess(hand, dealerHand) ?
			rules.payouts.loss :
		isHandBustOrLess(dealerHand, hand) ?
			rules.payouts.win :
			rules.payouts.push;
}

function moveMoney(profit, box, dealerBox)
{
	box.player.bankroll += profit;
	dealerBox.player.bankroll -= profit;
}




function isCutCardReached(table)
{
	return table.remainingCards.length <=
		(1 - table.rules.deckPenetration) * 52 * table.rules.numDecks;
}



async function start(table)
{
	for (table.current.round = 0; table.current.round < table.rules.numRounds; table.current.round++) {
		
		console.log("roundsPerMinute: "+table.roundsPerMinute());

		for (table.current.phase of Object.values(Phase)) {

			for (table.current.box of table.playerBoxes) {
				table.current.box.setCurrent(true);
				await table.current.phase.call(table.current.box, table);
				table.current.box.setCurrent(false);
				table.current.box.update();
			}

			table.current.box = table.dealerBox;
			table.current.hand = table.dealerBox.hands[0];
			
			table.dealerBox.setCurrent(true);
			switch (table.current.phase) {
			case Phase.DEALING:
				dealingDealer(table.playerBoxes, table.dealerBox, table.remainingCards);
				break;
			case Phase.PLAYING:
				playingDealer(table.dealerBox, table.remainingCards);
				break;
			case Phase.SHOWDOWN:
				await showdownDealer(table);
				break;
			}
			table.dealerBox.setCurrent(false);
		}
	}
}






function initInput(table)
{
	let stakeInput = document.getElementById("stake");
	stakeInput.value = table.rules.limits.min;

	let placeBetButton = document.getElementById("place-bet-button");
	placeBetButton.onclick = () => placeBetOnClick(
		table.current.box, table.rules);

	const data = () => table.playingDecisionData();

	let hitButton = document.getElementById("Hit-button");
	hitButton.onclick = () => new Hit(data()).make();

	let standButton = document.getElementById("Stand-button");
	standButton.onclick = () => new Stand(data()).make();

	let doubleButton = document.getElementById("Double-button");
	doubleButton.onclick = () => new Double(data()).make();

	let splitButton = document.getElementById("Split-button");
	splitButton.onclick = () => new Split(data()).make();

	let surrenderButton = document.getElementById("Surrender-button");
	surrenderButton.onclick = () => new Surrender(data()).make();

	let nextButton = document.getElementById("next-button");
	nextButton.onclick = next;

	let autoMoveButton = document.getElementById("auto-move-button");
	autoMoveButton.onclick = () => autoMove(table.playingDecisionData());

	let autoStepButton = document.getElementById("auto-step-button");
	autoStepButton.onclick = () => autoStep(table.playingDecisionData());

	disablePlayingButtons();
}


function initAddPlayerBoxButton()
{
	let addPlayerBoxButton =
		document.getElementById("add-player-box-button");
	addPlayerBoxButton.onclick = () =>
		{
			let player = new Player(10000);
			const newPlayerBox = new PlayerBox(player,
				flatBettingStrategyMin(table.rules),
				debug ? true : false, false,
				basicStrategy, debug ? true : false, true,
				hiLoCountingStrategy);
				
			table.playerBoxes.push(newPlayerBox);
			
			new BoxView(newPlayerBox, boxesDiv);
		};
}


function initTableSettings()
{
	var tableSettings = createObjectControl(table);
	let tableDiv = document.getElementById("table-settings");
	tableDiv.appendChild(tableSettings);

	let showCurrentPlayerOnlyInput =
		document.getElementsByClassName("showCurrentPlayerOnly-input")[0];
	showCurrentPlayerOnlyInput.onclick = e =>
		{
			document.querySelectorAll(".table>#boxes>.box").forEach(
				box => box.style.display = e.target.checked ?
					"none" : "inline-flex");
			document.querySelector(".table>#boxes>.box.dealer")
				.style.display = "inline-flex";
			document.querySelector(".table>#boxes>.box.current")
				.style.display = "inline-flex";
		};
}




var boxesDiv = document.getElementById("boxes");


var defaultDealer = new Player(0);
var defaultDealerBox = new Box(
	defaultDealer,
	undefined, false, false,
	dealerS17Strategy, true, false);

///defaultDealerBox.htmlElement.classList.add("dealer");


var defaultPlayer = new Player(10000);
var defaultPlayerBox = new PlayerBox(
	defaultPlayer,
	flatBettingStrategy(10),
	debug ? true : false, false,
	basicStrategy, debug ? true : false, true,
	hiLoCountingStrategy);
	var defaultPlayerBoxes = [defaultPlayerBox];
	

new BoxView(defaultDealerBox, boxesDiv);
new BoxView(defaultPlayerBox, boxesDiv);


class TableTimeouts {

	constructor(betweenRounds = 0, shuffling = 0)
	{
		this.betweenRounds = betweenRounds;
		this.shuffling = shuffling;
	}

}

class TableState {

	constructor()
	{
		this.round = 0;
		this.phase = Phase.BETTING;
		this.box = undefined;
		this.hand = undefined;
	}

}



class Timer {

	constructor()
	{
		this.startTime = new Date();
	}

	time()
	{
		return new Date() - this.startTime;
	}

}



class Table extends Timer {

	constructor(
		rules = new Rules(), timeouts = new TableTimeouts(),
		showCurrentPlayerOnly = false,
		dealerBox = defaultDealerBox, playerBoxes = defaultPlayerBoxes,
		current = new TableState())
	{
		super();
		this.rules = rules;
		this.timeouts = timeouts;
		this.showCurrentPlayerOnly = showCurrentPlayerOnly;
		this.dealerBox = dealerBox;
		this.playerBoxes = playerBoxes;
		this.current = current;
		this.remainingCards = freshShuffledDecks(this.rules.numDecks);
	}

	roundsPerMinute()
	{
		return this.current.round / (this.time()/1000/60);
	}

	playingDecisionData()
	{
		return new PlayingDecisionData(
			this.rules, this.current.hand, this.current.box,
			this.dealerBox.hands[0], this.remainingCards);
	}

}


var table = new Table();

function init(table)
{
	initInput(table);
	initAddPlayerBoxButton();
	initTableSettings();
}

function main()
{
	init(table);
	start(table);
}
main();
