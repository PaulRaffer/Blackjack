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
				handValue == 12 ? hit :
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

function basicStrategyIllustrious18(hand, dealerHand, rules, trueCount)
{
	if (rules.numDecks == 1) {
		if (trueCount >= 1.4) {
			
		}
	}
	else if (rules.numDecks == 2) {

	}
	else if (rules.numDecks > 2) {

	}
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
