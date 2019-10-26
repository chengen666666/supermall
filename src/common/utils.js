export function debounce(func,delay=100){
  let timer = null
  return function(...args){
    if(timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this,args)
    },delay)
  }
}

function padLeftZero(str){
  return ('00' + str).substr(str.length);
}

export function formateDate(date,fmt){
  //1.获取年份
  // y+ 表示一个或多个y
  // y* 表示0个或者多个y
  // y? 表示0个或1个y
  //RegExp.$1 表示匹配到的结果
  //数字 + '' => 字符串
  //substr()表示截取字符串
  if(/(y+)/.test(fmt)){
    fmt = fmt.replace(RegExp.$1,(date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  //2.获取
  
  let o = {
    'M+':date.getMonth() + 1,
    'd+':date.getDate(),
    'h+':date.getHours(),
    'm+':date.getMinutes(),
    's+':date.getSeconds()
  };
  for(let k in o){
    if(new RegExp(`(${k})`).test(fmt)){
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1,(RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
}

