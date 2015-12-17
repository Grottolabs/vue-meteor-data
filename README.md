#Vue Meteor Data

####Easy subscriptions and reactive queries for Vue and Meteor
 

Installation:
```javascript
var VueMeteorData = require ('vue-meteor-data')
Vue.mixin(VueMeteorData)      
```
 
 
Usage example 1:  
```javascript
module.exports = {  
    reactiveData   : {
        tasks: function () {
            return Tasks.find().fetch()
        }
    },
    created: function(){
        this.subscribe('tasks/all')
    }
}    
```


Usage example 2:
```javascript    
module.exports = {
    created: function(){
        this.subscribe('tasks/all')
        this.autorun(function(){
            this.$set('tasks', Tasks.find().fetch())
        }.bind(this))
    }
}
```
 
 
Usage example 3 with VueRouter:
```javascript
module.exports = {  
    reactiveData   : {
        tasks: function () {
            return Tasks.find(this.$route.params.id).fetch()
        }
    },
    created: function(){
        this.subscribe('tasks/all')
    }
}
```


Usage example 4:
```javascript
module.exports = {  
    reactiveData   : {
        tasks: function (vm) {
            console.log(vm === this) //returns true
        }
    }
}
```

