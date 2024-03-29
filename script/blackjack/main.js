// Copyright (c) 2021 - 2022 Paul Raffer


const debug = false;



const countCard = countingStrategies => card =>
{
	countingStrategies.map(s => s.count(card));
}

const drawAndCountCard = countingStrategies => cards =>
{
	const card = drawCard(cards);
	countCard(countingStrategies)(card);
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







function payout(hand, dealerHand, rules)
{
	return isHandOnlyNatural(hand, dealerHand) ?
			rules.payouts.natural :
		isHandOnlyNatural(dealerHand, hand) ||
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


const pad = c => l => n => String(n).padStart(l, c);



async function start(table)
{
	let discardTrayPhotos = document.getElementById("discard-tray-photos");

	for (table.current.round = 0; table.current.round < table.settings.rules.numRounds; table.current.round++) {
		
		console.log("roundsPerMinute: "+table.roundsPerMinute());

		const cardsN = 52 * table.settings.rules.numDecks;
		const discardedCardsN = cardsN - table.remainingCards.length;
		const imgN = pad(0)(3)(discardedCardsN+1);
		discardTrayPhotos.src = `res/img/discard-tray/src/${imgN}.png`;

		for (table.current.phase of Object.values(Phase)) {
			for (table.current.box of table.playerBoxes.concat([table.dealerBox])) {
				table.current.box.setCurrent(true);
				await table.current.phase.call(table.current.box, table);
				table.current.box.setCurrent(false);
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

	let autoMoveButton = document.getElementById("auto-move-button");
	autoMoveButton.onclick = () =>
		autoMove(table.playingDecisionData());

	let autoStepButton = document.getElementById("auto-step-button");
	autoStepButton.onclick = () =>
		autoStep(table.playingDecisionData());


	initAccessKeyLabels("button, a, input");
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

	{
		let autoMoveButton = document.getElementById("auto-move-button");
		let showAutoMoveButtonInput =
			document.getElementsByClassName("showAutoMoveButton-input")[0];

		let onChangeAction = () => {
			let newValue = getInputValue(showAutoMoveButtonInput);
			onChangeAction.oldValue = newValue;
			newValue ?
				autoMoveButton.classList.remove("display-none") :
				autoMoveButton.classList.add("display-none");
		};
		onChangeAction();
		doWhen(() =>
			onChangeAction.oldValue != getInputValue(showAutoMoveButtonInput),
			onChangeAction);
	}

	{
		let autoStepButton = document.getElementById("auto-step-button");
		let showAutoStepButtonInput =
			document.getElementsByClassName("showAutoStepButton-input")[0];

		let onChangeAction = () => {
			let newValue = getInputValue(showAutoStepButtonInput);
			onChangeAction.oldValue = newValue;
			newValue ?
				autoStepButton.classList.remove("display-none") :
				autoStepButton.classList.add("display-none");
		};
		onChangeAction();
		doWhen(() =>
			onChangeAction.oldValue != getInputValue(showAutoStepButtonInput),
			onChangeAction);
	}

	{
		let element = document.getElementById("discard-tray");
		let input =
			document.getElementsByClassName("showDiscardTray-input")[0];

		let onChangeAction = () => {
			let newValue = getInputValue(input);
			onChangeAction.oldValue = newValue;
			newValue ?
				element.classList.remove("display-none") :
				element.classList.add("display-none");
		};
		onChangeAction();
		doWhen(() =>
			onChangeAction.oldValue != getInputValue(input),
			onChangeAction);
	}

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
