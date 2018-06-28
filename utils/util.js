const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const indexOfArr = function (arr,val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) return i;
  }
  return -1;
}
const removeArr = function (arr,val) {
  if (val > -1) {
    arr.splice(val, 1);
    return arr;
  }else{
    return arr;
  }
}

const ajax = function(datas,callback){
  var url = datas.url;
  var data = datas.data ||{};
  var method = datas.method || 'GET';
  var header = datas.header || {
    'content-type': 'application/x-www-form-urlencoded' // 默认值
  };
  // console.log('传递进来的值', url, data, method, header)
  // 登录
  wx.request({
    url: 'https://www.sjjhyz.club/contest'+url,
    data: data,
    method:method,
    header: header,
    success: function (res) {
      return callback(res);
    },
    fail:function(res){
      console.log('失败')
      return callback(res);
    }
  })
}

const numToLetter = function(code) {
  if (code == '1') {
    return 'A'
  } else if (code == '2') {
    return 'B'
  } else if (code == '3') {
    return 'C'
  } else if (code == '4') {
    return 'D'
  } else if (code == '5') {
    return 'E'
  } else if (code == '6') {
    return 'F'
  } else if (code == '') {
    return ''
  }
}

const letterToNum = function (code) {
  if (code == 'A') {
    return '1'
  } else if (code == 'B') {
    return '2'
  } else if (code == 'C') {
    return '3'
  } else if (code == 'D') {
    return '4'
  } else if (code == 'E') {
    return '5'
  } else if (code == 'F') {
    return '6'
  } else if (code == '') {
    return ''
  }
}

/**
 * 判断数组A在数组B中没有的元素
 */
const compareArr = function (array1, array2){
  var tempArray1 = [];//临时数组1
  var tempArray2 = [];//临时数组2

  for (var i = 0; i < array2.length; i++) {
    tempArray1[array2[i]] = true;//将数array2 中的元素值作为tempArray1 中的键，值为true；
  }

  for (var i = 0; i < array1.length; i++) {
    if (!tempArray1[array1[i]]) {
      tempArray2.push(array1[i]);//过滤array1 中与array2 相同的元素；
    }
  }
  return tempArray2;
}

/**
 * 判断两个数组是否相等
 */
const arrayEquals = function (array, array1) {
    // if the other array is a falsy value, return
    if (!array)
      return false;
      // compare lengths - can save a lot of time 
    if (array1.length != array.length)
      return false;
    for (var i = 0, l = array1.length; i < l; i++) {
      if (array1[i] != array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
}
module.exports = {
  formatTime: formatTime,
  indexOfArr: indexOfArr,
  removeArr: removeArr,
  ajax: ajax,
  numToLetter: numToLetter,
  letterToNum: letterToNum,
  compareArr: compareArr,
  arrayEquals: arrayEquals
}
