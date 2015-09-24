/**
 * Easy subscriptions and reactive queries for Vue and Meteor
 *
 * Installation:
 *     var VueMeteorData = require ('vue-meteor-data');
 *     Vue.use(VueMeteorData);
 *
 * Usage example 1:
 *     module.exports = {
 *       reactiveData   : {
 *           tasks: function () {
 *               return Tasks.find().fetch()
 *           }
 *       },
 *
 *       created: function(){
 *           this.subscribe('tasks/all');
 *       }
 *   }
 *
 * Usage example 2:
 *     module.exports = {
 *       created: function(){
 *           this.subscribe('tasks/all');
 *           this.autorun(function(){
 *               this.$add('tasks', Tasks.find().fetch())
 *           }.bind(this))
 *       }
 *   }
 */

(function () {
  var vue // lazy bind

  var meteorData = {

    created  : function () {
      var self = this;
      this._meteorHandles = [];

      /**
       * Wrap all queries in Tracker.autorun
       * Usage example:
       *     reactiveData: {
       *       tasks: function () {
       *         return Tasks.find().fetch()
       *       }
       *     }
       */
      if (reactiveData = this.$options.reactiveData) {
        for (var key of Object.keys(reactiveData)){
          var handle = Tracker.autorun(function(){
            self.$add(key, reactiveData[key]());
          })
          self._meteorHandles.push(handle);
        }
      }
    },

    destroyed: function () {
      //Stop all Meteor reactivity when view is destroyed.
      this._meteorHandles.forEach(function(sub){
        sub.stop();
      })
    },



    methods  : {
      /**
       * Subscription that automatically stop when view is destroyed
       * Usage example:
       *     created: function(){
       *       this.subscription("myPublication")
       *     }
       * @returns {*}
       */
      subscribe: function(){
        var handle = Meteor.subscribe.apply(this, arguments);
        this._meteorHandles.push(handle);
        return handle;
      },


      /**
       * Autorun that automatically stops when view is destroyed
       *
       * Usage example:
       *     created: function(){
       *       this.autorun(function(){
       *         this.myvar = myReactiveFunction();
       *       }.bind(this)
       *     }
       * @returns {Tracker.Computation}
       */
      autorun: function(){
        var handle = Tracker.autorun.apply(this, arguments);
        this._meteorHandles.push(handle);
        return handle;
      }

    }

  }



  var api = {
    mixin  : meteorData,
    install: function (Vue) {
      Vue.options = Vue.util.mergeOptions(Vue.options, meteorData)
    }
  }

  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = api
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return api
    })
  } else if (typeof window !== 'undefined') {
    window.VueMeteorData = api
  }
})()