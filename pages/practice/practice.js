const util = require('../../utils/util.js')
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: {},
    selectData: [],//记录已做题目答案数组
    selectList: [],//保存多选题记录值
    initialData: [],//所有的原始数组
    topicIndex: 0,//数组指针
    allData:1,//原始数组的个数
    timer:'',//倒计时
    isCorrent:false,
    isActive:false,
    isNext:false,
    showLoad:true,
    animationData: {}
  },
  onReady: function () {
    this.animation = wx.createAnimation({
      duration: 10000,
      timingFunction: "ease",
      delay: 0
    })
  },
/**
 * 点击选项时触发
 */
  itemTap: function (e) {
    var that = this;
    if (that.data.isActive || that.data.isNext) {
        return false;
    }
    
    //当前选项位置，固定不变
    var $num = e.currentTarget.dataset.num;
    //可能会变化（yes no)
    var $local = e.currentTarget.dataset.type;
    //获取当前选项的原始数据
    var $topicIndex = that.data.topicIndex;
    //多选题，从list中提取数据
    if(that.data.list.type==2){
      var $oriList = JSON.parse(JSON.stringify(that.data.list));
    }else{
      var $oriList = JSON.parse(JSON.stringify(that.data.initialData[$topicIndex]));
    }
    //数组操作相关
    var $selectData = JSON.parse(JSON.stringify(that.data.selectData));

    /**
     * $num 点击的原始数据
     * $local 点击的相对数据，可能会变化
     * $oriList 当前选项的原始数据
     * $topicIndex 数组指针
     * $selectData 存储已做题目信息
     * 根据type判断题目类型
     */
    if(that.data.list.type == 1 || that.data.list.type == 3){
      //判断是否相等，如果相等，则表示未点击，若不想等表示已经点击，需还原,点击后，无法再次点击
      if ($local == $num){
        for (let i = 0, len = $oriList.options.length; i<len; i++){
          if ($oriList.options[i].local == $local){
            $oriList.options[i].local = 'yes';
          }
        }
      }else{
        for (let i = 0, len = $oriList.options.length; i < len; i++) {
          if ($oriList.options[i].local == $local) {
            $oriList.options[i].local = $num;
          }
        }
      }
      //判断答案
      if (that.data.list.answer == util.numToLetter($num)){
        if (app.globalData.isDbug){
          console.log('当答案与自己点击的答案相同时', that.data.list.answer, $num)
        }
        //正确，移动指针
        /**
         * 如果想直接跳转则可以在此修改
         */
        // var $oriList = JSON.parse(JSON.stringify(that.data.initialData[$topicIndex + 1]));
        // that.setData({
        //   topicIndex: $topicIndex+1,
        //   list: $oriList
        // })
        var correctKey = util.letterToNum(that.data.list.answer);
        for (let i = 0, len = $oriList.options.length; i < len; i++) {
          if ($oriList.options[i].local == correctKey) {
            $oriList.options[i].local = 'yes';
          };
        }
      }else{
        var correctKey = util.letterToNum(that.data.list.answer);
        for (let i = 0, len = $oriList.options.length; i < len; i++) {
          if ($oriList.options[i].local == 'yes') {
            $oriList.options[i].local = 'no';
          };
          if ($oriList.options[i].local == correctKey){
            $oriList.options[i].local = 'yes';
          };
        }
        that.setData({
          isCorrent: true
        })
      }
      $selectData.push($oriList);
      //限制继续点击
      that.setData({
        isActive:true,
        list: $oriList,
        selectData: $selectData,
        isNext: true
      })
    }else{
      //多选题
      var recordArr = JSON.parse(JSON.stringify(that.data.selectList));
      if (app.globalData.isDbug) {
        console.log('点击了多选', recordArr, $local, $num)
      }
      if ($local == $num) {
          $oriList.options[$num-1].local = 'yes';
          recordArr.push(util.numToLetter($num));
      } else {
          $oriList.options[$num-1].local = $num;
          var index = util.indexOfArr(recordArr, util.numToLetter($num));
          //删除数组中的答案
          recordArr = util.removeArr(recordArr, index);
      }
      //记录选项
      // recordArr = recordArr.sort(1);
      recordArr = recordArr;
      that.setData({
        list: $oriList,
        selectList: recordArr
      })
    }
  },
  /**
   * 点击下一题的时候，移动数组中指针位置，将新的数据赋值给页面
  **/
  nextTopic: function (e) {
    var that = this;
    // var chooseAnswer = JSON.parse(JSON.stringify(that.data.selectList)).sort(1);
    var chooseAnswer = JSON.parse(JSON.stringify(that.data.selectList));
    //多选题，从list中提取数据
    var $oriList = JSON.parse(JSON.stringify(that.data.list));
    /**
     * 机型适配，某些机型sort()会报错
     */
    if ($oriList.answer.split('|').sort()){
      var answerArr = $oriList.answer.split('|').sort();
    }else{
      var answerArr = $oriList.answer.split('|');
    }
    if (app.globalData.isDbug) {
      console.log('重排答案数组', answerArr);
    }
    // var answerArr = $oriList.answer.split('|');
    var $selectData = JSON.parse(JSON.stringify(that.data.selectData));
    var $topicIndex = JSON.parse(JSON.stringify(that.data.topicIndex))
    /**
     * chooseAnswer 多选题保存的答案数组
     * $oriList 当前页面数据
     * answerArr 答案数组
     * $selectData 存储已做题目信息
     * 处理点击事件为多选题
     */
    if (that.data.isNext) {
      //模拟切换效果
      //加载动画
      wx.showToast({
        title: "loading",
        icon: "loading"
      })
      setTimeout(function(){
        wx.hideToast();       
      },200)
      //第二次点击,移动指针
      if ($topicIndex < that.data.initialData.length){
        $topicIndex = $topicIndex + 1;
      }else{
        $topicIndex = $topicIndex;
      }
      if ($selectData.length == that.data.initialData.length){
        
        if ($topicIndex == $selectData.length){
          wx.showModal({
            title: "完成练习",
            content: "用时：" + that.data.timer,
            confirmText: "退出",
            cancelText: "取消",
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                //点击取消
              }
            }
          })
        }
        if ($topicIndex < $selectData.length) {
          if (app.globalData.isDbug) {
            console.log($topicIndex, $selectData.length)
          }
          //指针前移
          that.setData({
            topicIndex: $topicIndex,
            list: $selectData[$topicIndex],
            // selectList: [],
            isCorrent: true,
            isActive: true,
            isNext: true
          })
          return false
        }
        return false;
      }

      //后退后的重置
      if ($topicIndex < $selectData.length) {
        if (app.globalData.isDbug) {
          console.log($topicIndex, $selectData.length)
        }
        //指针前移
        that.setData({
          topicIndex: $topicIndex,
          list: $selectData[$topicIndex],
          // selectList: [],
          isCorrent: true,
          isActive: true,
          isNext: true
        })
        return false
      }

      var $list = JSON.parse(JSON.stringify(that.data.initialData[$topicIndex]));
      //重置所有数据
      that.setData({
        topicIndex: $topicIndex,
        list: $list,
        selectList: [],
        isCorrent: false,
        isActive: false,
        isNext: false
      })
      return false;
    }
    if (that.data.list.type == 2){
      for (var i = 0, len = $oriList.options.length;i<len;i++){
        for (var j = 0, len2 = answerArr.length;j<len2;j++){
          if ($oriList.options[i].local == util.letterToNum(answerArr[j])){
            $oriList.options[i].local = 'yes';
            break;
          } else if ($oriList.options[i].local == 'yes'){
            //判断选择的值是否在答案中
            for (var k = 0, len3 = answerArr.length;k<len3;k++){
              if (util.numToLetter(i + 1) == answerArr[k]){
                $oriList.options[i].local = util.numToLetter(i + 1) + util.numToLetter(i + 1);
                break;
              }else{
                $oriList.options[i].local = 'no';
              }
            }
          }
        }
      }
      $selectData.push($oriList);
      that.setData({
        list: $oriList,
        selectData: $selectData,
        isNext: true,
        isCorrent: true
      })
    }else{
      //或者标出正确答案
      wx.showToast({
        title: "请选择答案",
        duration: 1500
      })
      return false
    }
  },
  //上一题
  preTopic:function(e){
    var that = this;
    var $topicIndex = JSON.parse(JSON.stringify(that.data.topicIndex));
    $topicIndex = $topicIndex - 1;
    if ($topicIndex < 0){
      $topicIndex = 0
      //第一题
      wx.showToast({
        title: "当前为第一题",
        duration: 1500
      })
    }
    /**
     * 判断是否直接就点击了上一题
     */
    if (that.data.selectData[$topicIndex]){
      var $oriList = JSON.parse(JSON.stringify(that.data.selectData[$topicIndex]));
    }else{
      wx.showToast({
        title: "当前为第一题",
        duration: 1500
      })
      return false;
    }
    
    
    // isActive: true,
    that.setData({
      list: $oriList,
      isNext: true,
      topicIndex: $topicIndex,
      isCorrent:true
    })
  },
  backTopic:function(e){
    wx.navigateBack({
      delta: 1
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
    var theme = options.theme;
    var isparty = options.isparty;
    // var theme = 6;
    // var isparty = 1;
    try {
      var value = wx.getStorageSync('user')
      if (value) {
        var token = value.data.token;
      }else{
        var token = '';
      }
    } catch (e) {
      var token = '';
    }
    var datas = {
      url: '/test?token=' + token + '&isparty=' + isparty + '&theme=' + theme
    }

    util.ajax(datas, function (result) {
      if (app.globalData.isDbug) {
        console.log('获取题目成功', result)
      }
      //关闭加载动画
      wx.hideToast();
      if (result.data){
        if (result.data.errorCode){
          if (app.globalData.isDbug) {
            console.log('获取数据出错')
          }
          if (result.data.errorCode == 1){
            wx.showModal({
              title: "录失效",
              content: "登录失效，请重新登录！",
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
            return false;
          }else{
            wx.showToast({
              title: "获取数据出错！",
              duration: 1500
            })
          }
          setTimeout(function () {
            that.setData({
              showLoad: false
            })
          }, 1500)
          return false;
        } else if (result.data.subjects){
          if (app.globalData.isDbug) {
            console.log('获取正确数据')
          }
          var subjects = result.data.subjects;
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
              objs.local = j + 1;
              objs.option = choose[j];
              options.push(objs);
            }
            obj.theme = subjects[i].theme;
            obj.isparty = subjects[i].isparty;
            obj.options = options;
            obj.id = subjects[i].id;
            obj.answer = subjects[i].answer;
            if (subjects[i].type == 2){
              var answerArr = subjects[i].answer.split('|');
              var answerStr = answerArr.join('、');
              obj.answerPro = answerStr;
            } else if (subjects[i].type == 3){
              if (subjects[i].answer == 'A'){
                var answerStr = '对';
              } else if (subjects[i].answer == 'B'){
                var answerStr = '错';
              }else{
                var answerStr = '未知';
              }
              obj.answerPro = answerStr;
            }else{
              obj.answerPro = subjects[i].answer;
            }
            
            newSbujects.push(obj);
          }
          that.setData({
            initialData: newSbujects,
            allData: newSbujects.length,
            list: JSON.parse(JSON.stringify(newSbujects[0]))
          })
        }
      } else if (result.errMsg) {
        if (app.globalData.isDbug) {
          console.log('网络出错')
        }
        wx.showToast({
          title: "请检查网络！",
          duration: 1500
        })
        setTimeout(function () {
          that.setData({
            showLoad: false
          })
        }, 1500)
        return false;
      }
    })

    //计时器
    var hour, minute, second;//时 分 秒
    hour = minute = second = 0;//初始化
    var millisecond = 0;//毫秒
    setInterval(timer, 50)
    function timer() {
      millisecond = millisecond + 50;
      if (millisecond >= 1000) {
        millisecond = 0;
        second = second + 1;
      }
      if (second >= 60) {
        second = 0;
        minute = minute + 1;
      }

      if (minute >= 60) {
        minute = 0;
        hour = hour + 1;
      }
      that.setData({
        timer: hour + ' 时 ' + minute + ' 分 ' + second + ' 秒'
      })
    }
  }
  // onShow:function(){
  //   var that = this;
  //   console.log('页面切回',that.data)
  // },
  // onHide:function(){
  //   var that = this;
  //   console.log('页面切出', that.data)
  // }
})