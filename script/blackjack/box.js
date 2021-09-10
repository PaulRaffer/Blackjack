// Copyright (c) 2021 Paul Raffer


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



class DealerBox extends Box {

	bet(table) {}

	deal(table)
	{
		table.current.box.hands = [new Hand([
			drawAndCountCard(table.remainingCards, table.playerBoxes)])];
			table.current.box.update();
	}
	
	play(table)
	{
		next(false);
		while (!nextFlag) {
			table.current.box.playingStrategy(new PlayingDecisionData(
				table.rules, table.current.box.hands[0], table.current.box,
				table.current.box.hands[0], table.remainingCards)).make();
		}
	}
	
	async showdown(table)
	{
		await waitFor(table.timeouts.betweenRounds);
		if (isCutCardReached(table)) {
			resetRunningCounts(table.playerBoxes);
			table.remainingCards =
				freshShuffledDecks(table.rules.numDecks);
			await waitFor(table.timeouts.shuffling);
		}
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
	if (box.constructor == DealerBox)
		this.htmlElement.classList.add("dealer");

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