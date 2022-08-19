// Copyright (c) 2021 Paul Raffer


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

class TableTimeouts {

	constructor(betweenRounds = 0, shuffling = 0)
	{
		this.betweenRounds = betweenRounds;
		this.shuffling = shuffling;
	}

}

class TableViewSettings {
	constructor(
		showHandTotals = false,
		showCurrentPlayerOnly = false,
		showAutoMoveButton = false,
		showAutoStepButton = false,
		showDiscardTray = false)
	{
		this.showHandTotals = showHandTotals;
		this.showCurrentPlayerOnly = showCurrentPlayerOnly;
		this.showAutoMoveButton = showAutoMoveButton;
		this.showAutoStepButton = showAutoStepButton;
		this.showDiscardTray = showDiscardTray;
	}
}

class TableSettings {
	constructor(rules = new Rules(),
		timeouts = new TableTimeouts(),
		view = new TableViewSettings())	
	{
		this.rules = rules;
		this.timeouts = timeouts;
		this.view = view;
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

class Table extends Timer {

	constructor(
		settings = new TableSettings(),
		dealerBox = defaultDealerBox,
		playerBoxes = defaultPlayerBoxes,
		current = new TableState())
	{
		super();
		this.settings = settings;
		this.dealerBox = dealerBox;
		this.playerBoxes = playerBoxes;
		this.current = current;
		this.remainingCards = freshShuffledDecks(this.settings.rules.numDecks);
	}

	roundsPerMinute()
	{
		return this.current.round / (this.time()/1000/60);
	}

	playingDecisionData()
	{
		return new PlayingDecisionData(
			this.settings.rules, this.current.hand, this.current.box,
			this.dealerBox.hands[0], this.remainingCards);
	}

}
