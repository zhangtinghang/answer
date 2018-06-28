// pages/topic/topic.js
const util = require('../../utils/util.js')
const timer = require('../../utils/wxTimer.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
   list:{},
   selectData:[],//所有选项数组
   selectList:[],//每道题记录的值
   initialData: [],
   saveIdData:[],
   topicIndex:0,
   allData:0,
   wxTimerList: {},
   showLoad:false,
   showScore: false,
   scoreNum:0,
   showTimestamp: null,//答题开始时间戳
   nowTimeStamp:null,//答题提交时间戳
   timeCount: "00:30:00"
  },
  //点击选项 
  itemTap:function(e){
    var that = this;
    var $type = e.currentTarget.dataset.type;
    var $num =e.currentTarget.dataset.num;
    var $numLetter = util.numToLetter(e.currentTarget.dataset.num); //与type属性映射
    var arrData = JSON.parse(JSON.stringify(that.data.selectList));
    //单选或判断时
    if (that.data.list.type == 1 || that.data.list.type == 3){
    //重置数据 
    var indexNum = that.data.topicIndex;
    var MultipleData = [];
    var newArr = JSON.parse(JSON.stringify(that.data.initialData[indexNum]));
    for (var i = 0, len = newArr.options.length; i < len; i++) {
      //未被选中
      if (newArr.options[i].num == $type) {
        newArr.options[i].num = 'yes';
      }
      //如果本身就是被选中状态,还原状态
      if ($type == 'yes') {
        newArr.options[$num - 1].num = $numLetter;
      }
    }
    //更新选项数组
    for (var i = 0, len = newArr.options.length;i<len;i++){
      if (newArr.options[i].num == 'yes'){
        var select = util.numToLetter(i + 1);
        MultipleData.push(select)
      }
    }
    that.setData({
      list: newArr,
      topicIndex: indexNum,
      selectList: MultipleData
    })
   }else{
     //多选时
     var options = that.data.list.options;
     for (var i = 0, len = options.length; i < len; i++) {
       if (options[i].num == $type) {
         options[i].num = 'yes';
       }
     }
     //代表未选中状态
     if ($type == $numLetter) {
       arrData.push($numLetter);
     }
     //选中状态的反选 
     if ($type == 'yes') {
       options[$num - 1].num = $numLetter;
       var index = util.indexOfArr(arrData, $numLetter);
       //删除数组中的答案
       arrData = util.removeArr(arrData, index);
     }
    //  arrData = arrData.sort(1);
     arrData = arrData;
     var str = 'list.options';
     that.setData({
       selectList: arrData,
       [str]: options
     })
   }
  },
  //点击下一题的时候，移动数组位置，将新的数据赋值给页面
  nextTopic:function(e){
    var that = this;
    //加载动画
    wx.showToast({
      title: "loading",
      icon: "loading"
    })
    setTimeout(function () {
      wx.hideToast();
    }, 200)
    var topicId = e.currentTarget.dataset.id;
    var IdData = JSON.parse(JSON.stringify(that.data.saveIdData));
    //将临时变量的值保存到数组中去
    var option = JSON.parse(JSON.stringify(that.data.selectList));
    //对答案数组排序
    option = option.sort();
    if (option.length === 0){
      setTimeout(function () {
        wx.showToast({
          title: "请选择答案！",
          duration: 1500
        })},200)
      return false;
    }
    //字符串化，存入数组
    var arrStr = option.join('|');
    if (app.globalData.isDbug) {
      console.log('选项数组', arrStr)
    }
    var temArr = JSON.parse(JSON.stringify(that.data.selectData));
    temArr.push(arrStr);
    IdData.push(topicId);
    if (app.globalData.isDbug) {
      console.log(temArr, arrStr)
    }
    var topicFlag = that.data.topicIndex +1;
    var optionOne = that.data.initialData[topicFlag];
    if (topicFlag === that.data.initialData.length){
      if (IdData.length == temArr.length){
        that.setData({
          saveIdData: IdData
        })
      }
      //答题完成 准备上传数据
      //对比时间戳，处理超时问题
      var timeStamp2 = Date.parse(new Date());
      timeStamp2 = timeStamp2 / 1000;
      if (that.data.showTimestamp + 35*60 < timeStamp2){
          //超时，请重新答题
        wx.showModal({
          title: '计时提示',
          showCancel: false,
          content: '答题时间超过30分钟，本次答题无效，请重新答题！',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 2
              })
            }
          }
        })
          return false;
      }

      var answerArr = [];
      for (var i = 0, len = temArr.length;i<len;i++){
        var obj = {};
        obj.answer = temArr[i];
        obj.id = JSON.parse(JSON.stringify(that.data.saveIdData[i]));
        answerArr.push(obj);
      }
      //拿取token
      var value = wx.getStorageSync('user');
      var token = value.data.token;
      //获取分数
      var datas = {
        data: {
          token:token,
          answers: answerArr
        },
        method: 'POST',
        url: '/submit',
        header:{
          'content-type': 'application/json'
        }
      }
      util.ajax(datas, function (result) {
        if (result.statusCode == 200) {
          if (result.data) {
            if (result.data.errorCode == 2) {
              wx.showModal({
                title: "答题信息",
                content: "系统查询您已答题完成，本次答题无效！",
                showCancel: false,
                confirmText: "退出",
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 2
                    })
                  }
                }
              })
              return false;
            }
            var score = result.data.score;
            //修改本地缓存
            try {
              var value = wx.getStorageSync('user');
              value.data.user.answered = true;
              try {
                wx.setStorageSync('user', value)
              } catch (e) {
                that.data.user = null
              }
            } catch (e) {
              that.data.user = null
            }
            that.setData({
              scoreNum: score,
              showScore:true
            })
          }
        }
      })
    }else{
      that.setData({
        list: optionOne,
        topicIndex: topicFlag,
        selectData: temArr,
        selectList:[],
        saveIdData: IdData
      })
    }
  },
  returnTopic:function(){
    wx.navigateBack({
      delta: 2
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //加载动画
    wx.showToast({
      title: "loading",
      icon: "loading"
    })
    //处理初始数据，获取题库,保存题库
    var isparty = options.party;
    try {
      var value = wx.getStorageSync('user')
      if (value) {
        var token = value.data.token;
      } else {
        var token = '';
      }
    } catch (e) {
      var token = '';
    }
    var datas = {
      url: '/contest?token=' + token + '&isparty=' + isparty
    }
    util.ajax(datas, function (result) {
      //关闭加载动画
      wx.hideToast();
      if(result.data){
        if(result.data.t){
          var subjects = result.data.t;
        }else{
          if (result.data.errorCode == 1){
            wx.showModal({
              title: "登录失效",
              content: "登录失效，请重新登录！",
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 2
                  })
                }
              }
            })
            return false;
          } else if (result.data.errorCode == 2){
            wx.showModal({
              title: "答题提示",
              content: "系统检测您已答题完成，请勿重复答题！",
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 2
                  })
                }
              }
            })
            return false;
          }
          if (app.globalData.isDbug) {
            console.log('获取数据出错')
          }
          wx.showToast({
            title: "获取数据出错！",
            duration: 1500
          })
          wxTimer.stop();
          setTimeout(function () {
            that.setData({
              showLoad: true
            })
          }, 1500)
          return false;
        }
      }else{
        if (app.globalData.isDbug) {
          console.log('网络出错')
        }
        wx.showToast({
          title: "请检查网络！",
          duration: 1500
        })
        wxTimer.stop();
        setTimeout(function () {
          that.setData({
            showLoad: true
          })
        }, 1500)
        return false;
      }
      if (app.globalData.isDbug) {
        console.log(subjects)
      }
      //关闭加载动画
      wx.hideToast();
      //构造成本地数据
      var newSbujects = [];
      for (var i = 0, len = subjects.length; i < len; i++) {
        var obj = {};
        obj.type = subjects[i].type;
        obj.content = subjects[i].content;
        var choose = subjects[i].choice.split('|');
        var options = [];
        for (var j = 0, lenj = choose.length; j < lenj; j++) {
          var objs = {}
          objs.num = util.numToLetter(j + 1);
          objs.option = choose[j];
          options.push(objs);
        }
        obj.options = options;
        obj.id = subjects[i].id;
        obj.correct = subjects[i].answer;
        newSbujects.push(obj);
      }
      //获取当前时间戳
      var timeStamp0 = Date.parse(new Date());
      timeStamp0 = timeStamp0/1000;
      that.setData({
        initialData: newSbujects,
        allData: newSbujects.length,
        showTimestamp: timeStamp0
      })
      var topicIndex = that.data.topicIndex;
      var optionOne = that.data.initialData[topicIndex];
      if (app.globalData.isDbug) {
        console.log(optionOne)
      }
      that.setData({
        list: optionOne
      })
    })

    //倒计时
    var wxTimer = new timer({
      beginTime: that.data.timeCount,
      complete: function () {
        wxTimer.stop();
        if (app.globalData.isDbug) {
          console.log(getCurrentPages()[getCurrentPages().length - 1].route)
        }
        if (getCurrentPages()[getCurrentPages().length - 1].route != 'pages/topic/topic'){
          return false;
        }
        //验证是否达到时间
        var timeStamp = Date.parse(new Date());
        timeStamp = timeStamp / 1000;
        //对比时间戳，如果在范围内，则表明不是倒计时未完就交卷
        if (that.data.showTimestamp + 29*60 > timeStamp){
          //告诉用户 定时器出现问题，您可以继续答题。
          wx.showModal({
            title: '计时提示',
            showCancel:false,
            content: '计时器出错，但您可继续答题,请将时间把握在30分钟内！',
            success: function (res) {
              if (res.confirm) {}
            }
          })
          return false;
        }

        wx.showModal({
          title: '时间耗尽',
          content: '自动提交试题！',
          confirmText: '确定',
          success: function (res) {
            if (res.confirm) {
              var answerArr = [];
              for (var i = 0, len = that.data.selectData.length; i < len; i++) {
                var obj = {};
                obj.answer = that.data.selectData[i];
                obj.id = JSON.parse(JSON.stringify(that.data.saveIdData[i]));
                answerArr.push(obj);
              }
              //拿取token
              var value = wx.getStorageSync('user');
              var token = value.data.token;
              //获取分数
              var datas = {
                data: {
                  token: token,
                  answers: answerArr
                },
                method: 'POST',
                url: '/submit',
                header: {
                  'content-type': 'application/json'
                }
              }

              util.ajax(datas, function (result) {
                if (result.statusCode == 200) {
                  if (result.data) {
                    if (result.data.errorCode == 2){
                      wx.showModal({
                        title: "答题信息",
                        content: "系统查询您已答题完成，本次答题无效！",
                        showCancel: false,
                        confirmText: "退出",
                        success: function (res) {
                          if (res.confirm) {
                            wx.navigateBack({
                              delta: 2
                            })
                          }
                        }
                      })
                      return false;
                    }
                    var score = result.data.score;
                    //修改本地缓存
                    try {
                      var value = wx.getStorageSync('user')
                      value.data.user.answered = true;
                      try {
                        wx.setStorageSync('user', value)
                      } catch (e) {
                        that.data.user = null
                      }
                    } catch (e) {
                      that.data.user = null
                    }
                    that.setData({
                      scoreNum: score,
                      showScore: true
                    })
                  }
                }
              })
            }else if(res.cancel){
              wx.navigateBack({
                delta: 2
              })
            }
          }
        })
      }
    })
    wxTimer.start(that);
  }
})