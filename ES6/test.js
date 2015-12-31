import 'babel-polyfill';

async function enter() {
  handle1();
  await handle2();
  handle3();
}

function handle1() {
  console.log('handle1 enter');
}

function handle2() {
  console.log('handle2 enter');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

function handle3() {
  console.log('handle3 enter');
}

enter();