const ANIMATION_SPEED = 200;
const TICK = 1;
const STATS_ENDPOINT = 'https://covid19-api.vost.pt/Requests/get_full_dataset';

const TABLE_PROPS = [
	{
		id: 'new-cases',
		title: 'Novos Casos',
		prop: 'confirmados'
	},
	{
		id: 'recovered',
		title: 'Recuperados',
		prop: 'recuperados'
	},
	{
		id: 'deaths',
		title: 'Mortos',
		prop: 'obitos'
	},
	{
		id: 'hospitalized',
		title: 'Internados',
		prop: 'internados'
	}
];

let days = 1;
let data;

async function getData() {
	const response = await fetch(STATS_ENDPOINT);

	data = await response.json();
}

function updateData() {
	updateActiveCases();

	updateTable();
}

function onChange(e) {
	const value = e.value;
	
	switch (value) {
		case 'yesterday':
			days = 1;
			break;
		case 'lastweek':
			days = 7;
			break;
		case 'lastmonth':
			days = 30;
			break;
		default:
			break;
	}

	updateTable();
}

function updateTable() {
	const rows = TABLE_PROPS.map(tableProp =>`
			<div class="row">
				<p>${tableProp.title}</p>
				<p id="${tableProp.id}">0</p>
			</div>
		`);

	const tableElement = document.querySelector('.statistics-table');

	tableElement.innerHTML = rows;

	for (const {id, prop} of TABLE_PROPS) {
		const values = Object.values(data[prop]);
		const slicedValues = days === 1 ? values.slice(-2) : values.slice(-days);
		const value = slicedValues.slice(-1)[0] - slicedValues[0];

		animateNumbers(document.getElementById(id), value);
	}
}

function updateActiveCases() {
	const activeCasesElement = document.getElementById('active-cases');
	const activeCases = Object.values(data.ativos).slice(-1)[0];

	animateNumbers(activeCasesElement, activeCases, false);
}

function animateNumbers(element, value, addOperators = true) {
	const increment = Math.ceil(value / ANIMATION_SPEED);

	let lastValue = 0;

	let interval = setInterval(() => {
		lastValue = (value < 0 ? lastValue + increment < value : lastValue + increment > value) ? value : lastValue + increment;

		element.innerText = `${addOperators ? lastValue > 0 ? '+' : lastValue < 0 ? '-' : '' : ''}${lastValue}`;

		if (lastValue === value) {
			clearInterval(interval);
		}
	}, TICK);
}

window.onload = async () => {
	await getData();

	updateData();
}