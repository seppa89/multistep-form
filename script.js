// Constants
const ELEMENTS = {
	sections: document.querySelectorAll('section'),
	prevBtn: document.querySelector('.btn--prev'),
	nextBtn: document.querySelector('.btn--next'),
	stepNumbers: document.querySelectorAll('li'),
	form: document.querySelector('form'),
	controls: {
		name: document.getElementById('name-control'),
		email: document.getElementById('email-control'),
		phone: document.getElementById('phone-control'),
	},
	plans: {
		arcade: document.getElementById('arcade'),
		advanced: document.getElementById('advanced'),
		pro: document.getElementById('pro'),
		changePlanBtn: null,
	},
	containers: {
		plan: document.querySelector('.step--two'),
		addOns: document.querySelector('.step--three'),
	},
};

const ADD_ON_TYPES = {
	'online-service': { label: 'Online Service', price: 1 },
	'larger-storage': { label: 'Larger Storage', price: 2 },
	'custom-profile': { label: 'Custom Profile', price: 2 },
};

const PLAN_TYPES = {
	arcade: { label: 'Arcade', price: 9 },
	advanced: { label: 'Advanced', price: 12 },
	pro: { label: 'Pro', price: 15 },
};

const INITIAL_FORM_STATE = {
	plan: 'arcade',
	subscription: 'monthly',
	addOn: {
		'online-service': true,
		'larger-storage': true,
		'custom-profile': false,
	},
};

// State
const formState = {
	name: '',
	email: '',
	phone: '',
	plan: '',
	subscription: '',
	addOn: {},
};

let currentStep = 1;

// UI Functions
function setCurrentStep(step) {
	ELEMENTS.sections.forEach(section => section.classList.add('hidden'));
	ELEMENTS.sections[currentStep - 1].classList.remove('hidden');

	if (currentStep < 5) {
		ELEMENTS.stepNumbers.forEach(step => step.classList.remove('step--active'));
		ELEMENTS.stepNumbers[currentStep - 1].classList.add('step--active');
	}

	if (step) {
		ELEMENTS.sections[step].classList.remove('hidden');
		ELEMENTS.stepNumbers[step].classList.add('step--active');
	}
}

function togglePriceVisibility(subscription) {
	const isMonthly = subscription === 'monthly';
	document
		.querySelectorAll('.price--month')
		.forEach(price => price.classList.toggle('hidden', !isMonthly));
	document
		.querySelectorAll('.price--year')
		.forEach(price => price.classList.toggle('hidden', isMonthly));
}

// Validation Functions
function isStepOneValid() {
	const controls = ELEMENTS.controls;
	let valid = true;
	const emailTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	Object.entries(controls).forEach(([name, control]) => {
		control.classList.remove('invalid');
		const fieldName = name;

		if (
			!formState[fieldName].trim() ||
			formState[fieldName].length < 3 ||
			(fieldName === 'email' && !emailTest.test(formState['email']))
		) {
			control.classList.add('invalid');
			valid = false;
		}
	});

	return valid;
}

// Navigation Functions
function nextStep() {
	const stepActions = {
		1: () => {
			if (isStepOneValid()) {
				ELEMENTS.prevBtn.style.visibility = 'visible';
				currentStep++;
				return true;
			}
			return false;
		},
		2: () => {
			currentStep++;
			togglePriceVisibility(formState.subscription);
			return true;
		},
		3: () => {
			ELEMENTS.nextBtn.type = 'submit';
			ELEMENTS.nextBtn.innerHTML = 'Confirm';
			ELEMENTS.form.onsubmit = e => e.preventDefault();
			currentStep++;
			renderSummary();
			return true;
		},
		4: () => {
			currentStep++;
			ELEMENTS.nextBtn.style.visibility = 'hidden';
			ELEMENTS.prevBtn.style.visibility = 'hidden';
			return true;
		},
	};

	if (stepActions[currentStep] && stepActions[currentStep]()) {
		setCurrentStep();
	}
}

function prevStep() {
	if (currentStep > 1) {
		currentStep--;
		if (currentStep === 1) {
			ELEMENTS.prevBtn.style.visibility = 'hidden';
		}
		if (currentStep !== 4) {
			ELEMENTS.nextBtn.type = 'button';
			ELEMENTS.nextBtn.innerHTML = 'Next Step';
		}
		setCurrentStep();
	}
}

// Summary Generation
function renderSummary() {
	const subscriptionType = formState.subscription;
	const shortSubscription = subscriptionType === 'monthly' ? 'mo' : 'yr';
	const planName = PLAN_TYPES[formState.plan].label;
	const planPrice =
		PLAN_TYPES[formState.plan].price *
		(subscriptionType === 'monthly' ? 1 : 10);
	const subscriptionName =
		formState.subscription[0].toUpperCase() + formState.subscription.slice(1);

	let totalPrice = planPrice;
	let template = `
        <div class="summary-plan active">
            <div class="summary-description">
                <p class="summary-name">${planName} (${subscriptionName})</p>
                <button class="plan-change-btn" type="button">Change</button>
            </div>
            <p class="summary-price">$${planPrice}/${shortSubscription}</p>
        </div>
    `;

	// Clear existing add-ons
	document.querySelectorAll('.add-on').forEach(node => node.remove());

	// Add new add-ons
	const selectedAddOns = Object.entries(formState.addOn)
		.filter(([_, isSelected]) => isSelected)
		.map(([addOn]) => {
			const price =
				ADD_ON_TYPES[addOn].price * (subscriptionType === 'monthly' ? 1 : 10);
			totalPrice += price;
			return `
                <div class="summary-plan add-on">
                    <div class="summary-description">
                        <p class="summary-name">${ADD_ON_TYPES[addOn].label}</p>
                    </div>
                    <p class="summary-price">+$${price}/${shortSubscription}</p>
                </div>
            `;
		})
		.join('');

	template += selectedAddOns;
	document.querySelector('.summary-total').innerHTML = `
	<p>Total (per ${shortSubscription === 'mo' ? 'month' : 'year'})</p>
	<p>+$${totalPrice}/${shortSubscription}</p>
	`;

	document.querySelector('.summary').innerHTML = template;
	ELEMENTS.plans.changePlanBtn = document.querySelector('.plan-change-btn');

	ELEMENTS.plans.changePlanBtn.addEventListener('click', () => {
		currentStep = 2;
		setCurrentStep();
		ELEMENTS.nextBtn.type = 'button';
		ELEMENTS.nextBtn.innerHTML = 'Next Step';
	});
}

// Initialization
function initForm() {
	// Initialize form inputs
	document.querySelectorAll('.step--one input').forEach(input => {
		// formState[input.id] = input.value;
		input.addEventListener('input', e => {
			formState[e.target.id] = e.target.value;
		});
	});

	// Initialize plan selection
	ELEMENTS.prevBtn.style.visibility = 'hidden';
	document.getElementById(INITIAL_FORM_STATE.plan).checked = true;
	document.getElementById('plan-type-btn').checked = !(
		INITIAL_FORM_STATE.subscription === 'monthly'
	);

	// Add event listeners
	ELEMENTS.containers.plan.addEventListener('click', e => {
		if (e.target.type === 'radio') {
			formState.plan = e.target.checked && e.target.id;
		}
	});

	ELEMENTS.containers.addOns.querySelectorAll('input').forEach(addOn => {
		formState.addOn[addOn.name] = addOn.checked;
		addOn.addEventListener('change', e => {
			formState.addOn[e.target.name] = e.target.checked;
		});
	});

	// Set initial state
	formState.plan = INITIAL_FORM_STATE.plan;
	formState.subscription = INITIAL_FORM_STATE.subscription;

	// Subscription type listener
	document.getElementById('plan-type-btn').addEventListener('change', e => {
		formState.subscription = e.target.checked ? 'yearly' : 'monthly';
	});
}

// Event Listeners
document.addEventListener('DOMContentLoaded', initForm);
ELEMENTS.prevBtn.addEventListener('click', prevStep);
ELEMENTS.nextBtn.addEventListener('click', nextStep);
