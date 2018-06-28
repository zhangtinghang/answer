// pages/classify/classify.js
const util = require('../../utils/util.js')
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isParty:false,
    showSelectModalStatus:false,
    ispartyNum:0,
    currentItem:''
  },
  list: function (e) {
    var that = this;
    var theme = e.currentTarget.dataset.type;
    //模拟点击态样式
    that.setData({
      'currentItem': theme
    })
    setTimeout(function(){
      that.setData({
        'currentItem': 10
      })
    },50)
    var isParty = that.data.ispartyNum;
    wx.navigateTo({
      url: '../practice/practice?isparty=' + isParty + '&theme=' + theme
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.party == 1) {
      that.setData({
        isParty: true,
        ispartyNum: options.party
      })
    } else {
      that.setData({
        isParty: false,
        ispartyNum: options.party
      })
    }
  }
})