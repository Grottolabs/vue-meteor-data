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

module.exports =  {

  created: function () {
    var VueComponent = this;
    this._meteorHandles = [];

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
      for (var key of Object.keys(reactiveData)) {
        var reactiveFunction = reactiveData[ key ].bind(VueComponent);
        var handle = Tracker.autorun(function () {
          VueComponent.$set(key, reactiveFunction(VueComponent));
        })
        VueComponent._meteorHandles.push(handle);
      }
    }
  },

  destroyed: function () {
    //Stop all Meteor reactivity when view is destroyed.
    this._meteorHandles.forEach(function (sub) {
      sub.stop();
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
    autorun: function () {
      var handle = Tracker.autorun.apply(this, arguments);
      this._meteorHandles.push(handle);
      return handle;
    }

  }

}