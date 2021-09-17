// Copyright (c) 2021 Paul Raffer


class CountingStrategy {

	constructor()
	{
		this.resetRunningCount();
		this.name = this.constructor.name.replace(/^[A-Z]/g,
			match => match.charAt(0).toLowerCase());
	}

	count(card)
	{
		this.runningCount += this.value(card);
	}

	resetRunningCount()
	{
		this.runningCount = this.initialRunningCount();
	}

}

class HiLoCountingStrategy extends CountingStrategy {

	initialRunningCount()
	{
		return 0;
	}

	value(card)
	{
		const value = rankValues[card.rank][0];
		return value <= 6 ? +1 : value >= 10 ? -1 : 0;
	}

	trueCount(numRemainingCards)
	{
		const numRemainingDecks = numRemainingCards / 52;
		const trueCount = this.runningCount / numRemainingDecks;
		return trueCount;
	}

}

class KoCountingStrategy extends CountingStrategy {

	initialRunningCount()
	{
		return 4;
	}

	value(card)
	{
		const value = rankValues[card.rank][0];
		return value <= 7 ? +1 : value >= 10 ? -1 : 0;
	}

	trueCount()
	{
		return this.runningCount;
	}

}


function resetRunningCounts(boxes)
{
	boxes.forEach(box => box.runningCount = 0);
}



var hiLoCountingStrategy = new HiLoCountingStrategy();
var koCountingStrategy = new KoCountingStrategy();

const countingStrategies = [hiLoCountingStrategy, koCountingStrategy];

const strategies = {
	bettingStrategy: [flatBettingStrategy(10), flatBettingStrategy(100), flatBettingStrategy(1000)],
	playingStrategy: [basicStrategy, superEasyBasicStrategy, noBustStrategy, dealerS17Strategy, dealerH17Strategy],
	countingStrategy: countingStrategies
};


