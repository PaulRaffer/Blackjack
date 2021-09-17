// Copyright (c) 2021 Paul Raffer


function camelCaseToNormalCase(string)
{
	return string
		.replace(/[A-Z]/g, match => ' '+match.charAt(0))
		.replace(/^[a-z]/g, match => match.charAt(0).toUpperCase());
}

function camelCaseToLowerCase(string)
{
	return string.replace(/[A-Z]/g,
		match => ' '+match.charAt(0).toLowerCase());
}



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





const doWhen = (condition, action, timeout = 1000) => {
	return new Promise((resolve) => {
		let interval = setInterval(() => {
			if (condition())
				action(resolve, interval);
		}, timeout);
	});
};

const waitUntil = (condition, timeout = 10) => {
	return doWhen(condition,
		(resolve, interval) => {
			clearInterval(interval);
			resolve();
		}, timeout);
}

const waitFor = (delay) =>
	new Promise((resolve) =>
		setTimeout(resolve, delay));


class Timer {

	constructor()
	{
		this.startTime = new Date();
	}

	time()
	{
		return new Date() - this.startTime;
	}

}

function initAccessKeyLabels(selectors, element = document)
{
	let elements = element.querySelectorAll(selectors);
	for (let e of elements)
		e.title = e.accessKeyLabel || e.accessKey ? "Alt+"+e.accessKey : "";
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
		return input.checked;
	case "number":
		return Number(input.value);
	default:
		return input.value;
	}
}

function setInputValue(input, value)
{
	if (input.type == "checkbox")
		input.checked = value;
	else
		input.value = value;
}

function createSelect(object, p, datalist)
{
	let select = document.createElement("select");
	
	for (let o = 0; o < datalist.length; o++) {
		optionName = datalist[o].name;
		let option = document.createElement("option");
		option.value = optionName;
		option.innerText = camelCaseToNormalCase(optionName);
		select.appendChild(option);
		
		if (object[p] && optionName == object[p].name)
			select.selectedIndex = o;
	}
	
	select.onchange = event =>
		object[p] = window[getInputValue(select)];
	
	return select;
}

function createInput(object, p)
{
	let input = document.createElement("input");

	input.type = typeToInputType(typeof object[p]);
	setInputValue(input, object[p]);

	input.onchange = event =>
		object[p] = getInputValue(input);

	let oldValue = object[p];
	doWhen(() => oldValue != object[p], () => {
		setInputValue(input, object[p]);
		oldValue = object[p];
	});
	
	return input;
}

createTable.count = 0;
function createTable(object, datalists)
{
	let propertiesTable = document.createElement("table");
	propertiesTable.className = "properties";
	for (let p in object)
	{
		let propertyTR = document.createElement("tr");
		let propertyTD1 = document.createElement("td");
		let propertyName = document.createElement("label");

		propertyName.innerHTML = camelCaseToNormalCase(p)+":";
		propertyTD1.appendChild(propertyName);

		let propertyTD2 = document.createElement("td");
		let propertyValue =
			isObject(object[p]) ?
				createObjectControl(object[p]) :
			datalists[p] ?
				createSelect(object, p, datalists[p]) :
				createInput(object, p);

		propertyValue.id =
			"table"+createTable.count+++"-"+p+"-input";
		propertyName.htmlFor = propertyValue.id;
		propertyValue.className = p+"-input";

		propertyTD2.appendChild(propertyValue);
		propertyTR.appendChild(propertyTD1);
		propertyTR.appendChild(propertyTD2);
		propertiesTable.appendChild(propertyTR);
	}

	return propertiesTable;
}

function createToggleButton(element, icons)
{
	let toggleTableButton = document.createElement("button");
	toggleTableButton.className = "toggle";
	toggleTableButton.onclick = () =>
	{
		element.classList.toggle("display-none");
		toggleTableButton.innerText = icons[
			element.classList.contains("display-none")];
	};
	toggleTableButton.onclick();

	return toggleTableButton;
}


function createObjectControl(
	object, datalists = {},
	displayIcons = { true: ">", false: "v"}, timeout = 1000)
{
	let div = document.createElement("div");

	let table = createTable(object, datalists);
	let toggleTableButton = createToggleButton(table, displayIcons);

	div.appendChild(toggleTableButton);
	div.appendChild(table);

	return div;
}



class View {

	constructor(object, parentHtmlElement)
	{
		this.object = object;
		this.htmlElement = document.createElement("div");
		parentHtmlElement.appendChild(this.htmlElement);

		object.setCurrent = current => current ?
			this.htmlElement.classList.add("current") :
			this.htmlElement.classList.remove("current");
	}

}
