/*function flatBettingStrategy(stake)
{
	function flatBettingStrategy(box, rules)
	{
		return new BettingDecision(box, stake, rules).placeBet();
	}
	return flatBettingStrategy;
}*/

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




function dealerS17Strategy(data)
{
	if (cardsValues(data.hand.cards)[0] <= 16) {
		return new Hit(data);
	}
	else {
		return new Stand(data);
	}
}

function dealerH17Strategy(data)
{
	if ((cardsValues(data.hand.cards)[0] <= 16) ||
		(isSoft(data.hand.cards) &&
		cardsValues(data.hand.cards)[0] == 17)) {
		return new Hit(data);
	}
	else {
		return new Stand(data);
	}
}

function superEasyBasicStrategy(data)
{
	if ((isHard(data.hand.cards) &&
		((cardsValues(data.hand.cards)[0] <= 16 &&
		cardsValues(dealerHand.cards)[0] >= 7) ||
		cardsValues(hand.cards)[0] <= 11)) ||
		(isSoft(data.hand.cards) &&
		cardsValues(data.hand.cards)[0] <= 17)) {
		return new Hit(data);
	}
	else {
		return new Stand(data);
	}
}

function basicStrategySplit(data)
{
	const dealerHandValue = bestHandValue(data.dealerHand);
	const split = new Split(data);
	if (split.isLegal()) {
		const cardValue = rankValues[data.hand.cards[0].rank];
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
			if ((dealerHandValue >= 3 && dealerHandValue <= 6) ||
				(dealerHandValue == 2 &&
				data.rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		case 4:
			if ((dealerHandValue >= 5 && dealerHandValue <= 6) &&
				data.rules.canDoubleAfterSplit) {
				return split;
			}
			break;
		case 3:
		case 2:
			if ((dealerHandValue >= 4 && dealerHandValue <= 7) ||
				(dealerHandValue >= 2 && dealerHandValue <= 3 &&
				data.rules.canDoubleAfterSplit)) {
				return split;
			}
			break;
		}
	}
	return undefined;
}

const ifLegalElse = (f1, f2) => data => {
	const t1 = f1(data);
	return t1.isLegal() ? t1 : f2(data);
};

function basicStrategy(data)
{
	let decision = basicStrategySplit(data);
	
	const handValue = bestHandValue(data.hand);
	const dealerHandValue = bestHandValue(data.dealerHand);

	const stand = data => new Stand(data);
	const hit = data => new Hit(data);
	const double = data => new Double(data);
	const surrender = data => new Surrender(data);
	const doubleStand = ifLegalElse(double, stand);
	const doubleHit = ifLegalElse(double, hit);
	const surrenderHit = ifLegalElse(surrender, hit);

	return	decision ?
				decision :
			(isHandSoft(data.hand) ?
				handValue == 20 ? stand :
				handValue == 19 ?
					dealerHandValue == 6 ? doubleStand : stand :
				handValue == 18 ?
					dealerHandValue <= 6 ? doubleStand :
					dealerHandValue <= 8 ? stand : hit :
				handValue == 17 ?
					dealerHandValue >= 3 && dealerHandValue <= 6 ? doubleHit : hit :
				handValue <= 16 && handValue >= 15 ?
					dealerHandValue >= 4 && dealerHandValue <= 6 ? doubleHit : hit :
				handValue <= 14 && handValue >= 13 ?
					dealerHandValue >= 5 && dealerHandValue <= 6 ? doubleHit : hit :
				handValue == 12 ? hit :
				undefined :
			isHandHard(data.hand) ?
				handValue == 16 && dealerHandValue >= 9 && dealerHandValue <= 11 ? surrenderHit :
				handValue == 15 && dealerHandValue == 10 ? surrenderHit :
				handValue >= 17 ? stand :
				handValue <= 16 && handValue >= 13 ?
					dealerHandValue <= 6 ? stand : hit :
				handValue == 12 ?
					dealerHandValue >= 4 && dealerHandValue <= 6 ? stand : hit :
				handValue == 11 ? doubleHit :
				handValue == 10 ?
					dealerHandValue <= 9 ? doubleHit : hit :
				handValue == 9 ?
					dealerHandValue >= 3 && dealerHandValue <= 6 ? doubleHit : hit :
				handValue <= 8 ? hit :
				undefined :
			undefined)(data);
}











function noBustStrategy(data)
{
	if (cardsValues(data.hand.cards)[0] <= 11) {
		return hit;
	}
	else {
		return stand;
	}
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
