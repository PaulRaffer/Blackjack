// Copyright (c) 2021 Paul Raffer


function shuffle(array)
{
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function duplicate(array, n)
{
	var result = [];
	for (i = 0; i < n; i++) {
		result = result.concat(array);
	}
	return result;
}

function combineElements(arrayA, arrayB, op = (a, b) => a + b)
{
	var result = [];
	for (a of arrayA) {
		for (b of arrayB) {
			result.push(op(a, b));
		}
	}
	return result;
}



const waitUntil = (condition) => {
	return new Promise((resolve) => {
		let interval = setInterval(() => {
			if (!condition()) {
				return
			}

			clearInterval(interval)
			resolve()
		}, 100)
	})
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))



function toggleDisplay(element)
{
	element.style.display =
			element.style.display == "none" ||
			element.style.display == ""
					? "block" : "none";
}

function moneyToString(money)
{
	return "<span class=\"money\">"+money+"</span>";
}





function isObject(x)
{
	return typeof x === 'object' && x !== null;
}



function typeToInputType(type)
{
	switch (type) {
	case "boolean":
		return "checkbox";
	default:
		return type;
	}
}


function getInputValue(input)
{
	switch (input.type) {
	case "checkbox":
		return input.value;
	case "number":
		return Number(input.value);
	default:
		return input.value;
	}
}

function setInputValue(input, value)
{
	if (input.type == "checkbox") {
		input.checked = value;
	}
	else {
		input.value = value;
	}
}

var createTableCount = 0;
function createTable(object, datalists, editable = false, displayIcons = { "none": ">", "block": "v" })
{
	let div = document.createElement("div");

	let propertiesTable = document.createElement("table");
	propertiesTable.className = "properties";
	for (let p in object)
	{
		let propertyTR = document.createElement("tr");
		let propertyTD1 = document.createElement("td");
		let propertyName = document.createElement("label");
		propertyName.htmlFor = "table"+createTableCount+"-"+p+"-input";
		propertyName.innerHTML = p+":";
		propertyTD1.appendChild(propertyName);

		let propertyTD2 = document.createElement("td");
		let propertyValue = null;
		if (isObject(object[p])) {
			propertyValue = createTable(object[p]);
		}
		else {
			if (datalists && datalists[p]) {
				propertyValue = document.createElement("select");
				
				propertyValue.onchange = event => object[p] = window[getInputValue(propertyValue)];

				for (let o = 0; o < datalists[p].length; o++) {
					optionValue = datalists[p][o];
					let option = document.createElement("option");
					option.value = optionValue;
					option.innerText = optionValue;
					propertyValue.appendChild(option);

					if (object[p] && optionValue == object[p].name)
						propertyValue.selectedIndex = o;
				}
			}
			else {
				propertyValue = document.createElement("input");
				propertyValue.type = typeToInputType(typeof object[p]);
				setInputValue(propertyValue, object[p]);
				propertyValue.onchange = event => object[p] = getInputValue(propertyValue);
			}
			propertyValue.id = "table"+createTableCount+"-"+p+"-input";
			propertyValue.className = p+"-input";
		}	
		propertyTD2.appendChild(propertyValue);
		propertyTR.appendChild(propertyTD1);
		propertyTR.appendChild(propertyTD2);
		propertiesTable.appendChild(propertyTR);
	}

	let toggleTableButton = document.createElement("button");
	toggleTableButton.className = "toggle";
	toggleTableButton.onclick = () =>
			{
				propertiesTable.style.display =
						propertiesTable.style.display == "none" ?
								"block" : "none";
				toggleTableButton.innerText = displayIcons[propertiesTable.style.display];
			};
	propertiesTable.style.display = "none";
	toggleTableButton.innerText = displayIcons[propertiesTable.style.display];


	let removeObjectButton = document.createElement("button");
	removeObjectButton.className = "remove-object-button";
	removeObjectButton.onclick = () =>
			{
			};
	propertiesTable.style.display = "none";
	removeObjectButton.innerText = "-";


	div.appendChild(toggleTableButton);
	div.appendChild(removeObjectButton);
	div.appendChild(propertiesTable);

	createTableCount++;
	return div;
}
