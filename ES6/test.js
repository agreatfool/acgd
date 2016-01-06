import 'babel-polyfill';

//async function enter() {
//  handle1();
//  await handle2();
//  handle3();
//}
//
//function handle1() {
//  console.log('handle1 enter');
//}
//
//function handle2() {
//  console.log('handle2 enter');
//  return new Promise((resolve) => {
//    setTimeout(() => {
//      resolve();
//    }, 5000);
//  });
//}
//
//function handle3() {
//  console.log('handle3 enter');
//}
//
//enter();

//----------------------------------------------------------------------

function enter(str1, str2) {
  return new Promise((resolve, reject) => {
    let random = Math.random();
    if (random > 0.5) {
      reject(new Error('failed, try again'));
    } else {
      resolve(str1 + str2 + ' : ' + random);
    }
  });
}

function retry(fn, args, retryLeft = 3) {
  console.log('args: ', args);
  return fn.apply(null, args).catch(function(err) {
    console.log(fn.name + ' failed: ', err, 'retry left: ', retryLeft);
    if (retryLeft <= 0) {
      console.log('max retry approach');
      throw err;
    }
    return retry(fn, args, retryLeft - 1);
  });
}

function enterRetry() {
  return retry(enter, arguments);
}

enterRetry('name is ', 'jonathan').then((_) => {
  console.log('final', _);
}, (err) => console.log('wrapped err: ', err));