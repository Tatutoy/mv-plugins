var Imported = Imported || {};
Imported['MVUI'] = '1.0.0';

var ui = {};
(function (ui) {
  "use strict";
//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function extend(parentClass) {
  var parent = parentClass || Object;
  var constructor = function () {  this.initialize.apply(this, arguments); };
  constructor.prototype = Object.create(parent.prototype);
  constructor.prototype.constructor = constructor;
  constructor.extend   = function () { return extend(constructor);  }
  constructor.include  = function (mixin) { include(constructor, mixin) };
  constructor.describe = function (desc) { describe(constructor, desc) };
  return constructor;
}
ui.extend = extend;

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function mixin(descriptor) {
  var c = function () { throw 'Cannot initialize a mixin.'; };
  c.include  = function (mixin) { include(c, mixin) };
  c.describe = function (desc) { describe(c, desc) };
  if (typeof descriptor !== 'undefined') {
    c.describe(descriptor);
  }
  return c;
}
ui.mixin = mixin;

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function include(classType, mixin) {
  for (var p in mixin.prototype) {
    if (p !== 'constructor') {
      classType.prototype[p] = classType.prototype[p] || mixin.prototype[p];
    }
  }
}
ui.include = include;

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function describe(classValue, descriptor) {
  for (var p in descriptor) {
    var item = descriptor[p];
    switch (typeof item) {
      case 'function':
        classValue.prototype[p] = item;
        break;
      default:
        Object.defineProperty(classValue.prototype, p, item);
        break;
    }
  }
}
ui.describe = describe;
//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function defaultGet(name) {
  return function () { return this['_' + name]; };
}
//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function defaultSet(name) {
  return function (value) {
    if (this.fire) {
      var event = new Event('propertychange');
      event.older = this['_' + name] || undefined;
      event.newer = value;
      if (this.fire('propertychange', event)) {
        this['_' + name] = value;
      }
    };
  };
}

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function getter(name) {
  return { get: defaultGet(name), configurable: true };
}
ui.getter = getter;

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function writer(name) {
  return { set: defaultSet(name), configurable: true };
}
ui.writer = writer;

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function accessor(name) {
  return { get: defaultGet(name), set: defaultSet(name), configurable: true };
}
ui.accessor = accessor;

//=============================================================================
//
//=============================================================================
var currentManager = null;

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
ui.EventHandler = mixin({
  //===========================================================================
  //
  //===========================================================================
  setupEvents: function () {
    this.__events = {};
  },
  //===========================================================================
  //
  //===========================================================================
  on: function (name, callback) {
    this.__events[name] = this.__events[name] || [];
  },
  //===========================================================================
  //
  //===========================================================================
  off: function (name, callback) {
    if (typeof callback == 'undefined') {
      this.__events[name] = [];
      return;
    }
    this.__events[name] = this.__events[name] || [];
  },
  //===========================================================================
  //
  //===========================================================================
  fire: function (name, event) {
    this.__events[name] = this.__events[name] || [];
    this.__events.forEach(function (callback) { callback(event); });
    return !event.defaultPrevented;
  }
});



//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
ui.MixinContainer  = mixin({
  //===========================================================================
  //
  //===========================================================================
  setupChildren: function () {
    this.__children = [];
  },
  //===========================================================================
  //
  //===========================================================================
  addChild: function (child) {
    var event = new Event('onchildadd');
    event.child = child;
    if (this.fire && this.fire('onchildadd', event)) {
      var i = this.children().indexOf(child);
      if (i === -1) {
        this.children().push(child);
      }
    };
  },
  //===========================================================================
  //
  //===========================================================================
  removeChild : function (child) {
    var event = new Event('onchildremove');
    event.child = child;
    if (this.fire && this.fire('onchildremove', event)) {
      var i = this.children().indexOf(child);
      if (i !== -1) {
         this.children().splice(i, 1);
      }
    };
  },
  //===========================================================================
  //
  //===========================================================================
  children: function () {
    return this.__children;
  }
});

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
ui.Manager = extend(WindowLayer);
  //===========================================================================
  //
  //===========================================================================
  ui.Manager.include(ui.EventHandler);
  //===========================================================================
  //
  //===========================================================================
  describe(ui.Manager, {
    //=========================================================================
    //
    //=========================================================================
    initialize: function () {
      WindowLayer.prototype.initialize.apply(this, arguments);
      this.setStartPosition();
      this.setupEvents();
      this.attach();
    },
    //=========================================================================
    //
    //=========================================================================
    setStartPosition: function () {
      var width = Graphics.boxWidth;
      var height = Graphics.boxHeight;
      var x = (Graphics.width - width) / 2;
      var y = (Graphics.height - height) / 2;
      this.move(x, y, width, height);
    },
    //=========================================================================
    //
    //=========================================================================
    attach: function () {
      currentManager = this;
    },
    //=========================================================================
    //
    //=========================================================================
    detach: function () {
      if (currentManager == this) {
        currentManager = null;
      }
    },
    //=========================================================================
    //
    //=========================================================================
    addChild: function (child) {
      if (this.parent) {
        this.parent.addChild(child);
      }
    },
    //=========================================================================
    //
    //=========================================================================
    removeChild : function (child) {
      if (this.parent) {
        this.parent.removeChild(child);
      }
    },
    //=========================================================================
    //
    //=========================================================================
    children: function () {
      if (this.parent) {
        return this.parent.children;
      }
    }
  });

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
ui.Widget = extend();
  //===========================================================================
  //
  //===========================================================================
  ui.Widget.include(ui.EventHandler);
  //===========================================================================
  //
  //===========================================================================
  ui.Widget.describe({
    initialize: function (parent) {
      this.setupEvents();
    }
  });

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
ui.Container = ui.Widget.extend();
  //===========================================================================
  //
  //===========================================================================
  ui.Container.include(ui.MixinContainer);
  //===========================================================================
  //
  //===========================================================================
  ui.Container.describe({
    initialize: function (parent) {
      ui.Widget.prototype.initialize.apply(this, arguments);
      this.setupChildren();
    }
  });

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
ui.DisplayWidget = ui.Container.extend();

//=============================================================================
// Added: Scene_Base.prototype.createUiManager
//-----------------------------------------------------------------------------
//
//=============================================================================
Scene_Base.prototype.createUiManager = function() {
};

var hiddenDiv = document.createElement('div');
hiddenDiv.style.width = hiddenDiv.style.height = 0;
hiddenDiv.style.overflow = 'hidden';
hiddenDiv.style.opacity = 0;
document.body.appendChild(hiddenDiv);

//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function addHiddenInput(type) {
  var input = document.createElement('input');
  input.type = type;
  hiddenDiv.appendChild(input);
  return input;
}
ui.addHiddenInput = addHiddenInput;
//=============================================================================
//
//-----------------------------------------------------------------------------
//
//=============================================================================
function removeHiddenInput(input) {
  hiddenDiv.removeChild(input);
}
ui.removeHiddenInput = removeHiddenInput;

})(ui);
