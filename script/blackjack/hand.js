// Copyright (c) 2021 Paul Raffer


function cardsValues(cards)
{
	var value = [0];
	for (card of cards) {
		value = combineElements(value, rankValues[card.rank]);
	}
	return [...new Set(value)];
}

function validValues(values)
{
	return values.filter(v => v <= 21);
}

function validCardsValues(cards)
{
	return validValues(cardsValues(cards));
}

function bestCardsValue(cards)
{
	return validCardsValues(cards)[0];
}


function isValuesBust(values)
{
	return values.every(v => v > 21);
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
	return isValuesBust(cardsValues(cards));
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
		this.played_ = false;
	}

	get played()
	{
		this.played_ |= isHandBust(this) || isHandValue21(this);
		return this.played_;
	}

	set played(p)
	{
		this.played_ = p;
	}

}


class HandView extends View {

	constructor(hand, parentHtmlElement, table, timeout = 10)
	{
		super(hand, parentHtmlElement, timeout);

		this.htmlElement.innerHTML =
			"<span id=\"cards-view\"></span>"+
			"<table class=\"properties\">"+
				"<tr id=\"value-tr\"><td>Value:</td><td id=\"value-info\"></td></tr>"+
				"<tr><td>Stake:</td><td id=\"stake-info\"></td></tr>"+
			"</table>";

		this.htmlElement.classList.add("hand");
		
		let cards = this.htmlElement.querySelector("#cards-view");
		let valueInfo = this.htmlElement.querySelector("#value-info");
		let valueTr = this.htmlElement.querySelector("#value-tr");
		let stakeInfo = this.htmlElement.querySelector("#stake-info");

		this.update = (resolve, interval) =>
			{
				if (hand.cards == undefined) {
					this.parentHtmlElement.removeChild(this.htmlElement);
					clearInterval(interval);
					resolve();
				}
				else {
					cards.innerHTML = cardsToString(hand.cards);
					
					const values = cardsValues(hand.cards);
					valueInfo.innerText =
						values + (isValuesBust(values) ? " (Bust)" : "");
					
					table.settings.view.showHandTotals ?
						valueTr.classList.remove("display-none") :
						valueTr.classList.add("display-none");

					stakeInfo.innerHTML = moneyToString(hand.stake);
				}
			};
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
