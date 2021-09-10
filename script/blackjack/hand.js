// Copyright (c) 2021 Paul Raffer


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





class Hand {

	constructor(cards = [], stake = 0, resplitCount = 0)
	{
		this.cards = cards;
		this.stake = stake;
		this.resplitCount = resplitCount;
	}

}


class HandView extends View {

	constructor(hand, htmlParentElement)
	{
		super(hand, htmlParentElement);

		this.htmlElement.innerHTML =
			"<span id=\"cards-view\"></span>"+
			"<table class=\"properties\">"+
				"<tr><td>Value:</td><td id=\"value-info\"></td></tr>"+
				"<tr><td>Stake:</td><td id=\"stake-info\"></td></tr>"+
			"</table>";

		this.htmlElement.classList.add("hand");

		hand.update = () =>
		{
			const value = cardsValues(hand.cards);

			let cards =
			this.htmlElement.querySelector("#cards-view");
			cards.innerHTML = cardsToString(hand.cards);

			let valueInfo =
				this.htmlElement.querySelector("#value-info");
			valueInfo.innerText = value + (value.every(v => v > 21) ? " (Bust)" : "");

			let stakeInfo =
				this.htmlElement.querySelector("#stake-info");
			stakeInfo.innerHTML = moneyToString(hand.stake);
		};

		hand.update();
	}

}


function validHandValues(hand)
{
	return validCardsValues(hand.cards);
}

function bestHandValue(hand)
{
	return bestCardsValue(hand.cards);
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



function isHandOnlyNatural(hand, hand2)
{
	return isHandNatural(hand) && !isHandNatural(hand2);
}

function isHandBustOrLess(hand, hand2)
{
	return isHandBust(hand) || bestHandValue(hand) < bestHandValue(hand2);
}
