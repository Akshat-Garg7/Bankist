'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2025-01-16T14:11:59.604Z',
    '2025-01-05T17:01:17.194Z',
    '2025-01-20T23:36:17.929Z',
    '2025-01-21T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'en-IN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2025-01-14T16:33:06.386Z',
    '2025-01-16T14:43:26.374Z',
    '2025-01-20T18:49:59.371Z',
    '2025-01-21T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatMovementDate=function(date,locale)
{
  const calcDaysPassed=(date1,date2)=>Math.round(Math.abs(date2-date1)/(1000*60*60*24));
  const daysPassed=calcDaysPassed(new Date(),date);
  if(daysPassed===0) return 'Today';
  else if(daysPassed===1) return 'Yesterday';
  else if(daysPassed<=7) return `${daysPassed} days ago`;
  // const days=`${date.getDate()}`.padStart(2,'0');
  // const months=`${date.getMonth()+1}`.padStart(2,'0');
  // const years=date.getFullYear();
  // return `${days}/${months}/${years}`;
  return new Intl.DateTimeFormat(locale).format(date);
}

const formatCur=function(value,locale,currency)
{
  return new Intl.NumberFormat(locale,{style:'currency',currency:currency}).format(value);
}

const displayMovements=function(accs,sort=false)
{
  containerMovements.innerHTML='';
  
  const combinedMovsDates=accs.movements.map((mov,i)=>
  ({movement:mov,movementDate:accs.movementsDates.at(i),}));
  // console.log(combinedMovsDates);
  if(sort) combinedMovsDates.sort((a,b)=>a.movement-b.movement);
  
  combinedMovsDates.forEach(function(obj,i)
  {
    const {movement,movementDate}=obj;
    const type=movement>0?'deposit':'withdrawal';
    const date=new Date(movementDate);
    const displayDate=formatMovementDate(date,accs.locale);
    const formattedMov=formatCur(movement,accs.locale,accs.currency);
    const html=`<div class="movements__row">
      <div class="movements__type movements__type--${type}">${i+1} ${type}</div> 
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin',html);
  });

}


const calcDisplayBalance=function(acc)
{
  const balance=acc.movements.reduce((acc,mov)=>acc+mov,0);
  acc.balance=balance;
  labelBalance.textContent=`${formatCur(acc.balance,acc.locale,acc.currency)}`;
}


const calcDisplaySummary=function(acc)
{
  const incomes=acc.movements.filter(mov=>mov>0).reduce((acc,mov)=>acc+mov,0);
  labelSumIn.textContent=`${formatCur(incomes,acc.locale,acc.currency)}`;

  const out=acc.movements.filter(mov=>mov<0).reduce((acc,mov)=>acc+mov,0);
  labelSumOut.textContent=`${formatCur(out,acc.locale,acc.currency)}`;

  const interest=acc.movements.filter(mov=>mov>0).map(deposit=>deposit*acc.interestRate/100).filter((int,i,arr)=>int>=1).reduce((acc,int)=>acc+int,0);
  labelSumInterest.textContent=`${formatCur(interest,acc.locale,acc.currency)}`;
}


const createUsernames=function(accs)
{
  accs.forEach(function (acc)
  {
    acc.username=acc.owner.toLowerCase().split(' ').map(n=>n[0]).join('');
  });
}
createUsernames(accounts);

const updateUI=function(acc)
{
  displayMovements(acc);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
}
const startLogOutTimer=function()
{
  let time=500;
  const tick=function()
  {
    const min=String(Math.trunc(time/60)).padStart(2,'0');
    const sec=String(time%60).padStart(2,'0');
    labelTimer.textContent=`${min}:${sec}`;
    
    if(time===0) 
    {
      clearInterval(timer);
      labelWelcome.textContent='Log in to get started';
      containerApp.style.opacity=0;
    }
    time--;
  }
  
  tick();
  const timer=setInterval(tick,1000);
  return timer;
}
let currentAccount,timer; 
const date=new Date();

btnLogin.addEventListener('click',function(event)
{
  event.preventDefault();
  const options={
    hour:'numeric',
    minute:'numeric',
    day:'numeric',
    month:'numeric',
    year:'numeric',
  };
  // const day=Dates.getDate().toString().padStart(2,'0');
  // const month=`${Dates.getMonth()+1}`.padStart(2,'0');
  // const year=Dates.getFullYear();
  // const hour=Dates.getHours().toString().padStart(2,'0');
  // const min=Dates.getMinutes().toString().padStart(2,'0');
  // labelDate.textContent=`${day}/${month}/${year}, ${hour}:${min}`;

  currentAccount=accounts.find(acc=>acc.username===inputLoginUsername.value);
  
  if(currentAccount?.pin===Number(inputLoginPin.value))
  {
    labelWelcome.textContent=`Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity=100;

    labelDate.textContent=new Intl.DateTimeFormat(currentAccount.locale,options).format(date);

    inputLoginUsername.value=inputLoginPin.value='';
    inputLoginPin.blur();
    if(timer) clearInterval(timer);
    timer=startLogOutTimer();
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click',function(event)
{
  event.preventDefault();
  const amount=Number(inputTransferAmount.value);
  const receiverAcc=accounts.find(acc=>acc.username===inputTransferTo.value);
  inputTransferAmount.value=inputTransferTo.value='';
  // console.log(amount,receiverAcc,currentAccount);
  if(amount>0 && receiverAcc && currentAccount.balance>=amount &&  receiverAcc?.username!==currentAccount.username)
  {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(date.toISOString());
    currentAccount.movementsDates.push(date.toISOString());
    updateUI(currentAccount);
    clearInterval(timer);
    timer=startLogOutTimer();  
  }
});


btnLoan.addEventListener('click',function(event)
{
  event.preventDefault();
  const amount=Number(inputLoanAmount.value);
  if(amount>0 && currentAccount.movements.some(mov=>mov>=amount*0.1))
  {
    setTimeout(function()
    {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(date.toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
    timer=startLogOutTimer();  
    },3000);
  }
  inputLoanAmount.value='';
});

btnClose.addEventListener('click',function(event)
{
  event.preventDefault();
  if(inputCloseUsername.value===currentAccount.username && Number(inputClosePin.value)===currentAccount.pin)
  {
    // console.log('correct');
    const index=accounts.findIndex(acc=>acc.username===currentAccount.username);
    accounts.splice(index,1);
    containerApp.style.opacity=0;
  }
  inputCloseUsername.value=inputClosePin.value='';
});

let sorted=false;
btnSort.addEventListener('click',function(event)
{
  event.preventDefault();
  displayMovements(currentAccount,!sorted);
  sorted=!sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
