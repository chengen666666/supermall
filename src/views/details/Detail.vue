<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
      <!-- 属性：topImages 传入值：top-images -->
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @detailImageLoad="detailImageLoad"/>
      <detail-param-info :param-info="paramInfo" ref="params"/>
      <detail-comment-info :comment-info="commentInfo" ref="comment"/>
      <goods-list :goods="recommends" ref="recommend"/>
    </scroll>
    <detail-bottom-bar @addCart="addToCart"/>
    <back-top @click.native="backTop" v-show="isShowBackTop"/>
 
  </div>
</template>

<script>
  import DetailNavBar from './childComps/DetailNavBar'
  import DetailSwiper from './childComps/DetailSwiper'
  import DetailBaseInfo from './childComps/DetailBaseInfo'
  import DetailShopInfo from './childComps/DetailShopInfo'
  import DetailGoodsInfo from './childComps/DetailGoodsInfo'
  import DetailParamInfo from './childComps/DetailParamInfo'
  import DetailCommentInfo from './childComps/DetailCommentInfo'
  import DetailBottomBar from './childComps/DetailBottomBar'

  import Scroll from 'components/common/scroll/Scroll'
  import GoodsList from 'components/content/goods/GoodsList'

  import {getDetail,Goods,Shop,GoodsParam,getRecommend} from 'network/detail'
  import {debounce} from 'common/utils'
  import {itemListenerMixin,backTopMixin} from 'common/mixin'

  import {mapActions} from 'vuex'



  export default {
    name:'Detail',
    data(){
      return {
        iid:null,
        topImages:[],
        goods:{},
        shop:{},
        detailInfo:{},
        paramInfo:{},
        commentInfo:{},
        recommends:[],
        themeTopYs:[],
        getThemeTopY:null,
        currentIndex:0,

      }
    },

    components:{
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      Scroll,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      GoodsList,
      DetailBottomBar,

    },

    mixins:[itemListenerMixin,backTopMixin],
    
    created(){
      //1.保存传入的iid
      this.iid = this.$route.params.iid

      //2.根据iid请求详情数据
      getDetail(this.iid).then(res => {
        //1.获取顶部的轮播图片
        const data = res.result;
        this.topImages = data.itemInfo.topImages

        //2.获取商品信息
        this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)

        //3.创建店铺信息的对象
        this.shop = new Shop(data.shopInfo)

        //4.保存商品的性情数据
        this.detailInfo = data.detailInfo

        //5.获取参数信息
        this.paramInfo = new GoodsParam(data.itemParams,data.itemParams.rule)

        //6.取出评论的信息
        if(data.rate.cRate !== 0){
          this.commentInfo = data.rate.list[0]
        }

        /* 
          //1.第一次获取，值不对
          //值不对原因：this.$refs.params.$el压根没有渲染
          this.themeTopYs = []
          this.themeTopYs.push(0);
          this.themeTopYs.push(this.$refs.params.$el.offsetTop)
          this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
          this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
          console.log(this.themeTopYs)

          this.$nextTick(() => {
            //2.第二次获取，值依然不对
            //值不对的原因，图片没有计算在内
            //根据最新数据，对应的DOM是已经被渲染出来的
            //但是图片依然是没有加载完（目前获取到offsetTop不包含其中的图片）
            //offsetTop值不对的时候，都是因为图片问题
            this.themeTopYs = []
            this.themeTopYs.push(0);
            this.themeTopYs.push(this.$refs.params.$el.offsetTop)
            this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
            this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
            console.log(this.themeTopYs)
          }) 
        
        */
      })

      //3.请求推荐数据
      getRecommend().then(res => {
        this.recommends = res.data.list
      })

      //4.给getThemeTopY赋值(对给this.themeTopYs赋值的操作进行防抖操作)
      this.getThemeTopY = debounce(() => {
        //console.log('----')
        this.themeTopYs = []
        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.params.$el.offsetTop -44)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop -44)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop -44)
        this.themeTopYs.push(Number.MAX_VALUE)
        console.log(this.themeTopYs)
      },1000)
    },

    mounted(){
      //console.log('mounted');
      
    }, 

   

    
    methods:{
      ...mapActions(['addCart']),
      detailImageLoad(){
        //console.log('----')
        //防抖
        this.newRefresh()
        //this.$refs.scroll.refresh()

        this.getThemeTopY()

      },

      titleClick(index){
        //console.log(index);
        this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],1000)
      },

      contentScroll(position){
        //console.log(position);
        //1.获取y值
        const positionY = -position.y
        //2.positionY和主题中的值进行对比
        let length = this.themeTopYs.length;
        for (let i = 0;i < length-1;i++){

          // if(this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1]) 
          //     || (i === length -1 && positionY >= this.themeTopYs[i]))){
          //   this.currentIndex = i;
          //   this.$refs.nav.currentIndex = this.currentIndex;

            if(this.currentIndex !== i && (positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1])){
              this.currentIndex = i;
              this.$refs.nav.currentIndex = this.currentIndex;
            }
        }

        //3.是否显示回到顶部
        this.listenShowBackTop(position)
      },

      addToCart(){
        //console.log('------')
        //1.获取购物车需要展示的信息
        const product = {}
        product.image = this.topImages[0];
        product.title = this.goods.title;
        product.desc = this.goods.desc;
        product.price = this.goods.realPrice;
        product.iid = this.iid;

        //2.将商品添加到购物车中
        //this.$store.commit('addCart',product)
        //dispatch接收一个promise对象
        
        // this.$store.dispatch('addCart',product).then(res => {
        //   console.log(res);
        // })

        this.addCart(product).then(res => {
          this.$toast.show(res)
        })
         
      }


    },
    

    destroyed(){
      this.$bus.$off('itemImageLoad',this.itemImgListener)
    },
  }
</script>

<style scoped>
  #detail{
    position:relative;
    z-index: 1;
    background-color: #fff;
    height: 100vh;
  }

  .content{
    background-color: #fff;
    height: calc(100% - 44px - 49px);
  }

  .detail-nav{
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
</style>