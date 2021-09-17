// Copyright (c) 2021 Paul Raffer


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
			"Correct stake (" + camelCaseToNormalCase(this.data.box.bettingStrategy.name) + "): " + this.data.box.bettingStrategy(this.data.box, this.data.rules) + "\n\n" +
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
		this.data.hand.cards.push(drawAndCountCard(countingStrategies)(this.data.remainingCards));
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
			drawAndCountCard(countingStrategies)(this.data.remainingCards));
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
		next();
	}

}

const PlayingDecisions = {
	HIT: Hit,
	STAND: Stand,
	DOUBLE: Double,
	SPLIT: Split,
	SURRENDER: Surrender,
};