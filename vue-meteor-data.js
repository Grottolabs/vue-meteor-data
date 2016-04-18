/**
 * Easy subscriptions and reactive queries for Vue and Meteor
 *
 * Installation:
 *     var VueMeteorData = require ('vue-meteor-data');
 *     Vue.mixin(VueMeteorData)
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
 *               this.$set('tasks', Tasks.find().fetch())
 *           }.bind(this))
 *       }
 *   }
 */
var Vue = require('vue')

module.exports = {

  created: function () {
    var vm = this;
    this._trackerHandles = [];

    /**
     * Wrap all queries in Tracker.autorun
     * Usage example:
     *     reactiveData: {
     *       tasks: function (component) {
     *         this.subscribe('myPubliation');
     *         return Tasks.find().fetch()
     *       }
     *     }
     */
    var reactiveData = this.$options.reactiveData
    if (reactiveData) {
      for (var key in reactiveData) {
        var reactiveFunction = reactiveData[ key ].bind(vm);
        Vue.util.defineReactive(vm, key, null);
        (function(key, reactiveFunction){
          vm.autorun(function () {
            vm.$set(key, reactiveFunction(vm));
          });
        })(key, reactiveFunction);
      }
    }
  },

  destroyed: function () {
    //Stop all reactivity when view is destroyed.
    this._trackerHandles.forEach(function (tracker) {
      tracker.stop();
    })
  },


  methods: {
    /**
     * Subscription that automatically stop when view is destroyed
     * Usage example:
     *     created: function(){
       *       this.subscription("myPublication")
       *     }
     * @returns {*}
     */
    subscribe: function () {
      var handle = Meteor.subscribe.apply(this, arguments);
      this._trackerHandles.push(handle);
      return handle;
    },


    /**
     * Autorun - automatically stops when view is destroyed
     *
     * Usage example:
     *     created: function(){
     *       var handle = this.autorun(function(){
     *         this.myvar = myReactiveFunction();
     *       }.bind(this);
     *       ...
     *       handle.stop();
     *     }
     * @param reactiveFunction
     * @returns {{_meteor: Tracker.Computation, _vue: Function, stop: handle.stop}}
     */
    autorun: function (reactiveFunction) {
      var vm = this;

      var handle = {
        _meteor: {},  //placeholder
        _vue   : function () {
        },  //placeholder
        stop   : function () {
          this._meteor.stop();
          this._vue();
        }
      };


      handle._meteor = Tracker.autorun(function () {

        //calls watcher.teardown() to avoid creation of duplicate watchers
        handle._vue()

        handle._vue = vm.$watch(reactiveFunction)

      });

      this._trackerHandles.push(handle);

      return handle;
    }

  }

}
