// Copyright (c) 2021 Paul Raffer

let rules = new Rules();

let box = new PlayerBox(
	undefined,
	flatBettingStrategy(10), false, false,
	basicStrategy, false, true,
	hiLoCountingStrategy);

let rulesControl = createObjectControl(rules);
let boxControl = createObjectControl(box, strategies);

let parent = document.getElementById("strategy");
parent.appendChild(rulesControl);
parent.appendChild(boxControl);


let playingStrategyTable;

const update = () =>
	{
		playingStrategyTable && parent.removeChild(playingStrategyTable);
		playingStrategyTable =
			playingStrategyToTable(box.playingStrategy, rules);
		parent.appendChild(playingStrategyTable);
	}

doWhen(() => true, () => update());
