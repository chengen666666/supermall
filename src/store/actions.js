import {
  ADD_COUNTER,
  ADD_TO_CART
} from './mutation-types.js'

export default {
  addCart({state,commit},payload){
    //1.查找之前数组中是否有该商品
    // let oldProduct = null;
    // for(let item of state.cartList){
    //   if(item.iid === payload.iid){
    //     oldProduct = item;
    //   }
    // }

    let oldProduct = state.cartList.find(item => item.iid === payload.iid)

    //2.判断oldProduct
    if(oldProduct){
      //oldProduct.count += 1;
      commit(ADD_COUNTER,oldProduct)
    }else{
      payload.count = 1;
      //state.cartList.push(payload);
      commit(ADD_TO_CART,payload)
    }
    
  }
}