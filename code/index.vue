<template>
  <div class="mod">
    <el-input v-model="输入框变量名" placeholder="请输入内容"></el-input>
    <div class="body">
      <div class="group-i0">
        <div class="mask" />
        <span class="info">{{ info }}</span>
      </div>
      <div class="group-i1">
        <div class="overlayer" />
        <span class="meta">{{ meta }}</span>
      </div>
      <div class="group-i2">
        <div class="layer" />
        <span class="subtitle">{{ subtitle }}</span>
      </div>
      <div class="group-i3">
        <div class="mask-1" />
        <span class="tag">{{ tag }}</span>
      </div>
    </div>
    <div class="submain">
      <img class="icon" :src="icon" /> <img class="icon-1" :src="icon1" />
      <img class="icon-2" :src="icon2" />
      <img class="shop-logo" :src="shopLogo" />
    </div>
    <div class="main" v-for="(item, index) in 循环数据变量名" :key="index">
      <div class="group">
        <span class="location">{{ location }}</span>
        <div class="time-wrapper">
          <span class="time">{{ time }}</span>
        </div>
      </div>
      <div class="group-1">
        <span class="address">{{ address }}</span>
        <div class="timer-wrapper">
          <span class="timer">{{ timer }}</span>
        </div>
      </div>
      <div class="group-2">
        <span class="location-1">{{ location1 }}</span>
        <div class="clock-wrapper">
          <span class="clock">{{ clock }}</span>
        </div>
      </div>
      <div class="group-3">
        <span class="address-1">{{ address1 }}</span>
        <div class="time-wrapper-1">
          <span class="time-1">{{ time1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      info: '监督发现问题\r',
      meta: '已解决问题数\r',
      subtitle: '收集意见建议\r',
      tag: '群众满意度\r',
      icon:
        'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/f5152680b46611eb88036994d50680a3.png',
      icon1:
        'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/f5383ee0b46611ebbf28499222699ef9.png',
      icon2:
        'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/f55bcc70b46611eb81cf2f493451c55c.png',
      shopLogo:
        'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/f57d8540b46611ebbe4eb94ab0d46d3d.png',
      location: '南湖区村（居）务监督委员会月报表三家浜社区4月\r',
      time: '2020年4月\r',
      address: '南湖区村（居）务监督委员会月报表三家浜社区4月\r',
      timer: '2020年4月\r',
      location1: '南湖区村（居）务监督委员会月报表三家浜社区4月\r',
      clock: '2020年4月\r',
      address1: '南湖区村（居）务监督委员会月报表三家浜社区4月\r',
      time1: '2020年4月\r'
    };
  },
  methods: {}
};
</script>
<style>
@import './index.response.css';
</style>
