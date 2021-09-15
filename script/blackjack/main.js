// Copyright (c) 2021 Paul Raffer


const debug = false;


const rankValues = {
	'A': [11, 1],
	'2': [ 2],
	'3': [ 3],
	'4': [ 4],
	'5': [ 5],
	'6': [ 6],
	'7': [ 7],
	'8': [ 8],
	'9': [ 9],
	'T': [10],
	'J': [10],
	'Q': [10],
	'K': [10],
};



















var nextFlag = false;

function next(n = true)
{
	nextFlag = n;
}












async function autoMove(data)
{
	next(false);
	if (table.current.phase == Phase.BETTING) {
		data.box.bettingStrategy(data.rules)(data.box, data.rules);
	}
	else if (table.current.phase == Phase.PLAYING) {
		await autoPlay(data);
	}
	next();
}

function autoStep(data)
{
	next(false);
	if (table.current.phase == Phase.BETTING) {
		data.box.bettingStrategy(data.rules)(data.box, data.rules);
		next();
	}
	else if (table.current.phase == Phase.PLAYING) {
		data.box.playingStrategy(data).make();
	}
}












function countCard(card, boxes)
{
	boxes.map(box =>
		{
			if (box.countingStrategy)
				box.runningCount += box.countingStrategy(card);
			box.update();
		});
}

function drawAndCountCard(cards, boxes)
{
	const card = drawCard(cards);
	countCard(card, boxes);
	return card;
}




function enablePlayingButtons(data)
{
	let playingInput = document.getElementById("playing-input");
	playingInput.classList.remove("disabled");
	Object.values(PlayingDecisions).forEach(Decision =>
		new Decision(data).updateButton());

}

function disablePlayingButtons()
{
	let playingInput = document.getElementById("playing-input");
	playingInput.classList.add("disabled");
}

async function autoPlay(data)
{
	while (!(nextFlag || isHandValue21(data.hand))) {
		await waitFor(data.box.timeouts.autoPlay);
		data.box.playingStrategy(data).make();
	}
}

async function manuPlay(data)
{
	enablePlayingButtons(data);
	await waitUntil(() => nextFlag || isHandValue21(data.hand));
	disablePlayingButtons();
}





function payout(hand, dealerHand, rules)
{
	return isHandOnlyNatural(hand, dealerHand) ?
			rules.payouts.natural :
		isHandBustOrLess(hand, dealerHand) ?
			rules.payouts.loss :
		isHandBustOrLess(dealerHand, hand) ?
			rules.payouts.win :
			rules.payouts.push;
}

function moveMoney(profit, box, dealerBox)
{
	box.player.bankroll += profit;
	dealerBox.player.bankroll -= profit;
}




function isCutCardReached(table)
{
	return table.remainingCards.length <=
		(1 - table.settings.rules.deckPenetration) * 52 * table.settings.rules.numDecks;
}



async function start(table)
{
	for (table.current.round = 0; table.current.round < table.settings.rules.numRounds; table.current.round++) {
		
		console.log("roundsPerMinute: "+table.roundsPerMinute());

		for (table.current.phase of Object.values(Phase)) {
			for (table.current.box of table.playerBoxes.concat([table.dealerBox])) {
				table.current.box.setCurrent(true);
				await table.current.phase.call(table.current.box, table);
				table.current.box.setCurrent(false);
				table.current.box.update();
			}
		}
	}
}






function initInput(table)
{
	let stakeInput = document.getElementById("stake");
	stakeInput.value = table.settings.rules.limits.min;

	let placeBetButton = document.getElementById("place-bet-button");
	placeBetButton.onclick = () => placeBetOnClick(
		table.current.box, table.settings.rules);

	const data = () => table.playingDecisionData();

	let hitButton = document.getElementById("Hit-button");
	hitButton.onclick = () => new Hit(data()).make();

	let standButton = document.getElementById("Stand-button");
	standButton.onclick = () => new Stand(data()).make();

	let doubleButton = document.getElementById("Double-button");
	doubleButton.onclick = () => new Double(data()).make();

	let splitButton = document.getElementById("Split-button");
	splitButton.onclick = () => new Split(data()).make();

	let surrenderButton = document.getElementById("Surrender-button");
	surrenderButton.onclick = () => new Surrender(data()).make();

	let nextButton = document.getElementById("next-button");
	nextButton.onclick = next;

	let autoMoveButton = document.getElementById("auto-move-button");
	autoMoveButton.onclick = () => autoMove(table.playingDecisionData());

	let autoStepButton = document.getElementById("auto-step-button");
	autoStepButton.onclick = () => autoStep(table.playingDecisionData());


	initButtons();
	disablePlayingButtons();
}


function initAddPlayerBoxButton(table)
{
	let addPlayerBoxButton =
		document.getElementById("add-player-box-button");
	addPlayerBoxButton.onclick = () =>
		{
			let player = new Player(10000);
			const newPlayerBox = new PlayerBox(player,
				flatBettingStrategyMin(table.settings.rules),
				debug ? true : false, false,
				basicStrategy, debug ? true : false, true,
				hiLoCountingStrategy);
				
			table.playerBoxes.push(newPlayerBox);
			
			new BoxView(newPlayerBox, boxesDiv, table);
		};
}


function initTableSettings(table)
{
	var tableSettings = createObjectControl(table.settings);
	let tableDiv = document.getElementById("table-settings");
	tableDiv.appendChild(tableSettings);

	let showCurrentPlayerOnlyInput =
		document.getElementsByClassName("showCurrentPlayerOnly-input")[0];
	showCurrentPlayerOnlyInput.onclick = e =>
		{
			document.querySelectorAll(".table>#boxes>.box").forEach(
				box => box.style.display = e.target.checked ?
					"none" : "inline-flex");
			document.querySelector(".table>#boxes>.box.dealer")
				.style.display = "inline-flex";
			document.querySelector(".table>#boxes>.box.current")
				.style.display = "inline-flex";
		};
}




var boxesDiv = document.getElementById("boxes");


var defaultDealer = new Player(0);
var defaultDealerBox = new DealerBox(
	defaultDealer,
	undefined, false, false,
	dealerS17Strategy, true, false);




var defaultPlayer = new Player(10000);
var defaultPlayerBox = new PlayerBox(
	defaultPlayer,
	flatBettingStrategy(10),
	debug ? true : false, false,
	basicStrategy, debug ? true : false, true,
	hiLoCountingStrategy);
	var defaultPlayerBoxes = [defaultPlayerBox];


var table = new Table();

new BoxView(defaultDealerBox, boxesDiv, table);
new BoxView(defaultPlayerBox, boxesDiv, table);



function init(table)
{
	initInput(table);
	initAddPlayerBoxButton(table);
	initTableSettings(table);
}

function main()
{
	init(table);

	start(table);
}
main();
