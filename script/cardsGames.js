// Copyright (c) 2021 Paul Raffer


const Suit = {
	SPADES: '♠',
	HEARTS: '♥',
	DIAMONDS: '♦',
	CLUBS: '♣',
}

const Rank = {
	ACE: 'A',
	TWO: '2',
	THREE: '3',
	FOUR: '4',
	FIVE: '5',
	SIX: '6',
	SEVEN: '7',
	EIGHT: '8',
	NINE: '9',
	TEN: 'T',
	JACK: 'J',
	QUEEN: 'Q',
	KING: 'K',
}

function suitToHTMLUnicodeCardPart(suit)
{
	switch (suit) {
	case Suit.SPADES:
		return 'A';
	case Suit.HEARTS:
		return 'B';
	case Suit.DIAMONDS:
		return 'C';
	case Suit.CLUBS:
		return 'D';
	}
}

function rankToHTMLUnicodeCardPart(rank)
{
	switch (rank) {
	case Rank.ACE:
		return '1';
	case Rank.TEN:
		return 'A';
	case Rank.JACK:
		return 'B';
	case Rank.QUEEN:
		return 'D';
	case Rank.KING:
		return 'E';
	default:
		return rank;
	}
}

class Card {

constructor(suit, rank)
{
	this.suit = suit;
	this.rank = rank;
}

HTMLFront()
{
	return	'&#x1F0' +
		suitToHTMLUnicodeCardPart(this.suit) +
		rankToHTMLUnicodeCardPart(this.rank) +
		';';
}

HTMLBack()
{
	return '&#x1F0A0;';
}

}

function freshDeck()
{
	var cards = [];
	Object.values(Suit).map(suit =>
	Object.values(Rank).map(rank =>
			cards.push(new Card(suit, rank))));
	return cards;
}

function freshDecks(n)
{
	return duplicate(freshDeck(), n);
}

function freshShuffledDecks(n)
{
	let decks = freshDecks(n);
	shuffle(decks);
	return decks;
}

function drawCard(cards)
{
	return cards.pop();
}


function cardsToString(cards)
{
	var cardsStr = "<span class=\"cards\">";
	for (card of cards) {
		cardsStr += "<span class=\"card "+card.suit+"\">"+card.HTMLFront()+"</span>";
	}
	cardsStr += "</span>";
	return cardsStr;
}

function cardsToString2(cards)
{
	var cardsStr = "";
	for (card of cards) {
		cardsStr += card.suit + card.rank + " ";
	}
	return cardsStr;
}
