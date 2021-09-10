// Copyright (c) 2021 Paul Raffer


const debug = false;


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

const has2Cards = hasNCards(2);


function isRankPair(cards)
{
	return has2Cards(cards) && cards[0].rank == cards[1].rank;
}

function isValuePair(cards)
{
	return has2Cards(cards) && rankValues[cards[0].rank][0] == rankValues[cards[1].rank][0];
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
			limits = { min: 10, max: 100 }, payouts = new Payouts(), numRounds = Infinity,
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
		this.hands.forEach(hand =>
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
		this.hands.forEach(hand =>
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








class DecisionData {

constructor(rules, box)
{
	this.rules = rules;
	this.box = box;
}

}


class BettingDecisionData extends DecisionData {

constructor(box, stake, rules)
{
	super(rules, box);
	this.stake = stake;
}

}


class PlayingDecisionData extends DecisionData {

constructor(rules, hand, box, dealerHand, remainingCards)
{
	super(rules, box);
	this.hand = hand;
	this.dealerHand = dealerHand;
	this.remainingCards = remainingCards;
}

}



class Decision {

constructor(data)
{
	this.data = data;
}

isConfirmed()
{
	return table.current.phase == this.phase() &&
		(this.isLegal() || this.alertIllegal()) &&
		(!this.warnOnIncorrect() ||
		this.isCorrect() || this.confirmIncorrect());
}

make()
{
	if (this.isConfirmed())
		this.execute();
}

updateButton()
{
	let button = document.getElementById(this.constructor.name+"-button");
	if (this.isLegal())
		button.classList.remove("disabled")
	else
		button.classList.add("disabled");
}

}


class BettingDecision extends Decision {

phase()
{
	return Phase.BETTING;
}

isLegal()
{
	return this.data.stake >= this.data.rules.limits.min && this.data.stake <= this.data.rules.limits.max;
}

alertIllegal()
{
	return alert(
		"Illegal Betting Decision!\n\n" +
		"Your stake: " + this.data.stake + "$\n" +
		"Limits: " + this.data.rules.limits.min+"$..."+this.data.rules.limits.max+"$");
}

isCorrect()
{
	return this.data.box.bettingStrategy ? this.data.box.bettingStrategy(this.data.box, this.data.rules) == this.data.stake : true;
}

confirmIncorrect()
{
	return confirm(
		"Betting Strategy Error!\n\n" +
		

		"Your stake: " + this.data.stake + "$\n" +
		"Correct stake (" + this.data.box.bettingStrategy.name + "): " + this.data.box.bettingStrategy(this.data.box, this.data.rules) + "\n\n" +
		"Do you really want to continue?");
}

warnOnIncorrect()
{
	return this.data.box.warnOnBettingError;
}

execute()
{
	this.data.box.stake = this.data.stake;
	next();
}

}


function placeBet(stake) {
	return (box, rules) => {
		let bettingDecision = new BettingDecision(new BettingDecisionData(box, stake, rules));
		bettingDecision.make();
	}
}

function placeBetOnClick(box, rules)
{
	var stake = document.getElementById("stake").value;
	placeBet(stake)(box, rules);
}




class PlayingDecision extends Decision {

phase()
{
	return Phase.PLAYING;
}

alertIllegal()
{
	return alert(
		"Illegal Playing Decision!\n\n" +
		"Your hand: " + cardsToString2(this.data.hand.cards) + "= " + validHandValues(this.data.hand) + "\n" +
		"Dealers hand: " + cardsToString2(this.data.dealerHand.cards) + "= " + validHandValues(this.dealerHand) + "\n" +
		"Your decision: " + this.name());
}

isCorrect()
{
	return this.data.box.playingStrategy ? this.data.box.playingStrategy(this.data).constructor.name == this.constructor.name : true;
}


confirmIncorrect()
{
	return confirm(
		"Playing Strategy Error!\n\n" +
		"Your hand: " + cardsToString2(this.data.hand.cards) + "= " + validHandValues(this.data.hand) + "\n" +
		"Dealers hand: " + cardsToString2(this.data.dealerHand.cards) + "= " + validHandValues(this.data.dealerHand) + "\n" +
		"Your decision: " + this.constructor.name + "\n" +
		"Correct decision (" + this.data.box.playingStrategy.name + "): " + this.data.box.playingStrategy(this.data).constructor.name + "\n\n" +
		"Do you really want to continue?");
}

warnOnIncorrect()
{
	return this.data.box.warnOnPlayingError;
}

}



class Hit extends PlayingDecision {

isLegal()
{
	return !isHandSplit(this.data.hand) ||
		this.data.hand.cards[0].rank != Rank.ACE ||
		this.data.rules.canHitSplitAces;
}

execute()
{
	this.data.hand.cards.push(drawAndCountCard(this.data.remainingCards, playerBoxes));
	this.data.hand.update();
	if (isHandBust(this.data.hand) || isHandValue21(this.data.hand))
		next();
}

}



class Stand extends PlayingDecision {

isLegal()
{
	return true;
}

execute()
{
	next();
}

}



class Double extends PlayingDecision {

isLegal()
{
	return hasHand2Cards(this.data.hand) &&
		(!isHandSplit(this.data.hand) ||
		this.data.rules.canDoubleAfterSplit);
}

execute()
{
	this.data.hand.stake *= 2;
	this.data.hand.cards.push(
		drawAndCountCard(this.data.remainingCards, playerBoxes));
	this.data.hand.update();
	next();
}
	
}



class Split extends PlayingDecision {

isLegal()
{
	return isHandSplitablePair(this.data.rules)(this.data.hand) &&
		this.data.hand.resplitCount < this.data.rules.resplitLimit &&
		(this.data.hand.cards[0].rank != Rank.ACE || !isHandSplit(this.data.hand) || this.data.rules.canResplitAces);
}

execute()
{
	var hand2 = new Hand([this.data.hand.cards.pop()], this.data.box.stake, ++this.data.hand.resplitCount);
	this.data.box.hands.push(hand2);
	while (this.data.hand.cards.length < 2) {
		new Hit(this.data).execute();
	}
	this.data.box.update();
}
	
}



class Surrender extends PlayingDecision {

isLegal()
{
	return isHandFresh(this.data.hand) && this.data.rules.canSurrender;
}

execute()
{
	this.data.box.player.bankroll -= 0.5 * this.data.hand.stake;
	this.data.box.update();
	next();
}

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
	BETTING: 0,
	DEALING: 1,
	PLAYING: 2,
	SHOWDOWN: 3,
}

const Phases = [
	betting,
	dealing,
	playing,
	showdown,
]






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




async function betting(box, rules)
{
	next(false);
	if (box.autoBet && box.bettingStrategy) {
		await waitFor(box.timeouts.autoBet);
		box.bettingStrategy(rules)(box, rules);
	}
	else {
		let bettingInput = document.getElementById("betting-input");
		bettingInput.classList.remove("disabled");
		
		await waitUntil(() => nextFlag);

		bettingInput.classList.add("disabled");
	}
}

async function dealing(box, remainingCards, rules)
{
	await waitFor(box.timeouts.deal);
	box.clearHands();
	if (box.stake >= rules.limits.min &&
		box.stake <= rules.limits.max) {
		box.hands = [new Hand(
			[drawAndCountCard(remainingCards, playerBoxes),
			drawAndCountCard(remainingCards, playerBoxes)],
			box.stake)];
		box.update();
	}
}

function enablePlayingButtons(data)
{
	let playingInput = document.getElementById("playing-input");
	playingInput.classList.remove("disabled");
	
	new Hit(data).updateButton();
	new Stand(data).updateButton();
	new Double(data).updateButton();
	new Split(data).updateButton();
	new Surrender(data).updateButton();
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

async function playing(box, dealerHand, remainingCards, rules)
{
	for (table.current.hand of box.hands) {

		table.current.hand.HTMLElement.classList.add("current");

		const data = new PlayingDecisionData(
			rules, table.current.hand, box, dealerHand, remainingCards);

		while (table.current.hand.cards.length < 2) {
			new Hit(data).execute();
		}
		next(false);
		
		await (box.autoPlay && box.playingStrategy ? 
			autoPlay : manuPlay)(data);
		
			table.current.hand.HTMLElement.classList.remove("current");
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

async function showdown(box, dealerBox, rules)
{
	await waitFor(box.timeouts.showdown);
	let dealerHand = dealerBox.hands[0];
	box.hands.forEach(hand => {
		hand.HTMLElement.classList.add("current");
		const profit = hand.stake * payout(hand, dealerHand, rules);
		moveMoney(profit, box, dealerBox);
		hand.HTMLElement.classList.remove("current");
	});
	dealerBox.update();
}


function isCutCardReached(table)
{
	return table.remainingCards.length <= (1 - table.rules.deckPenetration) * 52 * table.rules.numDecks;
}

function dealingDealer(playerBoxes, dealerBox, remainingCards)
{
	dealerBox.hands = [new Hand([drawAndCountCard(remainingCards, playerBoxes)])];
	dealerBox.update();
}

function playingDealer(dealerBox, remainingCards)
{
	next(false);
	while (!nextFlag) {
		dealerBox.playingStrategy(new PlayingDecisionData(table.rules, dealerBox.hands[0], dealerBox, dealerBox.hands[0], remainingCards)).make();
	}
}

async function showdownDealer(table)
{
	await waitFor(table.timeouts.betweenRounds);
	if (isCutCardReached(table)) {
		resetRunningCounts(playerBoxes);
		table.remainingCards = freshShuffledDecks(table.rules.numDecks);
		await waitFor(table.timeouts.shuffling);
	}
}

async function start(table)
{
	for (table.current.round = 0; table.current.round < table.rules.numRounds; table.current.round++) {
		
		console.log("roundsPerMinute: "+table.roundsPerMinute());

		for (table.current.phase = Phase.BETTING; table.current.phase <= Phase.SHOWDOWN; table.current.phase++) {

			for (table.current.box of playerBoxes) {
				table.current.box.HTMLElement.classList.add("current");
				switch (table.current.phase) {
				case Phase.BETTING:
					await betting(table.current.box, table.rules);
					break;
				case Phase.DEALING:
					await dealing(table.current.box, table.remainingCards, table.rules);
					break;
				case Phase.PLAYING:
					await playing(table.current.box, dealerBox.hands[0], table.remainingCards, table.rules);
					break;
				case Phase.SHOWDOWN:
					await showdown(table.current.box, dealerBox, table.rules);
					break;
				}
				table.current.box.HTMLElement.classList.remove("current");
				table.current.box.update();
			}
			
			dealerBox.HTMLElement.classList.add("current");
			switch (table.current.phase) {
			case Phase.DEALING:
				dealingDealer(playerBoxes, dealerBox, table.remainingCards);
				break;
			case Phase.PLAYING:
				playingDealer(dealerBox, table.remainingCards);
				break;
			case Phase.SHOWDOWN:
				await showdownDealer(table);
				break;
			}
			dealerBox.HTMLElement.classList.remove("current");
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
			playerBoxes.push(new Box(player, boxesDiv,
				flatBettingStrategyMin(table.rules),
				debug ? true : false, false,
				basicStrategy, debug ? true : false, true,
				hiLoCountingStrategy));
		}
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


var dealer = new Player(0);
var dealerBox = new Box(
	dealer, boxesDiv,
	undefined, false, false,
	dealerS17Strategy, true, false);

dealerBox.HTMLElement.classList.add("dealer");


var player = new Player(10000);
var playerBoxes = [new Box(
	player, boxesDiv,
	flatBettingStrategy(10),
	debug ? true : false, false,
	basicStrategy, debug ? true : false, true,
	hiLoCountingStrategy)];


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
		current = new TableState())
	{
		super();
		this.rules = rules;
		this.timeouts = timeouts;
		this.showCurrentPlayerOnly = showCurrentPlayerOnly;
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
			dealerBox.hands[0], this.remainingCards);
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
