// Copyright (c) 2021 Paul Raffer


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
			const correctDecision = strategy(new PlayingDecisionData(
				rules, hand, undefined, dealerHand, undefined));
			if (correctDecision) {
				strategyTD.innerText = correctDecision.constructor.name;
				strategyTD.className = strategyTD.innerText.toLowerCase();
			}

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
			const correctDecision = strategy(new PlayingDecisionData(
				rules, hand, undefined, dealerHand, undefined));
			if (correctDecision) {
				strategyTD.innerText = correctDecision.constructor.name;
				strategyTD.className = strategyTD.innerText.toLowerCase();
			}

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
			const correctDecision = strategy(new PlayingDecisionData(
				rules, hand, undefined, dealerHand, undefined));
			if (correctDecision) {
				strategyTD.innerText = correctDecision.constructor.name;
				strategyTD.className = strategyTD.innerText.toLowerCase();
			}
			
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


const ifLegalElse = (f1, f2) => data => {
	const t1 = f1(data);
	return t1.isLegal() ? t1 : f2(data);
};

const stand = data => new Stand(data);
const hit = data => new Hit(data);
const double = data => new Double(data);
const split = data => new Split(data);
const surrender = data => new Surrender(data);
const hitStand = ifLegalElse(hit, stand);
const doubleStand = ifLegalElse(double, stand);
const doubleHit = ifLegalElse(double, hit);
const surrenderHit = ifLegalElse(surrender, hit);



function dealerS17Strategy(data)
{
	return new
		(bestHandValue(data.hand) <= 16 ?
		Hit : Stand)(data);
}

function dealerH17Strategy(data)
{
	return new
		((bestHandValue(data.hand) <= 16) ||
		(isHandSoft(data.hand) &&
		bestHandValue(data.hand) == 17) ?
		Hit : Stand)(data);
}

function superEasyBasicStrategy(data)
{
	return new
		((isHandHard(data.hand) &&
		((bestHandValue(data.hand) <= 16 &&
		bestHandValue(data.hand) >= 7) ||
		bestHandValue(data.hand) <= 11)) ||
		(isHandSoft(data.hand) &&
		bestHandValue(data.hand) <= 17) ?
		Hit : Stand)(data);
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



function basicStrategy(data)
{
	let decision = basicStrategySplit(data);
	
	const handValue = bestHandValue(data.hand);
	const dealerHandValue = bestHandValue(data.dealerHand);

	return decision ? decision :
		(isHandSoft(data.hand) ?
			handValue == 20 ? stand :
			handValue == 19 ?
				dealerHandValue == 6 ? doubleStand : stand :
			handValue == 18 ?
				dealerHandValue <= 6 ? doubleStand :
				dealerHandValue <= 8 ? stand : hitStand :
			handValue == 17 ?
				dealerHandValue >= 3 && dealerHandValue <= 6 ? doubleHit : hitStand :
			handValue <= 16 && handValue >= 15 ?
				dealerHandValue >= 4 && dealerHandValue <= 6 ? doubleHit : hitStand :
			handValue <= 14 && handValue >= 13 ?
				dealerHandValue >= 5 && dealerHandValue <= 6 ? doubleHit : hitStand :
			handValue == 12 ? hitStand :
			undefined :
		isHandHard(data.hand) ?
			handValue == 16 && dealerHandValue >= 9 && dealerHandValue <= 11 ? surrenderHit :
			handValue == 15 && dealerHandValue == 10 ? surrenderHit :
			handValue >= 17 ? stand :
			handValue <= 16 && handValue >= 13 ?
				dealerHandValue <= 6 ? stand : hitStand :
			handValue == 12 ?
				dealerHandValue >= 4 && dealerHandValue <= 6 ? stand : hitStand :
			handValue == 11 ? doubleHit :
			handValue == 10 ?
				dealerHandValue <= 9 ? doubleHit : hitStand :
			handValue == 9 ?
				dealerHandValue >= 3 && dealerHandValue <= 6 ? doubleHit : hitStand :
			handValue <= 8 ? hitStand :
			undefined :
		undefined)(data);
}



function noBustStrategy(data)
{
	return (cardsValues(data.hand.cards)[0] <= 11 ?
		hit : stand)(data);
}




