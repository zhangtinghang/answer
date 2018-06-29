//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    showLoginModalStatus: false,
    showSelectModalStatus:false,
    isLogin:false,
    user:null,
    userData:''
  },
  onLoad: function () {
    var that = this
    try {
      var value = wx.getStorageSync('user')
      if (value) {
        that.setData({
          user : value
        })      
      } else {
        that.setData({
          user: null
        })
      }
    } catch (e) {
      that.setData({
        user: null
      })
    }
    //判断是否登陆
    if (that.data.user) {
        //拿取登陆数据渲染
      if (app.globalData.isDbug){
        console.log('保存在本地的数据==', value)
      }
      that.setData({
        isLogin:true,
        userData: that.data.user.data.user
      })
    }
  },
  //事件处理函数
  practice: function() {
    //选择类型
    var that = this
    var userSync = wx.getStorageSync('user');
    if (userSync){
      that.setData({
        showSelectModalStatus: true
      })
    }else{
      wx.showModal({
        title: "登录提示",
        content: "暂未登录,请先登录！",
        showCancel: false,
        confirmText: "确定"
      })
    }  
  },
  partyBtn:function(){
    var that = this;
    that.setData({
      showSelectModalStatus: false
    });
    wx.navigateTo({
      url: '../classify/classify?party=1'
    })
  },
  notPartyBtn:function(){
    var that = this;
    that.setData({
      showSelectModalStatus: false
    });
    wx.navigateTo({
      url: '../classify/classify?party=0'
    })
  },
  cancel:function(){
    var that = this;
    that.setData({
      showSelectModalStatus: false
    });
  },
  answer:function(e){
    var that = this;
    var userSync = wx.getStorageSync('user');
    if (!userSync){
      wx.showModal({
        title: "登录提示",
        content: "暂未登录,请先登录！",
        showCancel: false,
        confirmText: "确定"
      })
      return false;
    }
    if (userSync){
      if (userSync.data.user.answered){
        wx.showModal({
          title: "答题提示",
          content: "您已经答题完成，分数为：" + userSync.data.user.score,
          showCancel: false,
          confirmText: "确定"
        })
        return false;
      }
      //弹框确认是否登陆
      wx.showModal({
        title: '确认提示',
        content: "答题模式只能答题一次，请再次确认是否进入答题模式！",
        confirmText: "确定",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../topicbg/topicbg'
            })
          } else if (res.cancel) {
            //点击取消
          }
        }
      })
    }
  },

  // 监听登陆事件
  loginFun:function(){
    var that = this
    if (this.data.isLogin){
      //退出登陆
      wx.showModal({
        title: '确认提示',
        content: "确认退出！",
        confirmText: "确定",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            try {
              wx.removeStorageSync('user')
            } catch (e) {

            }
            that.setData({
              isLogin: false
            });
          } else if (res.cancel) {
            //点击取消
          }
        }
      })
    }else{
      //登陆
      that.setData({
        showLoginModalStatus:true
      });
    }
  },
  formSubmit:function(e){

    try {
      var res = wx.getSystemInfoSync();
      res = JSON.stringify(res);
    } catch (e) {
      // Do something when catch error
    }
    if (app.globalData.isDbug) {
      console.log('设备信息', res)
    }
    
    var that = this;
    var username = e.detail.value.username;
    var password = e.detail.value.password;
    if (app.globalData.isDbug) {
      console.log('输入的账号密码',username, password)
    }
    
    if (!username){
      wx.showToast({
        title: "请正确输入"
      })
    }
     else if (!password){
      wx.showToast({
        title: "请输入密码"
      })
    }
    else{
      //登陆提交
      var datas={
        data: 'phone=' + username + '&password=' + password +'&deviceInfo='+res,
        method:'POST',
        url: '/login'
      }
      //兼容性处理
      if (wx.showLoading){
        wx.showLoading({
          title: "登录中...",
          icon: "loading"
        })
      }else{
        wx.showToast({
          title: '登录中...',
          icon: 'loading',
        })
      }
      util.ajax(datas,function(result){
        if (app.globalData.isDbug) {
          console.log('返回的数据',result)
        }
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        
        if (result.statusCode == 200){
          if (result.data){
            if (result.data.errorCode && result.data.errorCode == 0){
              wx.showModal({
                title: "登录失败",
                content: "暂无此账号",
                showCancel: false,
                confirmText: "确定"
              })
              return false;
            }
            if (result.data.token){
              try {
                wx.setStorageSync('user', result)
                //登陆成功，切换登陆
                that.setData({
                  isLogin: true,
                  user: result,
                  userData: result.data.user
                });     
              } catch (e) {
                wx.showModal({
                  title: "登录失败",
                  content: e,
                  showCancel: false,
                  confirmText: "确定"
                })
              }
            }else{
              //登陆失败，请重新登陆
              wx.showModal({
                title: "登录失败",
                content: "请检查账号或密码是否正确!",
                showCancel: false,
                confirmText: "确定"
              })
            }
          }else{
            //登陆失败，请重新登陆
            wx.showModal({
              title: "登录失败",
              content: "请联系管理员!",
              showCancel: false,
              confirmText: "确定"
            })
          }
        }else{
          wx.showModal({
            title: "登录失败",
            content: "请检查网络情况或管理员!",
            showCancel: false,
            confirmText: "确定"
          })
        }  
      })
      that.setData({
        showLoginModalStatus: false
      });
    }
  },
  //点击遮罩关闭
  popuMask: function(){
    var that = this;
    that.setData({
      showLoginModalStatus: false,
      showSelectModalStatus: false
    });
  }
})
