<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <tab-control :titles="['流行','新款','精选']" 
                   @tabClick="tabClick" 
                   ref="tabControl1"
                   class="tab-control"
                   v-show="isTabFixed"
                    />
    <scroll class="content" 
            ref="scroll" 
            :probe-type="3" 
            @scroll="contentScroll" 
            :pull-up-load="true"
            @pullingUp="loadMore"
            >
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad" />
      <home-recommend-view :recommends="recommends" />
      <feature-view />
      <tab-control :titles="['流行','新款','精选']" 
                   @tabClick="tabClick" 
                   ref="tabControl2"
                    />
      <goods-list :goods="showGoods" />
    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
  </div>
</template>

<script>
import HomeSwiper from "./childComps/HomeSwiper";
import HomeRecommendView from "./childComps/HomeRecommendView";
import FeatureView from "./childComps/FeatureView";

import NavBar from "components/common/navbar/NavBar";
import TabControl from "components/content/tabControl/TabControl";
import GoodsList from "components/content/goods/GoodsList";
import Scroll from "components/common/scroll/Scroll";
import BackTop from 'components/content/backTop/BackTop';

import { getHomeMultidata, getHomeGoods } from "network/home";
//import {debounce} from "common/utils";
import {itemListenerMixin} from 'common/mixin'

export default {
  name: "Home",
  components: {
    HomeSwiper,
    HomeRecommendView,
    FeatureView,
    TabControl,
    NavBar,
    GoodsList,
    Scroll,
    BackTop
  },

  mixins:[itemListenerMixin],

  data() {
    return {
      banners: [],
      recommends: [],
      goods: {
        pop: { page: 0, list: [] },
        new: { page: 0, list: [] },
        sell: { page: 0, list: [] }
      },
      currentType: "pop",
      isShowBackTop:false,
      tabOffsetTop:0,
      isTabFixed:false,
      saveY:0,
    };
  },

  computed: {
    showGoods() {
      return this.goods[this.currentType].list;
    }
  },

  destroyed(){
    console.log('home destroyed');
  },

  activated(){
    this.$refs.scroll.scrollTo(0,this.saveY,0)
    this.$refs.scroll.refresh()
  },
 
  deactivated(){
    //1.保存y值
    this.saveY = this.$refs.scroll.getScrollY()
    //2.取消全局事件的监听
    this.$bus.$off('itemImageLoad',this.itemImgListener)
  },

  created() {
    //1.请求多个数据
    this.getHomeMultidata();

    //2.请求商品数据
    this.getHomeGoods("pop");
    this.getHomeGoods("sell");
    this.getHomeGoods("new");

    //3.手动代码点击一次
    this.tabClick(0)
  },

  mounted(){
    //这个地方img标签确实被挂载，但是其中的照片还没有占据高度
    //1.监听item中图片加载完成
    //this.$refs.scroll.refresh对这个函数进行防抖操作
    // let newRefresh = debounce(this.$refs.scroll.refresh,300)

    // //对监听的事件进行保存
    // this.itemImgListener = () => {
    //   newRefresh()
    // }
    // this.$bus.$on('itemImageLoad',this.itemImgListener)
    
  },

  methods: {
    /* 
        事件监听相关的方法
      */

    
    tabClick(index) {
      switch (index) {
        case 0:
          this.currentType = "pop";
          break;
        case 1:
          this.currentType = "new";
          break;
        case 2:
          this.currentType = "sell";
          break;
      }
      //让两个TabControl的currentIndex保持一致
      if(this.$refs.tabControl1 !== undefined){
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      }
      
    },

    backClick(){
      this.$refs.scroll.scrollTo(0,0,500)
    },

    contentScroll(position){
      //1.判断BackTop是否显示
      this.isShowBackTop = -position.y > 1000 

      //2.决定tabControl是否吸顶（position:fixed）
      this.isTabFixed = (-position.y) > this.tabOffsetTop
    },

    loadMore(){
      //console.log("加载更多")
      this.getHomeGoods(this.currentType)
    },

    swiperImageLoad(){
      this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop
    },
   
    /* 
        网络请求相关的方法
      */
    getHomeMultidata() {
      getHomeMultidata().then(res => {
        //this.result = res;//这里的this就是组件对象
        this.banners = res.data.banner.list;
        this.recommends = res.data.recommend.list;
      });
    },
    getHomeGoods(type) {
      const page = this.goods[type].page + 1;
      getHomeGoods(type, page).then(res => {
        this.goods[type].list.push(...res.data.list);
        this.goods[type].page += 1;

        //完成上拉加载更多
        this.$refs.scroll.finishPullUp()
       
      });
    }
  }
};
</script>

<style scoped>
#home {
  
  height:100vh;
  position: relative;
}
.home-nav {
  background-color: var(--color-tint);
  color: white;

  /* 在使用浏览器原生滚动时，为了让导航不跟随一起滚动 */
  /* position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 9; */
}


.content{
  overflow: hidden;
  position:absolute;
  top: 44px;
  bottom:49px;
  left:0;
  right:0;
}

.tab-control{
  position:relative;
  z-index: 9;
}




</style>
