// pages/classify/classify.js
const util = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isParty: true,
    showSelectModalStatus: true
  },
  partyBtn: function () {
    var that = this;
    that.setData({
      showSelectModalStatus: false
    });
    wx.navigateTo({
      url: '../topic/topic?party=1'
    })
  },
  notPartyBtn: function () {
    var that = this;
    that.setData({
      showSelectModalStatus: false
    });
    wx.navigateTo({
      url: '../topic/topic?party=0'
    })
  },
  cancel: function () {
    var that = this;
    wx.navigateBack({
      delta: 1
    })
  },
  onShow:function(){
    var that = this;
    if (that.data.showSelectModalStatus == false){
      that.setData({
        showSelectModalStatus:true
      })
    }
  }
})