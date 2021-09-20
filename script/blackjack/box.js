// Copyright (c) 2021 Paul Raffer


async function autoMove(data)
{
	if (table.current.phase == Phase.BETTING) {
		data.box.bettingStrategy(data).make();
	}
	else if (table.current.phase == Phase.PLAYING) {
		await autoPlay(data);
	}
}

function autoStep(data)
{
	if (table.current.phase == Phase.BETTING) {
		data.box.bettingStrategy(data).make();
	}
	else if (table.current.phase == Phase.PLAYING) {
		data.box.playingStrategy(data).make();
	}
}

async function autoPlay(data)
{
	while (!data.hand.played) {
		await waitFor(data.box.timeouts.autoPlay);
		data.box.playingStrategy(data).make();
	}
}

async function manuPlay(data)
{
	enablePlayingButtons(data);
	await waitUntil(() => data.hand.played);
	disablePlayingButtons();
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





class Box {

	constructor(player,
		bettingStrategy, autoBet = false, warnOnBettingError = false,
		playingStrategy, autoPlay = false, warnOnPlayingError = false,
		countingStrategy, autoCount = false, warnOnCountingError = false,
		runningCountErrorTolerance = 0,
		timeouts = new BoxTimeouts())
	{
		this.player = player;
		this.bettingStrategy = bettingStrategy;
		this.autoBet = autoBet;
		this.warnOnBettingError = warnOnBettingError;
		this.playingStrategy = playingStrategy;
		this.autoPlay = autoPlay;
		this.warnOnPlayingError = warnOnPlayingError;
		this.countingStrategy = countingStrategy;
		this.autoCount = autoCount; // TODO
		this.warnOnCountingError = warnOnCountingError;
		this.runningCountErrorTolerance = runningCountErrorTolerance;
		this.timeouts = timeouts;
		this.runningCount = this.countingStrategy && this.countingStrategy.initialRunningCount();
		this.hands = [];
		this.stake = 0;
	}

	async bet_(table) { return this.bet(table); }
	async deal_(table) { return this.deal(table); }
	async play_(table) { return this.play(table); }
	async showdown_(table) { return this.showdown(table); }
}

const Phase = {
	BETTING: new Box().bet_,
	DEALING: new Box().deal_,
	PLAYING: new Box().play_,
	SHOWDOWN: new Box().showdown_,
};



class PlayerBox extends Box {

	async bet(table)
	{
		this.stake = 0;
		if (this.autoBet && this.bettingStrategy) {
			await waitFor(this.timeouts.autoBet);
			this.bettingStrategy(new BettingDecisionData(
				table.settings.rules, this)).make();
		}
		else {
			let bettingInput = document.getElementById("betting-input");
			bettingInput.classList.remove("disabled");
			
			await waitUntil(() => this.stake > 0);
			bettingInput.classList.add("disabled");
		}
		
		if (this.warnOnCountingError && !isInTolerance
			(this.countingStrategy.runningCount, this.runningCountErrorTolerance)
			(this.runningCount))
			console.log("Error!");
	}
	
	async deal(table)
	{
		await waitFor(this.timeouts.deal);
		if (this.stake >= table.settings.rules.limits.min &&
			this.stake <= table.settings.rules.limits.max) {
			let startHand = new Hand(
				[drawAndCountCard(countingStrategies)(table.remainingCards),
				drawAndCountCard(countingStrategies)(table.remainingCards)],
				this.stake);
			this.clearHands();
			this.addHand(startHand);
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
			
			await (this.autoPlay && this.playingStrategy ? 
				autoPlay : manuPlay)(data);

			if (this.warnOnCountingError && !isInTolerance
				(this.countingStrategy.runningCount, this.runningCountErrorTolerance)
				(this.runningCount))
				console.log("Error!");
		
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
				payout(table.current.hand, dealerHand, table.settings.rules);
			moveMoney(profit, this, table.dealerBox);
	
			table.current.hand.setCurrent(false);
		};
	}

}



class DealerBox extends Box {

	bet(table) {}

	deal(table)
	{
		let dealerStartHand = new Hand([
			drawAndCountCard(countingStrategies)(table.remainingCards)]);
		table.current.box.clearHands();
		table.current.box.addHand(dealerStartHand);
	}
	
	play(table)
	{
		table.current.hand = table.current.box.hands[0];
		table.current.hand.setCurrent(true);

		while (!table.current.hand.played)
			table.current.box.playingStrategy(
				table.playingDecisionData()).make();

		table.current.hand.setCurrent(false);
	}
	
	async showdown(table)
	{
		await waitFor(table.settings.timeouts.betweenRounds);
		if (isCutCardReached(table)) {
			resetRunningCounts(table.playerBoxes);
			table.remainingCards =
				freshShuffledDecks(table.settings.rules.numDecks);
			await waitFor(table.settings.timeouts.shuffling);
		}
	}

}






class BoxView extends View {

constructor(box, htmlParentElement, table)
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


	this.htmlElement.classList.add("box");
	if (box.constructor == DealerBox)
		this.htmlElement.classList.add("dealer");

	this.htmlElement.appendChild(this.handsDiv);
	this.htmlElement.appendChild(this.infoDiv);
	this.htmlElement.appendChild(this.settingsDiv);

	box.addHand = hand =>
		{
			new HandView(hand, this.handsDiv, table);
			box.hands.push(hand);
		}

	box.clearHands = () =>
		{
			box.hands.forEach(hand => {
				hand.cards = undefined;
			});
			box.hands = [];
		}

	let bankrollInfo =
		this.infoDiv.querySelector("#bankroll-info");
	let runningCountInfo =
		this.infoDiv.querySelector("#running-count-info");

	this.update = () =>
		{
			bankrollInfo.innerText = box.player.bankroll;
			runningCountInfo.innerText = box.runningCount;
		};
}

}