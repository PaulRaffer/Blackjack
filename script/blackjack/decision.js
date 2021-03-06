// Copyright (c) 2021 Paul Raffer


class DecisionData {

	constructor(rules, box)
	{
		this.rules = rules;
		this.box = box;
	}

}


class BettingDecisionData extends DecisionData {

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

	constructor(stake, data)
	{
		super(data);
		this.stake = stake;
	}

	phase()
	{
		return Phase.BETTING;
	}

	isLegal()
	{
		return this.stake >= this.data.rules.limits.min && this.stake <= this.data.rules.limits.max;
	}

	alertIllegal()
	{
		return alert(
			"Illegal Betting Decision!\n\n" +
			"Your stake: " + this.stake + "$\n" +
			"Limits: " + this.data.rules.limits.min+"$..."+this.data.rules.limits.max+"$");
	}

	isCorrect()
	{
		return this.data.box.bettingStrategy ?
			this.data.box.bettingStrategy(this.data).stake == this.stake : true;
	}

	confirmIncorrect()
	{
		return confirm(
			"Betting Strategy Error!\n\n" +
			

			"Your stake: " + this.stake + "$\n" +
			"Correct stake (" + camelCaseToNormalCase(this.data.box.bettingStrategy.name) + "): " + this.data.box.bettingStrategy(this.data).stake + "$\n\n" +
			"Do you really want to continue?");
	}

	warnOnIncorrect()
	{
		return this.data.box.warnOnBettingError;
	}

	execute()
	{
		this.data.box.stake = this.stake;
	}

}


function placeBetOnClick(box, rules)
{
	const stake = document.getElementById("stake").value;
	new BettingDecision(stake,
		new BettingDecisionData(rules, box)).make();
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
			"Dealers hand: " + cardsToString2(this.data.dealerHand.cards) + "= " + validHandValues(this.data.dealerHand) + "\n" +
			"Your decision: " + this.constructor.name);
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
			"Correct decision (" + camelCaseToNormalCase(this.data.box.playingStrategy.name) + "): " + this.data.box.playingStrategy(this.data).constructor.name + "\n\n" +
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
		this.data.hand.cards.push(drawAndCountCard(
			countingStrategies)(this.data.remainingCards));
	}

}



class Stand extends PlayingDecision {

	isLegal()
	{
		return true;
	}

	execute()
	{
		this.data.hand.played = true;
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
		this.data.hand.cards.push(drawAndCountCard(
			countingStrategies)(this.data.remainingCards));
		this.data.hand.played = true;
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
		this.data.box.addHand(hand2);
		while (this.data.hand.cards.length < 2) {
			new Hit(this.data).execute();
		}
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
		this.data.hand.played = true;
	}

}

const PlayingDecisions = {
	HIT: Hit,
	STAND: Stand,
	DOUBLE: Double,
	SPLIT: Split,
	SURRENDER: Surrender,
};