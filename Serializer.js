// Поскольку порядок чисел не важен, я сортирую массив, после чего разбиваю на последовательности по количеству бит
// Сохраняю в отдельном массиве количество бит и количество чисел в последовательности
// При этом проверяю, насколько выгодно выделять небольшие числа в отдельную последовательность
// поскольку на каждую такую последовательность я потрачу еще 7 бит (запись количества бит на одно число и остаток от 6
// для строки). Затем я собираю каждую последовательность в строку кратную 6 (в таблице 127 символов, но есть непечатные,
// поэтому беру не по 7 бит, а по 6 и прибавляю 33, пробел сохраняю для разделения последовательностей).
// Использую бинарные строки, перевожу в десятичное число, затем в символ и записываю в массив,
// который объединяю через пробел в строку.
// При десериализации мне понадобятся 3 бита (4-7, считая с 0), в котором я записал, сколько нулей в конце строки
// не несут информации. И в обратном порядке преобразую строку в массив

function serialize(nums) {
  nums.sort((a, b) => a - b);
  const arr = [];
  let bitCountArray = [];
  let bitCount = Math.floor(Math.log2(nums[0])) + 1;
  let index = 0;

  nums.forEach(item => {
    if (item < 2**bitCount) {
      !bitCountArray[index] ? bitCountArray.push([bitCount, 1]) : bitCountArray[index][1] += 1;
    } else {
      bitCount = Math.floor(Math.log2(item) + 1);

      if (bitCountArray[index][0] * bitCountArray[index][1] + 7 >= bitCount * bitCountArray[index][1]) {
        bitCountArray.push([bitCount, bitCountArray[index][1]]);
        bitCountArray[index][1] = 0;
      }

      if (bitCountArray[index]) index++;
      !bitCountArray[index] ? bitCountArray.push([bitCount, 1]) : bitCountArray[index][1] += 1;
    }    
  })
  
  bitCountArray = bitCountArray.filter(item => item[1] > 0);
  index = 0;
  bitCountArray.forEach((item) => {
    const tail = (7 + item[1] * item[0]) % 6 === 0 ? 0 : 6 - (7 + item[1] * item[0]) % 6;
    const prefix = (item[0] - 1).toString(2).padStart(4, '0') + (tail).toString(2).padStart(3, '0');
    let bstr = prefix + nums.slice(index, index + item[1]).map(elem => elem.toString(2).padStart(item[0], '0')).join('');
    bstr = bstr.padEnd(bstr.length + tail, '0');
    let str = '';

    for (let i = 0; i < bstr.length; i += 6) {
      str += String.fromCharCode(parseInt(bstr.slice(i, i + 6), 2) + 33);
    }

    arr.push(str);
    index += item[1];
  });

  return arr.join(' ');
}

function deserialize(str) {
  const result = [];
  const arr = str.split(' ').map(item => {
    return item.split('').map(item => (item.charCodeAt(0) - 33).toString(2).padStart(6, '0')).join('');
  });

  arr.forEach(item => {
    const bitCount = parseInt(item.slice(0, 4), 2) + 1;
    const tail = parseInt(item.slice(4, 7), 2);
    for (let i = 7; i < item.length - tail; i+=bitCount) {
      result.push(parseInt(item.slice(i, i + bitCount), 2));
    }
  });

  return result;
}

///тесты
const arrSimple50 = [];
const arrSimple100 = [];
const arrSimple500 = [];
for (let i = 0; i < 500; i++) {
  if (i < 50) {
    arrSimple50.push(Math.floor(Math.random() * 10) + 1);
  }
  if (i < 100) {
    arrSimple100.push(Math.floor(Math.random() * 10) + 1);
  }
  arrSimple500.push(Math.floor(Math.random() * 10) + 1);
}
const array900 = [];
for (let i = 1; i <= 900; i++) {
  array900.push(i);
  array900.push(i);
  array900.push(i);
}

console.log('Test1: 50 short numbers.\nSuccess: ', JSON.stringify(arrSimple50.sort((a, b) => a - b)) === JSON.stringify(deserialize(serialize(arrSimple50))), ' result: ', 100 - Math.round(serialize(arrSimple50).length / JSON.stringify(arrSimple50).length * 100), '%\n');
console.log('Test2: 100 short numbers.\nSuccess: ', JSON.stringify(arrSimple100.sort((a, b) => a - b)) === JSON.stringify(deserialize(serialize(arrSimple100))), ' result: ', 100 - Math.round(serialize(arrSimple100).length / JSON.stringify(arrSimple100).length * 100), '%\n');
console.log('Test3: 500 short numbers.\nSuccess: ', JSON.stringify(arrSimple500.sort((a, b) => a - b)) === JSON.stringify(deserialize(serialize(arrSimple500))), ' result: ', 100 - Math.round(serialize(arrSimple500).length / JSON.stringify(arrSimple500).length * 100), '%\n');
console.log('Test4: 900 numbers.\nSuccess: ', JSON.stringify(array900) === JSON.stringify(deserialize(serialize(array900))), ' result: ', 100 - Math.round(serialize(array900).length / JSON.stringify(array900).length * 100), '%');
