(function(){ 

if (!this.window) window = this;

if (!window.navigator) window.navigator = {
  userAgent: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; de-de) AppleWebKit/533.17.8 (KHTML, like Gecko) Version/5.0.1 Safari/533.17.8", 
  product: "", 
  cpuClass: ""
}; 

if (!window.qx) window.qx = {};

if (!window.qxvariants) qxvariants = {};
  
if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"qx.aspects":false,"qx.debug":false,"qx.globalErrorHandling":false};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

qx.$$packageData = {};
qx.$$loader = {};
})();

qx.$$packageData['0']={"locales":{},"resources":{"rpcjs/test.png":[32,32,"png","rpcjs"]},"translations":{}};
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#resource(qx.static:qx/static)
#ignore(qx.data)
#optional(qx.data.IListData)

************************************************************************ */

/**
 * Create namespace
 */
if (!window.qx) {
  window.qx = {};
}

/**
 * Bootstrap qx.Bootstrap to create myself later
 * This is needed for the API browser etc. to let them detect me
 */
qx.Bootstrap = {

  genericToString : function() {
    return "[Class " + this.classname + "]";
  },

  createNamespace : function(name, object)
  {
    var splits = name.split(".");
    var parent = window;
    var part = splits[0];

    for (var i=0, len=splits.length-1; i<len; i++, part=splits[i])
    {
      if (!parent[part]) {
        parent = parent[part] = {};
      } else {
        parent = parent[part];
      }
    }

    // store object
    parent[part] = object;

    // return last part name (e.g. classname)
    return part;
  },


  setDisplayName : function(fcn, classname, name)
  {
    fcn.displayName = classname + "." + name + "()";
  },


  setDisplayNames : function(functionMap, classname)
  {
    for (var name in functionMap)
    {
      var value = functionMap[name];
      if (value instanceof Function) {
        value.displayName = classname + "." + name + "()";
      }
    }
  },


  define : function(name, config)
  {
    if (!config) {
      var config = { statics : {} };
    }

    var clazz;
    var proto = null;

    qx.Bootstrap.setDisplayNames(config.statics, name);

    if (config.members || config.extend)
    {
      qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");

      clazz = config.construct || new Function;

      if (config.extend) {
        this.extendClass(clazz, clazz, config.extend, name, basename);
      }

      var statics = config.statics || {};
      // use getKeys to include the shadowed in IE
      for (var i=0, keys=qx.Bootstrap.getKeys(statics), l=keys.length; i<l; i++) {
        var key = keys[i];
        clazz[key] = statics[key];
      }

      proto = clazz.prototype;
      var members = config.members || {};
      // use getKeys to include the shadowed in IE
      for (var i=0, keys=qx.Bootstrap.getKeys(members), l=keys.length; i<l; i++) {
        var key = keys[i];
        proto[key] = members[key];
      }
    }
    else
    {
      clazz = config.statics || {};
    }

    // Create namespace
    var basename = this.createNamespace(name, clazz);

    // Store names in constructor/object
    clazz.name = clazz.classname = name;
    clazz.basename = basename;

    // Store type info
    clazz.$$type = "Class";

    // Attach toString
    if (!clazz.hasOwnProperty("toString")) {
      clazz.toString = this.genericToString;
    }

    // Execute defer section
    if (config.defer) {
      config.defer(clazz, proto);
    }

    // Store class reference in global class registry
    qx.Bootstrap.$$registry[name] = config.statics;

    return clazz;
  }
};


/**
 * Internal class that is responsible for bootstrapping the qooxdoo
 * framework at load time.
 *
 * Automatically loads JavaScript language fixes and enhancements to
 * bring all engines to at least JavaScript 1.6.
 *
 * Does support:
 *
 * * Construct
 * * Statics
 * * Members
 * * Extend
 * * Defer
 *
 * Does not support:
 *
 * * Super class calls
 * * Mixins, Interfaces, Properties, ...
 */
qx.Bootstrap.define("qx.Bootstrap",
{
  statics :
  {
    /** Timestamp of qooxdoo based application startup */
    LOADSTART : qx.$$start || new Date(),

    /**
     * Mapping for early use of the qx.debug environment setting.
     * @lint ignoreUndefined(qxvariants)
     */
     DEBUG : (function() {
       // make sure to reflect all changes here to the environment class!
       var debug = true;
       if (qx.$$environment && qx.$$environment["qx.debug"] === false) {
         debug = false;
       }
       return debug;
     })(),


     /**
      * Minimal accessor API for the environment settings given from the
      * generator.
      *
      * WARNING: This method only should be used if the
      * {@link qx.core.Environment} class is not loaded!
      *
      * @param key {String} The ke to get the value from.
      * @return {var} The value of the setting or <code>undefined</code>.
      */
     getEnvironmentSetting : function(key) {
       if (qx.$$environment) {
         return qx.$$environment[key];
       }
     },


     /**
      * Minimal mutator for the environment settings given from the generator.
      * It checks for the existance of the environment settings and sets the
      * key if its not given from the generator. If a setting is available from
      * the generator, the setting will be ignored.
      *
      * WARNING: This method only should be used if the
      * {@link qx.core.Environment} class is not loaded!
      *
      * @param key {String} The key of the setting.
      * @param value {var} The value for the setting.
      */
     setEnvironmentSetting : function(key, value) {
       if (!qx.$$environment) {
         qx.$$environment = {};
       }
       if (qx.$$environment[key] === undefined) {
         qx.$$environment[key] = value;
       }
     },


    /**
     * Creates a namespace and assigns the given object to it.
     *
     * @internal
     * @param name {String} The complete namespace to create. Typically, the last part is the class name itself
     * @param object {Object} The object to attach to the namespace
     * @return {Object} last part of the namespace (typically the class name)
     * @throws an exception when the given object already exists.
     */
    createNamespace : qx.Bootstrap.createNamespace,


    /**
     * Define a new class using the qooxdoo class system.
     * Lightweight version of {@link qx.Class#define} only used during bootstrap phase.
     *
     * @internal
     * @signature function(name, config)
     * @param name {String} Name of the class
     * @param config {Map ? null} Class definition structure.
     * @return {Class} The defined class
     */
    define : qx.Bootstrap.define,


    /**
     * Sets the display name of the given function
     *
     * @signature (fcn, classname, name)
     * @param fcn {Function} the function to set the display name for
     * @param classname {String} the name of the class the function is defined in
     * @param name {String} the function name
     */
    setDisplayName : qx.Bootstrap.setDisplayName,


    /**
     * Set the names of all functions defined in the given map
     *
     * @signature function(functionMap, classname)
     * @param functionMap {Object} a map with functions as values
     * @param classname {String} the name of the class, the functions are
     *   defined in
     */
    setDisplayNames : qx.Bootstrap.setDisplayNames,

    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @signature function()
     * @return {String} The class identifier
     */
    genericToString : qx.Bootstrap.genericToString,


    /**
     * Inherit a clazz from a super class.
     *
     * This function differentiates between class and constructor because the
     * constructor written by the user might be wrapped and the <code>base</code>
     * property has to be attached to the constructor, while the <code>superclass</code>
     * property has to be attached to the wrapped constructor.
     *
     * @param clazz {Function} The class's wrapped constructor
     * @param construct {Function} The unwrapped constructor
     * @param superClass {Function} The super class
     * @param name {Function} fully qualified class name
     * @param basename {Function} the base name
     */
    extendClass : function(clazz, construct, superClass, name, basename)
    {
      var superproto = superClass.prototype;

      // Use helper function/class to save the unnecessary constructor call while
      // setting up inheritance.
      var helper = new Function;
      helper.prototype = superproto;
      var proto = new helper;

      // Apply prototype to new helper instance
      clazz.prototype = proto;

      // Store names in prototype
      proto.name = proto.classname = name;
      proto.basename = basename;

      /*
        - Store base constructor to constructor-
        - Store reference to extend class
      */
      construct.base = clazz.superclass = superClass;

      /*
        - Store statics/constructor onto constructor/prototype
        - Store correct constructor
        - Store statics onto prototype
      */
      construct.self = clazz.constructor = proto.constructor = clazz;
    },


    /**
     * Find a class by its name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return qx.Bootstrap.$$registry[name];
    },


    /** {Map} Stores all defined classes */
    $$registry : {},


    /*
    ---------------------------------------------------------------------------
      OBJECT UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the number of objects in the map
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {Integer} number of objects in the map
     */
    objectGetLength :
    ({
      "count": function(map) {
        return map.__count__;
      },

      "default": function(map)
      {
        var length = 0;

        for (var key in map) {
          length++;
        }

        return length;
      }
    })[(({}).__count__ == 0) ? "count" : "default"],


    /**
     * Inserts all keys of the source object into the
     * target objects. Attention: The target map gets modified.
     *
     * @param target {Object} target object
     * @param source {Object} object to be merged
     * @param overwrite {Boolean ? true} If enabled existing keys will be overwritten
     * @return {Object} Target with merged values from the source object
     */
    objectMergeWith : function(target, source, overwrite)
    {
      if (overwrite === undefined) {
        overwrite = true;
      }

      for (var key in source)
      {
        if (overwrite || target[key] === undefined) {
          target[key] = source[key];
        }
      }

      return target;
    },


    /**
     * IE does not return "shadowed" keys even if they are defined directly
     * in the object.
     *
     * @internal
     */
    __shadowedKeys :
    [
      "isPrototypeOf",
      "hasOwnProperty",
      "toLocaleString",
      "toString",
      "valueOf",
      "constructor"
    ],


    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    getKeys :
    ({
      "ES5" : Object.keys,

      "BROKEN_IE" : function(map)
      {
        var arr = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for (var key in map) {
          if (hasOwnProperty.call(map, key)) {
            arr.push(key);
          }
        }

        // IE does not return "shadowed" keys even if they are defined directly
        // in the object. This is incompatible with the ECMA standard!!
        // This is why this checks are needed.
        var shadowedKeys = qx.Bootstrap.__shadowedKeys;
        for (var i=0, a=shadowedKeys, l=a.length; i<l; i++)
        {
          if (hasOwnProperty.call(map, a[i])) {
            arr.push(a[i]);
          }
        }

        return arr;
      },

      "default" : function(map)
      {
        var arr = [];

        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for (var key in map) {
          if (hasOwnProperty.call(map, key)) {
            arr.push(key);
          }
        }

        return arr;
      }
    })[
      typeof(Object.keys) == "function" ? "ES5" :
        (function() {for (var key in {toString : 1}) { return key }})() !== "toString" ? "BROKEN_IE" : "default"
    ],


    /**
     * Get the keys of a map as string
     *
     * @param map {Object} the map
     * @return {String} String of the keys of the map
     *         The keys are separated by ", "
     */
    getKeysAsString : function(map)
    {
      var keys = qx.Bootstrap.getKeys(map);
      if (keys.length == 0) {
        return "";
      }

      return '"' + keys.join('\", "') + '"';
    },


    /**
     * Mapping from JavaScript string representation of objects to names
     * @internal
     */
    __classToTypeMap :
    {
      "[object String]": "String",
      "[object Array]": "Array",
      "[object Object]": "Object",
      "[object RegExp]": "RegExp",
      "[object Number]": "Number",
      "[object Boolean]": "Boolean",
      "[object Date]": "Date",
      "[object Function]": "Function",
      "[object Error]": "Error"
    },


    /*
    ---------------------------------------------------------------------------
      FUNCTION UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */


    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.self(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction()
     * {
     *   this.setStyle('color', 'red');
     *   // note that 'this' here refers to myFunction, not an element
     *   // we'll need to bind this function to the element we want to alter
     * };
     *
     * var myBoundFunction = qx.lang.Function.bind(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Function} The bound function.
     */
    bind : function(func, self, varargs)
    {
      var fixedArgs = Array.prototype.slice.call(arguments, 2, arguments.length);
      return function() {
        var args = Array.prototype.slice.call(arguments, 0, arguments.length);
        return func.apply(self, fixedArgs.concat(args));
      }
    },


    /*
    ---------------------------------------------------------------------------
      STRING UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */


    /**
     * Convert the first character of the string to upper case.
     *
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp : function(str) {
      return str.charAt(0).toUpperCase() + str.substr(1);
    },


    /**
     * Convert the first character of the string to lower case.
     *
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : function(str) {
      return str.charAt(0).toLowerCase() + str.substr(1);
    },


    /*
    ---------------------------------------------------------------------------
      TYPE UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the internal class of the value. See
     * http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass : function(value)
    {
      var classString = Object.prototype.toString.call(value);
      return (
        qx.Bootstrap.__classToTypeMap[classString] ||
        classString.slice(8, -1)
      );
    },


    /**
     * Whether the value is a string.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a string.
     */
    isString : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof String" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        typeof value === "string" ||
        qx.Bootstrap.getClass(value) == "String" ||
        value instanceof String ||
        (!!value && !!value.$$isString))
      );
    },


    /**
     * Whether the value is an array.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an array.
     */
    isArray : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Array" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        value instanceof Array ||
        (value && qx.data && qx.data.IListData && qx.Bootstrap.hasInterface(value.constructor, qx.data.IListData) ) ||
        qx.Bootstrap.getClass(value) == "Array" ||
        (!!value && !!value.$$isArray))
      );
    },


    /**
     * Whether the value is an object. Note that built-in types like Window are
     * not reported to be objects.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an object.
     */
    isObject : function(value) {
      return (
        value !== undefined &&
        value !== null &&
        qx.Bootstrap.getClass(value) == "Object"
      );
    },


    /**
     * Whether the value is a function.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunction : function(value) {
      return qx.Bootstrap.getClass(value) == "Function";
    },


    /*
    ---------------------------------------------------------------------------
      CLASS UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */


    /**
     * Whether the given class exists
     *
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    classIsDefined : function(name) {
      return qx.Bootstrap.getByName(name) !== undefined;
    },

    /**
     * Returns the definition of the given property. Returns null
     * if the property does not exist.
     *
     * TODO: Correctly support refined properties?
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition : function(clazz, name)
    {
      while (clazz)
      {
        if (clazz.$$properties && clazz.$$properties[name]) {
          return clazz.$$properties[name];
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether a class has the given property
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty : function(clazz, name) {
      return !!qx.Bootstrap.getPropertyDefinition(clazz, name);
    },


    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the event
     * @return {Map|null} Event type of the given event.
     */
    getEventType : function(clazz, name)
    {
      var clazz = clazz.constructor;

      while (clazz.superclass)
      {
        if (clazz.$$events && clazz.$$events[name] !== undefined) {
          return clazz.$$events[name];
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether a class supports the given event type
     *
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent : function(clazz, name) {
      return !!qx.Bootstrap.getEventType(clazz, name);
    },


    /**
     * Returns the class or one of its super classes which contains the
     * declaration of the given interface. Returns null if the interface is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the interface
     * @param iface {Interface} interface to look for
     * @return {Class | null} the class which directly implements the given interface
     */
    getByInterface : function(clazz, iface)
    {
      var list, i, l;

      while (clazz)
      {
        if (clazz.$$implements)
        {
          list = clazz.$$flatImplements;

          for (i=0, l=list.length; i<l; i++)
          {
            if (list[i] === iface) {
              return clazz;
            }
          }
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether a given class or any of its super classes includes a given interface.
     *
     * This function will return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) of the class
     * or any of its super classes using the "implement"
     * key.
     *
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    hasInterface : function(clazz, iface) {
      return !!qx.Bootstrap.getByInterface(clazz, iface);
    },


    /**
     * Returns a list of all mixins available in a given class.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getMixins : function(clazz)
    {
      var list = [];

      while (clazz)
      {
        if (clazz.$$includes) {
          list.push.apply(list, clazz.$$flatIncludes);
        }

        clazz = clazz.superclass;
      }

      return list;
    },


    /*
    ---------------------------------------------------------------------------
      LOGGING UTILITY FUNCTIONS
    ---------------------------------------------------------------------------
    */

    $$logs : [],


    /**
     * Sending a message at level "debug" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    debug : function(object, message) {
      qx.Bootstrap.$$logs.push(["debug", arguments]);
    },


    /**
     * Sending a message at level "info" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    info : function(object, message) {
      qx.Bootstrap.$$logs.push(["info", arguments]);
    },


    /**
     * Sending a message at level "warn" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    warn : function(object, message) {
      qx.Bootstrap.$$logs.push(["warn", arguments]);
    },


    /**
     * Sending a message at level "error" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    error : function(object, message) {
      qx.Bootstrap.$$logs.push(["error", arguments]);
    },


    /**
     * Prints the current stack trace at level "info"
     *
     * @param object {Object} Contextual object (either instance or static class)
     */
    trace : function(object) {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's selected locale.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Locale",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * The name of the system locale e.g. "de" when the full locale is "de_AT"
     * @return {String} The current locale
     * @internal
     */
    getLocale : function() {
      var locale = qx.bom.client.Locale.__getNavigatorLocale();

      var index = locale.indexOf("-");
      if (index != -1) {
        locale = locale.substr(0, index);
      }

      return locale;
    },


    /**
     * The name of the variant for the system locale e.g. "at" when the
     * full locale is "de_AT"
     *
     * @return {String} The locales variant.
     * @internal
     */
    getVariant : function() {
      var locale = qx.bom.client.Locale.__getNavigatorLocale();
      var variant = "";

      var index = locale.indexOf("-");

      if (index != -1) {
        variant = locale.substr(index + 1);
      }

      return variant;
    },


    /**
     * Internal helper for accessing the navigators language.
     *
     * @return {String} The language set by the navigator.
     */
    __getNavigatorLocale : function()
    {
      var locale = (navigator.userLanguage || navigator.language || "");

      // Android Bug: Android does not return the system language from the
      // navigator language. Try to parse the language from the userAgent.
      // See http://code.google.com/p/android/issues/detail?id=4641
      if (qx.bom.client.OperatingSystem.getName() == "android")
      {
        var match = /(\w{2})-(\w{2})/i.exec(navigator.userAgent);
        if (match) {
          locale = match[0];
        }
      }

      return locale.toLowerCase();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Sebastian Fastner (fastner)

************************************************************************ */
/**
 * This class is responsible for checking the operating systems name.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.OperatingSystem",
{
  statics :
  {
    /**
     * Checks for the name of the operating system.
     * @return {String} The name of the operating system.
     * @internal
     */
    getName : function() {
      if (!navigator) {
        return "";
      }
      var input = navigator.platform || "";
      var agent = navigator.userAgent || "";

      if (
        input.indexOf("Windows") != -1 ||
        input.indexOf("Win32") != -1 ||
        input.indexOf("Win64") != -1
      ) {
        return "win";

      } else if (
        input.indexOf("Macintosh") != -1 ||
        input.indexOf("MacPPC") != -1 ||
        input.indexOf("MacIntel") != -1
      ) {
        return "osx";

      } else if (agent.indexOf("RIM Tablet OS") != -1) {
        return "rim_tabletos";

      } else if (agent.indexOf("webOS") != -1) {
        return "webos";

      } else if (
        input.indexOf("iPod") != -1 ||
        input.indexOf("iPhone") != -1 ||
        input.indexOf("iPad") != -1
      ) {
        return "ios";

      } else if (
        input.indexOf("Linux") != -1
      ) {
        return "linux";

      } else if (
        input.indexOf("X11") != -1 ||
        input.indexOf("BSD") != -1
      ) {
        return "unix";

      } else if (
        input.indexOf("Android") != -1
      ) {
        return "android";

      } else if (
        input.indexOf("SymbianOS") != -1
      ) {
        return "symbian";
      }

      else if (
        input.indexOf("BlackBerry") != -1
      ) {
        return "blackberry";
      }

      // don't know
      return "";
    },



    /** Maps user agent names to system IDs */
    __ids : {
      // Windows
      "Windows NT 6.1" : "7",
      "Windows NT 6.0" : "vista",
      "Windows NT 5.2" : "2003",
      "Windows NT 5.1" : "xp",
      "Windows NT 5.0" : "2000",
      "Windows 2000" : "2000",
      "Windows NT 4.0" : "nt4",

      "Win 9x 4.90" : "me",
      "Windows CE" : "ce",
      "Windows 98" : "98",
      "Win98" : "98",
      "Windows 95" : "95",
      "Win95" : "95",

      // OS X
      "Mac OS X 10_7" : "10.7",
      "Mac OS X 10.7" : "10.7",
      "Mac OS X 10_6" : "10.6",
      "Mac OS X 10.6" : "10.6",
      "Mac OS X 10_5" : "10.5",
      "Mac OS X 10.5" : "10.5",
      "Mac OS X 10_4" : "10.4",
      "Mac OS X 10.4" : "10.4",
      "Mac OS X 10_3" : "10.3",
      "Mac OS X 10.3" : "10.3",
      "Mac OS X 10_2" : "10.2",
      "Mac OS X 10.2" : "10.2",
      "Mac OS X 10_1" : "10.1",
      "Mac OS X 10.1" : "10.1",
      "Mac OS X 10_0" : "10.0",
      "Mac OS X 10.0" : "10.0"
    },


    /**
     * Checks for the version of the operating system using the internal map.
     *
     * @internal
     * @return {String} The version as strin or an empty string if the version
     *   could not be detected.
     */
    getVersion : function() {
      var str = [];
      for (var key in qx.bom.client.OperatingSystem.__ids) {
        str.push(key);
      }

      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(navigator.userAgent);

      if (match && match[1]) {
        return qx.bom.client.OperatingSystem.__ids[match[1]];
      }
      return "";
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Internal class which contains the checks used by {@link qx.core.Environment}.
 * All checks in here are marked as internal which means you should never use
 * them directly.
 *
 * This class should contain all checks about HTML.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Html",
{
  statics:
  {
    /**
     * Whether the client supports Web Workers.
     *
     * @internal
     * @return {Boolean} <code>true</code> if webworkers are supported
     */
    getWebWorker : function() {
      return window.Worker != null;
    },


    /**
     * Whether the client supports File Readers
     *
     * @internal
     * @return {Boolean} <code>true</code> if FileReaders are supported
     */
    getFileReader : function() {
      return window.FileReader != null;
    },


    /**
     * Whether the client supports Geo Location.
     *
     * @internal
     * @return {Boolean} <code>true</code> if geolocation supported
     */
    getGeoLocation : function() {
      return navigator.geolocation != null;
    },


    /**
     * Whether the client supports audio.
     *
     * @internal
     * @return {Boolean} <code>true</code> if audio is supported
     */
    getAudio : function() {
      return !!document.createElement('audio').canPlayType;
    },

    /**
     * Whether the client can play ogg audio format.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getAudioOgg : function() {
      if (!qx.bom.client.Html.getAudio()) {
        return "";
      }
      var a = document.createElement("audio");
      return a.canPlayType("audio/ogg");
    },

    /**
     * Whether the client can play mp3 audio format.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getAudioMp3 : function() {
      if (!qx.bom.client.Html.getAudio()) {
        return "";
      }
      var a = document.createElement("audio");
      return a.canPlayType("audio/mpeg");
    },

    /**
     * Whether the client can play wave audio wave format.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getAudioWav : function() {
      if (!qx.bom.client.Html.getAudio()) {
        return "";
      }
      var a = document.createElement("audio");
      return a.canPlayType("audio/x-wav");
    },

    /**
     * Whether the client can play au audio format.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getAudioAu : function() {
      if (!qx.bom.client.Html.getAudio()) {
        return "";
      }
      var a = document.createElement("audio");
      return a.canPlayType("audio/basic");
    },

    /**
     * Whether the client can play aif audio format.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getAudioAif : function() {
      if (!qx.bom.client.Html.getAudio()) {
        return "";
      }
      var a = document.createElement("audio");
      return a.canPlayType("audio/x-aiff");
    },


    /**
     * Whether the client supports video.
     *
     * @internal
     * @return {Boolean} <code>true</code> if video is supported
     */
    getVideo : function() {
      return !!document.createElement('video').canPlayType;
    },

    /**
     * Whether the client supports ogg video.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getVideoOgg : function() {
      if (!qx.bom.client.Html.getVideo()) {
        return "";
      }
      var v = document.createElement("video");
      return v.canPlayType('video/ogg; codecs="theora, vorbis"');
    },

    /**
     * Whether the client supports mp4 video.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getVideoH264 : function() {
      if (!qx.bom.client.Html.getVideo()) {
        return "";
      }
      var v = document.createElement("video");
      return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    },

    /**
     * Whether the client supports webm video.
     *
     * @internal
     * @return {String} "" or "maybe" or "probably"
     */
    getVideoWebm : function() {
      if (!qx.bom.client.Html.getVideo()) {
        return "";
      }
      var v = document.createElement("video");
      return v.canPlayType('video/webm; codecs="vp8, vorbis"');
    },

    /**
     * Whether the client supports local storage.
     *
     * @internal
     * @return {Boolean} <code>true</code> if local storage is supported
     */
    getLocalStorage : function() {
      try {
        return window.localStorage != null;
      } catch (exc) {
        // Firefox Bug: Local execution of window.sessionStorage throws error
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=357323
        return false;
      }
    },


    /**
     * Whether the client supports session storage.
     *
     * @internal
     * @return {Boolean} <code>true</code> if session storage is supported
     */
    getSessionStorage : function() {
      try {
        return window.sessionStorage != null;
      } catch (exc) {
        // Firefox Bug: Local execution of window.sessionStorage throws error
        // see https://bugzilla.mozilla.org/show_bug.cgi?id=357323
        return false;
      }
    },


    /**
     * Whether the browser supports CSS class lists.
     * https://developer.mozilla.org/en/DOM/element.classList
     *
     * @internal
     * @return {Boolean} <code>true</code> if class list is supported.
     */
    getClassList : function() {
      return !!(document.documentElement.classList &&
        qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList"
      );
    },


    /**
     * Checks if XPath could be used.
     *
     * @internal
     * @return {Boolean} <code>true</code> if xpath is supported.
     */
    getXPath : function() {
      return !!document.evaluate;
    },


    /**
     * Checks if XUL could be used.
     *
     * @internal
     * @return {Boolean} <code>true</code> if XUL is supported.
     */
    getXul : function() {
      try {
        document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
        return true;
      } catch (e) {
        return false;
      }
    },


    /**
     * Checks if SVG could be used
     *
     * @internal
     * @return {Boolean} <code>true</code> if SVG is supported.
     */
    getSvg : function() {
      return document.implementation && document.implementation.hasFeature &&
        (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") ||
        document.implementation.hasFeature(
          "http://www.w3.org/TR/SVG11/feature#BasicStructure",
          "1.1"
        )
      );
    },


    /**
     * Checks if VML could be used
     *
     * @internal
     * @return {Boolean} <code>true</code> if VML is supported.
     */
    getVml : function() {
      return qx.bom.client.Engine.getName() == "mshtml";
    },


    /**
     * Checks if canvas could be used
     *
     * @internal
     * @return {Boolean} <code>true</code> if canvas is supported.
     */
    getCanvas : function() {
      return !!window.CanvasRenderingContext2D;
    },


    /**
     * Asynchronous check for using data urls.
     *
     * @internal
     * @param callback {Function} The function which should be executed as
     *   soon as the check is done.
     */
    getDataUrl : function(callback) {
      var data = new Image();
      data.onload = data.onerror = function() {
        // wrap that into a timeout because IE might execute it synchronously
        window.setTimeout(function() {
          callback.call(null, (data.width == 1 && data.height == 1));
        }, 0);
      };
      data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    },
    
    /**
     * Checks if dataset could be used
     *
     * @internal
     * @return {Boolean} <code>true</code> if dataset is supported.
     */
    getDataset : function() {
      return !!document.documentElement.dataset;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fbjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Determines browser-dependent information about the transport layer.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Transport",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the maximum number of parallel requests the current browser
     * supports per host addressed.
     *
     * Note that this assumes one connection can support one request at a time
     * only. Technically, this is not correct when pipelining is enabled (which
     * it currently is only for IE 8 and Opera). In this case, the number
     * returned will be too low, as one connection supports multiple pipelined
     * requests. This is accepted for now because pipelining cannot be
     * detected from JavaScript and because modern browsers have enough
     * parallel connections already - it's unlikely an app will require more
     * than 4 parallel XMLHttpRequests to one server at a time.
     *
     * @internal
     */
    getMaxConcurrentRequestCount: function()
    {
      var maxConcurrentRequestCount;

      // Parse version numbers.
      var versionParts = qx.bom.client.Engine.getVersion().split(".");
      var versionMain = 0;
      var versionMajor = 0;
      var versionMinor = 0;

      // Main number
      if (versionParts[0]) {
        versionMain = versionParts[0];
      }

      // Major number
      if (versionParts[1]) {
        versionMajor = versionParts[1];
      }

      // Minor number
      if (versionParts[2]) {
        versionMinor = versionParts[2];
      }

      // IE 8 gives the max number of connections in a property
      // see http://msdn.microsoft.com/en-us/library/cc197013(VS.85).aspx
      if (window.maxConnectionsPerServer){
        maxConcurrentRequestCount = window.maxConnectionsPerServer;

      } else if (qx.bom.client.Engine.getName() == "opera") {
        // Opera: 8 total
        // see http://operawiki.info/HttpProtocol
        maxConcurrentRequestCount = 8;

      } else if (qx.bom.client.Engine.getName() == "webkit") {
        // Safari: 4
        // http://www.stevesouders.com/blog/2008/03/20/roundup-on-parallel-connections/

        // TODO: Distinguish Chrome from Safari, Chrome has 6 connections
        //       according to
        //      http://stackoverflow.com/questions/561046/how-many-concurrent-ajax-xmlhttprequest-requests-are-allowed-in-popular-browser

        maxConcurrentRequestCount = 4;

      } else if (qx.bom.client.Engine.getName() == "gecko"
                 && ( (versionMain >1)
                      || ((versionMain == 1) && (versionMajor > 9))
                      || ((versionMain == 1) && (versionMajor == 9) && (versionMinor >= 1)))){
          // FF 3.5 (== Gecko 1.9.1): 6 Connections.
          // see  http://gemal.dk/blog/2008/03/18/firefox_3_beta_5_will_have_improved_connection_parallelism/
          maxConcurrentRequestCount = 6;

      } else {
        // Default is 2, as demanded by RFC 2616
        // see http://blogs.msdn.com/ie/archive/2005/04/11/407189.aspx
        maxConcurrentRequestCount = 2;
      }

      return maxConcurrentRequestCount;
    },


    /**
     * Checks whether the app is loaded with SSL enabled which means via https.
     *
     * @internal
     * @return {Boolean} <code>true</code>, if the app runs on https
     */
    getSsl : function() {
      return window.location.protocol === "https:";
    },

    /**
     * Checks what kind of XMLHttpRequest object the browser supports
     * for the current protocol, if any.
     *
     * The standard XMLHttpRequest is preferred over ActiveX XMLHTTP.
     *
     * @internal
     * @return {String}
     *  <code>"xhr"</code>, if the browser provides standard XMLHttpRequest.<br/>
     *  <code>"activex"</code>, if the browser provides ActiveX XMLHTTP.<br/>
     *  <code>""</code>, if there is not XHR support at all.
     */
    getXmlHttpRequest : function() {
      // Standard XHR can be disabled in IE's security settings,
      // therefore provide ActiveX as fallback. Additionaly,
      // standard XHR in IE7 is broken for file protocol.
      var supports = window.ActiveXObject ?
        (function() {
          if ( window.location.protocol !== "file:" ) {
            try {
              new window.XMLHttpRequest();
              return "xhr";
            } catch(noXhr) {}
          }

          try {
            new window.ActiveXObject("Microsoft.XMLHTTP");
            return "activex";
          } catch(noActiveX) {}
        })()
        :
        (function() {
          try {
            new window.XMLHttpRequest();
            return "xhr";
          } catch(noXhr) {}
        })();

      return supports || "";
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Contains detection for QuickTime, Windows Media, DivX, Silverlight adn gears.
 * If no version could be detected the version is set to an empty string as
 * default.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Plugin",
{
  statics :
  {
    /**
     * Checkes for the availability of google gears plugin.
     *
     * @internal
     * @return {Boolean} <code>true</code> if gears is available
     */
    getGears : function() {
      return !!(window.google && window.google.gears);
    },


    /**
     * Database of supported features.
     * Filled with additional data at initialization
     */
    __db :
    {
      quicktime :
      {
        plugin : [ "QuickTime" ],
        control : "QuickTimeCheckObject.QuickTimeCheck.1"
        // call returns boolean: instance.IsQuickTimeAvailable(0)
      },

      wmv :
      {
        plugin : [ "Windows Media" ],
        control : "WMPlayer.OCX.7"
        // version string in: instance.versionInfo
      },

      divx :
      {
        plugin : [ "DivX Web Player" ],
        control : "npdivx.DivXBrowserPlugin.1"
      },

      silverlight :
      {
        plugin : [ "Silverlight" ],
        control : "AgControl.AgControl"
        // version string in: instance.version (Silverlight 1.0)
        // version string in: instance.settings.version (Silverlight 1.1)
        // version check possible using instance.IsVersionSupported
      },

      pdf :
      {
        plugin : [ "Chrome PDF Viewer", "Adobe Acrobat" ],
        control : "AcroPDF.PDF"
        // this is detecting Acrobat PDF version > 7 and Chrome PDF Viewer
      }
    },


    /**
     * Fetches the version of the quicktime plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getQuicktimeVersion : function() {
      var entry = qx.bom.client.Plugin.__db["quicktime"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the windows media plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getWindowsMediaVersion : function() {
      var entry = qx.bom.client.Plugin.__db["wmv"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the divx plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getDivXVersion : function() {
      var entry = qx.bom.client.Plugin.__db["divx"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the silverlight plugin.
     * @return {String} The version of the plugin, if available,
     *   an empty string otherwise
     * @internal
     */
    getSilverlightVersion : function() {
      var entry = qx.bom.client.Plugin.__db["silverlight"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Fetches the version of the pdf plugin.
     * @return {String} The version of the plugin, if available,
     *  an empty string otherwise
     * @internal
     */
    getPdfVersion : function() {
      var entry = qx.bom.client.Plugin.__db["pdf"];
      return qx.bom.client.Plugin.__getVersion(entry.control, entry.plugin);
    },


    /**
     * Checks if the quicktime plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getQuicktime : function() {
      var entry = qx.bom.client.Plugin.__db["quicktime"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the windows media plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getWindowsMedia : function() {
      var entry = qx.bom.client.Plugin.__db["wmv"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the divx plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getDivX : function() {
      var entry = qx.bom.client.Plugin.__db["divx"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the silverlight plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getSilverlight : function() {
      var entry = qx.bom.client.Plugin.__db["silverlight"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Checks if the pdf plugin is available.
     * @return {Boolean} <code>true</code> if the plugin is available
     * @internal
     */
    getPdf : function() {
      var entry = qx.bom.client.Plugin.__db["pdf"];
      return qx.bom.client.Plugin.__isAvailable(entry.control, entry.plugin);
    },


    /**
     * Internal helper for getting the version of a given plugin.
     *
     * @param activeXName {String} The name which should be used to generate
     *   the test ActiveX Object.
     * @param pluginNames {Array} The names with which the plugins are listed in
     *   the navigator.plugins list.
     * @return {String} The version of the plugin as string.
     */
    __getVersion : function(activeXName, pluginNames) {
      var available = qx.bom.client.Plugin.__isAvailable(
        activeXName, pluginNames
      );
      // don't check if the plugin is not available
      if (!available) {
        return "";
      }

      // IE checks
      if (qx.bom.client.Engine.getName() == "mshtml") {
        var obj = new ActiveXObject(activeXName);

        try {
          var version = obj.versionInfo;
          if (version != undefined) {
            return version;
          }

          version = obj.version;
          if (version != undefined) {
            return version;
          }

          version = obj.settings.version;
          if (version != undefined) {
            return version;
          }
        } catch (ex) {
          return "";
        }

        return "";

      // all other browsers
      } else {
        var plugins = navigator.plugins;

        var verreg = /([0-9]\.[0-9])/g;
        for (var i = 0; i < plugins.length; i++)
        {
          var plugin = plugins[i];

          for (var j = 0; j < pluginNames.length; j++)
          {
            if (plugin.name.indexOf(pluginNames[j]) !== -1)
            {
              if (verreg.test(plugin.name) || verreg.test(plugin.description)) {
                return RegExp.$1;
              }
            }
          }
        }

        return "";
      }
    },


    /**
     * Internal helper for getting the availability of a given plugin.
     *
     * @param activeXName {String} The name which should be used to generate
     *   the test ActiveX Object.
     * @param pluginNames {Array} The names with which the plugins are listed in
     *   the navigator.plugins list.
     * @return {Boolean} <code>true</code>, if the plugin available
     */
    __isAvailable : function(activeXName, pluginNames) {
      // IE checks
      if (qx.bom.client.Engine.getName() == "mshtml") {

        var control = window.ActiveXObject;
        if (!control) {
          return false;
        }

        try {
          new ActiveXObject(activeXName);
        } catch(ex) {
          return false;
        }

        return true;
      // all other
      } else {

        var plugins = navigator.plugins;
        if (!plugins) {
          return false;
        }

        var name;
        for (var i = 0; i < plugins.length; i++)
        {
          name = plugins[i].name;

          for (var j = 0; j < pluginNames.length; j++)
          {
            if (name.indexOf(pluginNames[j]) !== -1) {
              return true;
            }
          }
        }

        return false;
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's engine.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Engine",
{
  // General: http://en.wikipedia.org/wiki/Browser_timeline
  // Webkit: http://developer.apple.com/internet/safari/uamatrix.html
  // Firefox: http://en.wikipedia.org/wiki/History_of_Mozilla_Firefox
  statics :
  {
    /**
     * Returns the version of the engine.
     *
     * @return {String} The version number of the current engine.
     * @internal
     */
    getVersion : function() {
      var agent = window.navigator.userAgent;

      var version = "";
      if (qx.bom.client.Engine.__isOpera()) {
        // Opera has a special versioning scheme, where the second part is combined
        // e.g. 8.54 which should be handled like 8.5.4 to be compatible to the
        // common versioning system used by other browsers
        if (/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(agent))
        {
          // opera >= 10 has as a first verison 9.80 and adds the proper version
          // in a separate "Version/" postfix
          // http://my.opera.com/chooseopera/blog/2009/05/29/changes-in-operas-user-agent-string-format
          if (agent.indexOf("Version/") != -1) {
            var match = agent.match(/Version\/(\d+)\.(\d+)/);
            // ignore the first match, its the whole version string
            version =
              match[1] + "." +
              match[2].charAt(0) + "." +
              match[2].substring(1, match[2].length);
          } else {
            version = RegExp.$1 + "." + RegExp.$2;
            if (RegExp.$3 != "") {
              version += "." + RegExp.$3;
            }
          }
        }
      } else if (qx.bom.client.Engine.__isWebkit()) {
        if (/AppleWebKit\/([^ ]+)/.test(agent))
        {
          version = RegExp.$1;

          // We need to filter these invalid characters
          var invalidCharacter = RegExp("[^\\.0-9]").exec(version);

          if (invalidCharacter) {
            version = version.slice(0, invalidCharacter.index);
          }
        }
      } else if (qx.bom.client.Engine.__isGecko()) {
        // Parse "rv" section in user agent string
        if (/rv\:([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;
        }
      } else if (qx.bom.client.Engine.__isMshtml()) {
        if (/MSIE\s+([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;

          // If the IE8 or IE9 is running in the compatibility mode, the MSIE value
          // is set to an older version, but we need the correct version. The only
          // way is to compare the trident version.
          if (version < 8 && /Trident\/([^\);]+)(\)|;)/.test(agent)) {
            if (RegExp.$1 == "4.0") {
              version = "8.0";
            } else if (RegExp.$1 == "5.0") {
              version = "9.0";
            }
          }
        }
      } else {
        var failFunction = window.qxFail;
        if (failFunction && typeof failFunction === "function") {
          version = failFunction().FULLVERSION;
        } else {
          version = "1.9.0.0";
          qx.Bootstrap.warn("Unsupported client: " + agent
            + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        }
      }

      return version;
    },


    /**
     * Returns the name of the engine.
     *
     * @return {String} The name of the current engine.
     * @internal
     */
    getName : function() {
      var name;
      if (qx.bom.client.Engine.__isOpera()) {
        name = "opera";
      } else if (qx.bom.client.Engine.__isWebkit()) {
        name = "webkit";
      } else if (qx.bom.client.Engine.__isGecko()) {
        name = "gecko";
      } else if (qx.bom.client.Engine.__isMshtml()) {
        name = "mshtml";
      } else {
        // check for the fallback
        var failFunction = window.qxFail;
        if (failFunction && typeof failFunction === "function") {
          name = failFunction().NAME;
        } else {
          name = "gecko";
          qx.Bootstrap.warn("Unsupported client: " + window.navigator.userAgent
            + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        }
      }
      return name;
    },


    /**
     * Internal helper for checking for opera.
     * @return {boolean} true, if its opera.
     */
    __isOpera : function() {
      return window.opera &&
        Object.prototype.toString.call(window.opera) == "[object Opera]";
    },


    /**
     * Internal helper for checking for webkit.
     * @return {boolean} true, if its webkit.
     */
    __isWebkit : function() {
      return window.navigator.userAgent.indexOf("AppleWebKit/") != -1;
    },


    /**
     * Internal helper for checking for gecko.
     * @return {boolean} true, if its gecko.
     */
    __isGecko : function() {
      return window.controllers && window.navigator.product === "Gecko";
    },


    /**
     * Internal helper to check for MSHTML.
     * @return {boolean} true, if its MSHTML.
     */
    __isMshtml : function() {
      return window.navigator.cpuClass &&
        /MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

   ======================================================================

   This class contains code from:

     Copyright:
       2009 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Basic browser detection for qooxdoo.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Browser",
{
  statics :
  {
    /**
     * Checks for the name of the browser and returns it.
     * @return {String} The name of the current browser.
     * @internal
     */
    getName : function() {
      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__agents + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if (!match) {
        return "";
      }

      var name = match[1].toLowerCase();

      var engine = qx.bom.client.Engine.getName();
      if (engine === "webkit")
      {
        if (name === "android")
        {
          // Fix Chrome name (for instance wrongly defined in user agent on Android 1.6)
          name = "mobile chrome";
        }
        else if (agent.indexOf("Mobile Safari") !== -1 || agent.indexOf("Mobile/") !== -1)
        {
          // Fix Safari name
          name = "mobile safari";
        }
      }
      else if (engine ===  "mshtml")
      {
        if (name === "msie")
        {
          name = "ie";

          // Fix IE mobile before Microsoft added IEMobile string
          if (qx.bom.client.OperatingSystem.getVersion() === "ce") {
            name = "iemobile";
          }
        }
      }
      else if (engine === "opera")
      {
        if (name === "opera mobi") {
          name = "operamobile";
        } else if (name === "opera mini") {
          name = "operamini";
        }
      }

      return name;
    },


    /**
     * Determines the version of the current browser.
     * @return {String} The name of the current browser.
     * @internal
     */
    getVersion : function() {
      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__agents + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if (!match) {
        return "";
      }

      var name = match[1].toLowerCase();
      var version = match[3];

      // Support new style version string used by Opera and Safari
      if (agent.match(/Version(\/| )([0-9]+\.[0-9])/)) {
        version = RegExp.$2;
      }

      if (qx.bom.client.Engine.getName() == "mshtml")
      {
        // Use the Engine version, because IE8 and higher change the user agent
        // string to an older version in compatibility mode
        version = qx.bom.client.Engine.getVersion();

        if (name === "msie" && qx.bom.client.OperatingSystem.getVersion() == "ce") {
          // Fix IE mobile before Microsoft added IEMobile string
          version = "5.0";
        }
      }

      return version;
    },


    /**
     * Returns in which document mode the current document is (only for IE).
     *
     * @internal
     * @return {Number} The mode in which the browser is.
     */
    getDocumentMode : function() {
      if (document.documentMode) {
        return document.documentMode;
      }
      return 0;
    },


    /**
     * Check if in quirks mode.
     *
     * @internal
     * @return {Boolean} <code>true</code>, if the environment is in quirks mode
     */
    getQuirksMode : function() {
      if(qx.bom.client.Engine.getName() == "mshtml" &&
        parseFloat(qx.bom.client.Engine.getVersion()) >= 8)
      {
        return qx.bom.client.Engine.DOCUMENT_MODE === 5;
      } else {
        return document.compatMode !== "CSS1Compat";
      }
    },


    /**
     * Internal helper map for picking the right browser names to check.
     */
    __agents : {
      // Safari should be the last one to check, because some other Webkit-based browsers
      // use this identifier together with their own one.
      // "Version" is used in Safari 4 to define the Safari version. After "Safari" they place the
      // Webkit version instead. Silly.
      // Palm Pre uses both Safari (contains Webkit version) and "Version" contains the "Pre" version. But
      // as "Version" is not Safari here, we better detect this as the Pre-Browser version. So place
      // "Pre" in front of both "Version" and "Safari".
      "webkit" : "AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari",

      // Better security by keeping Firefox the last one to match
      "gecko" : "prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",

      // No idea what other browsers based on IE's engine
      "mshtml" : "IEMobile|Maxthon|MSIE",

      // Keep "Opera" the last one to correctly prefer/match the mobile clients
      "opera" : "Opera Mini|Opera Mobi|Opera"
    }[qx.bom.client.Engine.getName()]
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#ignore(WebKitCSSMatrix)

************************************************************************ */

/**
 * The purpose of this class is to contain all checks about css.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Css",
{
  statics :
  {
    /**
     * Checks what box model is used in the current environemnt.
     * @return {String} It either returns "content" or "border".
     * @internal
     */
    getBoxModel : function() {
      var content = qx.bom.client.Engine.getName() !== "mshtml" ||
        !qx.bom.client.Browser.getQuirksMode() ;

      return content ? "content" : "border";
    },


    /**
     * Checks if text overflow could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getTextOverflow : function() {
      return "textOverflow" in document.documentElement.style ||
        "OTextOverflow" in document.documentElement.style;
    },


    /**
     * Checks if a placeholder could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getPlaceholder : function() {
      var i = document.createElement("input");
      return "placeholder" in i;
    },


    /**
     * Checks if border radius could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getBorderRadius : function() {
      return "borderRadius" in document.documentElement.style ||
        "MozBorderRadius" in document.documentElement.style ||
        "WebkitBorderRadius" in document.documentElement.style;
    },


    /**
     * Checks if box shadow could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getBoxShadow : function() {
      return "boxShadow" in document.documentElement.style ||
        "MozBoxShadow" in document.documentElement.style ||
        "WebkitBoxShadow" in document.documentElement.style;
    },


    /**
     * Checks if translate3d can be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     * @lint ignoreUndefined(WebKitCSSMatrix)
     */
    getTranslate3d : function() {
      return 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
    },


    /**
     * Checks if background gradients could be used.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getGradients : function() {
      var el;
      try {
        el = document.createElement("div");
      } catch (ex) {
        el = document.createElement();
      }

      var style = [
        "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))",
        "-webkit-linear-gradient(left, white, black)",
        "-moz-linear-gradient(0deg, white 0%, red 100%)",
        "-o-linear-gradient(0deg, white 0%, red 100%)",
        "-ms-linear-gradient(0deg, white 0%, red 100%)",
        "linear-gradient(0deg, white 0%, red 100%)"
      ];

      for (var i=0; i < style.length; i++) {
        // try catch for IE
        try {
          el.style["background"] = style[i];
          if (el.style["background"].indexOf("gradient") != -1) {
            return true;
          }
        } catch (ex) {}
      };

      return false;
    },


    /**
     * Checks if rgba collors can be used:
     * http://www.w3.org/TR/2010/PR-css3-color-20101028/#rgba-color
     *
     * @return {Boolean} <code>true</code>, if rgba colors are supported.
     */
    getRgba : function() {
      var el;
      try {
        el = document.createElement("div");
      } catch (ex) {
        el = document.createElement();
      }

      // try catch for IE
      try {
        el.style["color"] = "rgba(1, 2, 3, 0.5)";
        if (el.style["color"].indexOf("rgba") != -1) {
          return true;
        }
      } catch (ex) {}

      return false;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The purpose of this class is to contain all checks for PhoneGap.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.PhoneGap",
{
  statics :
  {
    /**
     * Checks if PhoneGap is available.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getPhoneGap : function() {
      return "PhoneGap" in window;
    },


    /**
     * Checks if notifications can be displayed.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getNotification : function() {
      return "notification" in navigator;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

   ======================================================================

   This class contains code based on the following work:

   * SWFFix
     http://www.swffix.org
     Version 0.3 (r17)

     Copyright:
       (c) 2007 SWFFix developers

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Geoff Stearns
       * Michael Williams
       * Bobby van der Sluis

************************************************************************ */

/* ************************************************************************

#require(qx.bom.client.OperatingSystem)

************************************************************************ */

/**
 * This class contains all Flash detection.
 *
 * It is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Flash",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Checks if the flash plugin is available.
     * @return {Boolean} <code>true</code>, if flash is available.
     * @internal
     */
    isAvailable : function() {
      return parseFloat(qx.bom.client.Flash.getVersion()) > 0;
    },


    /**
     * Checks for the version of flash and returns it as a string. If the
     * version could not be detected, an empty string will be returnd.
     *
     * @return {String} The version number as string.
     * @internal
     */
    getVersion : function() {
      if (qx.bom.client.Engine.getName() == "mshtml") {
        if (!window.ActiveXObject) {
          return "";
        }

        var full = [0,0,0];
        var fp6Crash = false;

        try {
          var obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        }
        catch(ex)
        {
          try
          {
            var obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
            full = [ 6, 0, 21 ];
            obj.AllowScriptAccess = "always";
          }
          catch(ex)
          {
            if (full[0] == 6) {
              fp6Crash = true;
            }
          }

          if (!fp6Crash)
          {
            try {
              obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            } catch(ex) {}
          }
        }

        if (!fp6Crash && typeof obj == "object")
        {
          var info = obj.GetVariable("$version");

          if (typeof info != "undefined")
          {
            info = info.split(" ")[1].split(",");
            full[0] = parseInt(info[0], 10);
            full[1] = parseInt(info[1], 10);
            full[2] = parseInt(info[2], 10);
          }
        }

        return full.join(".");

      // all other browsers
      } else {
        if (!navigator.plugins || typeof navigator.plugins["Shockwave Flash"] !== "object") {
          return "";
        }

        var full = [0,0,0];
        var desc = navigator.plugins["Shockwave Flash"].description;

        if (typeof desc != "undefined")
        {
          desc = desc.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
          full[0] = parseInt(desc.replace(/^(.*)\..*$/, "$1"), 10);
          full[1] = parseInt(desc.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
          full[2] = /r/.test(desc) ? parseInt(desc.replace(/^.*r(.*)$/, "$1"), 10) : 0;
        }

        return full.join(".");
      }
    },


    /**
     * Checks if the flash installation is an expres installation.
     *
     * @return {Boolean} <code>true</code>, if its an express installation.
     * @internal
     */
    getExpressInstall : function() {
      var availableVersion = qx.bom.client.Flash.getVersion();
      if (availableVersion == "") {
        return false;
      }

      var os = qx.bom.client.OperatingSystem.getName();
      return (os == "win" || os == "osx") &&
        qx.bom.client.Flash.__supportsVersion("6.0.65", availableVersion);
    },


    /**
     * Checks if a strict security model is available.
     *
     * @return {Boolean} <code>true</code>, if its available.
     * @internal
     */
    getStrictSecurityModel : function() {
      var version = qx.bom.client.Flash.getVersion();
      if (version == "") {
        return false;
      }
      var full = version.split(".");

      if (full[0] < 10) {
        return qx.bom.client.Flash.__supportsVersion("9.0.151", version);
      } else {
        return qx.bom.client.Flash.__supportsVersion("10.0.12", version);
      }
    },


    /**
     * Storage for supported Flash versions.
     *
     * @internal
     */
    _cachedSupportsVersion : {},


    /**
     * Check if the first given version is supported by either the current
     * version available on the system or the optional given second parameter.
     *
     * @param input {String} The version to check.
     * @param availableVersion {String} The version available on the current
     *   system.
     * @return {Boolean} <code>true</code>, if the version is supported.
     */
    __supportsVersion : function(input, availableVersion) {
      var splitInput = input.split(".");
      var system = availableVersion || qx.bom.client.Flash.getVersion();
      system = system.split(".");

      for (var i=0; i<splitInput.length; i++)
      {
        var diff = parseInt(system[i], 10) - parseInt(splitInput[i], 10);
        if (diff > 0) {
          return true;
        } else if (diff < 0) {
          return false;
        }
      }
      return true;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The main purpose of this class to hold all checks about ECMAScript.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.EcmaScript",
{
  statics :
  {
    /**
     * Checks if the ECMAScript object count could be used:
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object#Properties_2
     *
     * @internal
     * @return {Boolean} <code>true</code> if the count is available.
     */
    getObjectCount : function() {
      return (({}).__count__ == 0);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The class is responsible for device detection. This is specially usefull
 * if you are on a mobile device.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Device",
{
  statics :
  {
    /** Maps user agent names to device IDs */
    __ids : {
      "iPod" : "ipod",
      "iPad" : "ipad",
      "iPhone" : "iPhone",

      "PSP" : "psp",
      "PLAYSTATION 3" : "ps3",
      "Nintendo Wii" : "wii",
      "Nintendo DS" : "ds",
      "XBOX" : "xbox",
      "Xbox" : "xbox"
    },


    /**
     * Returns the name of the current device if detectable. It falls back to
     * <code>pc</code> if the detection for other devices fails.
     *
     * @internal
     * @return {String} The string of the device found.
     */
    getName : function() {
      var str = [];
      for (var key in this.__ids) {
        str.push(key);
      }

      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(navigator.userAgent);

      if (match && match[1]) {
        return qx.bom.client.Device.__ids[match[1]];
      }
      return "pc";
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Internal class which contains the checks used by {@link qx.core.Environment}.
 * All checks in here are marked as internal which means you should never use
 * them directly.
 *
 * This class should contain all checks about events.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Event",
{
  statics :
  {
    /**
     * Checks if touch events are supported.
     *
     * @internal
     * @return {Boolean} <code>true</code> if touch events are supported.
     */
    getTouch : function() {
      return ("ontouchstart" in window);
    },


    /**
     * Checks if pointer events are available.
     *
     * @internal
     * @return {Boolean} <code>true</code> if pointer events are supported.
     */
    getPointer : function() {
      // Check if browser reports that pointerEvents is a known style property
      if ("pointerEvents" in document.documentElement.style) {
        // Opera 10.63 incorrectly advertises support for CSS pointer events (#4229).
        // Do not rely on pointer events in Opera until this browser issue is fixed.
        // IE9 only supports pointer events only for SVG.
        // See http://msdn.microsoft.com/en-us/library/ff972269%28v=VS.85%29.aspx
        var browserName = qx.bom.client.Engine.getName();
        return browserName != "opera" && browserName != "mshtml";
      }
      return false;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2005-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is the single point to access all settings that may be different
 * in different environments. This contains e.g. the browser name, engine
 * version but also qooxdoo or application specific settings.
 *
 * It's public API can be found in its four main methods. One pair of methods
 * are used to check the synchronous values of the environment. The other pair
 * is used for asynchronous checks.
 *
 * The most used method should be {@link #get} which is used to return the
 * current value for a given environment check.
 *
 * All qx settings can be changed via the generator's config. See the manual
 * for more details about the environment key in the config. As you can see
 * from the methods API, there is no way to override an existing key. So if you
 * need to change a qx setting, you have to use the generator to do so.
 *
 * The following table shows all checks which could be used. If you are
 * interessted in more details, check the reference to the implementation of
 * each check. Plese do not use these check implementation directly due to the
 * missing caching feature the Environment class offers.
 *
 * <table border="0" cellspacing="10">
 *   <tbody>
 *     <tr>
 *       <td colspan="4"><h2>Synchronous checks</h2>
 *       </td>
 *     </tr>
 *     <tr>
 *       <th><h3>Key</h3></th>
 *       <th><h3>Type</h3></th>
 *       <th><h3>Example</h3></th>
 *       <th><h3>Details</h3></th>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>browser</b></td>
 *     </tr>
 *     <tr>
 *       <td>browser.documentmode</td><td><i>Integer</em></td><td><code>0</code></td>
 *       <td>{@link qx.bom.client.Browser#getDocumentMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.name</td><td><i>String</em></td><td><code> chrome </code></td>
 *       <td>{@link qx.bom.client.Browser#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.quirksmode</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Browser#getQuirksMode}</td>
 *     </tr>
 *     <tr>
 *       <td>browser.version</td><td><i>String</em></td><td><code>11.0</code></td>
 *       <td>{@link qx.bom.client.Browser#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>css</b></td>
 *     </tr>
 *     <tr>
 *       <td>css.borderradius</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getBorderRadius}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxmodel</td><td><i>String</em></td><td><code>content</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxModel}</td>
 *     </tr>
 *     <tr>
 *       <td>css.boxshadow</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getBoxShadow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.gradients</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getGradients}</td>
 *     </tr>
 *     <tr>
 *       <td>css.placeholder</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getPlaceholder}</td>
 *     </tr>
 *     <tr>
 *       <td>css.textoverflow</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getTextOverflow}</td>
 *     </tr>
 *     <tr>
 *       <td>css.translate3d</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getTranslate3d}</td>
 *     </tr>
 *     <tr>
 *       <td>css.rgba</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Css#getRgba}</td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><b>device</b></td>
 *     </tr>
 *     <tr>
 *       <td>device.name</td><td><i>String</em></td><td><code>pc</code></td>
 *       <td>{@link qx.bom.client.Device#getName}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>ecmascript</b></td>
 *     </tr>
 *     <tr>
 *       <td>ecmascript.objectcount</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.EcmaScript#getObjectCount}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>engine</b></td>
 *     </tr>
 *     <tr>
 *       <td>engine.name</td><td><i>String</em></td><td><code>webkit</code></td>
 *       <td>{@link qx.bom.client.Engine#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>engine.version</td><td><i>String</em></td><td><code>534.24</code></td>
 *       <td>{@link qx.bom.client.Engine#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>event</b></td>
 *     </tr>
 *     <tr>
 *       <td>event.pointer</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Event#getPointer}</td>
 *     </tr>
 *     <tr>
 *       <td>event.touch</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Event#getTouch}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>html</b></td>
 *     </tr>
 *     <tr>
 *       <td>html.audio</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getAudio}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.mp3</td><td><i>String</em></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioMp3}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.ogg</td><td><i>String</em></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.wav</td><td><i>String</em></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioWav}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.au</td><td><i>String</em></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAu}</td>
 *     </tr>
 *     <tr>
 *       <td>html.audio.aif</td><td><i>String</em></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getAudioAif}</td>
 *     </tr>
 *     <tr>
 *       <td>html.canvas</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getCanvas}</td>
 *     </tr>
 *     <tr>
 *       <td>html.classlist</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getClassList}</td>
 *     </tr>
 *     <tr>
 *       <td>html.geolocation</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getGeoLocation}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.local</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getLocalStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.storage.session</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSessionStorage}</td>
 *     </tr>
 *     <tr>
 *       <td>html.svg</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getSvg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getVideo}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.h264</td><td><i>String</em></td><td><code>"probably"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoH264}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.ogg</td><td><i>String</em></td><td><code>""</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoOgg}</td>
 *     </tr>
 *     <tr>
 *       <td>html.video.webm</td><td><i>String</em></td><td><code>"maybe"</code></td>
 *       <td>{@link qx.bom.client.Html#getVideoWebm}</td>
 *     </tr>
 *     <tr>
 *       <td>html.vml</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Html#getVml}</td>
 *     </tr>
 *     <tr>
 *       <td>html.webworker</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getWebWorker}</td>
 *     <tr>
 *       <td>html.filereader</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getFileReader}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xpath</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXPath}</td>
 *     </tr>
 *     <tr>
 *       <td>html.xul</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getXul}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>io</b></td>
 *     </tr>
 *     <tr>
 *       <td>io.maxrequests</td><td><i>Integer</em></td><td><code>4</code></td>
 *       <td>{@link qx.bom.client.Transport#getMaxConcurrentRequestCount}</td>
 *     </tr>
 *     <tr>
 *       <td>io.ssl</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Transport#getSsl}</td>
 *     </tr>
 *     <tr>
 *       <td>io.xhr</td><td><i>String</em></td><td><code>xhr</code></td>
 *       <td>{@link qx.bom.client.Transport#getXmlHttpRequest}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>locale</b></td>
 *     </tr>
 *     <tr>
 *       <td>locale</td><td><i>String</em></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getLocale}</td>
 *     </tr>
 *     <tr>
 *       <td>locale.variant</td><td><i>String</em></td><td><code>de</code></td>
 *       <td>{@link qx.bom.client.Locale#getVariant}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>os</b></td>
 *     </tr>
 *     <tr>
 *       <td>os.name</td><td><i>String</em></td><td><code>osx</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getName}</td>
 *     </tr>
 *     <tr>
 *       <td>os.version</td><td><i>String</em></td><td><code>10.6</code></td>
 *       <td>{@link qx.bom.client.OperatingSystem#getVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>phonegap</b></td>
 *     </tr>
 *     <tr>
 *       <td>phonegap</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getPhoneGap}</td>
 *     </tr>
 *     <tr>
 *       <td>phonegap.notification</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.PhoneGap#getNotification}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>plugin</b></td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getDivX}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.divx.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getDivXVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#isAvailable}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.express</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getExpressInstall}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.strictsecurity</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Flash#getStrictSecurityModel}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.flash.version</td><td><i>String</em></td><td><code>10.2.154</code></td>
 *       <td>{@link qx.bom.client.Flash#getVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.gears</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getGears}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdf</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getPdf}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.pdf.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getPdfVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktime}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.quicktime.version</td><td><i>String</em></td><td><code>7.6</code></td>
 *       <td>{@link qx.bom.client.Plugin#getQuicktimeVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlight}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.silverlight.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getSilverlightVersion}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMedia}</td>
 *     </tr>
 *     <tr>
 *       <td>plugin.windowsmedia.version</td><td><i>String</em></td><td></td>
 *       <td>{@link qx.bom.client.Plugin#getWindowsMediaVersion}</td>
 *     </tr>

 *     <tr>
 *       <td colspan="4"><b>qx</b></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlSettings</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.allowUrlVariants</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.application</td><td><i>String</em></td><td><code>name.space</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;application name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.aspects</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.debug.databinding</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.disposerDebugLevel</td><td><i>Integer</em></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynamicmousewheel</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.dynlocale</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>true</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.globalErrorHandling</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.emulatetouch</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.mobile.nativescroll</td><td><i>Boolean</em></td><td><code>false</code></td>
 *       <td><i>default:</i> <code>false</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.basecalls</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.comments</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.privates</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.strings</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.variables</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.optimization.variants</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>true if the corresp. <i>optimize</i> key is set in the config</td>
 *     </tr>
 *     <tr>
 *       <td>qx.propertyDebugLevel</td><td><i>Integer</em></td><td><code>0</code></td>
 *       <td><i>default:</i> <code>0</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.revision</td><td><i>String</em></td><td><code>27348</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.theme</td><td><i>String</em></td><td><code>qx.theme.Modern</code></td>
 *       <td><i>default:</i> <code>&lt;&lt;theme name&gt;&gt;</code></td>
 *     </tr>
 *     <tr>
 *       <td>qx.version</td><td><i>String</em></td><td><code>1.5</code></td>
 *     </tr>
 *     <tr>
 *       <td colspan="4"><h3>Asynchronous checks</h3>
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>html.dataurl</td><td><i>Boolean</em></td><td><code>true</code></td>
 *       <td>{@link qx.bom.client.Html#getDataUrl}</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 */
qx.Bootstrap.define("qx.core.Environment",
{
  statics : {

    /** Map containing the synchronous check functions. */
    _checks : {},
    /** Map containing the asynchronous check functions. */
    _asyncChecks : {},

    /** Internal cache for all checks. */
    __cache : {},


    /**
     * The default accessor for the checks. It returns the value the current
     * environment has for the given key. The key could be something like
     * "qx.debug", "css.textoverflow" or "io.ssl". A complete list of
     * checks can be found in the class comment of this class.
     *
     * Please keep in mind that the result is cached. If you want to run the
     * check function again in case something could have been changed, take a
     * look at the {@link #invalidateCacheKey} function.
     *
     * @param key {String} The name of the check you want to query.
     */
    get : function(key) {
      // check the cache
      if (this.__cache[key] != undefined) {
        return this.__cache[key];
      }

      // search for a fitting check
      var check = this._checks[key];
      if (check) {
        // execute the check and write the result in the cache
        var value = check();
        this.__cache[key] = value;
        return value;
      }

      // debug flag
      if (qx.Bootstrap.DEBUG) {
        qx.Bootstrap.warn(
          key + " is not a valid key. Please see the API-doc of " +
          "qx.core.Environment for a list of predefined keys."
        );
        qx.Bootstrap.trace(this);
      }
    },


    /**
     * Invokes the callback as soon as the check has been done. If no check
     * could be found, a warning will be printed.
     *
     * @param key {String} The key of the asynchronous check.
     * @param callback {Function} The function to call as soon as the check is
     *   done. The function should have one argument which is the result of the
     *   check.
     * @param self {var} The context to use when invoking the callback.
     */
    getAsync : function(key, callback, self) {
      // check the cache
      var env = this;
      if (this.__cache[key] != undefined) {
        // force async behavior
        window.setTimeout(function() {
          callback.call(self, env.__cache[key]);
        }, 0);
        return;
      }

      var check = this._asyncChecks[key];
      if (check) {
        check(function(result) {
          env.__cache[key] = result;
          callback.call(self, result);
        });
        return;
      }

      // debug flag
      if (qx.Bootstrap.DEBUG) {
        qx.Bootstrap.warn(
          key + " is not a valid key. Please see the API-doc of " +
          "qx.core.Environment for a list of predefined keys."
        );
        qx.Bootstrap.trace(this);
      }
    },


    /**
     * Returns the proper value dependent on the check for the given key.
     *
     * @param key {String} The name of the check the select depends on.
     * @param values {Map} A map containing the values which should be returned
     *   in any case. The "default" key could be used as a catch all statement.
     * @return {var} The value which is stored in the map for the given
     *   check of the key.
     */
    select : function(key, values) {
      return this.__pickFromValues(this.get(key), values);
    },


    /**
     * Selects the proper function dependent on the asynchronous check.
     *
     * @param key {String} The key for the async check.
     * @param values {Map} A map containing functions. The map keys should
     *   contain all possibilities which could be returned by the given check
     *   key. The "default" key could be used as a catch all statement.
     *   The called function will get one parameter, the result of the query.
     * @param self {var} The context which should be used when calling the
     *   method in the values map.
     */
    selectAsync : function(key, values, self) {
      this.getAsync(key, function(result) {
        var value = this.__pickFromValues(key, values);
        value.call(self, result)
      }, this);
    },


    /**
     * Internal helper which tries to pick the given key from the given values
     * map. If that key is not found, it tries to use a key named "default".
     * If there is also no default key, it prints out a warning and returns
     * undefined.
     *
     * @param key {String} The key to search for in the values.
     * @param values {Map} A map containing some keys.
     * @return {var} The value stored as values[key] usually.
     */
    __pickFromValues : function(key, values) {
      var value = values[key];
      if (values.hasOwnProperty(key)) {
        return value;
      }

      // check for piped values
      for (var id in values) {
        if (id.indexOf("|") != -1) {
          var ids = id.split("|");
          for (var i = 0; i < ids.length; i++) {
            if (ids[i] == key) {
              return values[id];
            }
          };
        }
      }

      if (values["default"] !== undefined) {
        return values["default"];
      }

      if (qx.Bootstrap.DEBUG)
      {
        throw new Error('No match for variant "' + key +
          '" (' + (typeof key) + ' type)' +
          ' in variants [' + qx.Bootstrap.getKeysAsString(values) +
          '] found, and no default ("default") given');
      }
    },


    /**
     * Invalidates the cache for the given key.
     *
     * @param key {String} The key of the check.
     */
    invalidateCacheKey : function(key) {
      delete this.__cache[key];
    },


    /**
     * Add a check to the environment class. If there is already a check
     * added for the given key, the add will be ignored.
     *
     * @param key {String} The key for the check e.g. html.featurexyz.
     * @param check {var} It could be either a function or a simple value.
     *   The function should be responsible for the check and should return the
     *   result of the check.
     */
    add : function(key, check) {
      // ignore already added checks.
      if (this._checks[key] == undefined) {
        // add functions directly
        if (check instanceof Function) {
          this._checks[key] = check;
        // otherwise, create a check function and use that
        } else {
          this._checks[key] = this.__createCheck(check);
        }
      }
    },


    /**
     * Adds an asynchronous check to the environment. If there is already a check
     * added for the given key, the add will be ignored.
     *
     * @param key {String} The key of the check e.g. html.featureabc
     * @param check {Function} A function which should check for a specific
     *   environment setting in an asynchronous way. The method should take two
     *   arguments. First one is the callback and the second one is the context.
     */
    addAsync : function(key, check) {
      if (this._checks[key] == undefined) {
        this._asyncChecks[key] = check;
      }
    },



    /**
     * Initializer for the default values of the framework settings.
     */
    _initDefaultQxValues : function() {
      // old settings
      this.add("qx.allowUrlSettings", function() {return false;});
      this.add("qx.allowUrlVariants", function() {return false;});
      this.add("qx.propertyDebugLevel", function() {return 0;});

      // old variants
      // make sure to reflect all changes to qx.debug here in the bootstrap class!
      this.add("qx.debug", function() {return true;});
      this.add("qx.aspects", function() {return false;});
      this.add("qx.dynlocale", function() {return true;});
      this.add("qx.mobile.emulatetouch", function() {return false;});
      this.add("qx.mobile.nativescroll", function() {return false;});

      this.add("qx.dynamicmousewheel", function() {return true;});
      this.add("qx.debug.databinding", function() {return false;});

      // generator optimization vectors
      this.add("qx.optimization.basecalls", function() {return false;});
      this.add("qx.optimization.comments", function() {return false;});
      this.add("qx.optimization.privates", function() {return false;});
      this.add("qx.optimization.strings", function() {return false;});
      this.add("qx.optimization.variables", function() {return false;});
      this.add("qx.optimization.variants", function() {return false;});
    },


    /**
     * Import checks from global qx.$$environment into the Environment class.
     */
    __importFromGenerator : function()
    {
      // import the environment map
      if (qx && qx.$$environment)
      {
        for (var key in qx.$$environment) {
          var value = qx.$$environment[key];

          this._checks[key] = this.__createCheck(value);
        }
      }
    },


    /**
     * Checks the URL for environment settings and imports these into the
     * Environment class.
     */
    __importFromUrl : function() {
      if (window.document && window.document.location) {
        var urlChecks = window.document.location.search.slice(1).split("&");

        for (var i = 0; i < urlChecks.length; i++)
        {
          var check = urlChecks[i].split(":");
          if (check.length != 3 || check[0] != "qxenv") {
            continue;
          }

          var key = check[1];
          var value = decodeURIComponent(check[2]);

          // implicit type conversion
          if (value == "true") {
            value = true;
          } else if (value == "false") {
            value = false;
          } else if (/^(\d|\.)+$/.test(value)) {
            value = parseFloat(value);
          }

          this._checks[key] = this.__createCheck(value);
        }
      }
    },


    /**
     * Internal helper which creates a function retuning the given value.
     *
     * @param value {var} The value which should be returned.
     * @return {Function} A function which could be used by a test.
     */
    __createCheck : function(value) {
      return qx.Bootstrap.bind(function(value) {
        return value;
      }, null, value);
    },


    /**
     * Internal helper for the generator to flag that this block contains the
     * dependency for the given check key.
     *
     * @internal
     * @param key {String} the check key.
     * @return {Boolean} Always true
     */
    useCheck : function(key) {
      return true;
    },


    /**
     * Initializer for the checks which are available on runtime.
     */
    _initChecksMap : function() {
      // CAUTION! If you edit this function, be sure to use the following
      // pattern to asure the removal of the generator on demand.
      // if (this.useCheck("check.name")) {
      //   this._checks["check.name"] = checkFunction;
      // }
      // Also keep in mind to change the class comment to reflect the current
      // available checks.

      // /////////////////////////////////////////
      // Engine
      // /////////////////////////////////////////
      if (this.useCheck("engine.version")) {
        this._checks["engine.version"] = qx.bom.client.Engine.getVersion;
      }
      if (this.useCheck("engine.name")) {
        this._checks["engine.name"] = qx.bom.client.Engine.getName;
      }

      // /////////////////////////////////////////
      // Browser
      // /////////////////////////////////////////
      if (this.useCheck("browser.name")) {
        this._checks["browser.name"] = qx.bom.client.Browser.getName;
      }
      if (this.useCheck("browser.version")) {
        this._checks["browser.version"] = qx.bom.client.Browser.getVersion;
      }
      if (this.useCheck("browser.documentmode")) {
        this._checks["browser.documentmode"] = qx.bom.client.Browser.getDocumentMode;
      }
      if (this.useCheck("browser.quirksmode")) {
        this._checks["browser.quirksmode"] = qx.bom.client.Browser.getQuirksMode;
      }

      // /////////////////////////////////////////
      // DEVICE
      // /////////////////////////////////////////
      if (this.useCheck("device.name")) {
        this._checks["device.name"] = qx.bom.client.Device.getName;
      }

      // /////////////////////////////////////////
      // LOCALE
      // /////////////////////////////////////////
      if (this.useCheck("locale")) {
        this._checks["locale"] = qx.bom.client.Locale.getLocale;
      }

      if (this.useCheck("locale.variant")) {
        this._checks["locale.variant"] = qx.bom.client.Locale.getVariant;
      }

      // /////////////////////////////////////////
      // OPERATING SYSTEM
      // /////////////////////////////////////////
      if (this.useCheck("os.name")) {
        this._checks["os.name"] = qx.bom.client.OperatingSystem.getName;
      }
      if (this.useCheck("os.version")) {
        this._checks["os.version"] = qx.bom.client.OperatingSystem.getVersion;
      }

      // /////////////////////////////////////////
      // plugin
      // /////////////////////////////////////////
      if (this.useCheck("plugin.gears")) {
        this._checks["plugin.gears"] = qx.bom.client.Plugin.getGears;
      }

      if (this.useCheck("plugin.quicktime")) {
        this._checks["plugin.quicktime"] = qx.bom.client.Plugin.getQuicktime;
      }
      if (this.useCheck("plugin.quicktime.version")) {
        this._checks["plugin.quicktime.version"] = qx.bom.client.Plugin.getQuicktimeVersion;
      }

      if (this.useCheck("plugin.windowsmedia")) {
        this._checks["plugin.windowsmedia"] = qx.bom.client.Plugin.getWindowsMedia;
      }
      if (this.useCheck("plugin.windowsmedia.version")) {
        this._checks["plugin.windowsmedia.version"] = qx.bom.client.Plugin.getWindowsMediaVersion;
      }

      if (this.useCheck("plugin.divx")) {
        this._checks["plugin.divx"] = qx.bom.client.Plugin.getDivX;
      }
      if (this.useCheck("plugin.divx.version")) {
        this._checks["plugin.divx.version"] = qx.bom.client.Plugin.getDivXVersion;
      }

      if (this.useCheck("plugin.silverlight")) {
        this._checks["plugin.silverlight"] = qx.bom.client.Plugin.getSilverlight;
      }
      if (this.useCheck("plugin.silverlight.version")) {
        this._checks["plugin.silverlight.version"] = qx.bom.client.Plugin.getSilverlightVersion;
      }

      if (this.useCheck("plugin.flash")) {
        this._checks["plugin.flash"] = qx.bom.client.Flash.isAvailable;
      }
      if (this.useCheck("plugin.flash.version")) {
        this._checks["plugin.flash.version"] = qx.bom.client.Flash.getVersion;
      }
      if (this.useCheck("plugin.flash.express")) {
        this._checks["plugin.flash.express"] = qx.bom.client.Flash.getExpressInstall;
      }
      if (this.useCheck("plugin.flash.strictsecurity")) {
        this._checks["plugin.flash.strictsecurity"] = qx.bom.client.Flash.getStrictSecurityModel;
      }

      if (this.useCheck("plugin.pdf")) {
        this._checks["plugin.pdf"] = qx.bom.client.Plugin.getPdf;
      }
      if (this.useCheck("plugin.pdf.version")) {
        this._checks["plugin.pdf.version"] = qx.bom.client.Plugin.getPdfVersion;
      }

      // /////////////////////////////////////////
      // IO
      // /////////////////////////////////////////
      if (this.useCheck("io.maxrequests")) {
        this._checks["io.maxrequests"] = qx.bom.client.Transport.getMaxConcurrentRequestCount;
      }
      if (this.useCheck("io.ssl")) {
        this._checks["io.ssl"] = qx.bom.client.Transport.getSsl;
      }
      if (this.useCheck("io.xhr")) {
        this._checks["io.xhr"] = qx.bom.client.Transport.getXmlHttpRequest;
      }

      // /////////////////////////////////////////
      // EVENTS
      // /////////////////////////////////////////
      if (this.useCheck("event.touch")) {
        this._checks["event.touch"] = qx.bom.client.Event.getTouch;
      }

      if (this.useCheck("event.pointer")) {
        this._checks["event.pointer"] = qx.bom.client.Event.getPointer;
      }

      // /////////////////////////////////////////
      // ECMA SCRIPT
      // /////////////////////////////////////////
      if (this.useCheck("ecmascript.objectcount")) {
        this._checks["ecmascript.objectcount"] =
          qx.bom.client.EcmaScript.getObjectCount;
      }

      // /////////////////////////////////////////
      // HTML
      // /////////////////////////////////////////
      if (this.useCheck("html.webworker")) {
        this._checks["html.webworker"] = qx.bom.client.Html.getWebWorker;
      }
      if (this.useCheck("html.filereader")) {
        this._checks["html.filereader"] = qx.bom.client.Html.getFileReader;
      }
      if (this.useCheck("html.geolocation")) {
        this._checks["html.geolocation"] = qx.bom.client.Html.getGeoLocation;
      }
      if (this.useCheck("html.audio")) {
        this._checks["html.audio"] = qx.bom.client.Html.getAudio;
      }
      if (this.useCheck("html.audio.ogg")) {
        this._checks["html.audio.ogg"] = qx.bom.client.Html.getAudioOgg;
      }
      if (this.useCheck("html.audio.mp3")) {
        this._checks["html.audio.mp3"] = qx.bom.client.Html.getAudioMp3;
      }
      if (this.useCheck("html.audio.wav")) {
        this._checks["html.audio.wav"] = qx.bom.client.Html.getAudioWav;
      }
      if (this.useCheck("html.audio.au")) {
        this._checks["html.audio.au"] = qx.bom.client.Html.getAudioAu;
      }
      if (this.useCheck("html.audio.aif")) {
        this._checks["html.audio.aif"] = qx.bom.client.Html.getAudioAif;
      }
      if (this.useCheck("html.video")) {
        this._checks["html.video"] = qx.bom.client.Html.getVideo;
      }
      if (this.useCheck("html.video.ogg")) {
        this._checks["html.video.ogg"] = qx.bom.client.Html.getVideoOgg;
      }
      if (this.useCheck("html.video.h264")) {
        this._checks["html.video.h264"] = qx.bom.client.Html.getVideoH264;
      }
      if (this.useCheck("html.video.webm")) {
        this._checks["html.video.webm"] = qx.bom.client.Html.getVideoWebm;
      }
      if (this.useCheck("html.storage.local")) {
        this._checks["html.storage.local"] = qx.bom.client.Html.getLocalStorage;
      }
      if (this.useCheck("html.storage.session")) {
        this._checks["html.storage.session"] = qx.bom.client.Html.getSessionStorage;
      }
      if (this.useCheck("html.classlist")) {
        this._checks["html.classlist"] = qx.bom.client.Html.getClassList;
      }

      if (this.useCheck("html.xpath")) {
        this._checks["html.xpath"] = qx.bom.client.Html.getXPath;
      }
      if (this.useCheck("html.xul")) {
        this._checks["html.xul"] = qx.bom.client.Html.getXul;
      }

      if (this.useCheck("html.canvas")) {
        this._checks["html.canvas"] = qx.bom.client.Html.getCanvas;
      }
      if (this.useCheck("html.svg")) {
        this._checks["html.svg"] = qx.bom.client.Html.getSvg;
      }
      if (this.useCheck("html.vml")) {
        this._checks["html.vml"] = qx.bom.client.Html.getVml;
      }
      if (this.useCheck("html.dataurl")) {
        this._asyncChecks["html.dataurl"] = qx.bom.client.Html.getDataUrl;
      }
      if (this.useCheck("html.dataset")) {
        this._checks["html.dataset"] = qx.bom.client.Html.getDataset;
      }

      // /////////////////////////////////////////
      // CSS
      // /////////////////////////////////////////
      if (this.useCheck("css.textoverflow")) {
        this._checks["css.textoverflow"] = qx.bom.client.Css.getTextOverflow;
      }

      if (this.useCheck("css.placeholder")) {
        this._checks["css.placeholder"] = qx.bom.client.Css.getPlaceholder;
      }

      if (this.useCheck("css.borderradius")) {
        this._checks["css.borderradius"] = qx.bom.client.Css.getBorderRadius;
      }

      if (this.useCheck("css.boxshadow")) {
        this._checks["css.boxshadow"] = qx.bom.client.Css.getBoxShadow;
      }

      if (this.useCheck("css.gradients")) {
        this._checks["css.gradients"] = qx.bom.client.Css.getGradients;
      }

      if (this.useCheck("css.boxmodel")) {
        this._checks["css.boxmodel"] = qx.bom.client.Css.getBoxModel;
      }

      if (this.useCheck("css.translate3d")) {
        this._checks["css.translate3d"] = qx.bom.client.Css.getTranslate3d;
      }

      if (this.useCheck("css.rgba")) {
        this._checks["css.rgba"] = qx.bom.client.Css.getRgba;
      }

      // /////////////////////////////////////////
      // PHONEGAP
      // /////////////////////////////////////////
      if (this.useCheck("phonegap")) {
        this._checks["phonegap"] = qx.bom.client.PhoneGap.getPhoneGap;
      }

      if (this.useCheck("phonegap.notification")) {
        this._checks["phonegap.notification"] = qx.bom.client.PhoneGap.getNotification;
      }
    }
  },


  defer : function(statics) {
    // create default values for the environment class
    statics._initDefaultQxValues();
    // first initialize the defined checks
    statics._initChecksMap();
    // load the checks from the generator
    statics.__importFromGenerator();
    // load the checks from the url
    if (statics.get("qx.allowUrlSettings") === true) {
      statics.__importFromUrl();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This class is used to define mixins (similar to mixins in Ruby).
 *
 * Mixins are collections of code and variables, which can be merged into
 * other classes. They are similar to classes but don't support inheritance.
 *
 * See the description of the {@link #define} method how a mixin is defined.
 */
qx.Bootstrap.define("qx.Mixin",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new mixin.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Mixin.define("name",
     * {
     *   includes: [SuperMixins],
     *
     *   properties: {
     *     tabIndex: {type: "number", init: -1}
     *   },
     *
     *   members:
     *   {
     *     prop1: "foo",
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String} name of the mixin
     * @param config {Map ? null} Mixin definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>construct</th><td>Function</td><td>An optional mixin constructor. It is called on instantiation each
     *         class including this mixin. The constructor takes no parameters.</td></tr>
     *     <tr><th>destruct</th><td>Function</td><td>An optional mixin destructor.</td></tr>
     *     <tr><th>include</th><td>Mixin[]</td><td>Array of mixins, which will be merged into the mixin.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the mixin. The statics will not get copied into the target class. They remain
     *         accessible from the mixin. This is the same behaviour as statics in interfaces ({@link qx.Interface#define}).
     *     </td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the mixin.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property}.</td></tr>
     *     <tr><th>events</th><td>Map</td><td>
     *         Map of events the mixin fires. The keys are the names of the events and the values are
     *         corresponding event type classes.
     *     </td></tr>
     *   </table>
     */
    define : function(name, config)
    {
      if (config)
      {
        // Normalize include
        if (config.include && !(qx.Bootstrap.getClass(config.include) === "Array")) {
          config.include = [config.include];
        }

        // Validate incoming data
        if (qx.core.Environment.get("qx.debug")) {
          this.__validateConfig(name, config);
        }

        // Create Interface from statics
        var mixin = config.statics ? config.statics : {};
        qx.Bootstrap.setDisplayNames(mixin, name);

        for(var key in mixin) {
          if (mixin[key] instanceof Function)
          {
            mixin[key].$$mixin = mixin;
          }
        }

        // Attach configuration
        if (config.construct)
        {
          mixin.$$constructor = config.construct;
          qx.Bootstrap.setDisplayName(config.construct, name, "constructor");
        }

        if (config.include) {
          mixin.$$includes = config.include;
        }

        if (config.properties) {
          mixin.$$properties = config.properties;
        }

        if (config.members)
        {
          mixin.$$members = config.members;
          qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");
        }

        for(var key in mixin.$$members)
        {
          if (mixin.$$members[key] instanceof Function) {
            mixin.$$members[key].$$mixin = mixin;
          }
        }

        if (config.events) {
          mixin.$$events = config.events;
        }

        if (config.destruct)
        {
          mixin.$$destructor = config.destruct;
          qx.Bootstrap.setDisplayName(config.destruct, name, "destruct");
        }
      }
      else
      {
        var mixin = {};
      }

      // Add basics
      mixin.$$type = "Mixin";
      mixin.name = name;

      // Attach toString
      mixin.toString = this.genericToString;

      // Assign to namespace
      mixin.basename = qx.Bootstrap.createNamespace(name, mixin);

      // Store class reference in global mixin registry
      this.$$registry[name] = mixin;

      // Return final mixin
      return mixin;
    },


    /**
     * Check compatibility between mixins (including their includes)
     *
     * @param mixins {Mixin[]} an array of mixins
     * @throws an exception when there is a conflict between the mixins
     */
    checkCompatibility : function(mixins)
    {
      var list = this.flatten(mixins);
      var len = list.length;

      if (len < 2) {
        return true;
      }

      var properties = {};
      var members = {};
      var events = {};
      var mixin;

      for (var i=0; i<len; i++)
      {
        mixin = list[i];

        for (var key in mixin.events)
        {
          if(events[key]) {
            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + events[key] + '" in member "' + key + '"!');
          }

          events[key] = mixin.name;
        }

        for (var key in mixin.properties)
        {
          if(properties[key]) {
            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + properties[key] + '" in property "' + key + '"!');
          }

          properties[key] = mixin.name;
        }

        for (var key in mixin.members)
        {
          if(members[key]) {
            throw new Error('Conflict between mixin "' + mixin.name + '" and "' + members[key] + '" in member "' + key + '"!');
          }

          members[key] = mixin.name;
        }
      }

      return true;
    },


    /**
     * Checks if a class is compatible to the given mixin (no conflicts)
     *
     * @param mixin {Mixin} mixin to check
     * @param clazz {Class} class to check
     * @throws an exception when the given mixin is incompatible to the class
     * @return {Boolean} true if the mixin is compatible to the given class
     */
    isCompatible : function(mixin, clazz)
    {
      var list = qx.Bootstrap.getMixins(clazz);
      list.push(mixin);
      return qx.Mixin.checkCompatibility(list);
    },


    /**
     * Returns a mixin by name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.$$registry[name];
    },


    /**
     * Determine if mixin exists
     *
     * @name isDefined
     * @param name {String} mixin name to check
     * @return {Boolean} true if mixin exists
     */
    isDefined : function(name) {
      return this.getByName(name) !== undefined;
    },


    /**
     * Determine the number of mixins which are defined
     *
     * @return {Number} the number of mixins
     */
    getTotalNumber : function() {
      return qx.Bootstrap.objectGetLength(this.$$registry);
    },


    /**
     * Generates a list of all mixins given plus all the
     * mixins these includes plus... (deep)
     *
     * @param mixins {Mixin[] ? []} List of mixins
     * @return {Array} List of all mixins
     */
    flatten : function(mixins)
    {
      if (!mixins) {
        return [];
      }

      // we need to create a copy and not to modify the existing array
      var list = mixins.concat();

      for (var i=0, l=mixins.length; i<l; i++)
      {
        if (mixins[i].$$includes) {
          list.push.apply(list, this.flatten(mixins[i].$$includes));
        }
      }

      return list;
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all mixins to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The mixin identifier
     */
    genericToString : function() {
      return "[Mixin " + this.name + "]";
    },


    /** Registers all defined mixins */
    $$registry : {},


    /** {Map} allowed keys in mixin definition */
    __allowedKeys : qx.core.Environment.select("qx.debug",
    {
      "true":
      {
        "include"    : "object",   // Mixin | Mixin[]
        "statics"    : "object",   // Map
        "members"    : "object",   // Map
        "properties" : "object",   // Map
        "events"     : "object",   // Map
        "destruct"   : "function", // Function
        "construct"  : "function"  // Function
      },

      "default" : null
    }),


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : qx.core.Environment.select("qx.debug",
    {
      "true": function(name, config)
      {
        // Validate keys
        var allowed = this.__allowedKeys;
        for (var key in config)
        {
          if (!allowed[key]) {
            throw new Error('The configuration key "' + key + '" in mixin "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value is undefined/null!');
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in mixin "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        // Validate maps
        var maps = [ "statics", "members", "properties", "events" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined && 
              ([
                 "Array", 
                 "RegExp", 
                 "Date"
               ].indexOf(qx.Bootstrap.getClass(config[key])) != -1 ||
               config[key].classname !== undefined)) {

            throw new Error('Invalid key "' + key + '" in mixin "' + name + '"! The value needs to be a map!');
          }
        }

        // Validate includes
        if (config.include)
        {
          for (var i=0, a=config.include, l=a.length; i<l; i++)
          {
            if (a[i] == null) {
              throw new Error("Includes of mixins must be mixins. The include number '" + (i+1) + "' in mixin '" + name + "'is undefined/null!");
            }

            if (a[i].$$type !== "Mixin") {
              throw new Error("Includes of mixins must be mixins. The include number '" + (i+1) + "' in mixin '" + name + "'is not a mixin!");
            }
          }

          this.checkCompatibility(config.include);
        }
      },

      "default" : function() {}
    })
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This class is used to define interfaces (similar to Java interfaces).
 *
 * See the description of the {@link #define} method how an interface is
 * defined.
 */
qx.Bootstrap.define("qx.Interface",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new interface. Interface definitions look much like class definitions.
     *
     * The main difference is that the bodies of functions defined in <code>members</code>
     * and <code>statics</code> are called before the original function with the
     * same arguments. This can be used to check the passed arguments. If the
     * checks fail, an exception should be thrown. It is convenient to use the
     * method defined in {@link qx.core.MAssert} to check the arguments.
     *
     * In the <code>build</code> version the checks are omitted.
     *
     * For properties only the names are required so the value of the properties
     * can be empty maps.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Interface.define("name",
     * {
     *   extend: [SuperInterfaces],
     *
     *   statics:
     *   {
     *     PI : 3.14
     *   },
     *
     *   properties: {"color": {}, "name": {} },
     *
     *   members:
     *   {
     *     meth1: function() {},
     *     meth2: function(a, b) { this.assertArgumentsCount(arguments, 2, 2); },
     *     meth3: function(c) { this.assertInterface(c.constructor, qx.some.Interface); }
     *   },
     *
     *   events :
     *   {
     *     keydown : "qx.event.type.KeySequence"
     *   }
     * });
     * </pre>
     *
     * @param name {String} name of the interface
     * @param config {Map ? null} Interface definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>extend</th><td>Interface |<br>Interface[]</td><td>Single interface or array of interfaces this interface inherits from.</td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the interface.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the interface. The statics will not get copied into the target class.
     *         This is the same behaviour as statics in mixins ({@link qx.Mixin#define}).
     *     </td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of properties and their definitions.</td></tr>
     *     <tr><th>events</th><td>Map</td><td>Map of event names and the corresponding event class name.</td></tr>
     *   </table>
     */
    define : function(name, config)
    {
      if (config)
      {
        // Normalize include
        if (config.extend && !(qx.Bootstrap.getClass(config.extend) === "Array")) {
          config.extend = [config.extend];
        }

        // Validate incoming data
        if (qx.core.Environment.get("qx.debug")) {
          this.__validateConfig(name, config);
        }

        // Create interface from statics
        var iface = config.statics ? config.statics : {};

        // Attach configuration
        if (config.extend) {
          iface.$$extends = config.extend;
        }

        if (config.properties) {
          iface.$$properties = config.properties;
        }

        if (config.members) {
          iface.$$members = config.members;
        }

        if (config.events) {
          iface.$$events = config.events;
        }
      }
      else
      {
        // Create empty interface
        var iface = {};
      }

      // Add Basics
      iface.$$type = "Interface";
      iface.name = name;

      // Attach toString
      iface.toString = this.genericToString;

      // Assign to namespace
      iface.basename = qx.Bootstrap.createNamespace(name, iface);

      // Add to registry
      qx.Interface.$$registry[name] = iface;

      // Return final interface
      return iface;
    },


    /**
     * Returns an interface by name
     *
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.$$registry[name];
    },


    /**
     * Determine if interface exists
     *
     * @param name {String} Interface name to check
     * @return {Boolean} true if interface exists
     */
    isDefined : function(name) {
      return this.getByName(name) !== undefined;
    },


    /**
     * Determine the number of interfaces which are defined
     *
     * @return {Number} the number of interfaces
     */
    getTotalNumber : function() {
      return qx.Bootstrap.objectGetLength(this.$$registry);
    },


    /**
     * Generates a list of all interfaces including their super interfaces
     * (resolved recursively)
     *
     * @param ifaces {Interface[] ? []} List of interfaces to be resolved
     * @return {Array} List of all interfaces
     */
    flatten : function(ifaces)
    {
      if (!ifaces) {
        return [];
      }

      // we need to create a copy and not to modify the existing array
      var list = ifaces.concat();

      for (var i=0, l=ifaces.length; i<l; i++)
      {
        if (ifaces[i].$$extends) {
          list.push.apply(list, this.flatten(ifaces[i].$$extends));
        }
      }

      return list;
    },


    /**
     * Assert members
     *
     * @param object {qx.core.Object} The object, which contains the methods
     * @param clazz {Class} class of the object
     * @param iface {Interface} the interface to verify
     * @param wrap {Boolean ? false} wrap functions required by interface to
     *     check parameters etc.
     */
    __assertMembers : function(object, clazz, iface, wrap)
    {
      // Validate members
      var members = iface.$$members;
      if (members)
      {
        for (var key in members)
        {
          if (qx.Bootstrap.isFunction(members[key]))
          {
            var isPropertyMethod = this.__isPropertyMethod(clazz, key);
            var hasMemberFunction = isPropertyMethod || qx.Bootstrap.isFunction(object[key]);

            if (!hasMemberFunction)
            {
              throw new Error(
                  'Implementation of method "' + key +
                  '" is missing in class "' + clazz.classname +
                  '" required by interface "' + iface.name + '"'
              );
            }

            // Only wrap members if the interface was not been applied yet. This
            // can easily be checked by the recursive hasInterface method.
            var shouldWrapFunction =
              wrap === true &&
              !isPropertyMethod &&
              !qx.Bootstrap.hasInterface(clazz, iface);

            if (shouldWrapFunction) {
              object[key] = this.__wrapInterfaceMember(
                iface, object[key], key, members[key]
              );
            }
          }
          else
          {
            // Other members are not checked more detailed because of
            // JavaScript's loose type handling
            if (typeof object[key] === undefined)
            {
              if (typeof object[key] !== "function") {
                throw new Error(
                  'Implementation of member "' + key +
                  '" is missing in class "' + clazz.classname +
                  '" required by interface "' + iface.name + '"'
                );
              }
            }
          }
        }
      }
    },


    /**
     * Internal helper to detect if the method will be generated by the
     * property system.
     *
     * @param clazz {Class} The current class.
     * @param methodName {String} The name of the method.
     *
     * @return {Boolean} true, if the method will be generated by the property
     *   system.
     */
    __isPropertyMethod: function(clazz, methodName)
    {
      var match = methodName.match(/^(is|toggle|get|set|reset)(.*)$/);

      if (!match) {
        return false;
      }

      var propertyName = qx.Bootstrap.firstLow(match[2]);
      var isPropertyMethod = qx.Bootstrap.getPropertyDefinition(clazz, propertyName);
      if (!isPropertyMethod) {
        return false;
      }

      var isBoolean = match[0] == "is" || match[0] == "toggle";
      if (isBoolean) {
        return qx.Bootstrap.getPropertyDefinition(clazz, propertyName).check == "Boolean";
      }

      return true;
    },


    /**
     * Assert properties
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     */
    __assertProperties : function(clazz, iface)
    {
      if (iface.$$properties)
      {
        for (var key in iface.$$properties)
        {
          if (!qx.Bootstrap.getPropertyDefinition(clazz, key)) {
            throw new Error(
              'The property "' + key + '" is not supported by Class "' +
              clazz.classname + '"!'
            );
          }
        }
      }
    },


    /**
     * Assert events
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     */
    __assertEvents : function(clazz, iface)
    {
      if (iface.$$events)
      {
        for (var key in iface.$$events)
        {
          if (!qx.Bootstrap.supportsEvent(clazz, key)) {
            throw new Error(
              'The event "' + key + '" is not supported by Class "' +
              clazz.classname + '"!'
            );
          }
        }
      }
    },


    /**
     * Asserts that the given object implements all the methods defined in the
     * interface. This method throws an exception if the object does not
     * implement the interface.
     *
     *  @param object {qx.core.Object} Object to check interface for
     *  @param iface {Interface} The interface to verify
     */
    assertObject : function(object, iface)
    {
      var clazz = object.constructor;
      this.__assertMembers(object, clazz, iface, false);
      this.__assertProperties(clazz, iface);
      this.__assertEvents(clazz, iface);

      // Validate extends, recursive
      var extend = iface.$$extends;
      if (extend)
      {
        for (var i=0, l=extend.length; i<l; i++) {
          this.assertObject(object, extend[i]);
        }
      }
    },


    /**
     * Checks if an interface is implemented by a class
     *
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the interface to verify
     * @param wrap {Boolean ? false} wrap functions required by interface to
     *     check parameters etc.
     */
    assert : function(clazz, iface, wrap)
    {
      this.__assertMembers(clazz.prototype, clazz, iface, wrap);
      this.__assertProperties(clazz, iface);
      this.__assertEvents(clazz, iface);

      // Validate extends, recursive
      var extend = iface.$$extends;
      if (extend)
      {
        for (var i=0, l=extend.length; i<l; i++) {
          this.assert(clazz, extend[i], wrap);
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all interface to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The interface identifier
     */
    genericToString : function() {
      return "[Interface " + this.name + "]";
    },


    /** Registry of all defined interfaces */
    $$registry : {},


    /**
     * Wrap a method with a precondition check.
     *
     * @signature function(iface, origFunction, functionName, preCondition)
     * @param iface {String} Name of the interface, where the pre condition
     *   was defined. (Used in error messages).
     * @param origFunction {Function} function to wrap.
     * @param functionName {String} name of the function. (Used in error messages).
     * @param preCondition {Function}. This function gets called with the arguments of the
     *   original function. If this function return true the original function is called.
     *   Otherwise an exception is thrown.
     * @return {Function} wrapped function
     */
    __wrapInterfaceMember : qx.core.Environment.select("qx.debug",
    {
      "true": function(iface, origFunction, functionName, preCondition)
      {
        function wrappedFunction()
        {
          // call precondition
          preCondition.apply(this, arguments);

          // call original function
          return origFunction.apply(this, arguments);
        }

        origFunction.wrapper = wrappedFunction;
        return wrappedFunction;
      },

      "default" : function() {}
    }),


    /** {Map} allowed keys in interface definition */
    __allowedKeys : qx.core.Environment.select("qx.debug",
    {
      "true":
      {
        "extend"     : "object", // Interface | Interface[]
        "statics"    : "object", // Map
        "members"    : "object", // Map
        "properties" : "object", // Map
        "events"     : "object"  // Map
      },

      "default" : null
    }),


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : qx.core.Environment.select("qx.debug",
    {
      "true": function(name, config)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          // Validate keys
          var allowed = this.__allowedKeys;

          for (var key in config)
          {
            if (allowed[key] === undefined) {
              throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
            }

            if (config[key] == null) {
              throw new Error("Invalid key '" + key + "' in interface '" + name + "'! The value is undefined/null!");
            }

            if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
              throw new Error('Invalid type of key "' + key + '" in interface "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
            }
          }

          // Validate maps
          var maps = [ "statics", "members", "properties", "events" ];
          for (var i=0, l=maps.length; i<l; i++)
          {
            var key = maps[i];

            if (config[key] !== undefined && 
                ([
                   "Array", 
                   "RegExp", 
                   "Date"
                 ].indexOf(qx.Bootstrap.getClass(config[key])) != -1 ||
                 config[key].classname !== undefined)) {
              throw new Error('Invalid key "' + key + '" in interface "' + name + '"! The value needs to be a map!');
            }
          }

          // Validate extends
          if (config.extend)
          {
            for (var i=0, a=config.extend, l=a.length; i<l; i++)
            {
              if (a[i] == null) {
                throw new Error("Extends of interfaces must be interfaces. The extend number '" + i+1 + "' in interface '" + name + "' is undefined/null!");
              }

              if (a[i].$$type !== "Interface") {
                throw new Error("Extends of interfaces must be interfaces. The extend number '" + i+1 + "' in interface '" + name + "' is not an interface!");
              }
            }
          }

          // Validate statics
          if (config.statics)
          {
            for (var key in config.statics)
            {
              if (key.toUpperCase() !== key) {
                throw new Error('Invalid key "' + key + '" in interface "' + name + '"! Static constants must be all uppercase.');
              }

              switch(typeof config.statics[key])
              {
                case "boolean":
                case "string":
                case "number":
                  break;

                default:
                  throw new Error('Invalid key "' + key + '" in interface "' + name + '"! Static constants must be all of a primitive type.')
              }
            }
          }
        }
      },

      "default" : function() {}
    })
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The intention of this class is to add features to native JavaScript
 * objects so that all browsers operate on a common JavaScript language level
 * (particularly JavaScript 1.6).
 *
 * The methods defined in this class contain implementations of methods, which
 * are not supported by all browsers. If a method is supported it points to
 * the native implementation, otherwise it contains an emulation function.
 *
 * For reference:
 *
 * * http://www.ecma-international.org/publications/standards/Ecma-262.htm
 * * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference
 * * http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6
 *
 * The following methods are added if they are not supported natively:
 *
 * * Error.toString()
 * * Array.indexOf()
 * * Array.lastIndexOf()
 * * Array.forEach()
 * * Array.filter()
 * * Array.map()
 * * Array.some()
 * * Array.every()
 * * String.quote()
 */
qx.Bootstrap.define("qx.lang.Core",
{
  statics :
  {
    /**
     * Some browsers (e.g. Internet Explorer) do not support to stringify
     * error objects like other browsers usually do. This feature is added to
     * those browsers.
     *
     * @signature function()
     * @return {String} Error message
     */
    errorToString :
      {
        "native" : Error.prototype.toString,

        "emulated" : function() {
          return this.message;
        }
      }
    [(!Error.prototype.toString || Error.prototype.toString() == "[object Error]") ? "emulated" : "native"],


    /**
     * Returns the first index at which a given element can be found in the array,
     * or <code>-1</code> if it is not present. It compares <code>searchElement</code> to elements of the Array
     * using strict equality (the same method used by the <code>===</code>, or
     * triple-equals, operator).
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
     *
     * @signature function(searchElement, fromIndex)
     * @param searchElement {var} Element to locate in the array.
     * @param fromIndex {Integer} The index at which to begin the search. Defaults to 0, i.e. the whole
     *         array will be searched. If the index is greater than or equal to the length of the array,
     *         <code>-1</code> is returned, i.e. the array will not be searched. If negative, it is taken as the
     *         offset from the end of the array. Note that even when the index is negative, the array is still
     *         searched from front to back. If the calculated index is less than 0, the whole array will be searched.
     * @return {Integer} Returns the first index at which a given element can
     *    be found in the array, or <code>-1</code> if it is not present.
     */
    arrayIndexOf :
    {
      "native" : Array.prototype.indexOf,

      "emulated" : function(searchElement, fromIndex)
      {
        if (fromIndex == null) {
          fromIndex = 0;
        } else if (fromIndex < 0) {
          fromIndex = Math.max(0, this.length + fromIndex);
        }

        for (var i=fromIndex; i<this.length; i++)
        {
          if (this[i] === searchElement) {
            return i;
          }
        }

        return -1;
      }
    }[Array.prototype.indexOf ? "native" : "emulated"],


    /**
     * Returns the last index at which a given element can be found in the array, or <code>-1</code>
     * if it is not present. The array is searched backwards, starting at <code>fromIndex</code>.
     * It compares <code>searchElement</code> to elements of the Array using strict equality
     * (the same method used by the <code>===</code>, or triple-equals, operator).
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
     *
     * @signature function(searchElement, fromIndex)
     * @param searchElement {var} Element to locate in the array.
     * @param fromIndex {Integer} The index at which to start searching backwards.
     *         Defaults to the array's length, i.e. the whole array will be searched. If
     *         the index is greater than or equal to the length of the array, the whole array
     *         will be searched. If negative, it is taken as the offset from the end of the
     *         array. Note that even when the index is negative, the array is still searched
     *         from back to front. If the calculated index is less than 0, -1 is returned,
     *         i.e. the array will not be searched.
     * @return {Integer} Returns the last index at which a given element can be
     *    found in the array, or <code>-1</code> if it is not present.
     */
    arrayLastIndexOf :
    {
      "native" : Array.prototype.lastIndexOf,

      "emulated" : function(searchElement, fromIndex)
      {
        if (fromIndex == null) {
          fromIndex = this.length - 1;
        } else if (fromIndex < 0) {
          fromIndex = Math.max(0, this.length + fromIndex);
        }

        for (var i=fromIndex; i>=0; i--)
        {
          if (this[i] === searchElement) {
            return i;
          }
        }

        return -1;
      }
    }[Array.prototype.lastIndexOf ? "native" : "emulated"],


    /**
     * Executes a provided function once per array element.
     *
     * <code>forEach</code> executes the provided function (<code>callback</code>) once for each
     * element present in the array.  <code>callback</code> is invoked only for indexes of the array
     * which have assigned values; it is not invoked for indexes which have been deleted or which
     * have never been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index
     * of the element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>forEach</code>, it will be used
     * as the <code>this</code> for each invocation of the <code>callback</code>.  If it is not
     * provided, or is <code>null</code>, the global object associated with <code>callback</code>
     * is used instead.
     *
     * <code>forEach</code> does not mutate the array on which it is called.
     *
     * The range of elements processed by <code>forEach</code> is set before the first invocation of
     * <code>callback</code>.  Elements which are appended to the array after the call to
     * <code>forEach</code> begins will not be visited by <code>callback</code>. If existing elements
     * of the array are changed, or deleted, their value as passed to <code>callback</code> will be
     * the value at the time <code>forEach</code> visits them; elements that are deleted are not visited.
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to execute for each element.
     * @param obj {Object} Object to use as this when executing callback.
     * @return {void}
     */
    arrayForEach :
    {
      "native" : Array.prototype.forEach,

      "emulated" : function(callback, obj)
      {
        var l = this.length;
        for (var i=0; i<l; i++)
        {
          var value = this[i];
          if (value !== undefined)  {
            callback.call(obj || window, value, i, this);
          }
        }
      }
    }[Array.prototype.forEach ? "native" : "emulated"],


    /**
     * Creates a new array with all elements that pass the test implemented by the provided
     * function.
     *
     * <code>filter</code> calls a provided <code>callback</code> function once for each
     * element in an array, and constructs a new array of all the values for which
     * <code>callback</code> returns a true value.  <code>callback</code> is invoked only
     * for indexes of the array which have assigned values; it is not invoked for indexes
     * which have been deleted or which have never been assigned values.  Array elements which
     * do not pass the <code>callback</code> test are simply skipped, and are not included
     * in the new array.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the
     * index of the element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>filter</code>, it will
     * be used as the <code>this</code> for each invocation of the <code>callback</code>.
     * If it is not provided, or is <code>null</code>, the global object associated with
     * <code>callback</code> is used instead.
     *
     * <code>filter</code> does not mutate the array on which it is called. The range of
     * elements processed by <code>filter</code> is set before the first invocation of
     * <code>callback</code>. Elements which are appended to the array after the call to
     * <code>filter</code> begins will not be visited by <code>callback</code>. If existing
     * elements of the array are changed, or deleted, their value as passed to <code>callback</code>
     * will be the value at the time <code>filter</code> visits them; elements that are deleted
     * are not visited.
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:filter
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to test each element of the array.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {Array} Returns a new array with all elements that pass the test
     *    implemented by the provided function.
     */
    arrayFilter :
    {
      "native" : Array.prototype.filter,

      "emulated" : function(callback, obj)
      {
        var res = [];

        var l = this.length;
        for (var i=0; i<l; i++)
        {
          var value = this[i];
          if (value !== undefined)
          {
            if (callback.call(obj || window, value, i, this)) {
              res.push(this[i]);
            }
          }
        }

        return res;
      }
    }[Array.prototype.filter ? "native" : "emulated"],


    /**
     * Creates a new array with the results of calling a provided function on every element in this array.
     *
     * <code>map</code> calls a provided <code>callback</code> function once for each element in an array,
     * in order, and constructs a new array from the results.  <code>callback</code> is invoked only for
     * indexes of the array which have assigned values; it is not invoked for indexes which have been
     * deleted or which have never been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index of the
     * element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>map</code>, it will be used as the
     * <code>this</code> for each invocation of the <code>callback</code>. If it is not provided, or is
     * <code>null</code>, the global object associated with <code>callback</code> is used instead.
     *
     * <code>map</code> does not mutate the array on which it is called.
     *
     * The range of elements processed by <code>map</code> is set before the first invocation of
     * <code>callback</code>. Elements which are appended to the array after the call to <code>map</code>
     * begins will not be visited by <code>callback</code>.  If existing elements of the array are changed,
     * or deleted, their value as passed to <code>callback</code> will be the value at the time
     * <code>map</code> visits them; elements that are deleted are not visited.
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:map
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function produce an element of the new Array from an element of the current one.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {Array} Returns a new array with the results of calling a provided
     *    function on every element in this array.
     */
    arrayMap :
    {
      "native" : Array.prototype.map,

      "emulated" : function(callback, obj)
      {
        var res = [];

        var l = this.length;
        for (var i=0; i<l; i++)
        {
          var value = this[i];
          if (value !== undefined) {
            res[i] = callback.call(obj || window, value, i, this);
          }
        }

        return res;
      }
    }[Array.prototype.map ? "native" : "emulated"],


    /**
     * Tests whether some element in the array passes the test implemented by the provided function.
     *
     * <code>some</code> executes the <code>callback</code> function once for each element present in
     * the array until it finds one where <code>callback</code> returns a true value. If such an element
     * is found, <code>some</code> immediately returns <code>true</code>. Otherwise, <code>some</code>
     * returns <code>false</code>. <code>callback</code> is invoked only for indexes of the array which
     * have assigned values; it is not invoked for indexes which have been deleted or which have never
     * been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index of the
     * element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>some</code>, it will be used as the
     * <code>this</code> for each invocation of the <code>callback</code>. If it is not provided, or is
     * <code>null</code>, the global object associated with <code>callback</code> is used instead.
     *
     * <code>some</code> does not mutate the array on which it is called.
     *
     * The range of elements processed by <code>some</code> is set before the first invocation of
     * <code>callback</code>.  Elements that are appended to the array after the call to <code>some</code>
     * begins will not be visited by <code>callback</code>. If an existing, unvisited element of the array
     * is changed by <code>callback</code>, its value passed to the visiting <code>callback</code> will
     * be the value at the time that <code>some</code> visits that element's index; elements that are
     * deleted are not visited.
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:some
     *
     * @param callback {Function} Function to test for each element.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {Boolean} Returns <code>true</code> whether some element in the
     *    array passes the test implemented by the provided function,
     *    <code>false</code> otherwise.
     */
    arraySome :
    {
      "native" : Array.prototype.some,

      "emulated" : function(callback, obj)
      {
        var l = this.length;
        for (var i=0; i<l; i++)
        {
          var value = this[i];
          if (value !== undefined)
          {
            if (callback.call(obj || window, value, i, this)) {
              return true;
            }
          }
        }

        return false;
      }
    }[Array.prototype.some ? "native" : "emulated"],


    /**
     * Tests whether all elements in the array pass the test implemented by the provided function.
     *
     * <code>every</code> executes the provided <code>callback</code> function once for each element
     * present in the array until it finds one where <code>callback</code> returns a false value. If
     * such an element is found, the <code>every</code> method immediately returns <code>false</code>.
     * Otherwise, if <code>callback</code> returned a true value for all elements, <code>every</code>
     * will return <code>true</code>.  <code>callback</code> is invoked only for indexes of the array
     * which have assigned values; it is not invoked for indexes which have been deleted or which have
     * never been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index of
     * the element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>every</code>, it will be used as
     * the <code>this</code> for each invocation of the <code>callback</code>. If it is not provided,
     * or is <code>null</code>, the global object associated with <code>callback</code> is used instead.
     *
     * <code>every</code> does not mutate the array on which it is called. The range of elements processed
     * by <code>every</code> is set before the first invocation of <code>callback</code>. Elements which
     * are appended to the array after the call to <code>every</code> begins will not be visited by
     * <code>callback</code>.  If existing elements of the array are changed, their value as passed
     * to <code>callback</code> will be the value at the time <code>every</code> visits them; elements
     * that are deleted are not visited.
     *
     * Natively supported in Gecko since version 1.8.
     * http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:every
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to test for each element.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {Boolean} Returns <code>false</code> whether all elements in the
     *    array pass the test implemented by the provided function,
     *    <code>false</code> otherwise.
     */
    arrayEvery :
    {
      "native" : Array.prototype.every,

      "emulated" : function(callback, obj)
      {
        var l = this.length;
        for (var i=0; i<l; i++)
        {
          var value = this[i];
          if (value !== undefined)
          {
            if (!callback.call(obj || window, value, i, this)) {
              return false;
            }
          }
        }

        return true;
      }
    }[Array.prototype.every ? "native" :"emulated"],


    /**
     * Surrounds the string with double quotes and escapes all double quotes
     * and backslashes within the string.
     *
     * Note: Not part of ECMAScript Language Specification ECMA-262
     *       3rd edition (December 1999), but implemented by Gecko:
     *       http://lxr.mozilla.org/seamonkey/source/js/src/jsstr.c
     *
     * @signature function()
     * @return {String} Returns a string with double quotes and escapes all
     *    double quotes and backslashes within the string.
     */
    stringQuote :
    {
      "native" : String.prototype.quote,

      "emulated" : function() {
        return '"' + this.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + '"';
      }
    }[String.prototype.quote ? "native" : "emulated"]
  }
});

/*
---------------------------------------------------------------------------
  FEATURE EXTENSION OF NATIVE ERROR OBJECT
---------------------------------------------------------------------------
*/

Error.prototype.toString = qx.lang.Core.errorToString;


/*
---------------------------------------------------------------------------
  FEATURE EXTENSION OF NATIVE ARRAY OBJECT
---------------------------------------------------------------------------
*/

Array.prototype.indexOf = qx.lang.Core.arrayIndexOf;
Array.prototype.lastIndexOf = qx.lang.Core.arrayLastIndexOf;
Array.prototype.forEach = qx.lang.Core.arrayForEach;
Array.prototype.filter = qx.lang.Core.arrayFilter;
Array.prototype.map = qx.lang.Core.arrayMap;
Array.prototype.some = qx.lang.Core.arraySome;
Array.prototype.every = qx.lang.Core.arrayEvery;


/*
---------------------------------------------------------------------------
  FEATURE EXTENSION OF NATIVE STRING OBJECT
---------------------------------------------------------------------------
*/

String.prototype.quote = qx.lang.Core.stringQuote;
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#optional(qx.Interface)
#use(qx.event.type.Data)
#use(qx.event.dispatch.Direct)

************************************************************************ */

/**
 * Internal class for handling of dynamic properties. Should only be used
 * through the methods provided by {@link qx.Class}.
 *
 * For a complete documentation of properties take a look at
 * http://manual.qooxdoo.org/1.4/pages/core.html#properties.
 *
 *
 * *Normal properties*
 *
 * The <code>properties</code> key in the class definition map of {@link qx.Class#define}
 * is used to generate the properties.
 *
 * Valid keys of a property definition are:
 *
 * <table>
 *   <tr><th>Name</th><th>Type</th><th>Description</th></tr>
 *   <tr><th>check</th><td>Array, String, Function</td><td>
 *     The check is used to check the type the incoming value of a property. This will only
 *     be executed in the source version. The build version will not contain the checks.
 *     The check can be:
 *     <ul>
 *       <li>a custom check function. The function takes the incoming value as a parameter and must
 *           return a boolean value to indicate whether the values is valid.
 *       </li>
 *       <li>inline check code as a string e.g. <code>"value &gt; 0 && value &lt; 100"</code></li>
 *       <li>a class name e.g. <code>qx.ui.form.Button</code></li>
 *       <li>a name of an interface the value must implement</li>
 *       <li>an array of all valid values</li>
 *       <li>one of the predefined checks: Boolean, String, Number, Integer, Float, Double,
 *           Object, Array, Map, Class, Mixin, Interface, Theme, Error, RegExp, Function,
 *           Date, Node, Element, Document, Window, Event
 *       </li>
 *     <ul>
 *   </td></tr>
 *   <tr><th>init</th><td>var</td><td>
 *     Sets the default/initial value of the property. If no property value is set or the property
 *     gets reset, the getter will return the <code>init</code> value.
 *   </td></tr>
 *   <tr><th>apply</th><td>String</td><td>
 *     On change of the property value the method of the specified name will be called. The signature of
 *     the method is <code>function(newValue, oldValue, propertyName)</code>. It is conventional to name
 *     the callback <code>_apply</code> + <i>PropertyName</i>, with the property name camel-cased (e.g.
 *     "<i>_applyFooBar</i>" for a property <i>fooBar</i>).
 *   </td></tr>
 *   <tr><th>event</th><td>String</td><td>
 *     On change of the property value an event with the given name will be dispatched. The event type is
 *     {@link qx.event.type.Data}.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 *   <tr><th>inheritable</th><td>Boolean</td><td>
 *     Whether the property value should be inheritable. If the property does not have an user defined or an
 *     init value, the property will try to get the value from the parent of the current object.
 *   </td></tr>
 *   <tr><th>nullable</th><td>Boolean</td><td>
 *     Whether <code>null</code> is an allowed value of the property. This is complementary to the check
 *     defined using the <code>check</code> key.
 *   </td></tr>
 *   <tr><th>refine</th><td>Boolean</td><td>
 *     Whether the property definition is a refinement of a property in one of the super classes of the class.
 *     Only the <code>init</code> value can be changed using refine.
 *   </td></tr>
 *   <tr><th>transform</th><td>String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value)</code>.
 *     The parameter <code>value</code> is the value passed to the setter.
 *     The function must return the modified or unmodified value.
 *     Transformation occurs before the check function, so both may be
 *     specified if desired.  Alternatively, the transform function may throw
 *     an error if the value passed to it is invalid.
 *   </td></tr>
 *   <tr><th>validate</th><td>Function, String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value)</code>.
 *     The parameter <code>value</code> is the value passed to the setter.
 *     If the validation fails, an <code>qx.core.ValidationError</code> should
 *     be thrown by the validation function. Otherwise, just do nothing in the
 *     function.<br>
 *     If a string is given, the string should hold a reference to a member
 *     method.<br>
 *     <code>"<i>methodname</i>"</code> for example
 *     <code>"this.__validateProperty"</code><br>
 *     There are some default validators in the {@link qx.util.Validate} class.
 *     See this documentation for usage examples.
 *   </td></tr>
 *   <tr><th>dereference</th><td>Boolean</td><td>
 *     By default, the references to the values (current, init, ...) of the
 *     property will be stored as references on the object. When disposing
 *     this object, the references will not be deleted. Setting the
 *     dereference key to true tells the property system to delete all
 *     connections made by this property on dispose. This can be necessary for
 *     disconnecting DOM objects to allow the garbage collector to work
 *     properly.
 *   </td></tr>
 * </table>
 *
 * *Property groups*
 *
 * Property groups are defined in a similar way but support a different set of keys:
 *
 * <table>
 *   <tr><th>Name</th><th>Type</th><th>Description</th></tr>
 *   <tr><th>group</th><td>String[]</td><td>
 *     A list of property names which should be set using the property group.
 *   </td></tr>
 *   <tr><th>mode</th><td>String</td><td>
 *     If mode is set to <code>"shorthand"</code>, the properties can be set using a CSS like shorthand mode.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 * </table>
 *
 * @internal
 */
qx.Bootstrap.define("qx.core.Property",
{
  statics :
  {
    /**
     * Built-in checks
     * The keys could be used in the check of the properties
     */
    __checks :
    {
      "Boolean"   : 'qx.core.Assert.assertBoolean(value, msg) || true',
      "String"    : 'qx.core.Assert.assertString(value, msg) || true',

      "Number"    : 'qx.core.Assert.assertNumber(value, msg) || true',
      "Integer"   : 'qx.core.Assert.assertInteger(value, msg) || true',
      "PositiveNumber" : 'qx.core.Assert.assertPositiveNumber(value, msg) || true',
      "PositiveInteger" : 'qx.core.Assert.assertPositiveInteger(value, msg) || true',

      "Error"     : 'qx.core.Assert.assertInstance(value, Error, msg) || true',
      "RegExp"    : 'qx.core.Assert.assertInstance(value, RegExp, msg) || true',

      "Object"    : 'qx.core.Assert.assertObject(value, msg) || true',
      "Array"     : 'qx.core.Assert.assertArray(value, msg) || true',
      "Map"       : 'qx.core.Assert.assertMap(value, msg) || true',

      "Function"  : 'qx.core.Assert.assertFunction(value, msg) || true',
      "Date"      : 'qx.core.Assert.assertInstance(value, Date, msg) || true',
      "Node"      : 'value !== null && value.nodeType !== undefined',
      "Element"   : 'value !== null && value.nodeType === 1 && value.attributes',
      "Document"  : 'value !== null && value.nodeType === 9 && value.documentElement',
      "Window"    : 'value !== null && value.document',
      "Event"     : 'value !== null && value.type !== undefined',

      "Class"     : 'value !== null && value.$$type === "Class"',
      "Mixin"     : 'value !== null && value.$$type === "Mixin"',
      "Interface" : 'value !== null && value.$$type === "Interface"',
      "Theme"     : 'value !== null && value.$$type === "Theme"',

      "Color"     : 'qx.lang.Type.isString(value) && qx.util.ColorUtil.isValidPropertyValue(value)',
      "Decorator" : 'value !== null && qx.theme.manager.Decoration.getInstance().isValidPropertyValue(value)',
      "Font"      : 'value !== null && qx.theme.manager.Font.getInstance().isDynamic(value)'
    },


    /**
     * Contains types from {@link #__checks} list which need to be dereferenced
     */
    __dereference :
    {
      "Node"      : true,
      "Element"   : true,
      "Document"  : true,
      "Window"    : true,
      "Event"     : true
    },


    /**
     * Inherit value, used to override defaults etc. to force inheritance
     * even if property value is not undefined (through multi-values)
     *
     * @internal
     */
    $$inherit : "inherit",


    /**
     * Caching field names for each property created
     *
     * @internal
     */
    $$store :
    {
      runtime : {},
      user    : {},
      theme   : {},
      inherit : {},
      init    : {},
      useinit : {}
    },


    /**
     * Caching function names for each property created
     *
     * @internal
     */
    $$method :
    {
      get          : {},
      set          : {},
      reset        : {},
      init         : {},
      refresh      : {},
      setRuntime   : {},
      resetRuntime : {},
      setThemed    : {},
      resetThemed  : {}
    },


    /**
     * Supported keys for property defintions
     *
     * @internal
     */
    $$allowedKeys :
    {
      name         : "string",   // String
      dereference  : "boolean",  // Boolean
      inheritable  : "boolean",  // Boolean
      nullable     : "boolean",  // Boolean
      themeable    : "boolean",  // Boolean
      refine       : "boolean",  // Boolean
      init         : null,       // var
      apply        : "string",   // String
      event        : "string",   // String
      check        : null,       // Array, String, Function
      transform    : "string",   // String
      deferredInit : "boolean",  // Boolean
      validate     : null        // String, Function
    },


    /**
     * Supported keys for property group definitions
     *
     * @internal
     */
    $$allowedGroupKeys :
    {
      name      : "string",   // String
      group     : "object",   // Array
      mode      : "string",   // String
      themeable : "boolean"   // Boolean
    },


    /** Contains names of inheritable properties, filled by {@link qx.Class.define} */
    $$inheritable : {},


    /**
     * Generate optimized refresh method and  attach it to the class' prototype
     *
     * @param clazz {Clazz} clazz to which the refresher should be added
     */
    __executeOptimizedRefresh : function(clazz)
    {
      var inheritables = this.__getInheritablesOfClass(clazz);

      if (!inheritables.length) {
        var refresher = function () {};
      } else {
        refresher = this.__createRefresher(inheritables);
      }

      clazz.prototype.$$refreshInheritables = refresher;
    },


    /**
     * Get the names of all inheritable properties of the given class
     *
     * @param clazz {Clazz} class to get the inheritable properties of
     * @return {String[]} List of property names
     */
    __getInheritablesOfClass : function(clazz)
    {
      var inheritable = [];

      while(clazz)
      {
        var properties = clazz.$$properties;

        if (properties)
        {
          for (var name in this.$$inheritable)
          {
            // Whether the property is available in this class
            // and whether it is inheritable in this class as well
            if (properties[name] && properties[name].inheritable)
            {
              inheritable.push(name);
            }
          }
        }

        clazz = clazz.superclass;
      }

      return inheritable;
    },


    /**
     * Assemble the refresher code and return the generated function
     *
     * @param inheritables {String[]} list of inheritable properties
     */
    __createRefresher : function(inheritables)
    {
      var inherit = this.$$store.inherit;
      var init = this.$$store.init;
      var refresh = this.$$method.refresh;

      var code = [
        "var parent = this.getLayoutParent();",
        "if (!parent) return;"
      ];

      for (var i=0, l=inheritables.length; i<l; i++)
      {
        var name = inheritables[i];
        code.push(
          "var value = parent.", inherit[name],";",
          "if (value===undefined) value = parent.", init[name], ";",
          "this.", refresh[name], "(value);"
        );
      }

      return new Function(code.join(""));
    },


    /**
     * Attach $$refreshInheritables method stub to the given class
     *
     * @param clazz {Clazz} clazz to which the refresher should be added
     */
    attachRefreshInheritables : function(clazz)
    {
      clazz.prototype.$$refreshInheritables = function()
      {
        qx.core.Property.__executeOptimizedRefresh(clazz);
        return this.$$refreshInheritables();
      }
    },


    /**
     * Attach one property to class
     *
     * @param clazz {Class} Class to attach properties to
     * @param name {String} Name of property
     * @param config {Map} Configuration map of property
     * @return {void}
     */
    attachMethods : function(clazz, name, config)
    {
      // Divide groups from "normal" properties
      config.group ?
        this.__attachGroupMethods(clazz, config, name) :
        this.__attachPropertyMethods(clazz, config, name);
    },


    /**
     * Attach group methods
     *
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @param name {String} Name of the property
     * @return {void}
     */
    __attachGroupMethods : function(clazz, config, name)
    {
      var upname = qx.Bootstrap.firstUp(name);
      var members = clazz.prototype;
      var themeable = config.themeable === true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.propertyDebugLevel") > 1) {
          qx.Bootstrap.debug("Generating property group: " + name);
        }
      }

      var setter = [];
      var resetter = [];

      if (themeable)
      {
        var styler = [];
        var unstyler = [];
      }

      var argHandler = "var a=arguments[0] instanceof Array?arguments[0]:arguments;";

      setter.push(argHandler);

      if (themeable) {
        styler.push(argHandler);
      }

      if (config.mode == "shorthand")
      {
        var shorthand = "a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));";
        setter.push(shorthand);

        if (themeable) {
          styler.push(shorthand);
        }
      }

      for (var i=0, a=config.group, l=a.length; i<l; i++)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (!this.$$method.set[a[i]]||!this.$$method.reset[a[i]]) {
            throw new Error("Cannot create property group '" + name + "' including non-existing property '" + a[i] + "'!");
          }
        }

        setter.push("this.", this.$$method.set[a[i]], "(a[", i, "]);");
        resetter.push("this.", this.$$method.reset[a[i]], "();");

        if (themeable)
        {
          if (qx.core.Environment.get("qx.debug"))
          {
            if (!this.$$method.setThemed[a[i]]) {
              throw new Error("Cannot add the non themable property '" + a[i] + "' to the themable property group '"+ name +"'");
            }
          }

          styler.push("this.", this.$$method.setThemed[a[i]], "(a[", i, "]);");
          unstyler.push("this.", this.$$method.resetThemed[a[i]], "();");
        }
      }

      // Attach setter
      this.$$method.set[name] = "set" + upname;
      members[this.$$method.set[name]] = new Function(setter.join(""));

      // Attach resetter
      this.$$method.reset[name] = "reset" + upname;
      members[this.$$method.reset[name]] = new Function(resetter.join(""));

      if (themeable)
      {
        // Attach styler
        this.$$method.setThemed[name] = "setThemed" + upname;
        members[this.$$method.setThemed[name]] = new Function(styler.join(""));

        // Attach unstyler
        this.$$method.resetThemed[name] = "resetThemed" + upname;
        members[this.$$method.resetThemed[name]] = new Function(unstyler.join(""));
      }
    },


    /**
     * Attach property methods
     *
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @param name {String} Name of the property
     * @return {void}
     */
    __attachPropertyMethods : function(clazz, config, name)
    {
      var upname = qx.Bootstrap.firstUp(name);
      var members = clazz.prototype;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.propertyDebugLevel") > 1) {
          qx.Bootstrap.debug("Generating property wrappers: " + name);
        }
      }

      // Fill dispose value
      if (config.dereference === undefined && typeof config.check === "string") {
        config.dereference = this.__shouldBeDereferenced(config.check);
      }

      var method = this.$$method;
      var store = this.$$store;

      store.runtime[name] = "$$runtime_" + name;
      store.user[name] = "$$user_" + name;
      store.theme[name] = "$$theme_" + name;
      store.init[name] = "$$init_" + name;
      store.inherit[name] = "$$inherit_" + name;
      store.useinit[name] = "$$useinit_" + name;

      method.get[name] = "get" + upname;
      members[method.get[name]] = function() {
        return qx.core.Property.executeOptimizedGetter(this, clazz, name, "get");
      }

      method.set[name] = "set" + upname;
      members[method.set[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", arguments);
      }

      method.reset[name] = "reset" + upname;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      }

      if (config.inheritable || config.apply || config.event || config.deferredInit)
      {
        method.init[name] = "init" + upname;
        members[method.init[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init", arguments);
        }
      }

      if (config.inheritable)
      {
        method.refresh[name] = "refresh" + upname;
        members[method.refresh[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", arguments);
        }
      }

      method.setRuntime[name] = "setRuntime" + upname;
      members[method.setRuntime[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setRuntime", arguments);
      }

      method.resetRuntime[name] = "resetRuntime" + upname;
      members[method.resetRuntime[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetRuntime");
      }

      if (config.themeable)
      {
        method.setThemed[name] = "setThemed" + upname;
        members[method.setThemed[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setThemed", arguments);
        }

        method.resetThemed[name] = "resetThemed" + upname;
        members[method.resetThemed[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetThemed");
        }
      }

      if (config.check === "Boolean")
      {
        members["toggle" + upname] = new Function("return this." + method.set[name] + "(!this." + method.get[name] + "())");
        members["is" + upname] = new Function("return this." + method.get[name] + "()");
      }
    },


    /**
     * Returns if the reference for the given property check should be removed
     * on dispose.
     *
     * @param check {var} The check of the property definition.
     * @return {Boolean} If the dereference key should be set.
     */
    __shouldBeDereferenced :  function(check) {
      return !!this.__dereference[check];
    },


    /**
     * Special function for IE6 and FF2 which returns if the reference for
     * the given property check should be removed on dispose.
     * As IE6 and FF2 seem to have bad garbage collection behaviors, we should
     * additionally remove all references between qooxdoo objects and
     * interfaces.
     *
     * @param check {var} The check of the property definition.
     * @return {Boolean} If the dereference key should be set.
     */
    __shouldBeDereferencedOld : function(check)
    {
      return this.__dereference[check] ||
      qx.Bootstrap.classIsDefined(check) ||
      (qx.Interface && qx.Interface.isDefined(check));
    },


    /** {Map} Internal data field for error messages used by {@link #error} */
    __errors :
    {
      0 : 'Could not change or apply init value after constructing phase!',
      1 : 'Requires exactly one argument!',
      2 : 'Undefined value is not allowed!',
      3 : 'Does not allow any arguments!',
      4 : 'Null value is not allowed!',
      5 : 'Is invalid!'
    },


    /**
     * Error method used by the property system to report errors.
     *
     * @param obj {qx.core.Object} Any qooxdoo object
     * @param id {Integer} Numeric error identifier
     * @param property {String} Name of the property
     * @param variant {String} Name of the method variant e.g. "set", "reset", ...
     * @param value {var} Incoming value
     */
    error : function(obj, id, property, variant, value)
    {
      var classname = obj.constructor.classname;
      var msg = "Error in property " + property + " of class " + classname +
        " in method " + this.$$method[variant][property] + " with incoming value '" + value + "': ";

      throw new Error(msg + (this.__errors[id] || "Unknown reason: " + id));
    },


    /**
     * Compiles a string builder object to a function, executes the function and
     * returns the return value.
     *
     * @param instance {Object} Instance which have called the original method
     * @param members {Object} Prototype members map where the new function should be stored
     * @param name {String} Name of the property
     * @param variant {String} Function variant e.g. get, set, reset, ...
     * @param code {Array} Array which contains the code
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Return value of the generated function
     */
    __unwrapFunctionFromCode : function(instance, members, name, variant, code, args)
    {
      var store = this.$$method[variant][name];

      // Output generate code
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.propertyDebugLevel") > 1) {
          qx.Bootstrap.debug("Code[" + this.$$method[variant][name] + "]: " + code.join(""));
        }

        // Overriding temporary wrapper
        try{
          members[store] =  new Function("value", code.join(""));
        } catch(ex) {
          throw new Error("Malformed generated code to unwrap method: " + this.$$method[variant][name] + "\n" + code.join(""));
        }
      }
      else
      {
        members[store] =  new Function("value", code.join(""));
      }

      // Enable profiling code
      if (qx.core.Environment.get("qx.aspects")) {
        members[store] = qx.core.Aspect.wrap(instance.classname + "." + store, members[store], "property");
      }

      qx.Bootstrap.setDisplayName(members[store], instance.classname + ".prototype", store)

      // Executing new function
      if (args === undefined) {
        return instance[store]();
      } else if (qx.core.Environment.get("qx.debug")) {
        return instance[store].apply(instance, args);
      } else {
        return instance[store](args[0]);
      }
    },


    /**
     * Generates the optimized getter
     * Supported variants: get
     *
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedGetter : function(instance, clazz, name, variant)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = [];
      var store = this.$$store;

      code.push('if(this.', store.runtime[name], '!==undefined)');
      code.push('return this.', store.runtime[name], ';');

      if (config.inheritable)
      {
        code.push('else if(this.', store.inherit[name], '!==undefined)');
        code.push('return this.', store.inherit[name], ';');
        code.push('else ');
      }

      code.push('if(this.', store.user[name], '!==undefined)');
      code.push('return this.', store.user[name], ';');

      if (config.themeable)
      {
        code.push('else if(this.', store.theme[name], '!==undefined)');
        code.push('return this.', store.theme[name], ';');
      }

      if (config.deferredInit && config.init === undefined)
      {
        code.push('else if(this.', store.init[name], '!==undefined)');
        code.push('return this.', store.init[name], ';');
      }

      code.push('else ');

      if (config.init !== undefined)
      {
        if (config.inheritable)
        {
          code.push('var init=this.', store.init[name], ';');

          if (config.nullable) {
            code.push('if(init==qx.core.Property.$$inherit)init=null;');
          } else if (config.init !== undefined) {
            code.push('return this.', store.init[name], ';');
          } else {
            code.push('if(init==qx.core.Property.$$inherit)throw new Error("Inheritable property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
          }

          code.push('return init;');
        }
        else
        {
          code.push('return this.', store.init[name], ';');
        }
      }
      else if (config.inheritable || config.nullable) {
        code.push('return null;');
      } else {
        code.push('throw new Error("Property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
      }

      return this.__unwrapFunctionFromCode(instance, members, name, variant, code);
    },


    /**
     * Generates the optimized setter
     * Supported variants: set, reset, init, refresh, style, unstyle
     *
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedSetter : function(instance, clazz, name, variant, args)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = [];

      var incomingValue = variant === "set" || variant === "setThemed" || variant === "setRuntime" || (variant === "init" && config.init === undefined);
      var hasCallback = config.apply || config.event || config.inheritable;


      var store = this.__getStore(variant, name);

      this.__emitSetterPreConditions(code, config, name, variant, incomingValue);

      if (incomingValue) {
        this.__emitIncomingValueTransformation(code, clazz, config, name);
      }

      if (hasCallback) {
        this.__emitOldNewComparison(code, incomingValue, store, variant);
      }

      if (config.inheritable) {
        code.push('var inherit=prop.$$inherit;');
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (incomingValue) {
          this.__emitIncomingValueValidation(code, config, clazz, name, variant);
        }
      }

      if (!hasCallback) {
        this.__emitStoreValue(code, name, variant, incomingValue);
      } else {
        this.__emitStoreComputedAndOldValue(code, config, name, variant, incomingValue);
      }

      if (config.inheritable) {
        this.__emitStoreInheritedPropertyValue(code, config, name, variant);
      } else if (hasCallback) {
        this.__emitNormalizeUndefinedValues(code, config, name, variant)
      }

      if (hasCallback)
      {
        this.__emitCallCallback(code, config, name);

        // Refresh children
        // Requires the parent/children interface
        if (config.inheritable && members._getChildren) {
          this.__emitRefreshChildrenValue(code, name);
        }
      }

      // Return value
      if (incomingValue) {
        code.push('return value;');
      }

      return this.__unwrapFunctionFromCode(instance, members, name, variant, code, args);
    },


    /**
     * Get the object to store the value for the given variant
     *
     * @param variant {String} Method variant.
     * @param name {String} name of the property
     *
     * @return {Object} the value store
     */
    __getStore : function(variant, name)
    {
      if (variant === "setRuntime" || variant === "resetRuntime") {
        var store = this.$$store.runtime[name];
      } else if (variant === "setThemed" || variant === "resetThemed") {
        store = this.$$store.theme[name];
      } else if (variant === "init") {
        store = this.$$store.init[name];
      } else {
        store = this.$$store.user[name];
      }

      return store;
    },


    /**
     * Emit code to check the arguments pre-conditions
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __emitSetterPreConditions : function(code, config, name, variant, incomingValue)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        code.push('var prop=qx.core.Property;');

        if (variant === "init") {
          code.push('if(this.$$initialized)prop.error(this,0,"', name, '","', variant, '",value);');
        }

        if (variant === "refresh")
        {
          // do nothing
          // refresh() is internal => no arguments test
          // also note that refresh() supports "undefined" values
        }
        else if (incomingValue)
        {
          // Check argument length
          code.push('if(arguments.length!==1)prop.error(this,1,"', name, '","', variant, '",value);');

          // Undefined check
          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        }
        else
        {
          // Check argument length
          code.push('if(arguments.length!==0)prop.error(this,3,"', name, '","', variant, '",value);');
        }
      }
      else
      {
        if (!config.nullable || config.check || config.inheritable) {
          code.push('var prop=qx.core.Property;');
        }

        // Undefined check
        if (variant === "set") {
          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        }
      }
    },


    /**
     * Emit code to apply the "validate" and "transform" config keys.
     *
     * @param code {String[]} String array to append the code to
     * @param clazz {Class} the class which originally defined the property
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     */
    __emitIncomingValueTransformation : function(code, clazz, config, name)
    {
      // Call user-provided transform method, if one is provided.  Transform
      // method should either throw an error or return the new value.
      if (config.transform) {
        code.push('value=this.', config.transform, '(value);');
      }

      // Call user-provided validate method, if one is provided.  Validate
      // method should either throw an error or do nothing.
      if (config.validate) {
        // if it is a string
        if (typeof config.validate === "string") {
          code.push('this.', config.validate, '(value);');
        // if its a function otherwise
        } else if (config.validate instanceof Function) {
          code.push(clazz.classname, '.$$properties.', name);
          code.push('.validate.call(this, value);');
        }
      }
    },


    /**
     * Emit code, which returns if the incoming value equals the current value.
     *
     * @param code {String[]} String array to append the code to
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     * @param store {Object} The data store to use for the incoming value
     * @param variant {String} Method variant.
     */
    __emitOldNewComparison : function(code, incomingValue, store, variant)
    {
      var resetValue = (
        variant === "reset" ||
        variant === "resetThemed" ||
        variant === "resetRuntime"
      );

      if (incomingValue) {
        code.push('if(this.', store, '===value)return value;');
      } else if (resetValue) {
        code.push('if(this.', store, '===undefined)return;');
      }
    },


    /**
     * Emit code, which performs validation of the incoming value according to
     * the "nullable", "check" and "inheritable" config keys.
     *
     * @signature function(code, config, clazz, name, variant)
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __emitIncomingValueValidation : qx.core.Environment.select("qx.debug",
    {
      "true" : function(code, config, clazz, name, variant)
      {
        // Null check
        if (!config.nullable) {
          code.push('if(value===null)prop.error(this,4,"', name, '","', variant, '",value);');
        }

        // Processing check definition
        if (config.check !== undefined)
        {
          code.push('var msg = "Invalid incoming value for property \''+name+'\' of class \'' + clazz.classname + '\'";');

          // Accept "null"
          if (config.nullable) {
            code.push('if(value!==null)');
          }

          // Inheritable properties always accept "inherit" as value
          if (config.inheritable) {
            code.push('if(value!==inherit)');
          }

          code.push('if(');

          if (this.__checks[config.check] !== undefined)
          {
            code.push('!(', this.__checks[config.check], ')');
          }
          else if (qx.Class.isDefined(config.check))
          {
            code.push('qx.core.Assert.assertInstance(value, qx.Class.getByName("', config.check, '"), msg)');
          }
          else if (qx.Interface && qx.Interface.isDefined(config.check))
          {
            code.push('qx.core.Assert.assertInterface(value, qx.Interface.getByName("', config.check, '"), msg)');
          }
          else if (typeof config.check === "function")
          {
            code.push('!', clazz.classname, '.$$properties.', name);
            code.push('.check.call(this, value)');
          }
          else if (typeof config.check === "string")
          {
            code.push('!(', config.check, ')');
          }
          else if (config.check instanceof Array)
          {
            code.push('qx.core.Assert.assertInArray(value, ', clazz.classname, '.$$properties.', name, '.check, msg)');
          }
          else
          {
            throw new Error("Could not add check to property " + name + " of class " + clazz.classname);
          }

          code.push(')prop.error(this,5,"', name, '","', variant, '",value);');
        }
      },

      "false" : undefined
    }),


    /**
     * Emit code to store the incoming value
     *
     * @param code {String[]} String array to append the code to
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __emitStoreValue : function(code, name, variant, incomingValue)
    {
      if (variant === "setRuntime")
      {
        code.push('this.', this.$$store.runtime[name], '=value;');
      }
      else if (variant === "resetRuntime")
      {
        code.push('if(this.', this.$$store.runtime[name], '!==undefined)');
        code.push('delete this.', this.$$store.runtime[name], ';');
      }
      else if (variant === "set")
      {
        code.push('this.', this.$$store.user[name], '=value;');
      }
      else if (variant === "reset")
      {
        code.push('if(this.', this.$$store.user[name], '!==undefined)');
        code.push('delete this.', this.$$store.user[name], ';');
      }
      else if (variant === "setThemed")
      {
        code.push('this.', this.$$store.theme[name], '=value;');
      }
      else if (variant === "resetThemed")
      {
        code.push('if(this.', this.$$store.theme[name], '!==undefined)');
        code.push('delete this.', this.$$store.theme[name], ';');
      }
      else if (variant === "init" && incomingValue)
      {
        code.push('this.', this.$$store.init[name], '=value;');
      }
    },


    /**
     * Emit code to store the incoming value and compute the "old" and "computed"
     * values.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __emitStoreComputedAndOldValue : function(code, config, name, variant, incomingValue)
    {
      if (config.inheritable) {
        code.push('var computed, old=this.', this.$$store.inherit[name], ';');
      } else {
        code.push('var computed, old;');
      }


      // OLD = RUNTIME VALUE
      code.push('if(this.', this.$$store.runtime[name], '!==undefined){');

      if (variant === "setRuntime")
      {
        // Replace it with new value
        code.push('computed=this.', this.$$store.runtime[name], '=value;');
      }
      else if (variant === "resetRuntime")
      {
        // Delete field
        code.push('delete this.', this.$$store.runtime[name], ';');

        // Complex compution of new value
        code.push('if(this.', this.$$store.user[name], '!==undefined)')
        code.push('computed=this.', this.$$store.user[name], ';');
        code.push('else if(this.', this.$$store.theme[name], '!==undefined)');
        code.push('computed=this.', this.$$store.theme[name], ';');
        code.push('else if(this.', this.$$store.init[name], '!==undefined){');
        code.push('computed=this.', this.$$store.init[name], ';');
        code.push('this.', this.$$store.useinit[name], '=true;');
        code.push('}');
      }
      else
      {
        // Use runtime value as it has higher priority
        code.push('old=computed=this.', this.$$store.runtime[name], ';');

        // Store incoming value
        if (variant === "set")
        {
          code.push('this.', this.$$store.user[name], '=value;');
        }
        else if (variant === "reset")
        {
          code.push('delete this.', this.$$store.user[name], ';');
        }
        else if (variant === "setThemed")
        {
          code.push('this.', this.$$store.theme[name], '=value;');
        }
        else if (variant === "resetThemed")
        {
          code.push('delete this.', this.$$store.theme[name], ';');
        }
        else if (variant === "init" && incomingValue)
        {
          code.push('this.', this.$$store.init[name], '=value;');
        }
      }

      code.push('}');


      // OLD = USER VALUE
      code.push('else if(this.', this.$$store.user[name], '!==undefined){');

      if (variant === "set")
      {
        if (!config.inheritable)
        {
          // Remember old value
          code.push('old=this.', this.$$store.user[name], ';');
        }

        // Replace it with new value
        code.push('computed=this.', this.$$store.user[name], '=value;');
      }
      else if (variant === "reset")
      {
        if (!config.inheritable)
        {
          // Remember old value
          code.push('old=this.', this.$$store.user[name], ';');
        }

        // Delete field
        code.push('delete this.', this.$$store.user[name], ';');

        // Complex compution of new value
        code.push('if(this.', this.$$store.runtime[name], '!==undefined)')
        code.push('computed=this.', this.$$store.runtime[name], ';');
        code.push('if(this.', this.$$store.theme[name], '!==undefined)');
        code.push('computed=this.', this.$$store.theme[name], ';');
        code.push('else if(this.', this.$$store.init[name], '!==undefined){');
        code.push('computed=this.', this.$$store.init[name], ';');
        code.push('this.', this.$$store.useinit[name], '=true;');
        code.push('}');
      }
      else
      {
        if (variant === "setRuntime")
        {
          // Use runtime value where it has higher priority
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        }
        else if (config.inheritable)
        {
          // Use user value where it has higher priority
          code.push('computed=this.', this.$$store.user[name], ';');
        }
        else
        {
          // Use user value where it has higher priority
          code.push('old=computed=this.', this.$$store.user[name], ';');
        }

        // Store incoming value
        if (variant === "setThemed")
        {
          code.push('this.', this.$$store.theme[name], '=value;');
        }
        else if (variant === "resetThemed")
        {
          code.push('delete this.', this.$$store.theme[name], ';');
        }
        else if (variant === "init" && incomingValue)
        {
          code.push('this.', this.$$store.init[name], '=value;');
        }
      }

      code.push('}');


      // OLD = THEMED VALUE
      if (config.themeable)
      {
        code.push('else if(this.', this.$$store.theme[name], '!==undefined){');

        if (!config.inheritable)
        {
          code.push('old=this.', this.$$store.theme[name], ';');
        }

        if (variant === "setRuntime")
        {
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        }

        else if (variant === "set")
        {
          code.push('computed=this.', this.$$store.user[name], '=value;');
        }

        // reset() is impossible, because the user has higher priority than
        // the themed value, so the themed value has no chance to ever get used,
        // when there is an user value, too.

        else if (variant === "setThemed")
        {
          code.push('computed=this.', this.$$store.theme[name], '=value;');
        }
        else if (variant === "resetThemed")
        {
          // Delete entry
          code.push('delete this.', this.$$store.theme[name], ';');

          // Fallback to init value
          code.push('if(this.', this.$$store.init[name], '!==undefined){');
            code.push('computed=this.', this.$$store.init[name], ';');
            code.push('this.', this.$$store.useinit[name], '=true;');
          code.push('}');
        }
        else if (variant === "init")
        {
          if (incomingValue) {
            code.push('this.', this.$$store.init[name], '=value;');
          }

          code.push('computed=this.', this.$$store.theme[name], ';');
        }
        else if (variant === "refresh")
        {
          code.push('computed=this.', this.$$store.theme[name], ';');
        }

        code.push('}');
      }


      // OLD = INIT VALUE
      code.push('else if(this.', this.$$store.useinit[name], '){');

      if (!config.inheritable) {
        code.push('old=this.', this.$$store.init[name], ';');
      }

      if (variant === "init")
      {
        if (incomingValue) {
          code.push('computed=this.', this.$$store.init[name], '=value;');
        } else {
          code.push('computed=this.', this.$$store.init[name], ';');
        }

        // useinit flag is already initialized
      }

      // reset(), resetRuntime() and resetStyle() are impossible, because the user and themed values have a
      // higher priority than the init value, so the init value has no chance to ever get used,
      // when there is an user or themed value, too.

      else if (variant === "set" || variant === "setRuntime" || variant === "setThemed" || variant === "refresh")
      {
        code.push('delete this.', this.$$store.useinit[name], ';');

        if (variant === "setRuntime") {
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        } else if (variant === "set") {
          code.push('computed=this.', this.$$store.user[name], '=value;');
        } else if (variant === "setThemed") {
          code.push('computed=this.', this.$$store.theme[name], '=value;');
        } else if (variant === "refresh") {
          code.push('computed=this.', this.$$store.init[name], ';');
        }
      }

      code.push('}');


      // OLD = NONE

      // reset(), resetRuntime() and resetStyle() are impossible because otherwise there
      // is already an old value
      if (variant === "set" || variant === "setRuntime" || variant === "setThemed" || variant === "init")
      {
        code.push('else{');

        if (variant === "setRuntime")
        {
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        }

        else if (variant === "set")
        {
          code.push('computed=this.', this.$$store.user[name], '=value;');
        }

        else if (variant === "setThemed")
        {
          code.push('computed=this.', this.$$store.theme[name], '=value;');
        }

        else if (variant === "init")
        {
          if (incomingValue) {
            code.push('computed=this.', this.$$store.init[name], '=value;');
          } else {
            code.push('computed=this.', this.$$store.init[name], ';');
          }

          code.push('this.', this.$$store.useinit[name], '=true;');
        }

        // refresh() will work with the undefined value, later
        code.push('}');
      }
    },


    /**
     * Emit code to store the value of an inheritable property
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __emitStoreInheritedPropertyValue : function(code, config, name, variant)
    {
      code.push('if(computed===undefined||computed===inherit){');

      if (variant === "refresh") {
        code.push('computed=value;');
      } else {
        code.push('var pa=this.getLayoutParent();if(pa)computed=pa.', this.$$store.inherit[name], ';');
      }

      // Fallback to init value if inheritance was unsuccessful
      code.push('if((computed===undefined||computed===inherit)&&');
      code.push('this.', this.$$store.init[name], '!==undefined&&');
      code.push('this.', this.$$store.init[name], '!==inherit){');
        code.push('computed=this.', this.$$store.init[name], ';');
        code.push('this.', this.$$store.useinit[name], '=true;');
      code.push('}else{');
      code.push('delete this.', this.$$store.useinit[name], ';}');

      code.push('}');

      // Compare old/new computed value
      code.push('if(old===computed)return value;');

      // Note: At this point computed can be "inherit" or "undefined".

      // Normalize "inherit" to undefined and delete inherited value
      code.push('if(computed===inherit){');
      code.push('computed=undefined;delete this.', this.$$store.inherit[name], ';');
      code.push('}');

      // Only delete inherited value
      code.push('else if(computed===undefined)');
      code.push('delete this.', this.$$store.inherit[name], ';');

      // Store inherited value
      code.push('else this.', this.$$store.inherit[name], '=computed;');

      // Protect against normalization
      code.push('var backup=computed;');

      // After storage finally normalize computed and old value
      if (config.init !== undefined && variant !== "init") {
        code.push('if(old===undefined)old=this.', this.$$store.init[name], ";");
      } else {
        code.push('if(old===undefined)old=null;');
      }
      code.push('if(computed===undefined||computed==inherit)computed=null;');
    },


    /**
     * Emit code to normalize the old and incoming values from undefined to
     * <code>null</code>.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __emitNormalizeUndefinedValues : function(code, config, name, variant)
    {
      // Properties which are not inheritable have no possibility to get
      // undefined at this position. (Hint: set(), setRuntime() and setThemed() only allow non undefined values)
      if (variant !== "set" && variant !== "setRuntime" && variant !== "setThemed") {
        code.push('if(computed===undefined)computed=null;');
      }

      // Compare old/new computed value
      code.push('if(old===computed)return value;');

      // Normalize old value
      if (config.init !== undefined && variant !== "init") {
        code.push('if(old===undefined)old=this.', this.$$store.init[name], ";");
      } else {
        code.push('if(old===undefined)old=null;');
      }
    },


    /**
     * Emit code to call the apply method and fire the change event
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     */
    __emitCallCallback : function(code, config, name)
    {
      // Execute user configured setter
      if (config.apply) {
        code.push('this.', config.apply, '(computed, old, "', name, '");');
      }

      // Fire event
      if (config.event) {
        code.push(
          "var reg=qx.event.Registration;",
          "if(reg.hasListener(this, '", config.event, "')){",
          "reg.fireEvent(this, '", config.event, "', qx.event.type.Data, [computed, old]", ")}"
        );
      }
    },


    /**
     * Emit code to update the inherited values of child objects
     *
     * @param code {String[]} String array to append the code to
     * @param name {String} name of the property
     */
    __emitRefreshChildrenValue : function(code, name)
    {
      code.push('var a=this._getChildren();if(a)for(var i=0,l=a.length;i<l;i++){');
      code.push('if(a[i].', this.$$method.refresh[name], ')a[i].', this.$$method.refresh[name], '(backup);');
      code.push('}');
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var ie6 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
    var ff2 = navigator.userAgent.indexOf("rv:1.8.1") != -1;

    // keep the old dereference behavior for IE6 and FF2
    if (ie6 || ff2) {
      statics.__shouldBeDereferenced = statics.__shouldBeDereferencedOld;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#require(qx.Interface)
#require(qx.Mixin)
#require(qx.core.Property)
#require(qx.lang.Core)

#use(qx.lang.Generics)

************************************************************************ */

/**
 * This class is one of the most important parts of qooxdoo's
 * object-oriented features.
 *
 * Its {@link #define} method is used to create qooxdoo classes.
 *
 * Each instance of a class defined by {@link #define} has
 * the following keys attached to the constructor and the prototype:
 *
 * <table>
 * <tr><th><code>classname</code></th><td>The fully-qualified name of the class (e.g. <code>"qx.ui.core.Widget"</code>).</td></tr>
 * <tr><th><code>basename</code></th><td>The namespace part of the class name (e.g. <code>"qx.ui.core"</code>).</td></tr>
 * <tr><th><code>constructor</code></th><td>A reference to the constructor of the class.</td></tr>
 * <tr><th><code>superclass</code></th><td>A reference to the constructor of the super class.</td></tr>
 * </table>
 *
 * Each method may access static members of the same class by using
 * <code>this.self(arguments)</code> ({@link qx.core.Object#self}):
 * <pre class='javascript'>
 * statics : { FOO : "bar" },
 * members: {
 *   baz: function(x) {
 *     this.self(arguments).FOO;
 *     ...
 *   }
 * }
 * </pre>
 *
 * Each overriding method may call the overridden method by using
 * <code>this.base(arguments [, ...])</code> ({@link qx.core.Object#base}). This is also true for calling
 * the constructor of the superclass.
 * <pre class='javascript'>
 * members: {
 *   foo: function(x) {
 *     this.base(arguments, x);
 *     ...
 *   }
 * }
 * </pre>
 */
qx.Bootstrap.define("qx.Class",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new class using the qooxdoo class system. This sets up the
     * namespace for the class and generates the class from the definition map.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Class.define("name",
     * {
     *   extend : Object, // superclass
     *   implement : [Interfaces],
     *   include : [Mixins],
     *
     *   statics:
     *   {
     *     CONSTANT : 3.141,
     *
     *     publicMethod: function() {},
     *     _protectedMethod: function() {},
     *     __privateMethod: function() {}
     *   },
     *
     *   properties:
     *   {
     *     "tabIndex": { check: "Number", init : -1 }
     *   },
     *
     *   members:
     *   {
     *     publicField: "foo",
     *     publicMethod: function() {},
     *
     *     _protectedField: "bar",
     *     _protectedMethod: function() {},
     *
     *     __privateField: "baz",
     *     __privateMethod: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String} Name of the class
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>type</th><td>String</td><td>
     *           Type of the class. Valid types are "abstract", "static" and "singleton".
     *           If unset it defaults to a regular non-static class.
     *       </td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface | Interface[]</td><td>Single interface or array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin | Mixin[]</td><td>Single mixin or array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property}.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>environment</th><td>Map</td><td>Map of environment settings for this class. For a description of the format of a setting see
     *           {@link qx.core.Environment}.</td></tr>
     *       <tr><th>events</th><td>Map</td><td>
     *           Map of events the class fires. The keys are the names of the events and the values are the
     *           corresponding event type class names.
     *       </td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of processing the class declaration. It allows access to the declared statics, members and properties.</td></tr>
     *       <tr><th>destruct</th><td>Function</td><td>The destructor of the class.</td></tr>
     *     </table>
     * @return {Class} The defined class
     */
    define : function(name, config)
    {
      if (!config) {
        var config = {};
      }

      // Normalize include to array
      if (config.include && !(qx.Bootstrap.getClass(config.include) === "Array")) {
        config.include = [config.include];
      }

      // Normalize implement to array
      if (config.implement && !(qx.Bootstrap.getClass(config.implement) === "Array")) {
        config.implement = [config.implement];
      }

      // Normalize type
      var implicitType = false;
      if (!config.hasOwnProperty("extend") && !config.type) {
        config.type = "static";
        implicitType = true;
      }

      // Validate incoming data
      if (qx.core.Environment.get("qx.debug")) {
        try {
          this.__validateConfig(name, config);
        } catch(ex) {
          if (implicitType) {
            ex.message = 'Assumed static class because no "extend" key was found. ' + ex.message;
          }
          throw ex;
        }
      }

      // Create the class
      var clazz = this.__createClass(name, config.type, config.extend, config.statics, config.construct, config.destruct, config.include);

      // Members, properties, events and mixins are only allowed for non-static classes
      if (config.extend)
      {
        // Attach properties
        if (config.properties) {
          this.__addProperties(clazz, config.properties, true);
        }

        // Attach members
        if (config.members) {
          this.__addMembers(clazz, config.members, true, true, false);
        }

        // Process events
        if (config.events) {
          this.__addEvents(clazz, config.events, true);
        }

        // Include mixins
        // Must be the last here to detect conflicts
        if (config.include)
        {
          for (var i=0, l=config.include.length; i<l; i++) {
            this.__addMixin(clazz, config.include[i], false);
          }
        }
      }

      // Process environment
      if (config.environment)
      {
        for (var key in config.environment) {
          qx.core.Environment.add(key, config.environment[key]);
        }
      }

      // Interface support for non-static classes
      if (config.implement)
      {
        for (var i=0, l=config.implement.length; i<l; i++) {
          this.__addInterface(clazz, config.implement[i]);
        }
      }


      if (qx.core.Environment.get("qx.debug")) {
        this.__validateAbstractInterfaces(clazz);
      }


      // Process defer
      if (config.defer)
      {
        config.defer.self = clazz;
        config.defer(clazz, clazz.prototype,
        {
          add : function(name, config)
          {
            // build pseudo properties map
            var properties = {};
            properties[name] = config;

            // execute generic property handler
            qx.Class.__addProperties(clazz, properties, true);
          }
        });
      }

      return clazz;
    },


    /**
     * Removes a class from qooxdoo defined by {@link #define}
     *
     * @param name {String} Name of the class
     */
    undefine : function(name)
    {
      // first, delete the class from the registry
      delete this.$$registry[name];
      // delete the class reference from the namespaces and all empty namespaces
      var ns = name.split(".");
      // build up an array containing all namespace objects including window
      var objects = [window];
      for (var i = 0; i < ns.length; i++) {
        objects.push(objects[i][ns[i]]);
      }

      // go through all objects and check for the constructor or empty namespaces
      for (var i = objects.length - 1; i >= 1; i--) {
        var last = objects[i];
        var parent = objects[i - 1];
        if (qx.Bootstrap.isFunction(last) || qx.Bootstrap.objectGetLength(last) === 0) {
          delete parent[ns[i - 1]];
        } else {
          break;
        }
      };
    },


    /**
     * Whether the given class exists
     *
     * @signature function(name)
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined : qx.Bootstrap.classIsDefined,


    /**
     * Determine the total number of classes
     *
     * @return {Number} the total number of classes
     */
    getTotalNumber : function() {
      return qx.Bootstrap.objectGetLength(this.$$registry);
    },


    /**
     * Find a class by its name
     *
     * @signature function(name)
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : qx.Bootstrap.getByName,


    /**
     * Include all features of the given mixin into the class. The mixin must
     * not include any methods or properties that are already available in the
     * class. This would only be possible using the {@link #patch} method.
     *
     * @param clazz {Class} An existing class which should be augmented by including a mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    include : function(clazz, mixin)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!mixin) {
          throw new Error("The mixin to include into class '" + clazz.classname + "' is undefined/null!");
        }

        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.__addMixin(clazz, mixin, false);
    },


    /**
     * Include all features of the given mixin into the class. The mixin may
     * include features, which are already defined in the target class. Existing
     * features of equal name will be overwritten.
     * Please keep in mind that this functionality is not intended for regular
     * use, but as a formalized way (and a last resort) in order to patch
     * existing classes.
     *
     * <b>WARNING</b>: You may break working classes and features.
     *
     * @param clazz {Class} An existing class which should be modified by including a mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    patch : function(clazz, mixin)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!mixin) {
          throw new Error("The mixin to patch class '" + clazz.classname + "' is undefined/null!");
        }

        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.__addMixin(clazz, mixin, true);
    },


    /**
     * Whether a class is a direct or indirect sub class of another class,
     * or both classes coincide.
     *
     * @param clazz {Class} the class to check.
     * @param superClass {Class} the potential super class
     * @return {Boolean} whether clazz is a sub class of superClass.
     */
    isSubClassOf : function(clazz, superClass)
    {
      if (!clazz) {
        return false;
      }

      if (clazz == superClass) {
        return true;
      }

      if (clazz.prototype instanceof superClass) {
        return true;
      }

      return false;
    },


    /**
     * Returns the definition of the given property. Returns null
     * if the property does not exist.
     *
     * TODO: Correctly support refined properties?
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition : qx.Bootstrap.getPropertyDefinition,


    /**
     * Returns a list of all properties supported by the given class
     *
     * @param clazz {Class} Class to query
     * @return {String[]} List of all property names
     */
    getProperties : function(clazz)
    {
      var list = [];

      while (clazz)
      {
        if (clazz.$$properties) {
          list.push.apply(list, qx.Bootstrap.getKeys(clazz.$$properties));
        }

        clazz = clazz.superclass;
      }

      return list;
    },


    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given property in its class definition. Returns null
     * if the property is not specified anywhere.
     *
     * @param clazz {Class} class to look for the property
     * @param name {String} name of the property
     * @return {Class | null} The class which includes the property
     */
    getByProperty : function(clazz, name)
    {
      while (clazz)
      {
        if (clazz.$$properties && clazz.$$properties[name]) {
          return clazz;
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Whether a class has the given property
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty : qx.Bootstrap.hasProperty,


    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event
     * @return {String|null} Event type of the given event.
     */
    getEventType : qx.Bootstrap.getEventType,


    /**
     * Whether a class supports the given event type
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent : qx.Bootstrap.supportsEvent,


    /**
     * Whether a class directly includes a mixin.
     *
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnMixin : function(clazz, mixin) {
      return clazz.$$includes && clazz.$$includes.indexOf(mixin) !== -1;
    },


    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given mixin. Returns null if the mixin is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the mixin
     * @param mixin {Mixin} mixin to look for
     * @return {Class | null} The class which directly includes the given mixin
     */
    getByMixin : function(clazz, mixin)
    {
      var list, i, l;

      while (clazz)
      {
        if (clazz.$$includes)
        {
          list = clazz.$$flatIncludes;

          for (i=0, l=list.length; i<l; i++)
          {
            if (list[i] === mixin) {
              return clazz;
            }
          }
        }

        clazz = clazz.superclass;
      }

      return null;
    },


    /**
     * Returns a list of all mixins available in a given class.
     *
     * @signature function(clazz)
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getMixins : qx.Bootstrap.getMixins,


    /**
     * Whether a given class or any of its superclasses includes a given mixin.
     *
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasMixin: function(clazz, mixin) {
      return !!this.getByMixin(clazz, mixin);
    },


    /**
     * Whether a given class directly includes an interface.
     *
     * This function will only return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) using the "implement"
     * key.
     *
     * @param clazz {Class} class or instance to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnInterface : function(clazz, iface) {
      return clazz.$$implements && clazz.$$implements.indexOf(iface) !== -1;
    },


    /**
     * Returns the class or one of its super classes which contains the
     * declaration of the given interface. Returns null if the interface is not
     * specified anywhere.
     *
     * @signature function(clazz, iface)
     * @param clazz {Class} class to look for the interface
     * @param iface {Interface} interface to look for
     * @return {Class | null} the class which directly implements the given interface
     */
    getByInterface : qx.Bootstrap.getByInterface,


    /**
     * Returns a list of all mixins available in a class.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getInterfaces : function(clazz)
    {
      var list = [];

      while (clazz)
      {
        if (clazz.$$implements) {
          list.push.apply(list, clazz.$$flatImplements);
        }

        clazz = clazz.superclass;
      }

      return list;
    },


    /**
     * Whether a given class or any of its super classes includes a given interface.
     *
     * This function will return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) of the class
     * or any of its super classes using the "implement"
     * key.
     *
     * @signature function(clazz, iface)
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    hasInterface : qx.Bootstrap.hasInterface,


    /**
     * Whether a given class to an interface.
     *
     * Checks whether all methods defined in the interface are
     * implemented. The class does not need to implement
     * the interface explicitly in the <code>extend</code> key.
     *
     * @param obj {Object} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class conforms to the interface.
     */
    implementsInterface : function(obj, iface)
    {
      var clazz = obj.constructor;

      if (this.hasInterface(clazz, iface)) {
        return true;
      }

      try
      {
        qx.Interface.assertObject(obj, iface);
        return true;
      }
      catch(ex) {}

      try
      {
        qx.Interface.assert(clazz, iface, false);
        return true;
      }
      catch(ex) {}

      return false;
    },


    /**
     * Helper method to handle singletons
     *
     * @internal
     */
    getInstance : function()
    {
      if (!this.$$instance)
      {
        this.$$allowconstruct = true;
        this.$$instance = new this;
        delete this.$$allowconstruct;
      }

      return this.$$instance;
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The class identifier
     */
    genericToString : function() {
      return "[Class " + this.classname + "]";
    },


    /** Stores all defined classes */
    $$registry : qx.Bootstrap.$$registry,


    /** {Map} allowed keys in non-static class definition */
    __allowedKeys : qx.core.Environment.select("qx.debug",
    {
      "true":
      {
        "type"       : "string",    // String
        "extend"     : "function",  // Function
        "implement"  : "object",    // Interface[]
        "include"    : "object",    // Mixin[]
        "construct"  : "function",  // Function
        "statics"    : "object",    // Map
        "properties" : "object",    // Map
        "members"    : "object",    // Map
        "environment"   : "object", // Map
        "events"     : "object",    // Map
        "defer"      : "function",  // Function
        "destruct"   : "function"   // Function
      },

      "default" : null
    }),


    /** {Map} allowed keys in static class definition */
    __staticAllowedKeys : qx.core.Environment.select("qx.debug",
    {
      "true":
      {
        "type"        : "string",    // String
        "statics"     : "object",    // Map
        "environment" : "object",    // Map
        "defer"       : "function"   // Function
      },

      "default" : null
    }),


    /**
     * Validates an incoming configuration and checks for proper keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : qx.core.Environment.select("qx.debug",
    {
      "true": function(name, config)
      {
        // Validate type
        if (config.type && !(config.type === "static" || config.type === "abstract" || config.type === "singleton")) {
          throw new Error('Invalid type "' + config.type + '" definition for class "' + name + '"!');
        }

        // Validate non-static class on the "extend" key
        if (config.type && config.type !== "static" && !config.extend) {
          throw new Error('Invalid config in class "' + name + '"! Every non-static class has to extend at least the "qx.core.Object" class.');
        }

        // Validate keys
        var allowed = config.type === "static" ? this.__staticAllowedKeys : this.__allowedKeys;
        for (var key in config)
        {
          if (!allowed[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
          }

          if (typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        // Validate maps
        var maps = [ "statics", "properties", "members", "environment", "settings", "variants", "events" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined && (
            config[key].$$hash !== undefined || !qx.Bootstrap.isObject(config[key])
          )) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value needs to be a map!');
          }
        }

        // Validate include definition
        if (config.include)
        {
          if (qx.Bootstrap.getClass(config.include) === "Array")
          {
            for (var i=0, a=config.include, l=a.length; i<l; i++)
            {
              if (a[i] == null || a[i].$$type !== "Mixin") {
                throw new Error('The include definition in class "' + name + '" contains an invalid mixin at position ' + i + ': ' + a[i]);
              }
            }
          }
          else
          {
            throw new Error('Invalid include definition in class "' + name + '"! Only mixins and arrays of mixins are allowed!');
          }
        }

        // Validate implement definition
        if (config.implement)
        {
          if (qx.Bootstrap.getClass(config.implement) === "Array")
          {
            for (var i=0, a=config.implement, l=a.length; i<l; i++)
            {
              if (a[i] == null || a[i].$$type !== "Interface") {
                throw new Error('The implement definition in class "' + name + '" contains an invalid interface at position ' + i + ': ' + a[i]);
              }
            }
          }
          else
          {
            throw new Error('Invalid implement definition in class "' + name + '"! Only interfaces and arrays of interfaces are allowed!');
          }
        }

        // Check mixin compatibility
        if (config.include)
        {
          try {
            qx.Mixin.checkCompatibility(config.include);
          } catch(ex) {
            throw new Error('Error in include definition of class "' + name + '"! ' + ex.message);
          }
        }

        // Validate environment
        if (config.environment)
        {
          for (var key in config.environment)
          {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error('Forbidden environment setting "' + key +
                '" found in "' + name + '". It is forbidden to define a ' +
                'environment setting for an external namespace!');
            }
          }
        }

        // Validate settings
        if (config.settings)
        {
          for (var key in config.settings)
          {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error('Forbidden setting "' + key + '" found in "' + name + '". It is forbidden to define a default setting for an external namespace!');
            }
          }
        }

        // Validate variants
        if (config.variants)
        {
          for (var key in config.variants)
          {
            if (key.substr(0, key.indexOf(".")) != name.substr(0, name.indexOf("."))) {
              throw new Error('Forbidden variant "' + key + '" found in "' + name + '". It is forbidden to define a variant for an external namespace!');
            }
          }
        }
      },

      "default" : function() {}
    }),


    /**
     * Validates the interfaces required by abstract base classes
     *
     * @signature function(clazz)
     * @param clazz {Class} The configured class.
     */
    __validateAbstractInterfaces : qx.core.Environment.select("qx.debug",
    {
      "true": function(clazz)
      {
        var superclass = clazz.superclass;
        while (superclass)
        {
          if (superclass.$$classtype !== "abstract") {
            break;
          }

          var interfaces = superclass.$$implements;
          if (interfaces)
          {
            for (var i=0; i<interfaces.length; i++) {
              qx.Interface.assert(clazz, interfaces[i], true);
            }
          }
          superclass = superclass.superclass;
        }
      },

      "default" : function() {}
    }),


    /**
     * Creates a class by type. Supports modern inheritance etc.
     *
     * @param name {String} Full name of the class
     * @param type {String} type of the class, i.e. "static", "abstract" or "singleton"
     * @param extend {Class} Superclass to inherit from
     * @param statics {Map} Static methods or fields
     * @param construct {Function} Constructor of the class
     * @param destruct {Function} Destructor of the class
     * @param mixins {Mixin[]} array of mixins of the class
     * @return {Class} The generated class
     */
    __createClass : function(name, type, extend, statics, construct, destruct, mixins)
    {
      var clazz;

      if (!extend && qx.core.Environment.get("qx.aspects") == false)
      {
        // Create empty/non-empty class
        clazz = statics || {};
        qx.Bootstrap.setDisplayNames(clazz, name);
      }
      else
      {
        var clazz = {};

        if (extend)
        {
          // Create default constructor
          if (!construct) {
            construct = this.__createDefaultConstructor();
          }

          if (this.__needsConstructorWrapper(extend, mixins)) {
            clazz = this.__wrapConstructor(construct, name, type);
          } else {
            clazz = construct;
          }

          // Add singleton getInstance()
          if (type === "singleton") {
            clazz.getInstance = this.getInstance;
          }

          qx.Bootstrap.setDisplayName(construct, name, "constructor");
        }

        // Copy statics
        if (statics)
        {
          qx.Bootstrap.setDisplayNames(statics, name);

          var key;

          for (var i=0, a=qx.Bootstrap.getKeys(statics), l=a.length; i<l; i++)
          {
            key = a[i];
            var staticValue = statics[key];

            if (qx.core.Environment.get("qx.aspects"))
            {

              if (staticValue instanceof Function) {
                staticValue = qx.core.Aspect.wrap(name + "." + key, staticValue, "static");
              }

              clazz[key] = staticValue;
            }
            else
            {
              clazz[key] = staticValue;
            }
          }
        }
      }

      // Create namespace
      var basename = qx.Bootstrap.createNamespace(name, clazz);

      // Store names in constructor/object
      clazz.name = clazz.classname = name;
      clazz.basename = basename;

      // Store type info
      clazz.$$type = "Class";
      if (type) {
        clazz.$$classtype = type;
      }

      // Attach toString
      if (!clazz.hasOwnProperty("toString")) {
        clazz.toString = this.genericToString;
      }

      if (extend)
      {
        qx.Bootstrap.extendClass(clazz, construct, extend, name, basename);

        // Store destruct onto class
        if (destruct)
        {
          if (qx.core.Environment.get("qx.aspects")) {
            destruct = qx.core.Aspect.wrap(name, destruct, "destructor");
          }

          clazz.$$destructor = destruct;
          qx.Bootstrap.setDisplayName(destruct, name, "destruct");
        }
      }

      // Store class reference in global class registry
      this.$$registry[name] = clazz;

      // Return final class object
      return clazz;
    },






    /*
    ---------------------------------------------------------------------------
       PRIVATE ADD HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Attach events to the class
     *
     * @param clazz {Class} class to add the events to
     * @param events {Map} map of event names the class fires.
     * @param patch {Boolean ? false} Enable redefinition of event type?
     */
    __addEvents : function(clazz, events, patch)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (typeof events !== "object" || qx.Bootstrap.getClass(events) === "Array") {
          throw new Error(clazz.classname + ": the events must be defined as map!");
        }

        for (var key in events)
        {
          if (typeof events[key] !== "string") {
            throw new Error(clazz.classname + "/" + key + ": the event value needs to be a string with the class name of the event object which will be fired.");
          }
        }

        // Compare old and new event type/value if patching is disabled
        if (clazz.$$events && patch !== true)
        {
          for (var key in events)
          {
            if (clazz.$$events[key] !== undefined && clazz.$$events[key] !== events[key]) {
              throw new Error(clazz.classname + "/" + key + ": the event value/type cannot be changed from " + clazz.$$events[key] + " to " + events[key]);
            }
          }
        }
      }

      if (clazz.$$events)
      {
        for (var key in events) {
          clazz.$$events[key] = events[key];
        }
      }
      else
      {
        clazz.$$events = events;
      }
    },


    /**
     * Attach properties to classes
     *
     * @param clazz {Class} class to add the properties to
     * @param properties {Map} map of properties
     * @param patch {Boolean ? false} Overwrite property with the limitations of a property
               which means you are able to refine but not to replace (esp. for new properties)
     */
    __addProperties : function(clazz, properties, patch)
    {
      var config;

      if (patch === undefined) {
        patch = false;
      }

      var proto = clazz.prototype;

      for (var name in properties)
      {
        config = properties[name];

        // Check incoming configuration
        if (qx.core.Environment.get("qx.debug")) {
          this.__validateProperty(clazz, name, config, patch);
        }

        // Store name into configuration
        config.name = name;

        // Add config to local registry
        if (!config.refine)
        {
          if (clazz.$$properties === undefined) {
            clazz.$$properties = {};
          }

          clazz.$$properties[name] = config;
        }

        // Store init value to prototype. This makes it possible to
        // overwrite this value in derived classes.
        if (config.init !== undefined) {
          clazz.prototype["$$init_" + name] = config.init;
        }

        // register event name
        if (config.event !== undefined) {
          var event = {}
          event[config.event] = "qx.event.type.Data";
          this.__addEvents(clazz, event, patch);
        }

        // Remember inheritable properties
        if (config.inheritable)
        {
          qx.core.Property.$$inheritable[name] = true;
          if (!proto.$$refreshInheritables) {
            qx.core.Property.attachRefreshInheritables(clazz);
          }
        }

        if (!config.refine) {
          qx.core.Property.attachMethods(clazz, name, config);
        }
      }
    },

    /**
     * Validates the given property
     *
     * @signature function(clazz, name, config, patch)
     * @param clazz {Class} class to add property to
     * @param name {String} name of the property
     * @param config {Map} configuration map
     * @param patch {Boolean ? false} enable refine/patch?
     */
    __validateProperty : qx.core.Environment.select("qx.debug",
    {
      "true": function(clazz, name, config, patch)
      {
        var has = this.hasProperty(clazz, name);

        if (has)
        {
          var existingProperty = this.getPropertyDefinition(clazz, name);

          if (config.refine && existingProperty.init === undefined) {
            throw new Error("Could not refine an init value if there was previously no init value defined. Property '" + name + "' of class '" + clazz.classname + "'.");
          }
        }

        if (!has && config.refine) {
          throw new Error("Could not refine non-existent property: '" + name + "' of class: '" + clazz.classname + "'!");
        }

        if (has && !patch) {
          throw new Error("Class " + clazz.classname + " already has a property: " + name + "!");
        }

        if (has && patch)
        {
          if (!config.refine) {
            throw new Error('Could not refine property "' + name + '" without a "refine" flag in the property definition! This class: ' + clazz.classname + ', original class: ' + this.getByProperty(clazz, name).classname + '.');
          }

          for (var key in config)
          {
            if (key !== "init" && key !== "refine") {
              throw new Error("Class " + clazz.classname + " could not refine property: " + name + "! Key: " + key + " could not be refined!");
            }
          }
        }

        // Check 0.7 keys
        var allowed = config.group ? qx.core.Property.$$allowedGroupKeys : qx.core.Property.$$allowedKeys;
        for (var key in config)
        {
          if (allowed[key] === undefined) {
            throw new Error('The configuration key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '" is not allowed!');
          }

          if (config[key] === undefined) {
            throw new Error('Invalid key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '"! The value is undefined: ' + config[key]);
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" of property "' + name + '" in class "' + clazz.classname + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        if (config.transform != null)
        {
          if (!(typeof config.transform == "string")) {
            throw new Error('Invalid transform definition of property "' + name + '" in class "' + clazz.classname + '"! Needs to be a String.');
          }
        }

        if (config.check != null)
        {
          if (
            !qx.Bootstrap.isString(config.check) &&
            !qx.Bootstrap.isArray(config.check) &&
            !qx.Bootstrap.isFunction(config.check)
          ) {
            throw new Error('Invalid check definition of property "' + name + '" in class "' + clazz.classname + '"! Needs to be a String, Array or Function.');
          }
        }
      },

      "default" : null
    }),


    /**
     * Attach members to a class
     *
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     * @param patch {Boolean ? false} Enable patching of
     * @param base (Boolean ? true) Attach base flag to mark function as members
     *     of this class
     * @param wrap {Boolean ? false} Whether the member method should be wrapped.
     *     this is needed to allow base calls in patched mixin members.
     */
    __addMembers : function(clazz, members, patch, base, wrap)
    {
      var proto = clazz.prototype;
      var key, member;

      qx.Bootstrap.setDisplayNames(members, clazz.classname + ".prototype");

      for (var i=0, a=qx.Bootstrap.getKeys(members), l=a.length; i<l; i++)
      {
        key = a[i];
        member = members[key];

        if (qx.core.Environment.get("qx.debug"))
        {
          if (proto[key] !== undefined && key.charAt(0) == "_" && key.charAt(1) == "_") {
            throw new Error('Overwriting private member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          }

          if (patch !== true && proto.hasOwnProperty(key)) {
            throw new Error('Overwriting member "' + key + '" of Class "' + clazz.classname + '" is not allowed!');
          }
        }

        // Added helper stuff to functions
        // Hint: Could not use typeof function because RegExp objects are functions, too
        // Protect to apply base property and aspect support on special attributes e.g.
        // classes which are function like as well.
        if (base !== false && member instanceof Function && member.$$type == null)
        {
          if (wrap == true)
          {
            // wrap "patched" mixin member
            member = this.__mixinMemberWrapper(member, proto[key]);
          }
          else
          {
            // Configure extend (named base here)
            // Hint: proto[key] is not yet overwritten here
            if (proto[key]) {
              member.base = proto[key];
            }
            member.self = clazz;
          }

          if (qx.core.Environment.get("qx.aspects")) {
            member = qx.core.Aspect.wrap(clazz.classname + "." + key, member, "member");
          }
        }

        // Attach member
        proto[key] = member;
      }
    },


    /**
     * Wraps a member function of a mixin, which is included using "patch". This
     * allows "base" calls in the mixin member function.
     *
     * @param member {Function} The mixin method to wrap
     * @param base {Function} The overwritten method
     * @return {Function} the wrapped mixin member
     */
    __mixinMemberWrapper : function(member, base)
    {
      if (base)
      {
        return function()
        {
          var oldBase = member.base;
          member.base = base;
          var retval = member.apply(this, arguments);
          member.base = oldBase;
          return retval;
        }
      }
      else
      {
        return member;
      }
    },


    /**
     * Add a single interface to a class
     *
     * @param clazz {Class} class to add interface to
     * @param iface {Interface} the Interface to add
     */
    __addInterface : function(clazz, iface)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!clazz || !iface) {
          throw new Error("Incomplete parameters!")
        }

        // This differs from mixins, we only check if the interface is already
        // directly used by this class. It is allowed however, to have an interface
        // included multiple times by extends in the interfaces etc.
        if (this.hasOwnInterface(clazz, iface)) {
          throw new Error('Interface "' + iface.name + '" is already used by Class "' + clazz.classname + '!');
        }

        // Check interface and wrap members
        if (clazz.$$classtype !== "abstract") {
          qx.Interface.assert(clazz, iface, true);
        }
      }

      // Store interface reference
      var list = qx.Interface.flatten([iface]);
      if (clazz.$$implements)
      {
        clazz.$$implements.push(iface);
        clazz.$$flatImplements.push.apply(clazz.$$flatImplements, list);
      }
      else
      {
        clazz.$$implements = [iface];
        clazz.$$flatImplements = list;
      }
    },


    /**
     * Wrap the constructor of an already existing clazz. This function will
     * replace all references to the existing constructor with the new wrapped
     * constructor.
     *
     * @param clazz {Class} The class to wrap
     */
    __retrospectWrapConstruct : function(clazz)
    {
      var name = clazz.classname
      var wrapper = this.__wrapConstructor(clazz, name, clazz.$$classtype);

      // copy all keys from the wrapped constructor to the wrapper
      for (var i=0, a=qx.Bootstrap.getKeys(clazz), l=a.length; i<l; i++)
      {
        key = a[i];
        wrapper[key] = clazz[key];
      }

      // fix prototype
      wrapper.prototype = clazz.prototype;

      // fix self references in members
      var members = clazz.prototype;
      for (var i=0, a=qx.Bootstrap.getKeys(members), l=a.length; i<l; i++)
      {
        key = a[i];
        var method = members[key];

        // check if method is available because null values can be stored as
        // init values on classes e.g. [BUG #3709]
        if (method && method.self == clazz) {
          method.self = wrapper;
        }
      }

      // fix base and superclass references in all defined classes
      for(var key in this.$$registry)
      {
        var construct = this.$$registry[key];
        if (!construct) {
          continue;
        }

        if (construct.base == clazz) {
          construct.base = wrapper;
        }
        if (construct.superclass == clazz) {
          construct.superclass = wrapper;
        }

        if (construct.$$original)
        {
          if (construct.$$original.base == clazz) {
            construct.$$original.base = wrapper;
          }
          if (construct.$$original.superclass == clazz) {
            construct.$$original.superclass = wrapper;
          }
        }
      }
      qx.Bootstrap.createNamespace(name, wrapper);
      this.$$registry[name] = wrapper;

      return wrapper;
    },


    /**
     * Include all features of the mixin into the given class, recursively.
     *
     * @param clazz {Class} The class onto which the mixin should be attached.
     * @param mixin {Mixin} Include all features of this mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __addMixin : function(clazz, mixin, patch)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!clazz || !mixin) {
          throw new Error("Incomplete parameters!")
        }
      }

      if (this.hasMixin(clazz, mixin)) {
        return;
      }

      var isConstructorWrapped = clazz.$$original;
      if (mixin.$$constructor && !isConstructorWrapped) {
        clazz = this.__retrospectWrapConstruct(clazz);
      }

      // Attach content
      var list = qx.Mixin.flatten([mixin]);
      var entry;

      for (var i=0, l=list.length; i<l; i++)
      {
        entry = list[i];

        // Attach events
        if (entry.$$events) {
          this.__addEvents(clazz, entry.$$events, patch);
        }

        // Attach properties (Properties are already readonly themselves, no patch handling needed)
        if (entry.$$properties) {
          this.__addProperties(clazz, entry.$$properties, patch);
        }

        // Attach members (Respect patch setting, but dont apply base variables)
        if (entry.$$members) {
          this.__addMembers(clazz, entry.$$members, patch, patch, patch);
        }
      }

      // Store mixin reference
      if (clazz.$$includes)
      {
        clazz.$$includes.push(mixin);
        clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
      }
      else
      {
        clazz.$$includes = [mixin];
        clazz.$$flatIncludes = list;
      }
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE FUNCTION HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the default constructor.
     * This constructor just calls the constructor of the base class.
     *
     * @return {Function} The default constructor.
     */
    __createDefaultConstructor : function()
    {
      function defaultConstructor() {
        defaultConstructor.base.apply(this, arguments);
      };

      return defaultConstructor;
    },


    /**
     * Returns an empty function. This is needed to get an empty function with an empty closure.
     *
     * @return {Function} empty function
     */
    __createEmptyFunction : function() {
      return function() {};
    },


    /**
     * Checks if the constructor needs to be wrapped.
     *
     * @param base {Class} The base class.
     * @param mixins {Mixin[]} All mixins which should be included.
     * @return {Boolean} true, if the constructor needs to be wrapped.
     */
    __needsConstructorWrapper : function(base, mixins)
    {
      if (qx.core.Environment.get("qx.debug")) {
        return true;
      }

      // Check for base class mixin constructors
      if (base && base.$$includes)
      {
        var baseMixins=base.$$flatIncludes;
        for (var i=0, l=baseMixins.length; i<l; i++)
        {
          if (baseMixins[i].$$constructor) {
            return true;
          }
        }
      }

      // check for direct mixin constructors
      if (mixins)
      {
        var flatMixins = qx.Mixin.flatten(mixins);
        for (var i=0, l=flatMixins.length; i<l; i++)
        {
          if (flatMixins[i].$$constructor) {
            return true;
          }
        }
      }

      return false;
    },


    /**
     * Generate a wrapper of the original class constructor in order to enable
     * some of the advanced OO features (e.g. abstract class, singleton, mixins)
     *
     * @param construct {Function} the original constructor
     * @param name {String} name of the class
     * @param type {String} the user specified class type
     */
    __wrapConstructor : function(construct, name, type)
    {
      var wrapper = function()
      {
        var clazz = wrapper;

        if (qx.core.Environment.get("qx.debug"))
        {
          // new keyword check
          if (!(this instanceof clazz)) {
            throw new Error("Please initialize '" + name + "' objects using the new keyword!");
          }

          // add abstract and singleton checks
          if (type === "abstract")
          {
            if (this.classname===name) {
              throw new Error("The class '," + name + "' is abstract! It is not possible to instantiate it.");
            }
          }
          else if (type === "singleton")
          {
            if (!clazz.$$allowconstruct) {
              throw new Error("The class '" + name + "' is a singleton! It is not possible to instantiate it directly. Use the static getInstance() method instead.");
            }
          }
        }

        // Execute default constructor
        var retval=clazz.$$original.apply(this,arguments);

        // Initialize local mixins
        if (clazz.$$includes)
        {
          var mixins=clazz.$$flatIncludes;
          for (var i=0, l=mixins.length; i<l; i++)
          {
            if (mixins[i].$$constructor) {
              mixins[i].$$constructor.apply(this,arguments);
            }
          }
        }

        if (qx.core.Environment.get("qx.debug")) {
          // Mark instance as initialized
          if (this.classname === name) {
            this.$$initialized = true;
          }
        }

        // Return optional return value
        return retval;
      };

      if (qx.core.Environment.get("qx.aspects"))
      {
        var aspectWrapper = qx.core.Aspect.wrap(name, wrapper, "constructor");
        wrapper.$$original = construct;
        wrapper.constructor = aspectWrapper;
        wrapper = aspectWrapper;
      }

      // Store original constructor
      wrapper.$$original = construct;

      // Store wrapper into constructor (needed for base calls etc.)
      construct.wrapper = wrapper;

      // Return generated wrapper
      return wrapper;
    }
  },

  defer : function()
  {
    // Binding of already loaded bootstrap classes
    if (qx.core.Environment.get("qx.aspects"))
    {
      for (var classname in qx.Bootstrap.$$registry)
      {
        var statics = qx.Bootstrap.$$registry[classname];

        for (var key in statics)
        {
          // only functions, no regexps
          if (statics[key] instanceof Function) {
            statics[key] = qx.core.Aspect.wrap(classname + "." + key, statics[key], "static");
          }
        }
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Basis for Aspect Oriented features in qooxdoo.
 *
 * This class makes it possible to attach functions (aspects) before or
 * after each function call of any function defined in {@link qx.Class#define}.
 *
 * Classes, which define own aspects must add an explicit require to this class
 * in the header comment using the following code:
 *
 * <pre>
 * &#35;require(qx.core.Aspect)
 * &#35;ignore(auto-require)
 * </pre>
 *
 * One example for a qooxdoo aspect is profiling ({@link qx.dev.Profile}).
 */
qx.Bootstrap.define("qx.core.Aspect",
{
  statics :
  {
    /** {Array} Registry for all known aspect wishes */
    __registry : [],


    /**
     * This function is used by {@link qx.Class#define} to wrap all statics, members and
     * constructors.
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param fcn {Function} function to wrap.
     * @param type {String} Type of the wrapped function. One of "member", "static",
     *          "constructor", "destructor" or "property".
     *
     * @return {Function} wrapped function
     */
    wrap : function(fullName, fcn, type)
    {
      var before = [];
      var after = [];
      var reg = this.__registry;
      var entry;

      for (var i=0; i<reg.length; i++)
      {
        entry = reg[i];

        if ((entry.type == null || type == entry.type || entry.type == "*") && (entry.name == null || fullName.match(entry.name))) {
          entry.pos == -1 ? before.push(entry.fcn) : after.push(entry.fcn);
        }
      }

      if (before.length === 0 && after.length === 0) {
        return fcn;
      }

      var wrapper = function()
      {
        for (var i=0; i<before.length; i++) {
          before[i].call(this, fullName, fcn, type, arguments);
        }

        var ret = fcn.apply(this, arguments);

        for (var i=0; i<after.length; i++) {
          after[i].call(this, fullName, fcn, type, arguments, ret);
        }

        return ret;
      }

      if (type !== "static")
      {
        wrapper.self = fcn.self;
        wrapper.base = fcn.base;
      }

      fcn.wrapper = wrapper
      wrapper.original = fcn;

      return wrapper;
    },


    /**
     * Register a function to be called just before or after each time
     * one of the selected functions is called.
     *
     * @param fcn {Function} Function to be called just before or after any of the
     *     selected functions is called. If position is "before" the functions
     *     supports the same signature as {@link qx.dev.Profile#profileBefore}. If
     *     position is "after" it supports the same signature as
     *     {@link qx.dev.Profile#profileAfter}.
     * @param position {String?"after"} One of "before" or "after". Whether the function
     *     should be called before or after the wrapped function.
     * @param type {String?null} Type of the wrapped function. One of "member",
     *     "static", "constructor", "destructor", "property" or "*". <code>null</code>
     *     is handled identical to "*".
     * @param name {String|RegExp?null} Each function, with a full name matching
     *     this pattern (using <code>fullName.match(name)</code>) will be
     *     wrapped.
     */
    addAdvice : function(fcn, position, type, name)
    {
      this.__registry.push(
      {
        fcn: fcn,
        pos: position === "before" ? -1 : 1,
        type: type,
        name: name
      });
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (mwittemann)

************************************************************************ */

/**
 * This interface defines a data structure compatible with the data binding
 * controllers.
 * It defines a minimum of functionality which the controller need to work.
 */
qx.Interface.define("qx.data.IListData",
{
  events :
  {
    /**
     * The change event which will be fired if there is a change in the data
     * structure.The data should contain a map with three key value pairs:
     * <li>start: The start index of the change.</li>
     * <li>end: The end index of the change.</li>
     * <li>type: The type of the change as a String. This can be 'add',
     * 'remove' or 'order'</li>
     * <li>item: The item which has been changed.</li>
     */
    "change" : "qx.event.type.Data",

    /**
     * The changeLength event will be fired every time the length of the
     * data structure changes.
     */
    "changeLength": "qx.event.type.Event"
  },


  members :
  {
    /**
     * Returns the item at the given index
     *
     * @param index {Number} The index requested of the data element.
     *
     * @return {var} The element at the given index.
     */
    getItem : function(index) {},


    /**
     * Sets the given item at the given position in the data structure. A
     * change event has to be fired.
     *
     * @param index {Number} The index of the data element.
     * @param item {var} The new item to set.
     */
    setItem : function(index, item) {},


    /**
     * Method to remove and add new element to the data. For every remove or
     * add a change event should be fired.
     *
     * @param startIndex {Integer} The index where the splice should start
     * @param amount {Integer} Defines number of element which will be removed
     *   at the given position.
     * @param varargs {var} All following parameters will be added at the given
     *   position to the array.
     * @return {qx.data.Array} An array containing the removed elements.
     */
    splice : function(startIndex, amount, varargs) {},


    /**
     * Check if the given item is in the current data structure.
     *
     * @param item {var} The item which is possibly in the data structure.
     * @return {boolean} true, if the array contains the given item.
     */
    contains : function(item) {},


    /**
     * Returns the current length of the data structure.
     *
     * @return {Number} The current length of the data structure.
     */
    getLength : function() {},


    /**
     * Returns the list data as native array.
     *
     * @return {Array} The native array.
     */
    toArray: function() {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#require(qx.lang.Core)

************************************************************************ */

/**
 * Support string/array generics as introduced with JavaScript 1.6 for
 * all browsers.
 *
 * http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
 *
 * *Array*
 *
 * * join
 * * reverse
 * * sort
 * * push
 * * pop
 * * shift
 * * unshift
 * * splice
 * * concat
 * * slice
 * * indexOf
 * * lastIndexOf
 * * forEach
 * * map
 * * filter
 * * some
 * * every
 *
 * *String*
 *
 * * quote
 * * substring
 * * toLowerCase
 * * toUpperCase
 * * charAt
 * * charCodeAt
 * * indexOf
 * * lastIndexOf
 * * toLocaleLowerCase
 * * toLocaleUpperCase
 * * localeCompare
 * * match
 * * search
 * * replace
 * * split
 * * substr
 * * concat
 * * slice
 */
qx.Class.define("qx.lang.Generics",
{
  statics :
  {
    /** Which methods to map */
    __map :
    {
      "Array" : [ "join", "reverse", "sort", "push", "pop", "shift", "unshift", "splice", "concat", "slice", "indexOf", "lastIndexOf", "forEach", "map", "filter", "some", "every" ],
      "String" : [ "quote", "substring", "toLowerCase", "toUpperCase", "charAt", "charCodeAt", "indexOf", "lastIndexOf", "toLocaleLowerCase", "toLocaleUpperCase", "localeCompare", "match", "search", "replace", "split", "substr", "concat", "slice" ]
    },


    /**
     * Make a method of an object generic and return the generic functions.
     * The generic function takes as first parameter the object the method operates on.
     *
     * TODO: maybe mode this function to qx.lang.Function
     *
     * @param obj {Object} the object in which prototype the function is defined.
     * @param func {String} name of the method to wrap.
     * @return {Function} wrapped method. This function takes as first argument an
     *         instance of obj and as following arguments the arguments of the original method.
     */
    __wrap : function(obj, func)
    {
      return function(s) {
        return obj.prototype[func].apply(s, Array.prototype.slice.call(arguments, 1));
      };
    },


    /**
     * Initialize all generic functions as defined in JavaScript 1.6.
     *
     * @return {void}
     */
    __init : function()
    {
      var map = qx.lang.Generics.__map;

      for (var key in map)
      {
        var obj = window[key];
        var arr = map[key];

        for (var i=0, l=arr.length; i<l; i++)
        {
          var func = arr[i];

          if (!obj[func]) {
            obj[func] = qx.lang.Generics.__wrap(obj, func);
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin is forwarding the static methods of
 * {@link qx.data.SingleValueBinding} to the instance including the mixin.
 * The source object will be <code>this</code>.
 */
qx.Mixin.define("qx.data.MBinding",
{
  members :
  {

    /**
     * The bind method delegates the call to the
     * {@link qx.data.SingleValueBinding#bind} function. As source, the current
     * object (this) will be used.
     *
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link qx.data.SingleValueBinding#bind} for more
     *   information.
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind : function(sourcePropertyChain, targetObject, targetProperty, options)
    {
      return qx.data.SingleValueBinding.bind(
        this, sourcePropertyChain, targetObject, targetProperty, options
      );
    },


    /**
     * Removes the binding with the given id from the current object. The
     * id hast to be the id returned by any of the bind functions.
     *
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBinding: function(id){
      qx.data.SingleValueBinding.removeBindingFromObject(this, id);
    },


    /**
     * Removes all bindings from the object.
     *
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeAllBindings: function() {
      qx.data.SingleValueBinding.removeAllBindingsForObject(this);
    },


    /**
     * Returns an array which lists all bindings for the object.
     *
     * @return {Array} An array of binding informations. Every binding
     *   information is an array itself containing id, sourceObject, sourceEvent,
     *   targetObject and targetProperty in that order.
     */
    getBindings: function() {
      return qx.data.SingleValueBinding.getAllBindingsForObject(this);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (swerner)

************************************************************************ */

/**
 * Registration for all instances of qooxdoo classes. Mainly
 * used to manage them for the final shutdown sequence and to
 * use weak references when connecting widgets to DOM nodes etc.
 */
qx.Class.define("qx.core.ObjectRegistry",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Boolean} Whether the application is in the shutdown phase */
    inShutDown : false,

    /** {Map} Internal data structure to store objects */
    __registry : {},

    /** {Integer} Next new hash code. */
    __nextHash : 0,

    /** {Array} List of all free hash codes */
    __freeHashes : [],

    /** {String} Post id for hash code creation. */
    __postId : "",

    /**
     * Registers an object into the database. This adds a hashcode
     * to the object (if not already done before) and stores it under
     * this hashcode. You can access this object later using the hashcode
     * by calling {@link #fromHashCode}.
     *
     * All registered objects are automatically disposed on application
     * shutdown. Each registered object must at least have a method
     * called <code>dispose</code>.
     *
     * @param obj {Object} Any object with a dispose() method
     * @return {void}
     */
    register : function(obj)
    {
      var registry = this.__registry;
      if (!registry) {
        return;
      }

      var hash = obj.$$hash;
      if (hash == null)
      {
        // Create new hash code
        var cache = this.__freeHashes;
        if (cache.length > 0) {
          hash = cache.pop();
        } else {
          hash = (this.__nextHash++) + this.__postId;
        }

        // Store hash code
        obj.$$hash = hash;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (!obj.dispose) {
          throw new Error("Invalid object: " + obj);
        }
      }

      registry[hash] = obj;
    },


    /**
     * Removes the given object from the database.
     *
     * @param obj {Object} Any previously registered object
     * @return {void}
     */
    unregister : function(obj)
    {
      var hash = obj.$$hash;
      if (hash == null) {
        return;
      }

      var registry = this.__registry;
      if (registry && registry[hash])
      {
        delete registry[hash];
        this.__freeHashes.push(hash);
      }

      // Delete the hash code
      try
      {
        delete obj.$$hash
      }
      catch(ex)
      {
        // IE has trouble directly removing the hash
        // but it's ok with using removeAttribute
        if (obj.removeAttribute) {
          obj.removeAttribute("$$hash");
        }
      }
    },


    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @param obj {Object} the object to get the hashcode for
     * @return {String} unique identifier for the given object
     */
    toHashCode : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (obj == null) {
          throw new Error("Invalid object: " + obj);
        }
      }

      var hash = obj.$$hash;
      if (hash != null) {
        return hash;
      }

      // Create new hash code
      var cache = this.__freeHashes;
      if (cache.length > 0) {
        hash = cache.pop();
      } else {
        hash = (this.__nextHash++) + this.__postId;
      }

      // Store
      return obj.$$hash = hash;
    },


    /**
     * Clears the unique identifier on the given object.
     *
     * @param obj {Object} the object to clear the hashcode for
     */
    clearHashCode : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (obj == null) {
          throw new Error("Invalid object: " + obj);
        }
      }

      var hash = obj.$$hash;
      if (hash != null)
      {
        this.__freeHashes.push(hash);

        // Delete the hash code
        try
        {
          delete obj.$$hash
        }
        catch(ex)
        {
          // IE has trouble directly removing the hash
          // but it's ok with using removeAttribute
          if (obj.removeAttribute) {
            obj.removeAttribute("$$hash");
          }
        }
      }
    },


    /**
     * Get an object instance by its hash code as returned by {@link #toHashCode}.
     * If the object is already disposed or the hashCode is invalid,
     * <code>null</code> is returned.
     *
     * @param hash {String} The object's hash code.
     * @return {qx.core.Object} The corresponding object or <code>null</code>.
     */
    fromHashCode : function(hash) {
      return this.__registry[hash] || null;
    },


    /**
     * Disposing all registered object and cleaning up registry. This is
     * automatically executed at application shutdown.
     *
     * @return {void}
     */
    shutdown : function()
    {
      this.inShutDown = true;

      var registry = this.__registry;
      var hashes = [];

      for (var hash in registry) {
        hashes.push(hash);
      }

      // sort the objects! Remove the objecs created at startup
      // as late as possible
      hashes.sort(function(a, b) {
        return parseInt(b, 10)-parseInt(a, 10);
      });

      var obj, i=0, l=hashes.length;
      while(true)
      {
        try
        {
          for (; i<l; i++)
          {
            hash = hashes[i];
            obj = registry[hash];

            if (obj && obj.dispose) {
              obj.dispose();
            }
          }
        }
        catch(ex)
        {
          qx.Bootstrap.error(this, "Could not dispose object " + obj.toString() + ": " + ex);

          if (i !== l)
          {
            i++;
            continue;
          }
        }

        break;
      }

      qx.Bootstrap.debug(this, "Disposed " + l + " objects");

      delete this.__registry;
    },


    /**
     * Returns the object registry.
     *
     * @return {Object} The registry
     */
    getRegistry : function() {
      return this.__registry;
    }
  },

  defer : function(statics)
  {
    if (window && window.top)
    {
      var frames = window.top.frames;
      for (var i = 0; i < frames.length; i++)
      {
        if (frames[i] === window)
        {
          statics.__postId = "-" + (i + 1);
          return;
        }
      }
    }
    statics.__postId = "-0";
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Basic node creation and type detection
 */
qx.Class.define("qx.dom.Node",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      NODE TYPES
    ---------------------------------------------------------------------------
    */

    /**
     * {Map} Node type:
     *
     * * ELEMENT
     * * ATTRIBUTE
     * * TEXT
     * * CDATA_SECTION
     * * ENTITY_REFERENCE
     * * ENTITY
     * * PROCESSING_INSTRUCTION
     * * COMMENT
     * * DOCUMENT
     * * DOCUMENT_TYPE
     * * DOCUMENT_FRAGMENT
     * * NOTATION
     */
    ELEMENT                : 1,
    ATTRIBUTE              : 2,
    TEXT                   : 3,
    CDATA_SECTION          : 4,
    ENTITY_REFERENCE       : 5,
    ENTITY                 : 6,
    PROCESSING_INSTRUCTION : 7,
    COMMENT                : 8,
    DOCUMENT               : 9,
    DOCUMENT_TYPE          : 10,
    DOCUMENT_FRAGMENT      : 11,
    NOTATION               : 12,






    /*
    ---------------------------------------------------------------------------
      DOCUMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the owner document of the given node
     *
     * @param node {Node|Document|Window} the node which should be tested
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(node)
    {
      return node.nodeType === this.DOCUMENT ? node : // is document already
        node.ownerDocument || // is DOM node
        node.document; // is window
    },


    /**
     * Returns the DOM2 <code>defaultView</code> (window).
     *
     * @signature function(node)
     * @param node {Node|Document|Window} node to inspect
     * @return {Window} the <code>defaultView</code> of the given node
     */
    getWindow : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(node)
      {
        // is a window already
        if (node.nodeType == null) {
          return node;
        }

        // jump to document
        if (node.nodeType !== this.DOCUMENT) {
          node = node.ownerDocument;
        }

        // jump to window
        return node.parentWindow;
      },

      "default" : function(node)
      {
        // is a window already
        if (node.nodeType == null) {
          return node;
        }

        // jump to document
        if (node.nodeType !== this.DOCUMENT) {
          node = node.ownerDocument;
        }

        // jump to window
        return node.defaultView;
      }
    }),


    /**
     * Returns the document element. (Logical root node)
     *
     * This is a convenience attribute that allows direct access to the child
     * node that is the root element of the document. For HTML documents,
     * this is the element with the tagName "HTML".
     *
     * @param node {Node|Document|Window} node to inspect
     * @return {Element} document element of the given node
     */
    getDocumentElement : function(node) {
      return this.getDocument(node).documentElement;
    },


    /**
     * Returns the body element. (Visual root node)
     *
     * This normally only makes sense for HTML documents. It returns
     * the content area of the HTML document.
     *
     * @param node {Node|Document|Window} node to inspect
     * @return {Element} document body of the given node
     */
    getBodyElement : function(node) {
      return this.getDocument(node).body;
    },






    /*
    ---------------------------------------------------------------------------
      TYPE TESTS
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given object is a DOM node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM node
     */
    isNode : function(node) {
      return !!(node && node.nodeType != null);
    },


    /**
     * Whether the given object is a DOM element node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === this.ELEMENT);
    },


    /**
     * Whether the given object is a DOM document node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a DOM document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === this.DOCUMENT);
    },


    /**
     * Whether the given object is a DOM text node
     *
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM text node
     */
    isText : function(node) {
      return !!(node && node.nodeType === this.TEXT);
    },


    /**
     * Check whether the given object is a browser window object.
     *
     * @param obj {Object} the object which should be tested
     * @return {Boolean} true if the object is a window object
     */
    isWindow : function(obj) {
      return !!(obj && obj.history && obj.location && obj.document);
    },


    /**
     * Whether the node has the given node name
     *
     * @param node {Node} the node
     * @param nodeName {String} the node name to check for
     * @return {Boolean} Whether the node has the given node name
     */
    isNodeName : function (node, nodeName)
    {
      if(!nodeName || !node || !node.nodeName) {
        return false;
      }

      return nodeName.toLowerCase() == qx.dom.Node.getName(node);
    },



    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */


    /**
     * Get the node name as lower case string
     *
     * @param node {Node} the node
     * @return {String} the node name
     */
    getName : function (node)
    {
      if(!node || !node.nodeName) {
        return null;
      }

      return node.nodeName.toLowerCase();
    },


    /**
     * Returns the text content of an node where the node may be of node type
     * NODE_ELEMENT, NODE_ATTRIBUTE, NODE_TEXT or NODE_CDATA
     *
     * @param node {Node} the node from where the search should start.
     *     If the node has subnodes the text contents are recursively retreived and joined.
     * @return {String} the joined text content of the given node or null if not appropriate.
     * @signature function(node)
     */
    getText : function(node)
    {
      if(!node || !node.nodeType) {
        return null;
      }

      switch(node.nodeType)
      {
        case 1: // NODE_ELEMENT
          var i, a=[], nodes=node.childNodes, length=nodes.length;
          for (i=0; i<length; i++) {
            a[i] = this.getText(nodes[i]);
          };

          return a.join("");

        case 2: // NODE_ATTRIBUTE
        case 3: // NODE_TEXT
        case 4: // CDATA
          return node.nodeValue;
      }

      return null;
    },


    /**
     * Checks if the given node is a block node
     *
     * @param node {Node} Node
     * @return {Boolean} whether it is a block node
     */
    isBlockNode : function(node)
    {
      if (!qx.dom.Node.isElement(node)) {
       return false;
      }

      node = qx.dom.Node.getName(node);

      return /^(body|form|textarea|fieldset|ul|ol|dl|dt|dd|li|div|hr|p|h[1-6]|quote|pre|table|thead|tbody|tfoot|tr|td|th|iframe|address|blockquote)$/.test(node);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * Static helper functions for arrays with a lot of often used convenience
 * methods like <code>remove</code> or <code>contains</code>.
 *
 * The native JavaScript Array is not modified by this class. However,
 * there are modifications to the native Array in {@link qx.lang.Core} for
 * browsers that do not support certain JavaScript 1.6 features natively .
 *
 * The string/array generics introduced in JavaScript 1.6 are supported by
 * {@link qx.lang.Generics}.
 */
qx.Class.define("qx.lang.Array",
{
  statics :
  {
    /**
     * Converts array like constructions like the <code>argument</code> object,
     * node collections like the ones returned by <code>getElementsByTagName</code>
     * or extended array objects like <code>qx.type.BaseArray</code> to an
     * native Array instance.
     *
     * @param object {var} any array like object
     * @param offset {Integer?0} position to start from
     * @return {Array} New array with the content of the incoming object
     */
    toArray : function(object, offset) {
      return this.cast(object, Array, offset);
    },


    /**
     * Converts an array like object to any other array like
     * object.
     *
     * Attention: The returned array may be same
     * instance as the incoming one if the constructor is identical!
     *
     * @param object {var} any array-like object
     * @param constructor {Function} constructor of the new instance
     * @param offset {Integer?0} position to start from
     * @return {Array} the converted array
     */
    cast : function(object, constructor, offset)
    {
      if (object.constructor === constructor) {
        return object;
      }

      if (qx.Class.hasInterface(object, qx.data.IListData)) {
        var object = object.toArray();
      }

      // Create from given constructor
      var ret = new constructor;

      // Some collections in mshtml are not able to be sliced.
      // These lines are a special workaround for this client.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        if (object.item)
        {
          for (var i=offset||0, l=object.length; i<l; i++) {
            ret.push(object[i]);
          }

          return ret;
        }
      }

      // Copy over items
      if (Object.prototype.toString.call(object) === "[object Array]" && offset == null) {
        ret.push.apply(ret, object);
      } else {
        ret.push.apply(ret, Array.prototype.slice.call(object, offset||0));
      }

      return ret;
    },


    /**
     * Convert an arguments object into an array
     *
     * @param args {arguments} arguments object
     * @param offset {Integer?0} position to start from
     * @return {Array} a newly created array (copy) with the content of the arguments object.
     */
    fromArguments : function(args, offset) {
      return Array.prototype.slice.call(args, offset||0);
    },


    /**
     * Convert a (node) collection into an array
     *
     * @param coll {var} node collection
     * @return {Array} a newly created array (copy) with the content of the node collection.
     */
    fromCollection : function(coll)
    {
      // Some collection is mshtml are not able to be sliced.
      // This lines are a special workaround for this client.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        if (coll.item)
        {
          var arr = [];
          for (var i=0, l=coll.length; i<l; i++) {
            arr[i] = coll[i];
          }

          return arr;
        }
      }

      return Array.prototype.slice.call(coll, 0);
    },


    /**
     * Expand shorthand definition to a four element list.
     * This is an utility function for padding/margin and all other shorthand handling.
     *
     * @param input {Array} arr with one to four elements
     * @return {Array} an arr with four elements
     */
    fromShortHand : function(input)
    {
      var len = input.length;
      var result = qx.lang.Array.clone(input);

      // Copy Values (according to the length)
      switch(len)
      {
        case 1:
          result[1] = result[2] = result[3] = result[0];
          break;

        case 2:
          result[2] = result[0];
          // no break here

        case 3:
          result[3] = result[1];
      }

      // Return list with 4 items
      return result;
    },


    /**
     * Return a copy of the given array
     *
     * @param arr {Array} the array to copy
     * @return {Array} copy of the array
     */
    clone : function(arr) {
      return arr.concat();
    },


    /**
     * Insert an element at a given position into the array
     *
     * @param arr {Array} the array
     * @param obj {var} the element to insert
     * @param i {Integer} position where to insert the element into the array
     * @return {Array} the array
     */
    insertAt : function(arr, obj, i)
    {
      arr.splice(i, 0, obj);

      return arr;
    },


    /**
     * Insert an element into the array before a given second element
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 before this object
     * @return {Array} the array
     */
    insertBefore : function(arr, obj, obj2)
    {
      var i = arr.indexOf(obj2);

      if (i == -1) {
        arr.push(obj);
      } else {
        arr.splice(i, 0, obj);
      }

      return arr;
    },


    /**
     * Insert an element into the array after a given second element
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 after this object
     * @return {Array} the array
     */
    insertAfter : function(arr, obj, obj2)
    {
      var i = arr.indexOf(obj2);

      if (i == -1 || i == (arr.length - 1)) {
        arr.push(obj);
      } else {
        arr.splice(i + 1, 0, obj);
      }

      return arr;
    },


    /**
     * Remove an element from the array at the given index
     *
     * @param arr {Array} the array
     * @param i {Integer} index of the element to be removed
     * @return {var} The removed element.
     */
    removeAt : function(arr, i) {
      return arr.splice(i, 1)[0];
    },


    /**
     * Remove all elements from the array
     *
     * @param arr {Array} the array
     * @return {Array} empty array
     */
    removeAll : function(arr)
    {
      arr.length = 0;
      return this;
    },


    /**
     * Append the elements of an array to the array
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be appended to other one
     * @return {Array} The modified array.
     * @throws an exception if one of the arguments is not an array
     */
    append : function(arr1, arr2)
    {
      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert && qx.core.Assert.assertArray(arr1, "The first parameter must be an array.");
        qx.core.Assert && qx.core.Assert.assertArray(arr2, "The second parameter must be an array.");
      }

      Array.prototype.push.apply(arr1, arr2);
      return arr1;
    },


    /**
     * Modifies the first array as it removes all elements
     * which are listed in the second array as well.
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be excluded from the other one
     * @return {Array} The modified array.
     * @throws an exception if one of the arguments is not an array
     */
    exclude : function(arr1, arr2)
    {
      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert && qx.core.Assert.assertArray(arr1, "The first parameter must be an array.");
        qx.core.Assert && qx.core.Assert.assertArray(arr2, "The second parameter must be an array.");
      }

      for (var i=0, il=arr2.length, index; i<il; i++)
      {
        index = arr1.indexOf(arr2[i]);
        if (index != -1) {
          arr1.splice(index, 1);
        }
      }

      return arr1;
    },


    /**
     * Remove an element from the array
     *
     * @param arr {Array} the array
     * @param obj {var} element to be removed from the array
     * @return {var} the removed element
     */
    remove : function(arr, obj)
    {
      var i = arr.indexOf(obj);

      if (i != -1)
      {
        arr.splice(i, 1);
        return obj;
      }
    },


    /**
     * Whether the array contains the given element
     *
     * @param arr {Array} the array
     * @param obj {var} object to look for
     * @return {Boolean} whether the arr contains the element
     */
    contains : function(arr, obj) {
      return arr.indexOf(obj) !== -1;
    },


    /**
     * Check whether the two arrays have the same content. Checks only the
     * equality of the arrays' content.
     *
     * @param arr1 {Array} first array
     * @param arr2 {Array} second array
     * @return {Boolean} Whether the two arrays are equal
     */
    equals : function(arr1, arr2)
    {
      var length = arr1.length;

      if (length !== arr2.length) {
        return false;
      }

      for (var i=0; i<length; i++)
      {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }

      return true;
    },


    /**
     * Returns the sum of all values in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number} The sum of all values.
     */
    sum : function(arr)
    {
      var result = 0;
      for (var i=0, l=arr.length; i<l; i++) {
        result += arr[i];
      }

      return result;
    },


    /**
     * Returns the highest value in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The highest of all values or undefined if array is empty.
     */
    max : function(arr)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertArray(arr, "Parameter must be an array.");
      }

      var i, len=arr.length, result = arr[0];

      for (i = 1; i < len; i++)
      {
        if (arr[i] > result) {
          result = arr[i];
        }
      }

      return result === undefined ? null : result;
    },


    /**
     * Returns the lowest value in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The lowest of all values or undefined if array is empty.
     */
    min : function(arr)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertArray(arr, "Parameter must be an array.");
      }

      var i, len=arr.length, result = arr[0];

      for (i = 1; i < len; i++)
      {
        if (arr[i] < result) {
          result = arr[i];
        }
      }

      return result === undefined ? null : result;
    },


    /**
     * Recreates an array which is free of all duplicate elements from the original.
     *
     * This method do not modifies the original array!
     *
     * Keep in mind that this methods deletes undefined indexes.
     *
     * @param arr {Array} Incoming array
     * @return {Array} Returns a copy with no duplicates or the original array if no duplicates were found
     */
    unique: function(arr)
    {
      var ret=[], doneStrings={}, doneNumbers={}, doneObjects={};
      var value, count=0;
      var key = "qx" + qx.lang.Date.now();
      var hasNull=false, hasFalse=false, hasTrue=false;

      // Rebuild array and omit duplicates
      for (var i=0, len=arr.length; i<len; i++)
      {
        value = arr[i];

        // Differ between null, primitives and reference types
        if (value === null)
        {
          if (!hasNull)
          {
            hasNull = true;
            ret.push(value);
          }
        }
        else if (value === undefined)
        {
          // pass
        }
        else if (value === false)
        {
          if (!hasFalse)
          {
            hasFalse = true;
            ret.push(value);
          }
        }
        else if (value === true)
        {
          if (!hasTrue)
          {
            hasTrue = true;
            ret.push(value);
          }
        }
        else if (typeof value === "string")
        {
          if (!doneStrings[value])
          {
            doneStrings[value] = 1;
            ret.push(value);
          }
        }
        else if (typeof value === "number")
        {
          if (!doneNumbers[value])
          {
            doneNumbers[value] = 1;
            ret.push(value);
          }
        }
        else
        {
          hash = value[key]

          if (hash == null) {
            hash = value[key] = count++;
          }

          if (!doneObjects[hash])
          {
            doneObjects[hash] = value;
            ret.push(value);
          }
        }
      }

      // Clear object hashs
      for (var hash in doneObjects)
      {
        try
        {
          // TODO: The following delete seems to fail in IE7
          delete doneObjects[hash][key];
        }
        catch(ex)
        {
          try
          {
            doneObjects[hash][key] = null;
          }
          catch(ex)
          {
            throw new Error("Cannot clean-up map entry doneObjects[" + hash + "][" + key + "]");
          }
        }
      }

      return ret;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net
     Version 1.1.1

     Copyright:
       2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/* ************************************************************************

#require(qx.lang.Array)

************************************************************************ */

/**
 * Collection of helper methods operating on functions.
 */
qx.Class.define("qx.lang.Function",
{
  statics :
  {
    /**
     * Extract the caller of a function from the arguments variable.
     * This will not work in Opera.
     *
     * @param args {arguments} The local arguments variable
     * @return {Function} A reference to the calling function or "undefined" if caller is not supported.
     */
    getCaller : function(args) {
      return args.caller ? args.caller.callee : args.callee.caller;
    },


    /**
     * Try to get a sensible textual description of a function object.
     * This may be the class/mixin and method name of a function
     * or at least the signature of the function.
     *
     * @param fcn {Function} function the get the name for.
     * @return {String} Name of the function.
     */
    getName : function(fcn)
    {
      if (fcn.displayName) {
        return fcn.displayName;
      }

      if (fcn.$$original || fcn.wrapper || fcn.classname) {
        return fcn.classname + ".constructor()";
      }

      if (fcn.$$mixin)
      {
        //members
        for(var key in fcn.$$mixin.$$members)
        {
          if (fcn.$$mixin.$$members[key] == fcn) {
            return fcn.$$mixin.name + ".prototype." + key + "()";
          }
        }

        // statics
        for(var key in fcn.$$mixin)
        {
          if (fcn.$$mixin[key] == fcn) {
            return fcn.$$mixin.name + "." + key + "()";
          }
        }
      }

      if (fcn.self)
      {
        var clazz = fcn.self.constructor;
        if (clazz)
        {
          // members
          for(var key in clazz.prototype)
          {
            if (clazz.prototype[key] == fcn) {
              return clazz.classname + ".prototype." + key + "()";
            }
          }
          // statics
          for(var key in clazz)
          {
            if (clazz[key] == fcn) {
              return clazz.classname + "." + key + "()";
            }
          }
        }
      }

      var fcnReResult = fcn.toString().match(/function\s*(\w*)\s*\(.*/);
      if (fcnReResult && fcnReResult.length >= 1 && fcnReResult[1]) {
        return fcnReResult[1] + "()";
      }

      return 'anonymous()';
    },


    /**
     * Evaluates JavaScript code globally
     *
     * @lint ignoreDeprecated(eval)
     *
     * @param data {String} JavaScript commands
     * @return {var} Result of the execution
     */
    globalEval : function(data)
    {
      if (window.execScript) {
        return window.execScript(data);
      } else {
        return eval.call(window, data);
      }
    },


    /**
     * empty function
     */
    empty : function() {},


    /**
     * Simply return true.
     *
     * @return {Boolean} Always returns true.
     */
    returnTrue : function() {
      return true;
    },


    /**
     * Simply return false.
     *
     * @return {Boolean} Always returns false.
     */
    returnFalse : function() {
      return false;
    },


    /**
     * Simply return null.
     *
     * @return {var} Always returns null.
     */
    returnNull : function() {
      return null;
    },


    /**
     * Return "this".
     *
     * @return {Object} Always returns "this".
     */
    returnThis : function() {
      return this;
    },


    /**
     * Simply return 0.
     *
     * @return {Number} Always returns 0.
     */
    returnZero : function() {
      return 0;
    },


    /**
     * Base function for creating functional closures which is used by most other methods here.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var createdFunction = qx.lang.Function.create(myFunction, [options]);</pre>
     *
     * @param func {Function} Original function to wrap
     * @param options? {Map} Map of options
     * <ul>
     * <li><strong>self</strong>: The object that the "this" of the function will refer to. Default is the same as the wrapper function is called.</li>
     * <li><strong>args</strong>: An array of arguments that will be passed as arguments to the function when called.
     *     Default is no custom arguments; the function will receive the standard arguments when called.</li>
     * <li><strong>delay</strong>: If set, the returned function will delay the actual execution by this amount of milliseconds and return a timer handle when called.
     *     Default is no delay.</li>
     * <li><strong>periodical</strong>: If set the returned function will periodically perform the actual execution with this specified interval
     *      and return a timer handle when called. Default is no periodical execution.</li>
     * <li><strong>attempt</strong>: If set to true, the returned function will try to execute and return either the results or false on error. Default is false.</li>
     * </ul>
     *
     * @return {Function} Wrapped function
     */
    create : function(func, options)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertFunction(func, "Invalid parameter 'func'.");
      }

      // Nothing to be done when there are no options.
      if (!options) {
        return func;
      }

      // Check for at least one attribute.
      if (!(options.self || options.args || options.delay != null || options.periodical != null || options.attempt)) {
        return func;
      }

      return function(event)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (options.self instanceof qx.core.Object)
          {
            qx.core.Assert && qx.core.Assert.assertFalse(
              options.self.isDisposed(),
              "Trying to call a bound function with a disposed object as context: " + options.self.toString() + " :: " + qx.lang.Function.getName(func)
            );
          }
        }

        // Convert (and copy) incoming arguments
        var args = qx.lang.Array.fromArguments(arguments);

        // Prepend static arguments
        if (options.args) {
          args = options.args.concat(args);
        }

        if (options.delay || options.periodical)
        {
          var returns = qx.event.GlobalError.observeMethod(function() {
            return func.apply(options.self||this, args);
          });

          if (options.delay) {
            return window.setTimeout(returns, options.delay);
          }

          if (options.periodical) {
            return window.setInterval(returns, options.periodical);
          }
        }
        else if (options.attempt)
        {
          var ret = false;

          try {
            ret = func.apply(options.self||this, args);
          } catch(ex) {}

          return ret;
        }
        else
        {
          return func.apply(options.self||this, args);
        }
      };
    },


    /**
     * Returns a function whose "this" is altered.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.bind(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction()
     * {
     *   this.setStyle('color', 'red');
     *   // note that 'this' here refers to myFunction, not an element
     *   // we'll need to bind this function to the element we want to alter
     * };
     *
     * var myBoundFunction = qx.lang.Function.bind(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * If you find yourself using this static method a lot, you may be
     * interested in the bindTo() method in the mixin qx.core.MBindTo.
     *
     * @see qx.core.MBindTo
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Function} The bound function.
     */
    bind : function(func, self, varargs)
    {
      return this.create(func,
      {
        self  : self,
        args  : arguments.length > 2 ? qx.lang.Array.fromArguments(arguments, 2) : null
      });
    },


    /**
     * Returns a function whose arguments are pre-configured.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.curry(myFunction, [varargs...]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * function myFunction(elem) {
     *   elem.setStyle('color', 'red');
     * };
     *
     * var myBoundFunction = qx.lang.Function.curry(myFunction, myElement);
     * myBoundFunction(); // this will make the element myElement red.
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param varargs {arguments} The arguments to pass to the function.
     * @return {var} The pre-configured function.
     */
    curry : function(func, varargs)
    {
      return this.create(func, {
        args  : arguments.length > 1 ? qx.lang.Array.fromArguments(arguments, 1) : null
      });
    },


    /**
     * Returns a function which could be used as a listener for a native event callback.
     *
     * *Syntax*
     *
     * <pre class='javascript'>qx.lang.Function.listener(myFunction, [self, [varargs...]]);</pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {var} The bound function.
     */
    listener : function(func, self, varargs)
    {
      if (arguments.length < 3)
      {
        return function(event)
        {
          // Directly execute, but force first parameter to be the event object.
          return func.call(self||this, event||window.event);
        }
      }
      else
      {
        var optargs = qx.lang.Array.fromArguments(arguments, 2);

        return function(event)
        {
          var args = [event||window.event];

          // Append static arguments
          args.push.apply(args, optargs);

          // Finally execute original method
          func.apply(self||this, args);
        };
      }
    },


    /**
     * Tries to execute the function.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var result = qx.lang.Function.attempt(myFunction, [self, [varargs...]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myObject = {
     *   'cow': 'moo!'
     * };
     *
     * var myFunction = function()
     * {
     *   for(var i = 0; i < arguments.length; i++) {
     *     if(!this[arguments[i]]) throw('doh!');
     *   }
     * };
     *
     * var result = qx.lang.Function.attempt(myFunction, myObject, 'pig', 'cow'); // false
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Boolean|var} <code>false</code> if an exception is thrown, else the function's return.
     */
    attempt : function(func, self, varargs)
    {
      return this.create(func,
      {
        self    : self,
        attempt : true,
        args    : arguments.length > 2 ? qx.lang.Array.fromArguments(arguments, 2) : null
      })();
    },


    /**
     * Delays the execution of a function by a specified duration.
     *
     * *Syntax*
     *
     * <pre class='javascript'>var timeoutID = qx.lang.Function.delay(myFunction, [delay, [self, [varargs...]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var myFunction = function(){ alert('moo! Element id is: ' + this.id); };
     * //wait 50 milliseconds, then call myFunction and bind myElement to it
     * qx.lang.Function.delay(myFunction, 50, myElement); // alerts: 'moo! Element id is: ... '
     *
     * // An anonymous function, example
     * qx.lang.Function.delay(function(){ alert('one second later...'); }, 1000); //wait a second and alert
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param delay {Integer} The duration to wait (in milliseconds).
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Integer} The JavaScript Timeout ID (useful for clearing delays).
     */
    delay : function(func, delay, self, varargs)
    {
      return this.create(func,
      {
        delay : delay,
        self  : self,
        args  : arguments.length > 3 ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    },


    /**
     * Executes a function in the specified intervals of time
     *
     * *Syntax*
     *
     * <pre class='javascript'>var intervalID = qx.lang.Function.periodical(myFunction, [period, [self, [varargs...]]]);</pre>
     *
     * *Example*
     *
     * <pre class='javascript'>
     * var Site = { counter: 0 };
     * var addCount = function(){ this.counter++; };
     * qx.lang.Function.periodical(addCount, 1000, Site); // will add the number of seconds at the Site
     * </pre>
     *
     * @param func {Function} Original function to wrap
     * @param interval {Integer} The duration of the intervals between executions.
     * @param self {Object ? null} The object that the "this" of the function will refer to.
     * @param varargs {arguments ? null} The arguments to pass to the function.
     * @return {Integer} The Interval ID (useful for clearing a periodical).
     */
    periodical : function(func, interval, self, varargs)
    {
      return this.create(func,
      {
        periodical : interval,
        self       : self,
        args       : arguments.length > 3 ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Alexander Steitz (aback)
     * Christian Hagendorn (chris_schmidt)

   ======================================================================

   This class contains code based on the following work:

   * Juriy Zaytsev
     http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/

     Copyright (c) 2009 Juriy Zaytsev

     Licence:
       BSD: http://github.com/kangax/iseventsupported/blob/master/LICENSE

     ----------------------------------------------------------------------

     http://github.com/kangax/iseventsupported/blob/master/LICENSE

     Copyright (c) 2009 Juriy Zaytsev

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without
     restriction, including without limitation the rights to use,
     copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following
     conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     OTHER DEALINGS IN THE SOFTWARE.

************************************************************************ */

/**
 * Wrapper around native event management capabilities of the browser.
 * This class should not be used directly normally. It's better
 * to use {@link qx.event.Registration} instead.
 */
qx.Class.define("qx.bom.Event",
{
  statics :
  {
    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes.
     *
     * Use this with caution. This is only thought for event handlers and
     * qualified developers. These are not mem-leak protected!
     *
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @param useCapture {Boolean ? false} A Boolean value that specifies the event phase to add
     *    the event handler for the capturing phase or the bubbling phase.
     */
    addNativeListener : function(target, type, listener, useCapture)
    {
      if (target.addEventListener) {
        target.addEventListener(type, listener, !!useCapture);
      } else if (target.attachEvent) {
        target.attachEvent("on" + type, listener);
      } else if (typeof target["on" + type] != "undefined") {
        target["on" + type] = listener;
      } else {
        if (qx.core.Environment.get("qx.debug")) {
          this.warn("No method available to add native listener to " + target);
        }
      }
    },


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes.
     *
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @param useCapture {Boolean ? false} A Boolean value that specifies the event phase to remove
     *    the event handler for the capturing phase or the bubbling phase.
     */
    removeNativeListener : function(target, type, listener, useCapture)
    {
      if (target.removeEventListener)
      {
        target.removeEventListener(type, listener, !!useCapture);
      }
      else if (target.detachEvent)
      {
        try {
          target.detachEvent("on" + type, listener);
        }
        catch(e)
        {
          // IE7 sometimes dispatches "unload" events on protected windows
          // Ignore the "permission denied" errors.
          if(e.number !== -2146828218) {
            throw e;
          };
        }
      }
      else if (typeof target["on" + type] != "undefined")
      {
        target["on" + type] = null;
      } 
      else
      {
        if (qx.core.Environment.get("qx.debug")) {
          this.warn("No method available to remove native listener from " + target);
        }
      }
    },


    /**
     * Returns the target of the event.
     *
     * @param e {Event} Native event object
     * @return {Object} Any valid native event target
     */
    getTarget : function(e) {
      return e.target || e.srcElement;
    },


    /**
     * Computes the related target from the native DOM event
     *
     * @param e {Event} Native DOM event object
     * @return {Element} The related target
     */
    getRelatedTarget : function(e)
    {
      if (e.relatedTarget !== undefined)
      {
        // In Firefox the related target of mouse events is sometimes an
        // anonymous div inside of a text area, which raises an exception if
        // the nodeType is read. This is why the try/catch block is needed.
        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          try {
            e.relatedTarget && e.relatedTarget.nodeType;
          } catch (e) {
            return null;
          }
        }

        return e.relatedTarget;
      }
      else if (e.fromElement !== undefined && e.type === "mouseover") {
        return e.fromElement;
      } else if (e.toElement !== undefined) {
        return e.toElement;
      } else {
        return null;
      }
    },


    /**
     * Prevent the native default of the event to be processed.
     *
     * This is useful to stop native keybindings, native selection
     * and other native functionality behind events.
     *
     * @param e {Event} Native event object
     */
    preventDefault : function(e)
    {
      if (e.preventDefault)
      {
        // Firefox 3 does not fire a "contextmenu" event if the mousedown
        // called "preventDefault" => don't prevent the default behavior for
        // right clicks.
        if ((qx.core.Environment.get("engine.name") == "gecko") &&
            parseFloat(qx.core.Environment.get("engine.version")) >= 1.9 &&
            e.type == "mousedown" &&
            e.button == 2) {
          return;
        }

        e.preventDefault();

        // not working in firefox 3 and above
        if ((qx.core.Environment.get("engine.name") == "gecko") &&
            parseFloat(qx.core.Environment.get("engine.version")) < 1.9)
        {
          try
          {
            // this allows us to prevent some key press events in Firefox.
            // See bug #1049
            e.keyCode = 0;
          } catch(ex) {}
        }
      }
      else
      {
        try
        {
          // this allows us to prevent some key press events in IE.
          // See bug #1049
          e.keyCode = 0;
        } catch(ex) {}

        e.returnValue = false;
      }
    },


    /**
     * Stops the propagation of the given event to the parent element.
     *
     * Only useful for events which bubble e.g. mousedown.
     *
     * @param e {Event} Native event object
     */
    stopPropagation : function(e)
    {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
    },


    /**
     * Fires a synthetic native event on the given element.
     *
     * @param target {Element} DOM element to fire event on
     * @param type {String} Name of the event to fire
     * @return {Boolean} A value that indicates whether any of the event handlers called {@link #preventDefault}.
     *  <code>true</code> The default action is permitted, <code>false</code> the caller should prevent the default action.
     */
    fire : function(target, type)
    {
      // dispatch for standard first
      if (document.createEvent)
      {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, true, true);

        return !target.dispatchEvent(evt);
      }

      // dispatch for IE
      else
      {
        var evt = document.createEventObject();
        return target.fireEvent("on" + type, evt);
      }
    },


    /**
     * Whether the given target supports the given event type.
     *
     * Useful for testing for support of new features like
     * touch events, gesture events, orientation change, on/offline, etc.
     *
     * @signature function(target, type)
     * @param target {var} Any valid target e.g. window, dom node, etc.
     * @param type {String} Type of the event e.g. click, mousedown
     * @return {Boolean} Whether the given event is supported
     */
    supportsEvent : qx.core.Environment.select("engine.name",
    {
      "webkit" : function(target, type) {
        return target.hasOwnProperty("on" + type);
      },

      "default" : function(target, type)
      {
        var eventName = "on" + type;

        var supportsEvent = (eventName in target);

        if (!supportsEvent)
        {
          supportsEvent = typeof target[eventName] == "function";

          if (!supportsEvent && target.setAttribute)
          {
            target.setAttribute(eventName, "return;");
            supportsEvent = typeof target[eventName] == "function";

            target.removeAttribute(eventName);
          }
        }

        return supportsEvent;
      }
    })
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#require(qx.bom.Event)

************************************************************************ */

/**
 * Wrapper for browser DOM event handling for each browser window/frame.
 */
qx.Class.define("qx.event.Manager",
{
  extend : Object,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of the event handler.
   *
   * @param win {Window} The DOM window this manager handles the events for
   * @param registration {qx.event.Registration} The event registration to use
   */
  construct : function(win, registration)
  {
    // Assign window object
    this.__window = win;
    this.__windowId = qx.core.ObjectRegistry.toHashCode(win);
    this.__registration = registration;

    // Register to the page unload event.
    // Only for iframes and other secondary documents.
    if (win.qx !== qx)
    {
      var self = this;
      qx.bom.Event.addNativeListener(win, "unload", qx.event.GlobalError.observeMethod(function()
      {
        qx.bom.Event.removeNativeListener(win, "unload", arguments.callee);
        self.dispose();
      }));
    }

    // Registry for event listeners
    this.__listeners = {};

    // The handler and dispatcher instances
    this.__handlers = {};
    this.__dispatchers = {};

    this.__handlerCache = {};
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Last used ID for an event */
    __lastUnique : 0,


    /**
     * Returns an unique ID which may be used in combination with a target and
     * a type to identify an event entry.
     *
     * @return {String} The next free identifier (auto-incremented)
     */
    getNextUniqueId : function() {
      return (this.__lastUnique++) + "";
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __registration : null,
    __listeners : null,

    __dispatchers : null,
    __disposeWrapper : null,

    __handlers : null,
    __handlerCache : null,
    __window : null,
    __windowId : null,


    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */


    /**
     * Get the window instance the event manager is responsible for
     *
     * @return {Window} DOM window instance
     */
    getWindow : function() {
      return this.__window;
    },


    /**
     * Get the hashcode of the manager's window
     *
     * @return {String} The window's hashcode
     */
    getWindowId : function() {
      return this.__windowId;
    },


    /**
     * Returns an instance of the given handler class for this manager(window).
     *
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getHandler : function(clazz)
    {
      var handler = this.__handlers[clazz.classname];

      if (handler) {
        return handler;
      }

      return this.__handlers[clazz.classname] = new clazz(this);
    },


    /**
     * Returns an instance of the given dispatcher class for this manager(window).
     *
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getDispatcher : function(clazz)
    {
      var dispatcher = this.__dispatchers[clazz.classname];

      if (dispatcher) {
        return dispatcher;
      }

      return this.__dispatchers[clazz.classname] = new clazz(this, this.__registration);
    },



    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER MANAGEMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Get a copy of all event listeners for the given combination
     * of target, event type and phase.
     *
     * This method is especially useful and for event handlers to
     * to query the listeners registered in the manager.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type
     * @param capture {Boolean ? false} Whether the listener is for the
     *       capturing phase of the bubbling phase.
     * @return {Array | null} Array of registered event handlers. May return
     *       null when no listener were found.
     */
    getListeners : function(target, type, capture)
    {
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return null;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      return entryList ? entryList.concat() : null;
    },


    /**
     * Returns all registered listeners.
     * 
     * @internal
     * 
     * @return {Map} All registered listeners. The key is the hash code form an object.
     */
    getAllListeners : function() {
      return this.__listeners;
    },


    /**
     * Returns a serialized array of all events attached on the given target.
     *
     * @param target {Object} Any valid event target
     * @return {Map[]} Array of maps where everyone contains the keys:
     *   <code>handler</code>, <code>self</code>, <code>type</code> and <code>capture</code>.
     */
    serializeListeners : function(target)
    {
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];
      var result = [];

      if (targetMap)
      {
        var indexOf, type, capture, entryList, entry;
        for (var entryKey in targetMap)
        {
          indexOf = entryKey.indexOf("|");
          type = entryKey.substring(0, indexOf);
          capture = entryKey.charAt(indexOf+1) == "c";
          entryList = targetMap[entryKey];

          for (var i=0, l=entryList.length; i<l; i++)
          {
            entry = entryList[i];
            result.push(
            {
              self: entry.context,
              handler: entry.handler,
              type: type,
              capture: capture
            });
          }
        }
      }

      return result;
    },


    /**
     * This method might be used to temporally remove all events
     * directly attached to the given target. This do not work
     * have any effect on bubbling events normally.
     *
     * This is mainly thought for detaching events in IE, before
     * cloning them. It also removes all leak scenarios
     * when unloading a document and may be used here as well.
     *
     * @internal
     * @param target {Object} Any valid event target
     * @param enable {Boolean} Whether to enable or disable the events
     */
    toggleAttachedEvents : function(target, enable)
    {
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (targetMap)
      {
        var indexOf, type, capture, entryList;
        for (var entryKey in targetMap)
        {
          indexOf = entryKey.indexOf("|");
          type = entryKey.substring(0, indexOf);
          capture = entryKey.charCodeAt(indexOf+1) === 99; // checking for character "c".
          entryList = targetMap[entryKey];

          if (enable) {
            this.__registerAtHandler(target, type, capture);
          } else {
            this.__unregisterAtHandler(target, type, capture);
          }
        }
      }
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListener : function(target, type, capture)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (target == null)
        {
          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + target);
        }
      }

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return false;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      return !!(entryList && entryList.length > 0);
    },


    /**
     * Imports a list of event listeners at once. This only
     * works for newly created elements as it replaces
     * all existing data structures.
     *
     * Works with a map of data. Each entry in this map should be a
     * map again with the keys <code>type</code>, <code>listener</code>,
     * <code>self</code>, <code>capture</code> and an optional <code>unique</code>.
     *
     * The values are identical to the parameters of {@link #addListener}.
     * For details please have a look there.
     *
     * @param target {Object} Any valid event target
     * @param list {Map} A map where every listener has an unique key.
     * @return {void}
     */
    importListeners : function(target, list)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (target == null)
        {
          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + target);
        }
      }

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey] = {};
      var clazz = qx.event.Manager;

      for (var listKey in list)
      {
        var item = list[listKey];

        var entryKey = item.type + (item.capture ? "|capture" : "|bubble");
        var entryList = targetMap[entryKey];

        if (!entryList)
        {
          entryList = targetMap[entryKey] = [];

          // This is the first event listener for this type and target
          // Inform the event handler about the new event
          // they perform the event registration at DOM level if needed
          this.__registerAtHandler(target, item.type, item.capture);
        }

        // Append listener to list
        entryList.push(
        {
          handler : item.listener,
          context : item.self,
          unique : item.unique || (clazz.__lastUnique++) + ""
        });
      }
    },


    /**
     * Add an event listener to any valid target. The event listener is passed an
     * instance of {@link qx.event.type.Event} containing all relevant information
     * about the event as parameter.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque ID, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     * @throws an error if the parameters are wrong
     */
    addListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var msg = "Failed to add event listener for type '"+ type +"'" +
          " to the target '" + target.classname + "': ";

        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(type, msg + "Invalid event type.");
        qx.core.Assert.assertFunction(listener, msg + "Invalid callback function");

        if (capture !== undefined) {
          qx.core.Assert.assertBoolean(capture, "Invalid capture flag.");
        }
      }

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        targetMap = this.__listeners[targetKey] = {};
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      if (!entryList) {
        entryList = targetMap[entryKey] = [];
      }

      // This is the first event listener for this type and target
      // Inform the event handler about the new event
      // they perform the event registration at DOM level if needed
      if (entryList.length === 0) {
        this.__registerAtHandler(target, type, capture);
      }

      // Append listener to list
      var unique = (qx.event.Manager.__lastUnique++) + "";
      var entry =
      {
        handler : listener,
        context : self,
        unique : unique
      };

      entryList.push(entry);

      return entryKey + "|" + unique;
    },


    /**
     * Get the event handler class matching the given event target and type
     *
     * @param target {var} The event target
     * @param type {String} The event type
     * @return {qx.event.IEventHandler|null} The best matching event handler or
     *     <code>null</code>.
     */
    findHandler : function(target, type)
    {
      var isDomNode=false, isWindow=false, isObject=false, isDocument = false;
      var key;

      if (target.nodeType === 1)
      {
        isDomNode = true;
        key = "DOM_" + target.tagName.toLowerCase() + "_" + type;
      } else if (target.nodeType === 9) {
        isDocument = true;
        key = "DOCUMENT_" + type;
      }

      // Please note:
      // Identical operator does not work in IE (as of version 7) because
      // document.parentWindow is not identical to window. Crazy stuff.
      else if (target == this.__window)
      {
        isWindow = true;
        key = "WIN_" + type;
      }
      else if (target.classname)
      {
        isObject = true;
        key = "QX_" + target.classname + "_" + type;
      }
      else
      {
        key = "UNKNOWN_" + target + "_" + type;
      }


      var cache = this.__handlerCache;
      if (cache[key]) {
        return cache[key];
      }


      var classes = this.__registration.getHandlers();
      var IEventHandler = qx.event.IEventHandler;
      var clazz, instance, supportedTypes, targetCheck;

      for (var i=0, l=classes.length; i<l; i++)
      {
        clazz = classes[i];

        // shortcut type check
        supportedTypes = clazz.SUPPORTED_TYPES;
        if (supportedTypes && !supportedTypes[type]) {
          continue;
        }

        // shortcut target check
        targetCheck = clazz.TARGET_CHECK;
        if (targetCheck)
        {
          // use bitwise & to compare for the bitmask!
          var found = false;
          if (isDomNode && ((targetCheck & IEventHandler.TARGET_DOMNODE) != 0)) {
            found = true;
          } else if (isWindow && ((targetCheck & IEventHandler.TARGET_WINDOW) != 0)) {
            found = true;
          } else if (isObject && ((targetCheck & IEventHandler.TARGET_OBJECT) != 0)) {
            found = true;
          } else if (isDocument && ((targetCheck & IEventHandler.TARGET_DOCUMENT) != 0)) {
            found = true;
          }

          if (!found) {
            continue;
          }
        }

        instance = this.getHandler(classes[i]);
        if (clazz.IGNORE_CAN_HANDLE || instance.canHandleEvent(target, type))
        {
          cache[key] = instance;
          return instance;
        }
      }

      return null;
    },


    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     * @throws an error if there is no handler for the event
     */
    __registerAtHandler : function(target, type, capture)
    {
      var handler = this.findHandler(target, type);

      if (handler)
      {
        handler.registerEvent(target, type, capture);
        return;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        qx.log.Logger.warn(
          this,
          "There is no event handler for the event '" + type +
          "' on target '" + target + "'!"
        );
      }
    },


    /**
     * Remove an event listener from an event target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean ? false} Whether to remove the event listener of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed successfully (was existend)
     * @throws an error if the parameters are wrong
     */
    removeListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var msg = "Failed to remove event listener for type '" + type + "'" +
          " from the target '" + target.classname + "': ";

        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(type, msg + "Invalid event type.");
        qx.core.Assert.assertFunction(listener, msg + "Invalid callback function");

        if (self !== undefined) {
          qx.core.Assert.assertObject(self, "Invalid context for callback.")
        }

        if (capture !== undefined) {
          qx.core.Assert.assertBoolean(capture, "Invalid capture flag.");
        }
      }

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return false;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      if (!entryList) {
        return false;
      }

      var entry;
      for (var i=0, l=entryList.length; i<l; i++)
      {
        entry = entryList[i];

        if (entry.handler === listener && entry.context === self)
        {
          qx.lang.Array.removeAt(entryList, i);

          if (entryList.length == 0) {
            this.__unregisterAtHandler(target, type, capture);
          }

          return true;
        }
      }

      return false;
    },


    /**
     * Removes an event listener from an event target by an ID returned by
     * {@link #addListener}.
     *
     * @param target {Object} The event target
     * @param id {String} The ID returned by {@link #addListener}
     */
    removeListenerById : function(target, id)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var msg = "Failed to remove event listener for id '" + id + "'" +
          " from the target '" + target.classname + "': ";

        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(id, msg + "Invalid id type.");
      }

      var split = id.split("|");
      var type = split[0];
      var capture = split[1].charCodeAt(0) == 99; // detect leading "c"
      var unique = split[2];

      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return false;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      if (!entryList) {
        return false;
      }

      var entry;
      for (var i=0, l=entryList.length; i<l; i++)
      {
        entry = entryList[i];

        if (entry.unique === unique)
        {
          qx.lang.Array.removeAt(entryList, i);

          if (entryList.length == 0) {
            this.__unregisterAtHandler(target, type, capture);
          }

          return true;
        }
      }

      return false;
    },


    /**
     * Remove all event listeners, which are attached to the given event target.
     *
     * @param target {Object} The event target to remove all event listeners from.
     * @return {Boolean} Whether the events were existend and were removed successfully.
     */
    removeAllListeners : function(target)
    {
      var targetKey = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];
      if (!targetMap) {
        return false;
      }

      // Deregister from event handlers
      var split, type, capture;
      for (var entryKey in targetMap)
      {
        if (targetMap[entryKey].length > 0)
        {
          // This is quite expensive, see bug #1283
          split = entryKey.split("|");

          type = split[0];
          capture = split[1] === "capture";

          this.__unregisterAtHandler(target, type, capture);
        }
      }

      delete this.__listeners[targetKey];
      return true;
    },


    /**
     * Internal helper for deleting the internal listener  data structure for
     * the given targetKey.
     *
     * @param targetKey {String} Hash code for the object to delete its
     *   listeners.
     *
     * @internal
     */
    deleteAllListeners : function(targetKey) {
      delete this.__listeners[targetKey];
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     * @throws an error if there is no handler for the event
     */
    __unregisterAtHandler : function(target, type, capture)
    {
      var handler = this.findHandler(target, type);

      if (handler)
      {
        handler.unregisterEvent(target, type, capture);
        return;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        qx.log.Logger.warn(
          this,
          "There is no event handler for the event '" + type +
          "' on target '" + target + "'!"
        );
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatches an event object using the qooxdoo event handler system. The
     * event will only be visible in event listeners attached using
     * {@link #addListener}. After dispatching the event object will be pooled
     * for later reuse or disposed.
     *
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *     object must be obtained using {@link qx.event.Registration#createEvent}
     *     and initialized using {@link qx.event.type.Event#init}.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @throws an error if there is no dispatcher for the event
     */
    dispatchEvent : function(target, event)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var msg = "Could not dispatch event '" + event + "' on target '" + target.classname +"': ";

        qx.core.Assert.assertNotUndefined(target, msg + "Invalid event target.")
        qx.core.Assert.assertNotNull(target, msg + "Invalid event target.")
        qx.core.Assert.assertInstance(event, qx.event.type.Event, msg + "Invalid event object.");
      }

      // Preparations
      var type = event.getType();

      if (!event.getBubbles() && !this.hasListener(target, type))
      {
        qx.event.Pool.getInstance().poolObject(event);
        return true;
      }

      if (!event.getTarget()) {
        event.setTarget(target);
      }

      // Interation data
      var classes = this.__registration.getDispatchers();
      var instance;

      // Loop through the dispatchers
      var dispatched = false;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getDispatcher(classes[i]);

        // Ask if the dispatcher can handle this event
        if (instance.canDispatchEvent(target, event, type))
        {
          instance.dispatchEvent(target, event, type);
          dispatched = true;
          break;
        }
      }

      if (!dispatched)
      {
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.error(this, "No dispatcher can handle event of type " + type + " on " + target);
        }
        return true;
      }

      // check whether "preventDefault" has been called
      var preventDefault = event.getDefaultPrevented();

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(event);

      return !preventDefault;
    },


    /**
     * Dispose the event manager
     */
    dispose : function()
    {
      // Remove from manager list
      this.__registration.removeManager(this);

      qx.util.DisposeUtil.disposeMap(this, "__handlers");
      qx.util.DisposeUtil.disposeMap(this, "__dispatchers");

      // Dispose data fields
      this.__listeners = this.__window = this.__disposeWrapper = null;
      this.__registration = this.__handlerCache = null;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#require(qx.event.Manager)
#require(qx.dom.Node)
#require(qx.lang.Function)

************************************************************************ */

/**
 * Wrapper for browser generic event handling.
 *
 * Supported events differ from target to target. Generally the handlers
 * in {@link qx.event.handler} defines the available features.
 *
 */
qx.Class.define("qx.event.Registration",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Static list of all instantiated event managers. The key is the qooxdoo
     * hash value of the corresponding window
     */
    __managers : {},


    /**
     * Get an instance of the event manager, which can handle events for the
     * given target.
     *
     * @param target {Object} Any valid event target
     * @return {qx.event.Manager} The event manger for the target.
     */
    getManager : function(target)
    {
      if (target == null)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          qx.log.Logger.error("qx.event.Registration.getManager(null) was called!");
          qx.log.Logger.trace(this);
        }

        target = window;
      }
      else if (target.nodeType)
      {
        target = qx.dom.Node.getWindow(target);
      }
      else if (!qx.dom.Node.isWindow(target))
      {
        target = window;
      }

      var hash = target.$$hash || qx.core.ObjectRegistry.toHashCode(target);
      var manager = this.__managers[hash];

      if (!manager)
      {
        manager = new qx.event.Manager(target, this);
        this.__managers[hash] = manager;
      }

      return manager;
    },


    /**
     * Removes a manager for a specific window from the list.
     *
     * Normally only used when the manager gets disposed through
     * an unload event of the attached window.
     *
     * @param mgr {qx.event.Manager} The manager to remove
     * @return {void}
     */
    removeManager : function(mgr)
    {
      var id = mgr.getWindowId();
      delete this.__managers[id];
    },


    /**
     * Add an event listener to a DOM target. The event listener is passed an
     * instance of {@link qx.event.type.Event} containing all relevant information
     * about the event as parameter.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {var} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(target, type, listener, self, capture) {
      return this.getManager(target).addListener(target, type, listener, self, capture);
    },


    /**
     * Remove an event listener from an event target.
     *
     * Note: All registered event listeners will automatically at page unload
     *   so it is not necessary to detach events in the destructor.
     *
     * @param target {Object} The event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean} Whether to remove the event listener of
     *    the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed. Return <code>false</code> if
     *    the event was already removed before.
     */
    removeListener : function(target, type, listener, self, capture) {
      return this.getManager(target).removeListener(target, type, listener, self, capture);
    },


    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param target {Object} The event target
     * @param id {var} The id returned by {@link #addListener}
     * @return {Boolean} Whether the event was removed. Return <code>false</code> if
     *    the event was already removed before.
     */
    removeListenerById : function(target, id) {
      return this.getManager(target).removeListenerById(target, id);
    },


    /**
     * Remove all event listeners, which are attached to the given event target.
     *
     * @param target {Object} The event target to remove all event listeners from.
     * @return {Boolean} Whether the events were existend and were removed successfully.
     */
    removeAllListeners : function(target) {
      return this.getManager(target).removeAllListeners(target);
    },


    /**
     * Internal helper for deleting the listeners map used during shutdown.
     *
     * @param target {Object} The event target to delete the internal map for
     *    all event listeners.
     *
     * @internal
     */
    deleteAllListeners : function(target) {
      var targetKey = target.$$hash;
      if (targetKey) {
        this.getManager(target).deleteAllListeners(targetKey);
      }
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListener : function(target, type, capture) {
      return this.getManager(target).hasListener(target, type, capture);
    },


    /**
     * Returns a serialized array of all events attached on the given target.
     *
     * @param target {Object} Any valid event target
     * @return {Map[]} Array of maps where everyone contains the keys:
     *   <code>handler</code>, <code>self</code>, <code>type</code> and <code>capture</code>.
     */
    serializeListeners : function(target) {
      return this.getManager(target).serializeListeners(target);
    },


    /**
     * Get an event instance of the given class, which can be dispatched using
     * an event manager. The created events must be initialized using
     * {@link qx.event.type.Event#init}.
     *
     * @param type {String} The type of the event to create
     * @param clazz {Object?qx.event.type.Event} The event class to use
     * @param args {Array?null} Array which will be passed to
     *       the event's init method.
     * @return {qx.event.type.Event} An instance of the given class.
     */
    createEvent : function(type, clazz, args)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (arguments.length > 1 && clazz === undefined) {
          throw new Error("Create event of type " + type + " with undefined class. Please use null to explicit fallback to default event type!");
        }
      }

      // Fallback to default
      if (clazz == null) {
        clazz = qx.event.type.Event;
      }

      var obj = qx.event.Pool.getInstance().getObject(clazz);

      // Initialize with given arguments
      args ? obj.init.apply(obj, args) : obj.init();

      // Setup the type
      // Note: Native event may setup this later or using init() above
      // using the native information.
      if (type) {
        obj.setType(type);
      }

      return obj;
    },


    /**
     * Dispatch an event object on the given target.
     *
     * It is normally better to use {@link #fireEvent} because it uses
     * the event pooling and is quite handy otherwise as well. After dispatching
     * the event object will be pooled for later reuse or disposed.
     *
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *       object must be obtained using {@link #createEvent} and initialized
     *       using {@link qx.event.type.Event#init}.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(target, event) {
      return this.getManager(target).dispatchEvent(target, event);
    },


    /**
     * Create an event object and dispatch it on the given target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @see #createEvent
     */
    fireEvent : function(target, type, clazz, args)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (arguments.length > 2 && clazz === undefined && args !== undefined) {
          throw new Error("Create event of type " + type + " with undefined class. Please use null to explicit fallback to default event type!");
        }

        var msg = "Could not fire event '" + type + "' on target '" + (target ? target.classname : "undefined") +"': ";

        qx.core.Assert.assertNotUndefined(target, msg + "Invalid event target.")
        qx.core.Assert.assertNotNull(target, msg + "Invalid event target.")
      }

      var evt = this.createEvent(type, clazz||null, args);
      return this.getManager(target).dispatchEvent(target, evt);
    },


    /**
     * Create an event object and dispatch it on the given target.
     * The event dispatched with this method does never bubble! Use only if you
     * are sure that bubbling is not required.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @see #createEvent
     */
    fireNonBubblingEvent : function(target, type, clazz, args)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (arguments.length > 2 && clazz === undefined && args !== undefined) {
          throw new Error("Create event of type " + type + " with undefined class. Please use null to explicit fallback to default event type!");
        }
      }

      var mgr = this.getManager(target);
      if (!mgr.hasListener(target, type, false)) {
        return true;
      }

      var evt = this.createEvent(type, clazz||null, args);
      return mgr.dispatchEvent(target, evt);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER/DISPATCHER PRIORITY
    ---------------------------------------------------------------------------
    */

    /** {Integer} Highest priority. Used by handlers and dispatchers. */
    PRIORITY_FIRST : -32000,

    /** {Integer} Default priority. Used by handlers and dispatchers. */
    PRIORITY_NORMAL : 0,

    /** {Integer} Lowest priority. Used by handlers and dispatchers. */
    PRIORITY_LAST : 32000,




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /** {Array} Contains all known event handlers */
    __handlers : [],


    /**
     * Register an event handler.
     *
     * @param handler {qx.event.handler.AbstractEventHandler} Event handler to add
     * @return {void}
     * @throws an error if the handler does not have the IEventHandler interface.
     */
    addHandler : function(handler)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInterface(handler, qx.event.IEventHandler, "Invalid event handler.");
      }

      // Append to list
      this.__handlers.push(handler);

      // Re-sort list
      this.__handlers.sort(function(a, b) {
        return a.PRIORITY - b.PRIORITY;
      });
    },


    /**
     * Get a list of registered event handlers.
     *
     * @return {qx.event.handler.AbstractEventHandler[]} registered event handlers
     */
    getHandlers : function() {
      return this.__handlers;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /** {Array} Contains all known event dispatchers */
    __dispatchers : [],


    /**
     * Register an event dispatcher.
     *
     * @param dispatcher {qx.event.dispatch.IEventDispatch} Event dispatcher to add
     * @param priority {Integer} One of
     * {@link qx.event.Registration#PRIORITY_FIRST},
     * {@link qx.event.Registration#PRIORITY_NORMAL}
     *       or {@link qx.event.Registration#PRIORITY_LAST}.
     * @return {void}
     * @throws an error if the dispatcher does not have the IEventHandler interface.
     */
    addDispatcher : function(dispatcher, priority)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInterface(dispatcher, qx.event.IEventDispatcher, "Invalid event dispatcher!");
      }

      // Append to list
      this.__dispatchers.push(dispatcher);

      // Re-sort list
      this.__dispatchers.sort(function(a, b) {
        return a.PRIORITY - b.PRIORITY;
      });
    },


    /**
     * Get a list of registered event dispatchers.
     *
     * @return {qx.event.dispatch.IEventDispatch[]} all registered event dispatcher
     */
    getDispatchers : function() {
      return this.__dispatchers;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Methods to get information about the JavaScript call stack.
 */
qx.Bootstrap.define("qx.dev.StackTrace",
{
  statics:
  {

    /**
     * Get a stack trace of the current position in the code.
     *
     * Browser compatibility:
     * <ul>
     *   <li> Mozilla combines the output of {@link #getStackTraceFromError}
     *        and {@link #getStackTraceFromCaller} and thus generates the richest trace.
     *   </li>
     *   <li> Internet Explorer and WebKit always use {@link #getStackTraceFromCaller}</li>
     *   <li> Opera is able to return file/class names and line numbers.</li>
     * </ul>
     *
     * @return {String[]} Stack trace of the current position in the code. Each line in the array
     *     represents one call in the stack trace.
     * @signature function()
     */
    getStackTrace : qx.core.Environment.select("engine.name",
    {
      "gecko" : function()
      {
        try
        {
          throw new Error();
        }
        catch(ex)
        {
          var errorTrace = this.getStackTraceFromError(ex);
          qx.lang.Array.removeAt(errorTrace, 0);
          var callerTrace = this.getStackTraceFromCaller(arguments);

          var trace = callerTrace.length > errorTrace.length ? callerTrace : errorTrace;
          for (var i=0; i<Math.min(callerTrace.length, errorTrace.length); i++)
          {
            var callerCall = callerTrace[i];
            if (callerCall.indexOf("anonymous") >= 0) {
              continue;
            }

            var callerArr = callerCall.split(":");
            if (callerArr.length != 2) {
              continue;
            }
            var callerClassName = callerArr[0];
            var methodName = callerArr[1];

            var errorCall = errorTrace[i];
            var errorArr = errorCall.split(":");
            var errorClassName = errorArr[0];
            var lineNumber = errorArr[1];

            if (qx.Class.getByName(errorClassName)) {
              var className = errorClassName;
            } else {
              className = callerClassName;
            }
            var line = className + ":";
            if (methodName) {
              line += methodName + ":";
            }
            line += lineNumber;
            trace[i] = line;
          }

          return trace;
        }
      },

      "mshtml|webkit" : function()
      {
        return this.getStackTraceFromCaller(arguments);
      },

      "opera" : function()
      {
        var foo;
        try {
          // force error
          foo.bar();
        }
        catch (ex)
        {
          var trace = this.getStackTraceFromError(ex);
          qx.lang.Array.removeAt(trace, 0)
          return trace;
        }
        return [];
      }
    }),


    /**
     * Get a stack trace from the arguments special variable using the
     * <code>caller</code> property. This is currently not supported
     * for Opera.
     *
     * This methods returns class/mixin and function names of each step
     * in the call stack.
     *
     * Recursion is not supported.
     *
     * @param args {arguments} arguments variable.
     * @return {String[]} Stack trace of caller of the function the arguments variable belongs to.
     *     Each line in the array represents one call in the stack trace.
     * @signature function(args)
     */
    getStackTraceFromCaller : qx.core.Environment.select("engine.name",
    {
      "opera" : function(args)
      {
        return [];
      },

      "default" : function(args)
      {
        var trace = [];
        var fcn = qx.lang.Function.getCaller(args);
        var knownFunction = {};
        while (fcn)
        {
          var fcnName = qx.lang.Function.getName(fcn);
          trace.push(fcnName);

          try {
            fcn = fcn.caller;
          } catch(ex) {
            break;
          }

          if (!fcn) {
            break;
          }

          // avoid infinite recursion
          var hash = qx.core.ObjectRegistry.toHashCode(fcn);
          if (knownFunction[hash]) {
            trace.push("...");
            break;
          }
          knownFunction[hash] = fcn;
        }
        return trace;
      }
    }),


    /**
     * Try to get a stack trace from an Error object. Mozilla sets the field
     * <code>stack</code> for Error objects thrown using <code>throw new Error()</code>.
     * From this field it is possible to get a stack trace from the position
     * the exception was thrown at.
     *
     * This will get the JavaScript file names and the line numbers of each call.
     * The file names are converted into qooxdoo class names if possible.
     *
     * This works reliably in Gecko-based browsers. Later Opera versions and
     * Chrome also provide an useful stack trace. For Safari, only the class or
     * file name and line number where the error occurred are returned.
     * IE 6/7/8 does not attach any stack information to error objects so an
     * empty array is returned.
     *
     * @param error {Error} Error exception instance.
     * @return {String[]} Stack trace of the exception. Each line in the array
     *     represents one call in the stack trace.
     * @signature function(error)
     */
    getStackTraceFromError : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(error)
      {
        if (!error.stack) {
          return [];
        }
        // e.g. "()@http://localhost:8080/webcomponent-test-SNAPSHOT/webcomponent/js/com/ptvag/webcomponent/common/log/Logger:253"
        var lineRe = /@(.+):(\d+)$/gm;
        var hit;
        var trace = [];


        while ((hit = lineRe.exec(error.stack)) != null)
        {
          var url = hit[1];
          var lineNumber = hit[2];

          var className = this.__fileNameToClassName(url);
          trace.push(className + ":" + lineNumber);
        }

        return trace;
      },

      "webkit" : function(error)
      {
        if (error.stack) {
          /*
           * Chrome trace info comes in two flavors:
           * at [jsObject].function (fileUrl:line:char)
           * at fileUrl:line:char
           */
          var lineRe = /at (.*)/gm;
          var fileReParens = /\((.*?)(:[^\/].*)\)/;
          var fileRe = /(.*?)(:[^\/].*)/;
          var hit;
          var trace = [];
          while ((hit = lineRe.exec(error.stack)) != null) {
            var fileMatch = fileReParens.exec(hit[1]);
            if (!fileMatch) {
              fileMatch = fileRe.exec(hit[1]);
            }

            if (fileMatch) {
              var className = this.__fileNameToClassName(fileMatch[1]);
              trace.push(className + fileMatch[2]);
            } else {
                trace.push(hit[1]);
            }
          }

          return trace;
        }
        else if (error.sourceURL && error.line) {
          return [this.__fileNameToClassName(error.sourceURL) + ":" + error.line];
        }
        else {
          return [];
        }
      },

      // Check "Exceptions Have Stacktrace" in opera:config, Section User Prefs
      "opera" : function(error)
      {
        if (error.stacktrace) {
          var stacktrace = error.stacktrace;
          if (stacktrace.indexOf("Error created at") >= 0) {
            stacktrace = stacktrace.split("Error created at")[0];
          }
          // older Opera style
          if (stacktrace.indexOf("of linked script") >= 0) {
            var lineRe = /Line\ (\d+?)\ of\ linked\ script\ (.*?)$/gm;
            var hit;
            var trace = [];
            while ((hit = lineRe.exec(stacktrace)) != null) {
              var lineNumber = hit[1];
              var url = hit[2];
              var className = this.__fileNameToClassName(url);
              trace.push(className + ":" + lineNumber);
            }
          }
          // new Opera style (10.6+)
          else {
            var lineRe = /line\ (\d+?),\ column\ (\d+?)\ in\ (?:.*?)\ in\ (.*?):[^\/]/gm;
            var hit;
            var trace = [];
            while ((hit = lineRe.exec(stacktrace)) != null) {
              var lineNumber = hit[1];
              var columnNumber = hit[2];
              var url = hit[3];
              var className = this.__fileNameToClassName(url);
              trace.push(className + ":" + lineNumber + ":" + columnNumber);
            }
          }
          return trace;
        } else if (error.message && error.message.indexOf("Backtrace:") >= 0) {
          var trace = [];
          var traceString = qx.lang.String.trim(error.message.split("Backtrace:")[1]);
          var lines = traceString.split("\n");
          for (var i=0; i<lines.length; i++)
          {
            var reResult = lines[i].match(/\s*Line ([0-9]+) of.* (\S.*)/);
            if (reResult && reResult.length >= 2) {
              var lineNumber = reResult[1];
              var fileName = this.__fileNameToClassName(reResult[2]);
              trace.push(fileName + ":" + lineNumber);
            }
          }
          return trace;
        } else {
          return [];
        }
      },

      "default": function() {
        return [];
      }
    }),


    /**
     * Convert an URL of a JavaScript class into a class name if the file is named using
     * the qooxdoo naming conventions.
     *
     * @param fileName {String} URL of the JavaScript file
     * @return {String} class name of the file if conversion was possible. Otherwise the
     *     fileName is returned unmodified.
     */
    __fileNameToClassName : function(fileName)
    {
      var scriptDir = "/source/class/";
      var jsPos = fileName.indexOf(scriptDir);
      var paramPos = fileName.indexOf("?");
      if (paramPos >= 0) {
        fileName = fileName.substring(0, paramPos);
      }
      var className = (jsPos == -1) ? fileName : fileName.substring(jsPos + scriptDir.length).replace(/\//g, ".").replace(/\.js$/, "");
      return className;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Mootools
     http://mootools.net/
     Version 1.1.1

     Copyright:
       (c) 2007 Valerio Proietti

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

   and

   * XRegExp
   http://xregexp.com/
   Version 1.5

   Copyright:
       (c) 2006-2007, Steven Levithan <http://stevenlevithan.com>

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Steven Levithan

************************************************************************ */

/**
 * String helper functions
 *
 * The native JavaScript String is not modified by this class. However,
 * there are modifications to the native String in {@link qx.lang.Core} for
 * browsers that do not support certain features.
 *
 * The string/array generics introduced in JavaScript 1.6 are supported by
 * {@link qx.lang.Generics}.
 */
qx.Class.define("qx.lang.String",
{
  statics :
  {
    
    /**
     * Unicode letters.  they are taken from Steve Levithan's excellent XRegExp library [http://xregexp.com/plugins/xregexp-unicode-base.js]
     */
    __unicodeLetters : "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",

    /**
     * A RegExp that matches the first letter in a word - unicode aware
     */
    
    __unicodeFirstLetterInWordRegexp : null,
    
    /**
     * Converts a hyphenated string (separated by '-') to camel case.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("I-like-cookies"); //returns "ILikeCookies"</pre>
     *
     * @param str {String} hyphenated string
     * @return {String} camelcase string
     */
    camelCase : function(str)
    {
      return str.replace(/\-([a-z])/g, function(match, chr) {
        return chr.toUpperCase();
      });
    },


    /**
     * Converts a camelcased string to a hyphenated (separated by '-') string.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("ILikeCookies"); //returns "I-like-cookies"</pre>
     *
     * @param str {String} camelcased string
     * @return {String} hyphenated string
     */
    hyphenate: function(str)
    {
      return str.replace(/[A-Z]/g, function(match){
        return ('-' + match.charAt(0).toLowerCase());
      });
    },


    /**
     * Converts a string to camel case.
     *
     * Example:
     * <pre class='javascript'>qx.lang.String.camelCase("i like cookies"); //returns "I Like Cookies"</pre>
     *
     * @param str {String} any string
     * @return {String} capitalized string
     */
    capitalize: function(str){
      if(this.__unicodeFirstLetterInWordRegexp === null) {
        var unicodeEscapePrefix = qx.core.Environment.get("engine.name") == "mshtml" ? '\\u' : '\\\u';
        this.__unicodeFirstLetterInWordRegexp = new RegExp("(^|[^" + this.__unicodeLetters.replace(/[0-9A-F]{4}/g,function(match){return unicodeEscapePrefix+match}) + "])[" + this.__unicodeLetters.replace(/[0-9A-F]{4}/g,function(match){return unicodeEscapePrefix+match}) + "]", "g");
      }
      return str.replace(this.__unicodeFirstLetterInWordRegexp, function(match) {
        return match.toUpperCase();
      });
    },


    /**
     * Removes all extraneous whitespace from a string and trims it
     *
     * Example:
     *
     * <code>
     * qx.lang.String.clean(" i      like     cookies      \n\n");
     * </code>
     *
     * Returns "i like cookies"
     *
     * @param str {String} the string to clean up
     * @return {String} Cleaned up string
     */
    clean: function(str){
      return this.trim(str.replace(/\s+/g, ' '));
    },


    /**
     * removes white space from the left side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trimLeft : function(str) {
      return str.replace(/^\s+/, "");
    },


    /**
     * removes white space from the right side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trimRight : function(str) {
      return str.replace(/\s+$/, "");
    },


    /**
     * removes white space from the left and the right side of a string
     *
     * @param str {String} the string to trim
     * @return {String} the trimmed string
     */
    trim : function(str) {
      return str.replace(/^\s+|\s+$/g, "");
    },


    /**
     * Check whether the string starts with the given substring
     *
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string starts with the given substring
     */
    startsWith : function(fullstr, substr) {
      return fullstr.indexOf(substr) === 0;
    },


    /**
     * Check whether the string ends with the given substring
     *
     * @param fullstr {String} the string to search in
     * @param substr {String} the substring to look for
     * @return {Boolean} whether the string ends with the given substring
     */
    endsWith : function(fullstr, substr) {
      return fullstr.substring(fullstr.length - substr.length, fullstr.length) === substr;
    },


    /**
     * Returns a string, which repeats a string 'length' times
     *
     * @param str {String} string used to repeat
     * @param times {Integer} the number of repetitions
     * @return {String} repeated string
     */
    repeat : function(str, times) {
      return str.length > 0 ? new Array(times + 1).join(str) : "";
    },


    /**
     * Pad a string up to a given length. Padding characters are added to the left of the string.
     *
     * @param str {String} the string to pad
     * @param length {Integer} the final length of the string
     * @param ch {String} character used to fill up the string
     * @return {String} padded string
     */
    pad : function(str, length, ch)
    {
      var padLength = length - str.length;
      if (padLength > 0)
      {
        if (typeof ch === "undefined") {
          ch = "0";
        }
        return this.repeat(ch, padLength) + str;
      }
      else
      {
        return str;
      }
    },


    /**
     * Convert the first character of the string to upper case.
     *
     * @signature function(str)
     * @param str {String} the string
     * @return {String} the string with an upper case first character
     */
    firstUp : qx.Bootstrap.firstUp,


    /**
     * Convert the first character of the string to lower case.
     *
     * @signature function(str)
     * @param str {String} the string
     * @return {String} the string with a lower case first character
     */
    firstLow : qx.Bootstrap.firstLow,


    /**
     * Check whether the string contains a given substring
     *
     * @param str {String} the string
     * @param substring {String} substring to search for
     * @return {Boolean} whether the string contains the substring
     */
    contains : function(str, substring) {
      return str.indexOf(substring) != -1;
    },


    /**
     * Print a list of arguments using a format string
     * In the format string occurrences of %n are replaced by the n'th element of the args list.
     * Example:
     * <pre class='javascript'>qx.lang.String.format("Hello %1, my name is %2", ["Egon", "Franz"]) == "Hello Egon, my name is Franz"</pre>
     *
     * @param pattern {String} format string
     * @param args {Array} array of arguments to insert into the format string
     * @return {String} the formatted string
     */
    format : function(pattern, args)
    {
      var str = pattern;
      var i = args.length;

      while (i--) {
        // be sure to always use a string for replacement.
        str = str.replace(new RegExp("%" + (i + 1), "g"), args[i] + "");
      }

      return str;
    },


    /**
     * Escapes all chars that have a special meaning in regular expressions
     *
     * @param str {String} the string where to escape the chars.
     * @return {String} the string with the escaped chars.
     */
    escapeRegexpChars : function(str) {
      return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    },


    /**
     * Converts a string to an array of characters.
     * <pre>"hello" => [ "h", "e", "l", "l", "o" ];</pre>
     *
     * @param str {String} the string which should be split
     * @return {Array} the result array of characters
     */
    toArray : function(str) {
      return str.split(/\B|\b/g);
    },


    /**
     * Remove HTML/XML tags from a string
     * Example:
     * <pre class='javascript'>qx.lang.String.stripTags("&lt;h1>Hello&lt;/h1>") == "Hello"</pre>
     *
     * @param str {String} string containing tags
     * @return {String} the string with stripped tags
     */
    stripTags : function(str) {
      return str.replace(/<\/?[^>]+>/gi, "");
    },


    /**
     * Strips <script> tags including its content from the given string.
     *
     * @param str {String} string containing tags
     * @param exec {Boolean?false} Whether the filtered code should be executed
     * @return {String} The filtered string
     */
    stripScripts: function(str, exec)
    {
      var scripts = "";
      var text = str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function()
      {
        scripts += arguments[1] + '\n';
        return "";
      });

      if (exec === true) {
        qx.lang.Function.globalEval(scripts);
      }

      return text;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An memory container which stores arbitrary data up to a maximum number of
 * entries. When new entries come in an the maximum is reached, the oldest
 * entries are deleted.
 *
 * A mark feature also exists which can be used to remember a point in time.
 * When retrieving entriues, it is possible to get only those entries
 * after the marked time. This is useful if data from the buffer is extracted
 * and processed. Whenever this happens, a mark() call can be used so that the
 * next extraction will only get new data.
 */
qx.Class.define("qx.lang.RingBuffer",
{
  extend : Object,

  /**
   * Constructor.
   *
   * @param maxEntries {Integer ? 50} Maximum number of entries in the buffer
   */
  construct : function(maxEntries)
  {
    this.setMaxEntries(maxEntries || 50);
  },


  members :
  {
    //Next slot in ringbuffer to use
    __nextIndexToStoreTo : 0,

    //Number of elements in ring buffer
    __entriesStored : 0,

    //Was a mark set?
    __isMarkActive: false,

    //How many elements were stored since setting of mark?
    __entriesStoredSinceMark : 0,

    //ring buffer
    __entries : null,

    //Maximum number of messages to store. Could be converted to a qx property.
    __maxEntries : null,


    /**
     * Set the maximum number of messages to hold. If null the number of
     * messages is not limited.
     *
     * Warning: Changing this property will clear the events logged so far.
     *
     * @param maxEntries {Integer} the maximum number of messages to hold
     */
    setMaxEntries : function(maxEntries)
    {
      this.__maxEntries = maxEntries;
      this.clear();
    },


    /**
     * Get the maximum number of entries to hold
     *
     * @return {Integer}
     */
    getMaxEntries : function() {
      return this.__maxEntries;
    },


    /**
     * Adds a single entry
     *
     * @param entry {var} The data to store
     */
    addEntry : function(entry)
    {
      this.__entries[this.__nextIndexToStoreTo] = entry;

      this.__nextIndexToStoreTo = this.__addToIndex(this.__nextIndexToStoreTo, 1);

      //Count # of stored entries
      var max = this.getMaxEntries();
      if (this.__entriesStored < max){
        this.__entriesStored++;
      }

      //Count # of stored elements since last mark call
      if (this.__isMarkActive && (this.__entriesStoredSinceMark < max)){
        this.__entriesStoredSinceMark++;
      }
    },


    /**
     * Remembers the current position in the ring buffer
     *
     */
    mark : function(){
      this.__isMarkActive = true;
      this.__entriesStoredSinceMark = 0;
    },


    /**
     * Removes the current mark position
     */
    clearMark : function(){
      this.__isMarkActive = false;
    },


    /**
     * Returns all stored entries. Mark is ignored.
     *
     * @return {Array} array of stored entries
     */
    getAllEntries : function() {
      return this.getEntries(this.getMaxEntries(), false);
    },


    /**
     * Returns entries which have been added previously.
     *
     * @param count {Integer} The number of entries to retrieve. If there are
     *    more entries than the given count, the oldest ones will not be returned.
     *
     * @param startingFromMark {Boolean ? false} If true, only entries since
     *   the last call to mark() will be returned
     * @return {Array} array of stored entries
     */
    getEntries : function(count, startingFromMark)
    {
      //Trim count so it does not exceed ringbuffer size
      if (count > this.__entriesStored) {
        count = this.__entriesStored;
      }

      // Trim count so it does not exceed last call to mark (if mark was called
      // and startingFromMark was true)
      if (
        startingFromMark &&
        this.__isMarkActive &&
        (count > this.__entriesStoredSinceMark)
      ) {
        count = this.__entriesStoredSinceMark;
      }

      if (count > 0){

        var indexOfYoungestElementInHistory = this.__addToIndex(this.__nextIndexToStoreTo,  -1);
        var startIndex = this.__addToIndex(indexOfYoungestElementInHistory, - count + 1);

        var result;

        if (startIndex <= indexOfYoungestElementInHistory) {
          //Requested segment not wrapping around ringbuffer boundary, get in one run
          result = this.__entries.slice(startIndex, indexOfYoungestElementInHistory + 1);
        } else {
          //Requested segment wrapping around ringbuffer boundary, get two parts & concat
          result = this.__entries.slice(startIndex, this.__entriesStored).concat(this.__entries.slice(0, indexOfYoungestElementInHistory + 1));
        }
      } else {
        result = [];
      }

      return result;
    },


    /**
     * Clears all entries
     */
    clear : function()
    {
      this.__entries = new Array(this.getMaxEntries());
      this.__entriesStored = 0;
      this.__entriesStoredSinceMark = 0;
      this.__nextIndexToStoreTo = 0;
    },


    /**
     * Adds a number to an ringbuffer index. Does a modulus calculation,
     * i. e. if the index leaves the ringbuffer space it will wrap around to
     * the other end of the ringbuffer.
     *
     * @param idx {Number} The current index.
     * @param addMe {Number} The number to add.
     */
    __addToIndex : function (idx, addMe){
      var max = this.getMaxEntries();
      var result = (idx + addMe) % max;

      //If negative, wrap up into the ringbuffer space
      if (result < 0){
        result += max;
      }
      return result;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Carsten Lergenmueller (carstenl)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An appender that writes all messages to a memory container. The messages
 * can be retrieved later, f. i. when an error dialog pops up and the question
 * arises what actions have caused the error.
 *
 * A mark feature also exists which can be used to remember a point in time.
 * When retrieving log events, it is possible to get only those events
 * after the marked time. This is useful if data from the buffer is extracted
 * and f. i. sent to a logging system. Whenever this happens, a mark() call
 * can be used so that the next extraction will only get new data.
 */
qx.Class.define("qx.log.appender.RingBuffer",
{
  extend : qx.lang.RingBuffer,

  /**
   * @param maxMessages {Integer?50} Maximum number of messages in the buffer
   */
  construct : function(maxMessages) {
    this.setMaxMessages(maxMessages || 50);
  },


  members :
  {

    /**
     * Set the maximum number of messages to hold. If null the number of
     * messages is not limited.
     *
     * Warning: Changing this property will clear the events logged so far.
     *
     * @param maxMessages {Integer} the maximum number of messages to hold
     */
    setMaxMessages : function(maxMessages) {
      this.setMaxEntries(maxMessages);
    },


    /**
     * Get the maximum number of messages to hold
     *
     * @return {Integer} the maximum number of messages
     */
    getMaxMessages : function() {
      return this.getMaxEntries();
    },


    /**
     * Processes a single log entry
     *
     * @param entry {Map} The entry to process
     */
    process : function(entry) {
      this.addEntry(entry);
    },


    /**
     * Returns all stored log events
     *
     * @return {Array} array of stored log events
     */
    getAllLogEvents : function() {
      return this.getAllEntries();
    },


    /**
     * Returns log events which have been logged previously.
     *
     * @param count {Integer} The number of events to retrieve. If there are
     *    more events than the given count, the oldest ones will not be returned.
     *
     * @param startingFromMark {Boolean ? false} If true, only entries since the last call to mark()
     *                                           will be returned
     * @return {Array} array of stored log events
     */
    retrieveLogEvents : function(count, startingFromMark) {
      return this.getEntries(count, startingFromMark);
    },


    /**
     * Clears the log history
     */
    clearHistory : function() {
      this.clear();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Main qooxdoo logging class.
 *
 * Used as central logging feature by qx.core.Object.
 *
 * Extremely modular and lightweight to support logging at bootstrap and
 * at shutdown as well.
 *
 * * Supports dynamic appenders to push the output to the user
 * * Supports buffering of the last 50 messages (configurable)
 * * Supports different debug levels ("debug", "info", "warn" or "error")
 * * Simple data serialization for incoming messages
 */
/*
 #require(qx.dev.StackTrace)
 */
qx.Class.define("qx.log.Logger",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CONFIGURATION
    ---------------------------------------------------------------------------
    */

    __level : "debug",


    /**
     * Configures the minimum log level required for new messages.
     *
     * @param value {String} One of "debug", "info", "warn" or "error".
     * @return {void}
     */
    setLevel : function(value) {
      this.__level = value;
    },


    /**
     * Returns the currently configured minimum log level required for new
     * messages.
     *
     * @return {Integer} Debug level
     */
    getLevel : function() {
      return this.__level;
    },


    /**
     * Configures the number of messages to be kept in the buffer.
     *
     * @param value {Integer} Any positive integer
     * @return {void}
     */
    setTreshold : function(value) {
      this.__buffer.setMaxMessages(value);
    },


    /**
     * Returns the currently configured number of messages to be kept in the
     * buffer.
     *
     * @return {Integer} Treshold value
     */
    getTreshold : function() {
      return this.__buffer.getMaxMessages();
    },





    /*
    ---------------------------------------------------------------------------
      APPENDER MANAGEMENT
    ---------------------------------------------------------------------------
    */

    /** {Map} Map of all known appenders by ID */
    __appender : {},


    /** {Integer} Last free appender ID */
    __id : 0,


    /**
     * Registers the given appender and inserts the last cached messages.
     *
     * @param appender {Class} A static appender class supporting at
     *   least a <code>process()</code> method to handle incoming messages.
     * @return {void}
     */
    register : function(appender)
    {
      if (appender.$$id) {
        return;
      }

      // Register appender
      var id = this.__id++;
      this.__appender[id] = appender;
      appender.$$id = id;
      var levels = this.__levels;

      // Insert previous messages
      var entries = this.__buffer.getAllLogEvents();
      for (var i=0, l=entries.length; i<l; i++) {
        if (levels[entries[i].level] >= levels[this.__level]) {
          appender.process(entries[i]);
        }
      }
    },


    /**
     * Unregisters the given appender
     *
     * @param appender {Class} A static appender class
     * @return {void}
     */
    unregister : function(appender)
    {
      var id = appender.$$id;
      if (id == null) {
        return;
      }

      delete this.__appender[id];
      delete appender.$$id;
    },





    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Sending a message at level "debug" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    debug : function(object, message) {
      qx.log.Logger.__log("debug", arguments);
    },


    /**
     * Sending a message at level "info" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    info : function(object, message) {
      qx.log.Logger.__log("info", arguments);
    },


    /**
     * Sending a message at level "warn" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    warn : function(object, message) {
      qx.log.Logger.__log("warn", arguments);
    },


    /**
     * Sending a message at level "error" to the logger.
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @param message {var} Any number of arguments supported. An argument may
     *   have any JavaScript data type. All data is serialized immediately and
     *   does not keep references to other objects.
     * @return {void}
     */
    error : function(object, message) {
      qx.log.Logger.__log("error", arguments);
    },


    /**
     * Prints the current stack trace at level "info"
     *
     * @param object {Object} Contextual object (either instance or static class)
     * @return {void}
     */
    trace : function(object) {
      qx.log.Logger.__log("info", [object, qx.dev.StackTrace.getStackTrace().join("\n")]);
    },


    /**
     * Prints a method deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param fcn {Function} reference to the deprecated function. This is
     *     arguments.callee if the calling method is to be deprecated.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedMethodWarning : function(fcn, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var functionName = qx.lang.Function.getName(fcn);
        this.warn(
          "The method '"+ functionName + "' is deprecated: " +
          (msg || "Please consult the API documentation of this method for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints a class deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param clazz {Class} reference to the deprecated class.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedClassWarning : function(clazz, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var className = clazz.classname || "unknown";
        this.warn(
          "The class '"+className+"' is deprecated: " +
          (msg || "Please consult the API documentation of this class for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints an event deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param clazz {Class} reference to the deprecated class.
     * @param event {String} deprecated event name.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedEventWarning : function(clazz, event, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var className = clazz.self ? clazz.self.classname : "unknown";
        this.warn(
          "The event '"+(event || "unknown")+"' from class '"+className+"' is deprecated: " +
          (msg || "Please consult the API documentation of this class for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints a mixin deprecation warning and a stack trace if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     * @param clazz {Class} reference to the deprecated mixin.
     * @param msg {String?} Optional message to be printed.
     */
    deprecatedMixinWarning : function(clazz, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var mixinName = clazz ? clazz.name : "unknown";
        this.warn(
          "The mixin '"+mixinName+"' is deprecated: " +
          (msg || "Please consult the API documentation of this class for alternatives.")
        );
        this.trace();
      }
    },


    /**
     * Prints a constant deprecation warning and a stacktrace if the setting
     * <code>qx.debug</code> is set to <code>on</code> AND the browser supports
     * __defineGetter__!
     *
     * @param clazz {Class} The class the constant is attached to.
     * @param constant {String} The name of the constant as string.
     * @param msg {String} Optional message to be printed.
     */
    deprecatedConstantWarning : function(clazz, constant, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        // check if __defineGetter__ is available
        if (clazz.__defineGetter__) {
          var self = this;
          var constantValue = clazz[constant];
          clazz.__defineGetter__(constant, function() {
            self.warn(
              "The constant '"+ constant + "' is deprecated: " +
              (msg || "Please consult the API documentation for alternatives.")
            );
            self.trace();
            return constantValue;
          });
        }
      }
    },


    /**
     * Prints a deprecation waring and a stacktrace when a subclass overrides
     * the passed method name. The deprecation is only printed if the setting
     * <code>qx.debug</code> is set to <code>on</code>.
     *
     *
     * @param object {qx.core.Object} Instance to check for overriding.
     * @param baseclass {Class} The baseclass as starting point.
     * @param methodName {String} The method name which is deprecated for overriding.
     * @param msg {String|?} Optional message to be printed.
     */
    deprecateMethodOverriding : function(object, baseclass, methodName, msg)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var clazz = object.constructor;

        while(clazz.classname !== baseclass.classname)
        {
          if (clazz.prototype.hasOwnProperty(methodName))
          {
            this.warn(
              "The method '" + qx.lang.Function.getName(object[methodName]) +
              "' overrides a deprecated method: " +
              (msg || "Please consult the API documentation for alternatives.")
            );
            this.trace();
            break;
          }
          clazz = clazz.superclass;
        }
      }
    },


    /**
     * Deletes the current buffer. Does not influence message handling of the
     * connected appenders.
     *
     * @return {void}
     */
    clear : function() {
      this.__buffer.clearHistory();
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL LOGGING IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /** {qx.log.appender.RingBuffer} Message buffer of previously fired messages. */
    __buffer : new qx.log.appender.RingBuffer(50),


    /** {Map} Numeric translation of log levels */
    __levels :
    {
      debug : 0,
      info : 1,
      warn : 2,
      error : 3
    },


    /**
     * Internal logging main routine.
     *
     * @param level {String} One of "debug", "info", "warn" or "error"
     * @param args {Array} List of other arguments, where the first is
     *   taken as the context object.
     * @return {void}
     */
    __log : function(level, args)
    {
      // Filter according to level
      var levels = this.__levels;
      if (levels[level] < levels[this.__level]) {
        return;
      }

      // Serialize and cache
      var object = args.length < 2 ? null : args[0];
      var start = object ? 1 : 0;
      var items = [];
      for (var i=start, l=args.length; i<l; i++) {
        items.push(this.__serialize(args[i], true));
      }

      // Build entry
      var time = new Date;
      var entry =
      {
        time : time,
        offset : time-qx.Bootstrap.LOADSTART,
        level: level,
        items: items,
        // store window to allow cross frame logging
        win: window
      };

      // Add relation fields
      if (object)
      {
        // Do not explicitly check for instanceof qx.core.Object, in order not
        // to introduce an unwanted load-time dependency
        if (object.$$hash !== undefined) {
          entry.object = object.$$hash;
        } else if (object.$$type) {
          entry.clazz = object;
        }
      }

      this.__buffer.process(entry);

      // Send to appenders
      var appender = this.__appender;
      for (var id in appender) {
        appender[id].process(entry);
      }
    },


    /**
     * Detects the type of the variable given.
     *
     * @param value {var} Incoming value
     * @return {String} Type of the incoming value. Possible values:
     *   "undefined", "null", "boolean", "number", "string",
     *   "function", "array", "error", "map",
     *   "class", "instance", "node", "stringify", "unknown"
     */
    __detect : function(value)
    {
      if (value === undefined) {
        return "undefined";
      } else if (value === null) {
        return "null";
      }

      if (value.$$type) {
        return "class";
      }

      var type = typeof value;

      if (type === "function" || type == "string" || type === "number" || type === "boolean") {
        return type;
      }

      else if (type === "object")
      {
        if (value.nodeType) {
          return "node";
        } else if (value.classname) {
          return "instance";
        } else if (value instanceof Array) {
          return "array";
        } else if (value instanceof Error) {
          return "error";
        } else if (value instanceof Date) {
          return "date";
        } else {
          return "map";
        }
      }

      if (value.toString) {
        return "stringify";
      }

      return "unknown";
    },


    /**
     * Serializes the incoming value. If it is a singular value, the result is
     * a simple string. For an array or a map the result can also be a
     * serialized string of a limited number of individual items.
     *
     * @param value {var} Incoming value
     * @param deep {Boolean?false} Whether arrays and maps should be
     *    serialized for a limited number of items
     * @return {Map} Contains the keys <code>type</code>, <code>text</code> and
     * <code>trace</code>.
     */
    __serialize : function(value, deep)
    {
      var type = this.__detect(value);
      var text = "unknown";
      var trace = [];

      switch(type)
      {
        case "null":
        case "undefined":
          text = type;
          break;

        case "string":
        case "number":
        case "boolean":
        case "date":
          text = value;
          break;

        case "node":
          if (value.nodeType === 9)
          {
            text = "document";
          }
          else if (value.nodeType === 3)
          {
            text = "text[" + value.nodeValue + "]";
          }
          else if (value.nodeType === 1)
          {
            text = value.nodeName.toLowerCase();
            if (value.id) {
              text += "#" + value.id;
            }
          }
          else
          {
            text = "node";
          }
          break;

        case "function":
          text = qx.lang.Function.getName(value) || type;
          break;

        case "instance":
          text = value.basename + "[" + value.$$hash + "]";
          break;

        case "class":
        case "stringify":
          text = value.toString();
          break;

        case "error":
          trace = qx.dev.StackTrace.getStackTraceFromError(value);
          text = value.toString();
          break;

        case "array":
          if (deep)
          {
            text = [];
            for (var i=0, l=value.length; i<l; i++)
            {
              if (text.length > 20)
              {
                text.push("...(+" + (l-i) + ")");
                break;
              }

              text.push(this.__serialize(value[i], false));
            }
          }
          else
          {
            text = "[...(" + value.length + ")]";
          }
          break;

        case "map":
          if (deep)
          {
            var temp;

            // Produce sorted key list
            var sorted = [];
            for (var key in value) {
              sorted.push(key);
            }
            sorted.sort();

            // Temporary text list
            text = [];
            for (var i=0, l=sorted.length; i<l; i++)
            {
              if (text.length > 20)
              {
                text.push("...(+" + (l-i) + ")");
                break;
              }

              // Additional storage of hash-key
              key = sorted[i];
              temp = this.__serialize(value[key], false);
              temp.key = key;
              text.push(temp);
            }
          }
          else
          {
            var number=0;
            for (var key in value) {
              number++;
            }
            text = "{...(" + number + ")}";
          }
          break;
      }

      return {
        type : type,
        text : text,
        trace : trace
      };
    }
  },


  defer : function(statics)
  {
    var logs = qx.Bootstrap.$$logs;
    for (var i=0; i<logs.length; i++) {
      statics.__log(logs[i][0], logs[i][1]);
    }

    qx.Bootstrap.debug = statics.debug;
    qx.Bootstrap.info = statics.info;
    qx.Bootstrap.warn = statics.warn;
    qx.Bootstrap.error = statics.error;
    qx.Bootstrap.trace = statics.trace;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.core.Property)
#require(qx.core.ObjectRegistry)
#use(qx.event.dispatch.Direct)
#use(qx.event.handler.Object)

************************************************************************ */

/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 *
 * * object management (creation and destruction)
 * * interfaces for event system
 * * generic setter/getter support
 * * interfaces for logging console
 * * user friendly OO interfaces like {@link #self} or {@link #base}
 */
qx.Class.define("qx.core.Object",
{
  extend : Object,
  include : [qx.data.MBinding],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   */
  construct : function() {
    qx.core.ObjectRegistry.register(this);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal type */
    $$type : "Object"
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * Return unique hash code of object
     *
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this.$$hash;
    },


    /**
     * Returns a string representation of the qooxdoo object.
     *
     * @return {String} string representation of the object
     */
    toString : function() {
      return this.classname + "[" + this.$$hash + "]";
    },


    /**
     * Call the same method of the super class.
     *
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!qx.Bootstrap.isFunction(args.callee.base)) {
          throw new Error(
            "Cannot call super class. Method is not derived: " +
            args.callee.displayName
          );
        }
      }

      if (arguments.length === 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },


    /**
     * Returns the static class (to access static members of this class)
     *
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },





    /*
    ---------------------------------------------------------------------------
      CLONE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * EXPERIMENTAL - NOT READY FOR PRODUCTION
     *
     * Returns a clone of this object. Copies over all user configured
     * property values. Do not configure a parent nor apply the appearance
     * styles directly.
     *
     * @return {qx.core.Object} The clone
     */
    clone : function()
    {
      var clazz = this.constructor;
      var clone = new clazz;
      var props = qx.Class.getProperties(clazz);
      var user = qx.core.Property.$$store.user;
      var setter = qx.core.Property.$$method.set;
      var name;

      // Iterate through properties
      for (var i=0, l=props.length; i<l; i++)
      {
        name = props[i];
        if (this.hasOwnProperty(user[name])) {
          clone[setter[name]](this[user[name]]);
        }
      }

      // Return clone
      return clone;
    },


    /*
    ---------------------------------------------------------------------------
      COMMON SETTER/GETTER/RESETTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets multiple properties at once by using a property list or
     * sets one property and its value by the first and second argument.
     * As a fallback, if no generated property setter could be found, a
     * handwritten setter will be searched and invoked if available.
     *
     * @param data {Map | String} a map of property values. The key is the name of the property.
     * @param value {var?} the value, only used when <code>data</code> is a string.
     * @return {Object} this instance.
     * @throws an Exception if a property defined does not exist
     */
    set : function(data, value)
    {
      var setter = qx.core.Property.$$method.set;

      if (qx.Bootstrap.isString(data))
      {
        if (!this[setter[data]])
        {
          if (this["set" + qx.Bootstrap.firstUp(data)] != undefined) {
            this["set" + qx.Bootstrap.firstUp(data)](value);
            return this;
          }

          if (qx.core.Environment.get("qx.debug"))
          {
            qx.Bootstrap.error(new Error("No such property: " + data));
            return this;
          }
        }


        return this[setter[data]](value);
      }
      else
      {
        for (var prop in data)
        {
          if (!this[setter[prop]])
          {
            if (this["set" + qx.Bootstrap.firstUp(prop)] != undefined) {
              this["set" + qx.Bootstrap.firstUp(prop)](data[prop]);
              continue;
            }

            if (qx.core.Environment.get("qx.debug"))
            {
              qx.Bootstrap.error(new Error("No such property: " + prop));
              return this;
            }
          }

          this[setter[prop]](data[prop]);
        }

        return this;
      }
    },


    /**
     * Returns the value of the given property. If no generated getter could be
     * found, a fallback tries to access a handwritten getter.
     *
     * @param prop {String} Name of the property.
     * @return {var} The value of the value
     * @throws an Exception if a property defined does not exist
     */
    get : function(prop)
    {
      var getter = qx.core.Property.$$method.get;

      if (!this[getter[prop]])
      {
        if (this["get" + qx.Bootstrap.firstUp(prop)] != undefined) {
          return this["get" + qx.Bootstrap.firstUp(prop)]();
        }

        if (qx.core.Environment.get("qx.debug"))
        {
          qx.Bootstrap.error(new Error("No such property: " + prop));
          return this;
        }
      }


      return this[getter[prop]]();
    },


    /**
     * Resets the value of the given property. If no generated resetter could be
     * found, a handwritten resetter will be invoked, if available.
     *
     * @param prop {String} Name of the property.
     * @throws an Exception if a property defined does not exist
     */
    reset : function(prop)
    {
      var resetter = qx.core.Property.$$method.reset;

      if (!this[resetter[prop]])
      {
        if (this["reset" + qx.Bootstrap.firstUp(prop)] != undefined) {
          this["reset" + qx.Bootstrap.firstUp(prop)]();
          return;
        }

        if (qx.core.Environment.get("qx.debug"))
        {
          qx.Bootstrap.error(new Error("No such property: " + prop));
          return;
        }
      }


      this[resetter[prop]]();
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the regular event registration class */
    __Registration : qx.event.Registration,


    /**
     * Add event listener to this object.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(type, listener, self, capture)
    {
      if (!this.$$disposed) {
        return this.__Registration.addListener(this, type, listener, self, capture);
      }

      return null;
    },


    /**
     * Add event listener to this object, which is only called once. After the
     * listener is called the event listener gets removed.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? window} reference to the 'this' variable inside the callback
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListenerOnce : function(type, listener, self, capture)
    {
      var callback = function(e)
      {
        this.removeListener(type, callback, this, capture);
        listener.call(self||this, e);
      };

      return this.addListener(type, callback, this, capture);
    },


    /**
     * Remove event listener from this object
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} reference to the 'this' variable inside the callback
     * @param capture {Boolean} Whether to remove the event listener of
     *   the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListener : function(type, listener, self, capture)
    {
      if (!this.$$disposed) {
        return this.__Registration.removeListener(this, type, listener, self, capture);
      }

      return false;
    },


    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param id {String} The id returned by {@link #addListener}
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListenerById : function(id)
    {
      if (!this.$$disposed) {
        return this.__Registration.removeListenerById(this, id);
      }

      return false;
    },


    /**
     * Check if there are one or more listeners for an event type.
     *
     * @param type {String} name of the event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the object has a listener of the given type.
     */
    hasListener : function(type, capture) {
      return this.__Registration.hasListener(this, type, capture);
    },


    /**
     * Dispatch an event on this object
     *
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt)
    {
      if (!this.$$disposed) {
        return this.__Registration.dispatchEvent(this, evt);
      }

      return true;
    },


    /**
     * Creates and dispatches an event on this object.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        return this.__Registration.fireEvent(this, type, clazz, args);
      }

      return true;
    },


    /**
     * Create an event object and dispatch it on this object.
     * The event dispatched with this method does never bubble! Use only if you
     * are sure that bubbling is not required.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireNonBubblingEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        return this.__Registration.fireNonBubblingEvent(this, type, clazz, args);
      }

      return true;
    },


    /**
     * Creates and dispatches an non-bubbling data event on this object.
     *
     * @param type {String} Event type to fire
     * @param data {var} User defined data attached to the event object
     * @param oldData {var?null} The event's old data (optional)
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireDataEvent : function(type, data, oldData, cancelable)
    {
      if (!this.$$disposed)
      {
        if (oldData === undefined) {
          oldData = null;
        }
        return this.__Registration.fireNonBubblingEvent(
          this, type, qx.event.type.Data, [data, oldData, !!cancelable]
        );
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      USER DATA
    ---------------------------------------------------------------------------
    */

    /** {Map} stored user data */
    __userData : null,


    /**
     * Store user defined data inside the object.
     *
     * @param key {String} the key
     * @param value {Object} the value of the user data
     * @return {void}
     */
    setUserData : function(key, value)
    {
      if (!this.__userData) {
        this.__userData = {};
      }

      this.__userData[key] = value;
    },


    /**
     * Load user defined data from the object
     *
     * @param key {String} the key
     * @return {Object} the user data
     */
    getUserData : function(key)
    {
      if (!this.__userData) {
        return null;
      }
      var data = this.__userData[key];
      return data === undefined ? null : data;
    },





    /*
    ---------------------------------------------------------------------------
      DEBUG
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the regular logger class */
    __Logger : qx.log.Logger,


    /**
     * Logs a debug message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    debug : function(varargs) {
      this.__logMessage("debug", arguments);
    },


    /**
     * Logs an info message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    info : function(varargs) {
      this.__logMessage("info", arguments);
    },


    /**
     * Logs a warning message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    warn : function(varargs) {
      this.__logMessage("warn", arguments);
    },


    /**
     * Logs an error message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    error : function(varargs) {
      this.__logMessage("error", arguments);
    },


    /**
     * Prints the current stack trace
     *
     * @return {void}
     */
    trace : function() {
      this.__Logger.trace(this);
    },


    /**
     * Helper that calls the appropriate logger function with the current object
     * and any number of items.
     *
     * @param level {String} The log level of the message
     * @param varargs {arguments} Arguments list to be logged
     */
    __logMessage : function(level, varargs)
    {
      var argumentsArray = qx.lang.Array.fromArguments(varargs);
      argumentsArray.unshift(this);
      this.__Logger[level].apply(this.__Logger, argumentsArray);
    },






    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns true if the object is disposed.
     *
     * @return {Boolean} Whether the object has been disposed
     */
    isDisposed : function() {
      return this.$$disposed || false;
    },


    /**
     * Dispose this object
     *
     * @return {void}
     */
    dispose : function()
    {
      // Check first
      if (this.$$disposed) {
        return;
      }

      // Mark as disposed (directly, not at end, to omit recursions)
      this.$$disposed = true;
      this.$$instance = null;
      this.$$allowconstruct = null;

      // Debug output
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.disposerDebugLevel") > 2) {
          qx.Bootstrap.debug(this, "Disposing " + this.classname + "[" + this.toHashCode() + "]");
        }
      }

      // Deconstructor support for classes
      var clazz = this.constructor;
      var mixins;

      while (clazz.superclass)
      {
        // Processing this class...
        if (clazz.$$destructor) {
          clazz.$$destructor.call(this);
        }

        // Destructor support for mixins
        if (clazz.$$includes)
        {
          mixins = clazz.$$flatIncludes;

          for (var i=0, l=mixins.length; i<l; i++)
          {
            if (mixins[i].$$destructor) {
              mixins[i].$$destructor.call(this);
            }
          }
        }

        // Jump up to next super class
        clazz = clazz.superclass;
      }

      // remove all property references for IE6 and FF2
      if (this.__removePropertyReferences) {
        this.__removePropertyReferences();
      }

      // Additional checks
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.disposerDebugLevel") > 0)
        {
          var key, value;
          for (key in this)
          {
            value = this[key];

            // Check for Objects but respect values attached to the prototype itself
            if (value !== null && typeof value === "object" && !(qx.Bootstrap.isString(value)))
            {
              // Check prototype value
              // undefined is the best, but null may be used as a placeholder for
              // private variables (hint: checks in qx.Class.define). We accept both.
              if (this.constructor.prototype[key] != null) {
                continue;
              }

              var ff2 = navigator.userAgent.indexOf("rv:1.8.1") != -1;
              var ie6 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
              // keep the old behavior for IE6 and FF2
              if (ff2 || ie6) {
                if (value instanceof qx.core.Object || qx.core.Environment.get("qx.disposerDebugLevel") > 1) {
                  qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                  delete this[key];
                }
              } else {
                if (qx.core.Environment.get("qx.disposerDebugLevel") > 1) {
                  qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                  delete this[key];
                }
              }
            }
          }
        }
      }
    },


    /**
     * Possible reference to special method for IE6 and FF2
     * {@link #__removePropertyReferencesOld}
     *
     * @signature function()
     */
    __removePropertyReferences : null,


    /**
     * Special method for IE6 and FF2 which removes all $$user_ references
     * set up by the properties.
     * @signature function()
     */
    __removePropertyReferencesOld : function() {
      // remove all property references
      var properties = qx.Class.getProperties(this.constructor);
      for (var i = 0, l = properties.length; i < l; i++) {
        delete this["$$user_" + properties[i]];
      }
    },


    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */


    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} Names of fields (which store objects) to dispose
     */
    _disposeObjects : function(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, arguments);
    },


    /**
     * Disconnects and disposes given singleton objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} Names of fields (which store objects) to dispose
     */
    _disposeSingletonObjects : function(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, arguments, true);
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param field {String} Name of the field which refers to the array
     */
    _disposeArray : function(field) {
      qx.util.DisposeUtil.disposeArray(this, field);
    },


    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param field {String} Name of the field which refers to the map
     */
    _disposeMap : function(field) {
      qx.util.DisposeUtil.disposeMap(this, field);
    }
  },




  /*
  *****************************************************************************
     ENVIRONMENT SETTINGS
  *****************************************************************************
  */

  environment : {
    "qx.disposerDebugLevel" : 0
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    // add asserts into each debug build
    if (qx.core.Environment.get("qx.debug")) {
      qx.Class.include(statics, qx.core.MAssert);
    }

    // special treatment for IE6 and FF2
    var ie6 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
    var ff2 = navigator.userAgent.indexOf("rv:1.8.1") != -1;

    // patch the remove property method for IE6 and FF2
    if (ie6 || ff2) {
      members.__removePropertyReferences = members.__removePropertyReferencesOld;
      // debugger;
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (!qx.core.ObjectRegistry.inShutDown) {
      // Cleanup event listeners
      qx.event.Registration.removeAllListeners(this);
    } else {
      // on shutdown, just clear the internal listener map
      qx.event.Registration.deleteAllListeners(this);
    }

    // Cleanup object registry
    qx.core.ObjectRegistry.unregister(this);

    // Cleanup user data
    this.__userData = null;

    // Cleanup properties
    // TODO: Is this really needed for non DOM/JS links?
    var clazz = this.constructor;
    var properties;
    var store = qx.core.Property.$$store;
    var storeUser = store.user;
    var storeTheme = store.theme;
    var storeInherit = store.inherit;
    var storeUseinit = store.useinit;
    var storeInit = store.init;

    while(clazz)
    {
      properties = clazz.$$properties;
      if (properties)
      {
        for (var name in properties)
        {
          if (properties[name].dereference) {
            this[storeUser[name]] = this[storeTheme[name]] = this[storeInherit[name]] = this[storeUseinit[name]] = this[storeInit[name]] = undefined;
          }
        }
      }

      clazz = clazz.superclass;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.event.Registration)

************************************************************************ */

/**
 * Basic event object.
 *
 * Please note:
 * Event objects are only valid during the event dispatch. After the dispatch
 * event objects are pooled or disposed. If you want to safe a reference to an
 * event instance use the {@link #clone} method.
 *
 * The interface is modeled after the DOM level 2 event interface:
 * http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 */
qx.Class.define("qx.event.type.Event",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** The current event phase is the capturing phase. */
    CAPTURING_PHASE : 1,

    /** The event is currently being evaluated at the target */
    AT_TARGET       : 2,

    /** The current event phase is the bubbling phase. */
    BUBBLING_PHASE  : 3
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param canBubble {Boolean?false} Whether or not the event is a bubbling event.
     *     If the event is bubbling, the bubbling can be stopped using
     *     {@link #stopPropagation}
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link #preventDefault}
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(canBubble, cancelable)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (canBubble !== undefined)
        {
          qx.core.Assert.assertBoolean(canBubble, "Invalid argument value 'canBubble'.");
        }

        if (cancelable !== undefined)
        {
          qx.core.Assert.assertBoolean(cancelable, "Invalid argument value 'cancelable'.");
        }
      }

      this._type = null;
      this._target = null;
      this._currentTarget = null;
      this._relatedTarget = null;
      this._originalTarget = null;
      this._stopPropagation = false;
      this._preventDefault = false;
      this._bubbles = !!canBubble;
      this._cancelable = !!cancelable;
      this._timeStamp = (new Date()).getTime();
      this._eventPhase = null;

      return this;
    },


    /**
     * Create a clone of the event object, which is not automatically disposed
     * or pooled after an event dispatch.
     *
     * @param embryo {qx.event.type.Event?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the value is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Event} a clone of this class.
     */
    clone : function(embryo)
    {
      if (embryo) {
        var clone = embryo;
      } else {
        var clone = qx.event.Pool.getInstance().getObject(this.constructor);
      }

      clone._type = this._type;
      clone._target = this._target;
      clone._currentTarget = this._currentTarget;
      clone._relatedTarget = this._relatedTarget;
      clone._originalTarget = this._originalTarget;
      clone._stopPropagation = this._stopPropagation;
      clone._bubbles = this._bubbles;
      clone._preventDefault = this._preventDefault;
      clone._cancelable = this._cancelable;

      return clone;
    },



    /**
     * Stops event from all further processing. Execute this when the
     * current handler should have "exclusive rights" to the event
     * and no further reaction by anyone else should happen.
     */
    stop : function()
    {
      if (this._bubbles) {
        this.stopPropagation();
      }

      if (this._cancelable) {
        this.preventDefault();
      }
    },


    /**
     * This method is used to prevent further propagation of an event during event
     * flow. If this method is called by any event listener the event will cease
     * propagating through the tree. The event will complete dispatch to all listeners
     * on the current event target before event flow stops.
     *
     * @return {void}
     */
    stopPropagation : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(this._bubbles, "Cannot stop propagation on a non bubbling event: " + this.getType());
      }
      this._stopPropagation = true;
    },


    /**
     * Get whether further event propagation has been stopped.
     *
     * @return {Boolean} Whether further propagation has been stopped.
     */
    getPropagationStopped : function() {
      return !!this._stopPropagation;
    },


    /**
     * Prevent the default action of cancelable events, e.g. opening the context
     * menu, ...
     *
     * @return {void}
     */
    preventDefault : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(this._cancelable, "Cannot prevent default action on a non cancelable event: " + this.getType());
      }
      this._preventDefault = true;
    },


    /**
     * Get whether the default action has been prevented
     *
     * @return {Boolean} Whether the default action has been prevented
     */
    getDefaultPrevented : function() {
      return !!this._preventDefault;
    },


    /**
     * The name of the event
     *
     * @return {String} name of the event
     */
    getType : function() {
      return this._type;
    },


    /**
     * Override the event type
     *
     * @param type {String} new event type
     * @return {void}
     */
    setType : function(type) {
      this._type = type;
    },


    /**
     * Used to indicate which phase of event flow is currently being evaluated.
     *
     * @return {Integer} The current event phase. Possible values are
     *         {@link #CAPTURING_PHASE}, {@link #AT_TARGET} and {@link #BUBBLING_PHASE}.
     */
    getEventPhase : function() {
      return this._eventPhase;
    },


    /**
     * Override the event phase
     *
     * @param eventPhase {Integer} new event phase
     * @return {void}
     */
    setEventPhase : function(eventPhase) {
      this._eventPhase = eventPhase;
    },


    /**
     * The time (in milliseconds relative to the epoch) at which the event was created.
     *
     * @return {Integer} the timestamp the event was created.
     */
    getTimeStamp : function() {
      return this._timeStamp;
    },


    /**
     * Returns the event target to which the event was originally
     * dispatched.
     *
     * @return {Element} target to which the event was originally
     *       dispatched.
     */
    getTarget : function() {
      return this._target;
    },


    /**
     * Override event target.
     *
     * @param target {Element} new event target
     * @return {void}
     */
    setTarget : function(target) {
      this._target = target;
    },


    /**
     * Get the event target node whose event listeners are currently being
     * processed. This is particularly useful during event capturing and
     * bubbling.
     *
     * @return {Element} The target the event listener is currently
     *       dispatched on.
     */
    getCurrentTarget : function() {
      return this._currentTarget || this._target;
    },


    /**
     * Override current target.
     *
     * @param currentTarget {Element} new current target
     * @return {void}
     */
    setCurrentTarget : function(currentTarget) {
      this._currentTarget = currentTarget;
    },


    /**
     * Get the related event target. This is only configured for
     * events which also had an influences on another element e.g.
     * mouseover/mouseout, focus/blur, ...
     *
     * @return {Element} The related target
     */
    getRelatedTarget : function() {
      return this._relatedTarget;
    },


    /**
     * Override related target.
     *
     * @param relatedTarget {Element} new related target
     * @return {void}
     */
    setRelatedTarget : function(relatedTarget) {
      this._relatedTarget = relatedTarget;
    },


    /**
     * Get the original event target. This is only configured
     * for events which are fired by another event (often when
     * the target should be reconfigured for another view) e.g.
     * low-level DOM event to widget event.
     *
     * @return {Element} The original target
     */
    getOriginalTarget : function() {
      return this._originalTarget;
    },


    /**
     * Override original target.
     *
     * @param originalTarget {Element} new original target
     * @return {void}
     */
    setOriginalTarget : function(originalTarget) {
      this._originalTarget = originalTarget;
    },


    /**
     * Check whether or not the event is a bubbling event. If the event can
     * bubble the value is true, else the value is false.
     *
     * @return {Boolean} Whether the event bubbles
     */
    getBubbles : function() {
      return this._bubbles;
    },


    /**
     * Set whether the event bubbles.
     *
     * @param bubbles {Boolean} Whether the event bubbles
     * @return {void}
     */
    setBubbles : function(bubbles) {
      this._bubbles = bubbles;
    },


    /**
     * Get whether the event is cancelable
     *
     * @return {Boolean} Whether the event is cancelable
     */
    isCancelable : function() {
      return this._cancelable;
    },


    /**
     * Set whether the event is cancelable
     *
     * @param cancelable {Boolean} Whether the event is cancelable
     * @return {void}
     */
    setCancelable : function(cancelable) {
      this._cancelable = cancelable;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._target = this._currentTarget = this._relatedTarget =
      this._originalTarget = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Event object for data holding event or data changes.
 */
qx.Class.define("qx.event.type.Data",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __data : null,
    __old : null,


    /**
     * Initializes an event object.
     *
     * @param data {var} The event's new data
     * @param old {var?null} The event's old data (optional)
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @return {qx.event.type.Data} the initialized instance.
     */
    init : function(data, old, cancelable)
    {
      this.base(arguments, false, cancelable);

      this.__data = data;
      this.__old = old;

      return this;
    },


    /**
     * Get a copy of this object
     *
     * @param embryo {qx.event.type.Data?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the data is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Data} a copy of this object
     */
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone.__data = this.__data;
      clone.__old = this.__old;

      return clone;
    },


    /**
     * The new data of the event sending this data event.
     * The return data type is the same as the event data type.
     *
     * @return {var} The new data of the event
     */
    getData : function() {
      return this.__data;
    },


    /**
     * The old data of the event sending this data event.
     * The return data type is the same as the event data type.
     *
     * @return {var} The old data of the event
     */
    getOldData : function() {
      return this.__old;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__data = this.__old = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * All event dispatchers must implement this interface. Event dispatchers must
 * register themselves at the event Manager using
 * {@link qx.event.Registration#addDispatcher}.
 */
qx.Interface.define("qx.event.IEventDispatcher",
{
  members:
  {
    /**
     * Whether the dispatcher is responsible for the this event.
     *
     * @param target {Element|qx.core.Event} The event dispatch target
     * @param event {qx.event.type.Event} The event object
     * @param type {String} the event type
     * @return {Boolean} Whether the event dispatcher is responsible for the this event
     */
    canDispatchEvent : function(target, event, type)
    {
      this.assertInstance(event, qx.event.type.Event);
      this.assertString(type);
    },


    /**
     * This function dispatches the event to the event listeners.
     *
     * @param target {Element|qx.core.Event} The event dispatch target
     * @param event {qx.event.type.Event} event object to dispatch
     * @param type {String} the event type
     */
    dispatchEvent : function(target, event, type)
    {
      this.assertInstance(event, qx.event.type.Event);
      this.assertString(type);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Dispatches events directly on the event target (no bubbling nor capturing).
 */
qx.Class.define("qx.event.dispatch.Direct",
{
  extend : qx.core.Object,
  implement : qx.event.IEventDispatcher,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * Create a new instance
   *
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager) {
    this._manager = manager;
  },






  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this dispatcher */
    PRIORITY : qx.event.Registration.PRIORITY_LAST
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canDispatchEvent : function(target, event, type) {
      return !event.getBubbles();
    },


    // interface implementation
    dispatchEvent : function(target, event, type)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (target instanceof qx.core.Object)
        {
          var expectedEventClassName = qx.Class.getEventType(target.constructor, type);
          var expectedEventClass = qx.Class.getByName(expectedEventClassName);
          if (!expectedEventClass)
          {
            this.error(
              "The event type '" + type + "' declared in the class '" +
              target.constructor + " is not an available class': " +
              expectedEventClassName
            );
          }
          else if (!(event instanceof expectedEventClass))
          {
            this.error(
              "Expected event type to be instanceof '" + expectedEventClassName +
              "' but found '" + event.classname + "'"
            );
          }
        }
      }

      event.setEventPhase(qx.event.type.Event.AT_TARGET);

      var listeners = this._manager.getListeners(target, type, false);
      if (listeners)
      {
        for (var i=0, l=listeners.length; i<l; i++)
        {
          var context = listeners[i].context || target;

          if (qx.core.Environment.get("qx.debug")) {
            // warn if the context is disposed
            if (context && context.isDisposed && context.isDisposed()) {
              this.warn(
                "The context object '" + context + "' for the event '" +
                type + "' of '" + target + "'is already disposed."
              );
            }
          }

          listeners[i].handler.call(context, event);
        }
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addDispatcher(statics);
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     Simon Bull

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Simon Bull (sbull)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class manages pooled Object instances.
 *
 * It exists mainly to minimise the amount of browser memory usage by reusing
 * window instances after they have been closed.  However, it could equally be
 * used to pool instances of any type of Object (expect singletons).
 *
 * It is the client's responsibility to ensure that pooled objects are not
 * referenced or used from anywhere else in the application.
 */
qx.Class.define("qx.util.ObjectPool",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param size {Integer} Size of each class pool
   */
  construct : function(size)
  {
    this.base(arguments);

    this.__pool = {};

    if (size != null) {
      this.setSize(size);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Number of objects of each class, which are pooled.
     *
     * A size of "null" represents an unlimited pool.
     */
    size :
    {
      check : "Integer",
      init : Infinity
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {Map} Stores arrays of instances for all managed classes */
    __pool : null,


    /*
    ---------------------------------------------------------------------------
      IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This method finds and returns an instance of a requested type in the pool,
     * if there is one.  Note that the pool determines which instance (if any) to
     * return to the client.  The client cannot get a specific instance from the
     * pool.
     *
     * @param clazz {Class} A reference to a class from which an instance should be created.
     * @return {Object} An instance of the requested type. If non existed in the pool a new
     *   one is transparently created and returned.
     */
    getObject : function(clazz)
    {
      if (this.$$disposed) {
        return new clazz;
      }

      if (!clazz) {
        throw new Error("Class needs to be defined!");
      }

      var obj = null;
      var pool = this.__pool[clazz.classname];

      if (pool) {
        obj = pool.pop();
      }

      if (obj) {
        obj.$$pooled = false;
      } else {
        obj = new clazz;
      }

      return obj;
    },


    /**
     * This method places an Object in a pool of Objects of its type. Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back. The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param obj {Object} An Object instance to pool.
     */
    poolObject : function(obj)
    {
      // Dispose check
      if (!this.__pool) {
        return;
      }

      var classname = obj.classname;
      var pool = this.__pool[classname];

      if (obj.$$pooled) {
        throw new Error("Object is already pooled: " + obj);
      }

      if (!pool) {
        this.__pool[classname] = pool = [];
      }

      // Check to see whether the pool for this type is already full
      if (pool.length > this.getSize())
      {
        // Use enhanced destroy() method instead of simple dispose
        // when available to work together with queues etc.
        if (obj.destroy) {
          obj.destroy();
        } else {
          obj.dispose();
        }

        return;
      }

      obj.$$pooled = true;
      pool.push(obj);
    }
  },






  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var pool = this.__pool;
    var classname, list, i, l;

    for (classname in pool)
    {
      list = pool[classname];
      for (i=0, l=list.length; i<l; i++) {
        list[i].dispose();
      }
    }

    delete this.__pool;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Central instance pool for event objects. All event objects dispatched by the
 * event loader are pooled using this class.
 */
qx.Class.define("qx.event.Pool",
{
  extend : qx.util.ObjectPool,
  type : "singleton",


  // Even though this class contains almost no code it is required because the
  // legacy code needs a place to patch the event pooling behavior.


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments, 30);
  }
});
 /* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class is the common super class for all error classes in qooxdoo.
 *
 * It has a comment and a fail message as members. The toString method returns
 * the comment and the fail message separated by a colon.
 */
qx.Class.define("qx.type.BaseError",
{
  extend : Error,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param comment {String} Comment passed to the assertion call
   * @param failMessage {String} Fail message provided by the assertion
   */
  construct : function(comment, failMessage)
  {
    Error.call(this, failMessage);

    this.__comment = comment || "";
    // opera 10 crashes if the message is an empty string!!!?!?!
    this.message = failMessage || qx.type.BaseError.DEFAULTMESSAGE;
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics :
  {
    DEFAULTMESSAGE : "error"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __comment : null,

    /** {String} Fail message provided by the assertion */
    message : null,


    /**
     * Comment passed to the assertion call
     *
     * @return {String} The comment passed to the assertion call
     */
    getComment : function() {
      return this.__comment;
    },


    /**
     * Get the error message
     *
     * @return {String} The error message
     */
    toString : function() {
      return this.__comment + (this.message ? ": " + this.message : "");
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Assertion errors are thrown if an assertion in {@link qx.core.Assert}
 * fails.
 */
qx.Class.define("qx.core.AssertionError",
{
  extend : qx.type.BaseError,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param comment {String} Comment passed to the assertion call
   * @param failMessage {String} Fail message provided by the assertion
   */
  construct : function(comment, failMessage)
  {
    qx.type.BaseError.call(this, comment, failMessage);
    this.__trace = qx.dev.StackTrace.getStackTrace();
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __trace : null,


    /**
     * Stack trace of the error
     *
     * @return {String[]} The stack trace of the location the exception was thrown
     */
    getStackTrace : function() {
      return this.__trace;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Michael Haitz (mhaitz)

************************************************************************ */

/**
 * This exception is thrown by the {@link qx.event.GlobalError} handler if a
 * observed method throws an exception.
 */
qx.Bootstrap.define("qx.core.GlobalError",
{
  extend : Error,


  /**
   * @param exc {Error} source exception
   * @param args {Array} arguments
   */
  construct : function(exc, args)
  {
    // Do not use the Environment class to keep the minimal
    // package size small [BUG #5068]
    if (qx.Bootstrap.DEBUG) {
      qx.core.Assert.assertNotUndefined(exc);
    }

    this.__failMessage = "GlobalError: " + (exc && exc.message ? exc.message : exc);

    Error.call(this, this.__failMessage);

    this.__arguments = args;
    this.__exc = exc;
  },


  members :
  {
    __exc : null,
    __arguments : null,
    __failMessage : null,


    /**
     * Returns the error message.
     *
     * @return {String} error message
     */
    toString : function() {
      return this.__failMessage;
    },


    /**
     * Returns the arguments which are
     *
     * @return {Object} arguments
     */
    getArguments : function() {
      return this.__arguments;
    },


    /**
     * Get the source exception
     *
     * @return {Error} source exception
     */
    getSourceException : function() {
      return this.__exc;
    }

  },


  destruct : function ()
  {
    this.__exc = null;
    this.__arguments = null;
    this.__failMessage = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Utility class with type check for all native JavaScript data types.
 */
qx.Class.define("qx.lang.Type",
{
  statics :
  {
    /**
     * Get the internal class of the value. See
     * http://thinkweb2.com/projects/prototype/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
     * for details.
     *
     * @signature function(value)
     * @param value {var} value to get the class for
     * @return {String} the internal class of the value
     */
    getClass : qx.Bootstrap.getClass,


    /**
     * Whether the value is a string.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a string.
     */
    isString : qx.Bootstrap.isString,


    /**
     * Whether the value is an array.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an array.
     */
    isArray : qx.Bootstrap.isArray,


    /**
     * Whether the value is an object. Note that built-in types like Window are
     * not reported to be objects.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is an object.
     */
     isObject : qx.Bootstrap.isObject,


    /**
     * Whether the value is a function.
     *
     * @signature function(value)
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a function.
     */
    isFunction : qx.Bootstrap.isFunction,


    /**
    * Whether the value is a regular expression.
    *
    * @param value {var} Value to check.
    * @return {Boolean} Whether the value is a regular expression.
    */
    isRegExp : function(value) {
      return this.getClass(value) == "RegExp";
    },


    /**
    * Whether the value is a number.
    *
    * @param value {var} Value to check.
    * @return {Boolean} Whether the value is a number.
    */
    isNumber : function(value) {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Number" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        this.getClass(value) == "Number" ||
        value instanceof Number)
      );
    },


    /**
    * Whether the value is a boolean.
    *
    * @param value {var} Value to check.
    * @return {Boolean} Whether the value is a boolean.
    */
    isBoolean : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Boolean" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        this.getClass(value) == "Boolean" ||
        value instanceof Boolean)
      );
    },


    /**
     * Whether the value is a date.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a date.
     */
    isDate : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Date" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        this.getClass(value) == "Date" ||
        value instanceof Date)
      );
    },


    /**
     * Whether the value is a Error.
     *
     * @param value {var} Value to check.
     * @return {Boolean} Whether the value is a Error.
     */
    isError : function(value)
    {
      // Added "value !== null" because IE throws an exception "Object expected"
      // by executing "value instanceof Error" if value is a DOM element that
      // doesn't exist. It seems that there is an internal different between a
      // JavaScript null and a null returned from calling DOM.
      // e.q. by document.getElementById("ReturnedNull").
      return (
        value !== null && (
        this.getClass(value) == "Error" ||
        value instanceof Error)
      );
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
   ________________________________________________________________________

   This class contains code based on the following work:

    http://www.JSON.org/json2.js
    2009-06-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

************************************************************************ */

/**
 * Pure JavaScript implementation of the EcmaScript 3.1 JSON object. This class
 * is used, if the browser does not support it natively.
 *
 * @internal
 */
qx.Class.define("qx.lang.JsonImpl",
{
  extend : Object,


  construct : function()
  {
    // bind parse and stringify so they can be called without a context.
    this.stringify = qx.lang.Function.bind(this.stringify, this);
    this.parse = qx.lang.Function.bind(this.parse, this);
  },

  members :
  {
    __gap: null,
    __indent: null,
    __rep: null,
    __stack : null,


    /**
     * This method produces a JSON text from a JavaScript value.
     *
     * @param value {var} any JavaScript value, usually an object or array.
     *
     * @param replacer {Function?} an optional parameter that determines how
     *    object values are stringified for objects. It can be a function or an
     *    array of strings.
     *
     * @param space {String?} an optional parameter that specifies the
     *    indentation of nested structures. If it is omitted, the text will
     *    be packed without extra whitespace. If it is a number, it will specify
     *    the number of spaces to indent at each level. If it is a string
     *    (such as '\t' or '&nbsp;'), it contains the characters used to indent
     *    at each level.
     *
     * @return {String} The JSON string of the value
     */
    stringify : function(value, replacer, space)
    {
      this.__gap = '';
      this.__indent = '';
      this.__stack = [];

      if (qx.lang.Type.isNumber(space))
      {
        // If the space parameter is a number, make an indent string containing that
        // many spaces.
        var space = Math.min(10, Math.floor(space));
        for (var i = 0; i < space; i += 1) {
          this.__indent += ' ';
        }
      }
      else if (qx.lang.Type.isString(space))
      {
        if (space.length > 10) {
          space = space.slice(0, 10);
        }
        // If the space parameter is a string, it will be used as the indent string.
        this.__indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, ignore it.
      if (
        replacer &&
        (qx.lang.Type.isFunction(replacer) || qx.lang.Type.isArray(replacer))
      ) {
        this.__rep = replacer;
      } else {
        this.__rep = null;
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return this.__str('', {'': value});
    },


    /**
     * Produce a string from holder[key].
     *
     * @param key {String} the map key
     * @param holder {Object} an object with the given key
     * @return {String} The string representation of holder[key]
     */
    __str : function(key, holder)
    {
      var mind = this.__gap, partial, value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.
      if (value && qx.lang.Type.isFunction(value.toJSON)) {
        value = value.toJSON(key);
      } else if (qx.lang.Type.isDate(value)) {
        value = this.dateToJSON(value);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.
      if (typeof this.__rep === 'function') {
        value = this.__rep.call(holder, key, value);
      }

      if (value === null) {
        return 'null';
      }

      if (value === undefined) {
        return undefined;
      }

      // What happens next depends on the value's type.
      switch (qx.lang.Type.getClass(value))
      {
        case 'String':
          return this.__quote(value);

        case 'Number':
          // JSON numbers must be finite. Encode non-finite numbers as null.
          return isFinite(value) ? String(value) : 'null';

        case 'Boolean':
          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.
          return String(value);

        case 'Array':
          // Make an array to hold the partial results of stringifying this array value.
          this.__gap += this.__indent;
          partial = [];

          if (this.__stack.indexOf(value) !== -1) {
            throw new TypeError("Cannot stringify a recursive object.")
          }
          this.__stack.push(value);

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.
          var length = value.length;
          for (var i = 0; i < length; i += 1) {
            partial[i] = this.__str(i, value) || 'null';
          }

          this.__stack.pop();

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.
          if (partial.length === 0) {
            var string = '[]';
          } else if (this.__gap) {
            string = '[\n' + this.__gap + partial.join(',\n' + this.__gap) + '\n' + mind + ']'
          } else {
            string = '[' + partial.join(',') + ']';
          }
          this.__gap = mind;
          return string;

        case 'Object':
          // Make an array to hold the partial results of stringifying this object value.
          this.__gap += this.__indent;
          partial = [];

          if (this.__stack.indexOf(value) !== -1) {
            throw new TypeError("Cannot stringify a recursive object.")
          }
          this.__stack.push(value);

          // If the replacer is an array, use it to select the members to be stringified.
          if (this.__rep && typeof this.__rep === 'object')
          {
            var length = this.__rep.length;
            for (var i = 0; i < length; i += 1)
            {
              var k = this.__rep[i];
              if (typeof k === 'string')
              {
                var v = this.__str(k, value);
                if (v) {
                  partial.push(this.__quote(k) + (this.__gap ? ': ' : ':') + v);
                }
              }
            }
          }
          else
          {
            // Otherwise, iterate through all of the keys in the object.
            for (var k in value)
            {
              if (Object.hasOwnProperty.call(value, k))
              {
                var v = this.__str(k, value);
                if (v) {
                  partial.push(this.__quote(k) + (this.__gap ? ': ' : ':') + v);
                }
              }
            }
          }

          this.__stack.pop();

          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.
          if (partial.length === 0) {
            var string =  '{}';
          } else if (this.__gap) {
            string = '{\n' + this.__gap + partial.join(',\n' + this.__gap) + '\n' + mind + '}';
          } else {
            string = '{' + partial.join(',') + '}';
          }
          this.__gap = mind;
          return string;
      }
    },


    /**
     * Convert a date to JSON
     *
     * @param date {Date} The date to convert
     * @return {String} The JSON representation of the date
     */
    dateToJSON : function(date)
    {
      // Format integers to have at least two digits.
      var f2 = function(n) {
        return n < 10 ? '0' + n : n;
      }

      var f3 = function(n) {
        var value = f2(n);
        return n < 100 ? '0' + value : value;
      }

      return isFinite(date.valueOf()) ?
         date.getUTCFullYear()   + '-' +
       f2(date.getUTCMonth() + 1) + '-' +
       f2(date.getUTCDate())      + 'T' +
       f2(date.getUTCHours())     + ':' +
       f2(date.getUTCMinutes())   + ':' +
       f2(date.getUTCSeconds())   + '.' +
       f3(date.getUTCMilliseconds()) + 'Z' : null;
    },


    /**
     * If the string contains no control characters, no quote characters, and no
     * backslash characters, then we can safely slap some quotes around it.
     * Otherwise we must also replace the offending characters with safe escape
     * sequences.
     *
     * @param string {String} The string to quote
     * @return {String} The quoted string
     */
    __quote : function(string)
    {
      var meta = {    // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"' : '\\"',
          '\\': '\\\\'
      };

      var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      escapable.lastIndex = 0;

      if (escapable.test(string))
      {
        return '"' + string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
      }
      else
      {
        return '"' + string + '"';
      }
    },


    /**
     * This method parses a JSON text to produce an object or array.
     * It can throw a SyntaxError exception.
     *
     * @param text {String} JSON string to parse
     *
     * @param reviver {Function?} Optional reviver function to filter and
     *    transform the results
     *
     * @return {Object} The parsed JSON object
     *
     * @lint ignoreDeprecated(eval)
     */
    parse : function(text, reviver)
    {
      var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      cx.lastIndex = 0;

      // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.
      if (cx.test(text))
      {
        text = text.replace(cx, function (a) {
          return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with '()' and 'new'
      // because they can cause invocation, and '=' because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.

      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
      if (
        /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
          replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
          replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
      ) {
        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.
        var j = eval('(' + text + ')');

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.
        return typeof reviver === 'function' ?  this.__walk({'': j}, '', reviver) : j;
      }

      // If the text is not JSON parseable, then a SyntaxError is thrown.
      throw new SyntaxError('JSON.parse');
    },


    /**
     * The walk method is used to recursively walk the resulting structure so
     * that modifications can be made.
     *
     * @param holder {Object} the root object
     * @param key {String} walk holder[key]
     * @param reviver {Function} callback, which is called on every node.
     */
    __walk : function(holder, key, reviver)
    {
      var value = holder[key];
      if (value && typeof value === 'object')
      {
        for (var k in value)
        {
          if (Object.hasOwnProperty.call(value, k))
          {
            var v = this.__walk(value, k, reviver);
            if (v !== undefined) {
              value[k] = v;
            } else {
              delete value[k];
            }
          }
        }
      }
      return reviver.call(holder, key, value);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#optional(qx.util.ColorUtil)
#optional(qx.ui.core.Widget)
#require(qx.lang.Type)

************************************************************************ */

/**
 * A collection of assertions.
 *
 * These methods can be used to assert incoming parameters, return values, ...
 * If an assertion fails an {@link AssertionError} is thrown.
 *
 * Assertions are used in unit tests as well.
 */
qx.Class.define("qx.core.Assert",
{
  statics :
  {
    __logError : true,

    /**
     * Assert that the condition evaluates to <code>true</code>. An
     * {@link AssertionError} is thrown if otherwise.
     *
     * @param comment {String} Message to be shown if the assertion fails. This
     *    message is provided by the user.
     * @param msgvarargs {var} any number of parts of a message to show if assertion
     *                         triggers. Each will be converted to a string and all
     *                         parts will be concatenated. E. g. instead of
     *                         "Got invalid value " + this.__toString(val) + "!!!!!"
     *                         use
     *                         "Got invalid value ", val, "!!!!!"
     *                         (much better performance)
     *
     */
    __fail : function(comment, msgvarargs)
    {
      // Build up message from message varargs. It's not really important
      // how long this takes as it is done only when assertion is triggered
      var msg = "";
      for (var i=1, l=arguments.length; i<l; i++)
      {
        msg = msg + this.__toString(arguments[i]);
      }

      var fullComment = "";
      if (msg) {
        fullComment = comment + ": " + msg;
      } else {
        fullComment = comment;
      }
      var errorMsg = "Assertion error! " + fullComment;

      if (this.__logError) {
        qx.Bootstrap.error(errorMsg);
      }
      if (qx.Class.isDefined("qx.core.AssertionError"))
      {
        var err = new qx.core.AssertionError(comment, msg);
        if (this.__logError) {
          qx.Bootstrap.error("Stack trace: \n" + err.getStackTrace());
        }
        throw err;
      } else {
        throw new Error(errorMsg);
      }
    },


    /**
     * Convert an unknown value to a string to display in error messages
     *
     * @param value {var} any value
     * @return {String} a string representation of the value
     */
    __toString : function(value)
    {
      var stringValue;

      if (value === null)
      {
        stringValue = "null";
      }
      else if (qx.lang.Type.isArray(value) && value.length > 10)
      {
        stringValue = "Array[" + value.length + "]";
      } else if ((value instanceof Object) && (value.toString == null))
      {
        stringValue = qx.lang.Json.stringify(value, null, 2);
      } else
      {
        try {
          stringValue = value.toString();
        } catch(e) {
          stringValue = "";
        }
      }
      return stringValue;
    },


    /**
     * Assert that the condition evaluates to <code>true</code>.
     *
     * @param condition {var} Condition to check for. Must evaluate to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assert : function(condition, msg) {
      condition == true || this.__fail(msg || "", "Called assert with 'false'");
    },


    /**
     * Raise an {@link AssertionError}.
     *
     * @param msg {String} Message to be shown if the assertion fails.
     * @param compact {Boolean} Show less verbose message. Default: false.
     */
    fail : function(msg, compact) {
      var msgvarargs = compact ? "" : "Called fail().";
      this.__fail(msg || "", msgvarargs);
    },


    /**
     * Assert that the value is <code>true</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>true</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertTrue : function(value, msg) {
      (value === true) || this.__fail(msg || "", "Called assertTrue with '", value, "'");
    },


    /**
     * Assert that the value is <code>false</code> (Identity check).
     *
     * @param value {Boolean} Condition to check for. Must be identical to
     *    <code>false</code>.
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFalse : function(value, msg) {
      (value === false) || this.__fail(msg || "", "Called assertFalse with '", value, "'");
    },


    /**
     * Assert that both values are equal. (Uses the equality operator
     * <code>==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertEquals : function(expected, found, msg)
    {
      expected == found || this.__fail(
        msg || "",
        "Expected '", expected,
        "' but found '", found, "'!"
      );
    },

    /**
     * Assert that both values are not equal. (Uses the not equality operator
     * <code>!=</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotEquals : function(expected, found, msg)
    {
        expected != found || this.__fail(
        msg || "",
        "Expected '",expected,
        "' to be not equal with '", found, "'!"
      );
    },

    /**
     * Assert that both values are identical. (Uses the identity operator
     * <code>===</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertIdentical : function(expected, found, msg)
    {
      expected === found || this.__fail(
        msg || "",
        "Expected '", expected,
        "' (identical) but found '", found, "'!"
      );
    },


    /**
     * Assert that both values are not identical. (Uses the not identity operator
     * <code>!==</code>.)
     *
     * @param expected {var} Reference value
     * @param found {var} found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotIdentical : function(expected, found, msg)
    {
      expected !== found || this.__fail(
        msg || "",
        "Expected '", expected,
        "' to be not identical with '", found, "'!"
      );
    },


    /**
     * Assert that the value is not <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotUndefined : function(value, msg)
    {
      value !== undefined || this.__fail(
        msg || "",
        "Expected value not to be undefined but found undefined!"
      );
    },


    /**
     * Assert that the value is <code>undefined</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertUndefined : function(value, msg)
    {
      value === undefined || this.__fail(
        msg || "",
        "Expected value to be undefined but found ", value, "!"
      );
    },


    /**
     * Assert that the value is not <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNotNull : function(value, msg)
    {
      value !== null || this.__fail(
        msg || "",
        "Expected value not to be null but found null!"
      );
    },


    /**
     * Assert that the value is <code>null</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNull : function(value, msg)
    {
      value === null || this.__fail(
        msg || "",
        "Expected value to be null but found ", value, "!"
      );
    },


    /**
     * Assert that the first two arguments are equal, when serialized into
     * JSON.
     *
     * @param expected {var} The the expected value
     * @param found {var} The found value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertJsonEquals : function(expected, found, msg) {
      this.assertEquals(
        qx.lang.Json.stringify(expected),
        qx.lang.Json.stringify(found),
        msg
      );
    },


    /**
     * Assert that the given string matches the regular expression
     *
     * @param str {String} String, which should match the regular expression
     * @param re {String|RegExp} Regular expression to match
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMatch : function(str, re, msg)
    {
      this.assertString(str);
      this.assert(
        qx.lang.Type.isRegExp(re) || qx.lang.Type.isString(re),
        "The parameter 're' must be a string or a regular expression."
      );
      str.search(re) >= 0 || this.__fail(
        msg || "",
        "The String '", str, "' does not match the regular expression '", re.toString(), "'!"
      );
    },


    /**
     * Assert that the number of arguments is within the given range
     *
     * @param args {arguments} The <code>arguments<code> variable of a function
     * @param minCount {Integer} Minimal number of arguments
     * @param maxCount {Integer} Maximum number of arguments
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArgumentsCount : function(args, minCount, maxCount, msg)
    {
      var argCount = args.length;
      (argCount >= minCount && argCount <= maxCount) || this.__fail(
        msg || "",
        "Wrong number of arguments given. Expected '", minCount, "' to '",
        maxCount, "' arguments but found '", arguments.length, "' arguments."
      )
    },


    /**
     * Assert that an event is fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   fires the event.
     * @param listenerFunc {Function?null} The function which will be invoked in the
     *   listener. The function receives one parameter which is the event.
     * @param msg {String?""} Message to be shows if the assertion fails.
     */
    assertEventFired : function(obj, event, invokeFunc, listenerFunc, msg)
    {
      var called = false;
      var listener = function(e)
      {
        if (listenerFunc) {
          listenerFunc.call(obj, e);
        }
        called = true;
      };

      var id;
      try {
        id = obj.addListener(event, listener, obj);
        invokeFunc.call();
      } catch (ex) {
        throw ex;
      } finally {
        try {
          obj.removeListenerById(id);
        } catch (ex) { /* ignore */ }
      }

      called === true || this.__fail(msg || "", "Event (", event, ") not fired.");
    },


    /**
     * Assert that an event is not fired.
     *
     * @param obj {Object} The object on which the event should be fired.
     * @param event {String} The event which should be fired.
     * @param invokeFunc {Function} The function which will be invoked and which
     *   should not fire the event.
     * @param msg {String} Message to be shows if the assertion fails.
     */
    assertEventNotFired : function(obj, event, invokeFunc, msg)
    {
      var called = false;
      var listener = function(e) {
        called = true;
      };
      var id = obj.addListener(event, listener, obj);

      invokeFunc.call();
      called === false || this.__fail(msg || "", "Event (", event, ") was fired.");

      obj.removeListenerById(id);
    },


    /**
     * Asserts that the callback raises a matching exception.
     *
     * @param callback {Function} function to check
     * @param exception {Error?Error} Expected constructor of the exception.
     *   The assertion fails if the raised exception is not an instance of the
     *   parameter.
     * @param re {String|RegExp} The assertion fails if the error message does
     *   not match this parameter
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertException : function(callback, exception, re, msg)
    {
      var exception = exception || Error;
      var error;

      try {
        this.__logError = false;
        callback();
      } catch(ex) {
        error = ex;
      } finally {
        this.__logError = true;
      }

      if (error == null) {
        this.__fail(msg || "", "The function did not raise an exception!");
      }

      error instanceof exception || this.__fail(msg || "",
        "The raised exception does not have the expected type! ",
        exception , " != ", error);

      if (re) {
        this.assertMatch(error.toString(), re, msg);
      }
    },


    /**
     * Assert that the value is an item in the given array.
     *
     * @param value {var} Value to check
     * @param array {Array} List of valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInArray : function(value, array, msg)
    {
      array.indexOf(value) !== -1 || this.__fail(
        msg || "",
        "The value '", value,
        "' must have any of the values defined in the array '",
        array, "'"
      );
    },


    /**
     * Assert that both array have identical array items.
     *
     * @param expected {Array} The expected array
     * @param found {Array} The found array
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArrayEquals : function(expected, found, msg)
    {
      this.assertArray(expected, msg);
      this.assertArray(found, msg);

      msg = msg ||
        "Expected [" + expected.join(", ") +
        "], but found [" + found.join(", ") + "]";

      if (expected.length !== found.length) {
        this.fail(msg, true);
      }

      for (var i=0; i<expected.length; i++) {
        if (expected[i] !== found[i]) {
          this.fail(msg, true);
        }
      }
    },


    /**
     * Assert that the value is a key in the given map.
     *
     * @param value {var} Value to check
     * @param map {map} Map, where the keys represent the valid values
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertKeyInMap : function(value, map, msg)
    {
      map[value] !== undefined || this.__fail(
        msg || "",
        "The value '", value, "' must must be a key of the map '",
        map, "'"
      );
    },


    /**
     * Assert that the value is a function.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertFunction : function(value, msg)
    {
      qx.lang.Type.isFunction(value) || this.__fail(
        msg || "",
        "Expected value to be typeof function but found ", value, "!"
      );
    },


    /**
     * Assert that the value is a string.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertString : function(value, msg) {
      qx.lang.Type.isString(value) || this.__fail(
        msg || "",
        "Expected value to be a string but found ", value, "!"
      );
    },


    /**
     * Assert that the value is a boolean.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertBoolean : function(value, msg)
    {
      qx.lang.Type.isBoolean(value) || this.__fail(
        msg || "",
        "Expected value to be a boolean but found ", value, "!"
      );
    },


    /**
     * Assert that the value is a number.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertNumber : function(value, msg)
    {
      (qx.lang.Type.isNumber(value) && isFinite(value)) || this.__fail(
        msg || "",
        "Expected value to be a number but found ", value, "!"
      );
    },


    /**
     * Assert that the value is a number >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveNumber : function(value, msg)
    {
      (qx.lang.Type.isNumber(value) && isFinite(value) && value >= 0) || this.__fail(
        msg || "",
        "Expected value to be a number >= 0 but found ", value, "!"
      );
    },


    /**
     * Assert that the value is an integer.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInteger : function(value, msg)
    {
      (qx.lang.Type.isNumber(value) && isFinite(value) && value % 1 === 0) || this.__fail(
        msg || "",
        "Expected value to be an integer but found ", value, "!"
      );
    },


    /**
     * Assert that the value is an integer >= 0.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertPositiveInteger : function(value, msg)
    {
      var condition = (
        qx.lang.Type.isNumber(value) &&
        isFinite(value) &&
        value % 1 === 0 &&
        value >= 0
      );
      condition || this.__fail(
        msg || "",
        "Expected value to be an integer >= 0 but found ", value, "!"
      );
    },


    /**
     * Assert that the value is inside the given range.
     *
     * @param value {var} Value to check
     * @param min {Number} lower bound
     * @param max {Number} upper bound
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInRange : function(value, min, max, msg)
    {
      (value >= min && value <= max) || this.__fail(
        msg || "",
        qx.lang.String.format("Expected value '%1' to be in the range '%2'..'%3'!", [value, min, max])
      );
    },


    /**
     * Assert that the value is an object.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertObject : function(value, msg)
    {
      var condition = value !== null &&
        (qx.lang.Type.isObject(value) || typeof value === "object");
      condition || this.__fail(
        msg || "",
        "Expected value to be typeof object but found ", (value), "!"
      );
    },


    /**
     * Assert that the value is an array.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertArray : function(value, msg)
    {
      qx.lang.Type.isArray(value) || this.__fail(
        msg || "",
        "Expected value to be an array but found ", value, "!"
      );
    },


    /**
     * Assert that the value is a map either created using <code>new Object</code>
     * or by using the object literal notation <code>{ ... }</code>.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertMap : function(value, msg)
    {
      qx.lang.Type.isObject(value) || this.__fail(
        msg || "",
        "Expected value to be a map but found ", value, "!"
      );
    },


    /**
    * Assert that the value is a regular expression.
    *
    * @param value {var} Value to check
    * @param msg {String} Message to be shown if the assertion fails.
    */
   assertRegExp : function(value, msg)
   {
     qx.lang.Type.isRegExp(value) || this.__fail(
       msg || "",
       "Expected value to be a regular expression but found ", value, "!"
     );
   },


    /**
     * Assert that the value has the given type using the <code>typeof</code>
     * operator. Because the type is not always what it is supposed to be it is
     * better to use more explicit checks like {@link #assertString} or
     * {@link #assertArray}.
     *
     * @param value {var} Value to check
     * @param type {String} expected type of the value
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertType : function(value, type, msg)
    {
      this.assertString(type, "Invalid argument 'type'");

      typeof(value) === type || this.__fail(
        msg || "",
        "Expected value to be typeof '", type, "' but found ", value, "!"
      );
    },


    /**
     * Assert that the value is an instance of the given class.
     *
     * @param value {var} Value to check
     * @param clazz {Class} The value must be an instance of this class
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInstance : function(value, clazz, msg)
    {
      var className = clazz.classname || clazz + "";

      value instanceof clazz || this.__fail(
        msg || "",
        "Expected value to be instanceof '", className, "' but found ", value, "!"
      );
    },


    /**
     * Assert that the value implements the given interface.
     *
     * @param value {var} Value to check
     * @param iface {Class} The value must implement this interface
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertInterface : function(value, iface, msg) {
      qx.Class.implementsInterface(value, iface) || this.__fail(
        msg || "",
        "Expected object '", value, "' to implement the interface '", iface, "'!"
      );
    },


    /**
     * Assert that the value represents the given CSS color value. This method
     * parses the color strings and compares the RGB values. It is able to
     * parse values supported by {@link qx.util.ColorUtil#stringToRgb}.
     *
     *  @param expected {String} The expected color
     *  @param value {String} The value to check
     *  @param msg {String} Message to be shown if the assertion fails.
     */
    assertCssColor : function(expected, value, msg)
    {
      var ColorUtil = qx.Class.getByName("qx.util.ColorUtil");
      if (!ColorUtil) {
        throw new Error("qx.util.ColorUtil not available! Your code must have a dependency on 'qx.util.ColorUtil'");
      }

      var expectedRgb = ColorUtil.stringToRgb(expected);
      try
      {
        var valueRgb = ColorUtil.stringToRgb(value);
      }
      catch (ex)
      {
        this.__fail(
          msg || "",
          "Expected value to be the CSS color '", expected,
          "' (rgb(", expectedRgb.join(","),
          ")), but found value '", value, "', which cannot be converted to a CSS color!"
        );
      }

      var condition = expectedRgb[0] == valueRgb[0] && expectedRgb[1] == valueRgb[1] && expectedRgb[2] == valueRgb[2];
      condition || this.__fail(
        msg || "",
          "Expected value to be the CSS color '", expectedRgb,
          "' (rgb(", expectedRgb.join(","),
          ")), but found value '", value,
          "' (rgb(", valueRgb.join(","), "))!"
      );
    },


    /**
     * Assert that the value is a DOM element.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertElement : function(value, msg)
    {
      // see qx.dom.Node.isElement
      !!(value && value.nodeType === 1) || this.__fail(
        msg || "",
        "Expected value to be a DOM element but found  '", value, "'!"
      );
    },


    /**
     * Assert that the value is an instance of {@link qx.core.Object}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxObject : function(value, msg)
    {
      this.__isQxInstance(value, "qx.core.Object") || this.__fail(
        msg || "",
        "Expected value to be a qooxdoo object but found ", value, "!"
      );
    },


    /**
     * Assert that the value is an instance of {@link qx.ui.core.Widget}.
     *
     * @param value {var} Value to check
     * @param msg {String} Message to be shown if the assertion fails.
     */
    assertQxWidget : function(value, msg)
    {
      this.__isQxInstance(value, "qx.ui.core.Widget") || this.__fail(
        msg || "",
        "Expected value to be a qooxdoo widget but found ", value, "!"
      );
    },


    /**
     * Internal helper for checking the instance of a qooxdoo object using the
     * classname.
     *
     * @param object {var} The object to check.
     * @param classname {String} The classname of the class as string.
     */
    __isQxInstance : function(object, classname)
    {
      if (!object) {
        return false;
      }
      var clazz = object.constructor;
      while(clazz) {
        if (clazz.classname === classname) {
          return true;
        }
        clazz = clazz.superclass;
      }
      return false;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#optional(qx.core.Environment)

************************************************************************ */

/**
 * The GlobalError class stores a reference to a global error handler function.
 *
 *  This function is called for each uncatched JavaScript exception. To enable
 *  global error handling the setting <code>qx.globalErrorHandling</code> must
 *  be enabled and an error handler must be registered.
 *  Further each JavaScript "entry point" must be wrapped with a call to
 *  {@link qx.event.GlobalError#observeMethod}.
 */
qx.Bootstrap.define("qx.event.GlobalError",
{
  statics :
  {
    /**
     * Little helper to check if the global error handling is enabled.
     * @return {Boolean} <code>true</code>, if it is enabled.
     */
    __isGlobaErrorHandlingEnabled : function() {
      if (qx.core && qx.core.Environment) {
        return qx.core.Environment.get("qx.globalErrorHandling");
      } else {
        return !!qx.Bootstrap.getEnvironmentSetting("qx.globalErrorHandling");
      }
    },


    /**
     * Set the global fallback error handler
     *
     * @param callback {Function} The error handler. The first argument is the
     *    exception, which caused the error
     * @param context {Object} The "this" context of the callback function
     */
    setErrorHandler : function(callback, context)
    {
      this.__callback = callback || null;
      this.__context = context || window;

      if (this.__isGlobaErrorHandlingEnabled())
      {
        // wrap the original onerror
        if (callback && window.onerror) {
          var wrappedHandler = qx.Bootstrap.bind(this.__onErrorWindow, this);
          if (this.__originalOnError == null) {
            this.__originalOnError = window.onerror;
          }
          var self = this;
          window.onerror = function(msg, uri, lineNumber) {
            self.__originalOnError(msg, uri, lineNumber);
            wrappedHandler(msg, uri, lineNumber);
          };
        }

        if (callback && !window.onerror) {
          window.onerror = qx.Bootstrap.bind(this.__onErrorWindow, this);
        }

        // reset
        if (this.__callback == null) {
          if (this.__originalOnError != null) {
            window.onerror = this.__originalOnError;
            this.__originalOnError = null;
          } else {
            window.onerror = null;
          }
        }
      }
    },


    /**
     * Catches all errors of the <code>window.onerror</code> handler
     * and passes an {@link qx.core.WindowError} object to the error
     * handling.
     *
     * @param msg {String} browser error message
     * @param uri {String} uri to errornous script
     * @param lineNumber {Integer} line number of error
     */
    __onErrorWindow : function(msg, uri, lineNumber)
    {
      if (this.__callback)
      {
        this.handleError(new qx.core.WindowError(msg, uri, lineNumber));
        return true;
      }
    },


    /**
     * Wraps a method with error handling code. Only methods, which are called
     * directly by the browser (e.g. event handler) should be wrapped.
     *
     * @param method {Function} method to wrap
     * @return {Function} The function wrapped with error handling code
     */
    observeMethod : function(method)
    {
      if (this.__isGlobaErrorHandlingEnabled())
      {
        var self = this;
        return function()
        {
          if (!self.__callback) {
            return method.apply(this, arguments);
          }

          try {
            return method.apply(this, arguments);
          } catch(ex) {
            self.handleError(new qx.core.GlobalError(ex, arguments));
         }
        };
      }
      else
      {
        return method;
      }
    },


    /**
     * Delegates every given exception to the registered error handler
     *
     * @param ex {qx.core.WindowError|exception} Exception to delegate
     */
    handleError : function(ex)
    {
      if (this.__callback) {
        this.__callback.call(this.__context, ex);
      }
    }
  },


  defer : function(statics)
  {
    // only use the environment class if already loaded
    if (qx.core && qx.core.Environment) {
      qx.core.Environment.add("qx.globalErrorHandling", true);
    } else {
      qx.Bootstrap.setEnvironmentSetting("qx.globalErrorHandling", true);
    }

    statics.setErrorHandler(null, null);
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
   ________________________________________________________________________

   This class contains code based on the following work:

    http://www.JSON.org/json2.js
    2009-06-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

************************************************************************ */

/**
 * JSON (JavaScript Object Notation) parser, serializer for qooxdoo
 *
 * This class implements EcmaScript 3.1 JSON support.
 *
 * http://wiki.ecmascript.org/doku.php?id=es3.1:json_support
 *
 * If the browser supports native JSON the browser implementation is used.
 */
qx.Class.define("qx.lang.Json",
{
  statics :
  {
    /**
     * {JSON} The JSON object to use. If the browser has native JSON support
     *   this member points to <code>window.JSON</code>. Otherwise it points to
     *   the qooxdoo implementation {@link JsonImpl}.
     */
    JSON : (
      qx.lang.Type.getClass(window.JSON) == "JSON" &&

      // Parsing actually works.
      JSON.parse('{"x":1}').x === 1 &&

      // Stringify supports replacer.
      //
      // Catches browser bug found in Firefox >=3.5 && < 4, see
      // https://bugzilla.mozilla.org/show_bug.cgi?id=509184
      JSON.stringify({"prop":"val"}, function(k,v) {
        return k === "prop" ? "repl" : v;
      }).indexOf("repl") > 0) ? window.JSON : new qx.lang.JsonImpl(),

    /**
     * This method produces a JSON text from a JavaScript value.
     *
     * When an object value is found, if the object contains a toJSON
     * method, its toJSON method will be called and the result will be
     * stringified. A toJSON method does not serialize: it returns the
     * value represented by the name/value pair that should be serialized,
     * or undefined if nothing should be serialized. The toJSON method
     * will be passed the key associated with the value, and this will be
     * bound to the object holding the key.
     *
     * For example, this would serialize Dates as ISO strings.
     *
     * <pre class="javascript">
     *     Date.prototype.toJSON = function (key) {
     *         function f(n) {
     *             // Format integers to have at least two digits.
     *             return n < 10 ? '0' + n : n;
     *         }
     *
     *         return this.getUTCFullYear()   + '-' +
     *              f(this.getUTCMonth() + 1) + '-' +
     *              f(this.getUTCDate())      + 'T' +
     *              f(this.getUTCHours())     + ':' +
     *              f(this.getUTCMinutes())   + ':' +
     *              f(this.getUTCSeconds())   + 'Z';
     *     };
     * </pre>
     *
     * You can provide an optional replacer method. It will be passed the
     * key and value of each member, with this bound to the containing
     * object. The value that is returned from your method will be
     * serialized. If your method returns undefined, then the member will
     * be excluded from the serialization.
     *
     * If the replacer parameter is an array of strings, then it will be
     * used to select the members to be serialized. It filters the results
     * such that only members with keys listed in the replacer array are
     * stringified.
     *
     * Values that do not have JSON representations, such as undefined or
     * functions, will not be serialized. Such values in objects will be
     * dropped; in arrays they will be replaced with null. You can use
     * a replacer function to replace those with JSON values.
     * JSON.stringify(undefined) returns undefined.
     *
     * The optional space parameter produces a stringification of the
     * value that is filled with line breaks and indentation to make it
     * easier to read.
     *
     * If the space parameter is a non-empty string, then that string will
     * be used for indentation. If the space parameter is a number, then
     * the indentation will be that many spaces.
     *
     * Example:
     *
     * <pre class="javascript">
     * text = JSON.stringify(['e', {pluribus: 'unum'}]);
     * // text is '["e",{"pluribus":"unum"}]'
     *
     *
     * text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
     * // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
     *
     * text = JSON.stringify([new Date()], function (key, value) {
     *     return this[key] instanceof Date ?
     *         'Date(' + this[key] + ')' : value;
     * });
     * // text is '["Date(---current time---)"]'
     * </pre>
     *
     * @signature function(value, replacer, space)
     *
     * @param value {var} any JavaScript value, usually an object or array.
     *
     * @param replacer {Function?} an optional parameter that determines how
     *    object values are stringified for objects. It can be a function or an
     *    array of strings.
     *
     * @param space {String?} an optional parameter that specifies the
     *    indentation of nested structures. If it is omitted, the text will
     *    be packed without extra whitespace. If it is a number, it will specify
     *    the number of spaces to indent at each level. If it is a string
     *    (such as '\t' or '&nbsp;'), it contains the characters used to indent
     *    at each level.
     *
     * @return {String} The JSON string of the value
     */
    stringify : null, // will be set in the defer block


    /**
     * This method parses a JSON text to produce an object or array.
     * It can throw a SyntaxError exception.
     *
     * The optional reviver parameter is a function that can filter and
     * transform the results. It receives each of the keys and values,
     * and its return value is used instead of the original value.
     * If it returns what it received, then the structure is not modified.
     * If it returns undefined then the member is deleted.
     *
     * Example:
     *
     * <pre class="javascript">
     * // Parse the text. Values that look like ISO date strings will
     * // be converted to Date objects.
     *
     * myData = JSON.parse(text, function (key, value)
     * {
     *   if (typeof value === 'string')
     *   {
     *     var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
     *     if (a) {
     *       return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
     *     }
     *   }
     *   return value;
     * });
     *
     * myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
     *     var d;
     *     if (typeof value === 'string' &&
     *             value.slice(0, 5) === 'Date(' &&
     *             value.slice(-1) === ')') {
     *         d = new Date(value.slice(5, -1));
     *         if (d) {
     *             return d;
     *         }
     *     }
     *     return value;
     * });
     * </pre>
     *
     * @signature function(text, reviver)
     *
     * @param text {String} JSON string to parse
     *
     * @param reviver {Function?} Optional reviver function to filter and
     *    transform the results
     *
     * @return {Object} The parsed JSON object
     */
    parse : null // will be set in the defer block
  },


  defer : function(statics)
  {
    statics.stringify = statics.JSON.stringify;
    statics.parse = statics.JSON.parse;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event handler Interface.
 *
 * All custom event handler like mouse or keyboard event handler must implement
 * this interface.
 */
qx.Interface.define("qx.event.IEventHandler",
{
  statics :
  {
    /** {Integer} The event target must be a dom node */
    TARGET_DOMNODE: 1,

    /** {Integer} The event target must be a window object */
    TARGET_WINDOW : 2,

    /** {Integer} The event target must be a qooxdoo object */
    TARGET_OBJECT: 4,

    /** {Integer} The event target must be a document node */
    TARGET_DOCUMENT: 8
  },


  members :
  {
    /**
     * Whether the event handler can handle events of the given type. If the
     * event handler class has a static variable called <code>IGNORE_CAN_HANDLE</code>
     * with the value <code>true</code> this function is not called. Whether the
     * handler can handle the event is them only determined by the static variables
     * <code>SUPPORTED_TYPES</code> and <code>TARGET_CHECK</code>.
     *
     * @param target {var} The target to, which the event handler should
     *     be attached
     * @param type {String} event type
     * @return {Boolean} Whether the event handler can handle events of the
     *     given type.
     */
    canHandleEvent : function(target, type) {},


    /**
     * This method is called each time an event listener, for one of the
     * supported events, is added using {@link qx.event.Manager#addListener}.
     *
     * @param target {var} The target to, which the event handler should
     *     be attached
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     */
    registerEvent : function(target, type, capture) {},


    /**
     * This method is called each time an event listener, for one of the
     * supported events, is removed by using {@link qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {var} The target from, which the event handler should
     *     be removed
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event.
     */
    unregisterEvent : function(target, type, capture) {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class provides qooxdoo object event support.
 */
qx.Class.define("qx.event.handler.Object",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_LAST,

    /** {Map} Supported event types */
    SUPPORTED_TYPES : null,

    /** {Integer} Which target check to use */
    TARGET_CHECK : qx.event.IEventHandler.TARGET_OBJECT,

    /** {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return qx.Class.supportsEvent(target.constructor, type);
    },


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    }
  },






  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#optional(qx.log.Logger)
#ignore(qx.log)

************************************************************************ */

/**
 * Methods to cleanup fields from maps/objects.
 */
qx.Class.define("qx.util.DisposeUtil",
{
  statics :
  {
    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param obj {Object} Object which contains the fields
     * @param arr {Array} List of fields (which store objects) to dispose
     * @param disposeSingletons {Boolean?} true, if singletons should be disposed
     */
    disposeObjects : function(obj, arr, disposeSingletons)
    {
      var name;
      for (var i=0, l=arr.length; i<l; i++)
      {
        name = arr[i];
        if (obj[name] == null || !obj.hasOwnProperty(name)) {
          continue;
        }

        if (!qx.core.ObjectRegistry.inShutDown)
        {
          if (obj[name].dispose) {
            // singletons
            if (!disposeSingletons && obj[name].constructor.$$instance) {
              throw new Error("The object stored in key " + name + " is a singleton! Please use disposeSingleton instead.");
            } else {
              obj[name].dispose();
            }
          } else {
            throw new Error("Has no disposable object under key: " + name + "!");
          }
        }

        obj[name] = null;
      }
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     * @return {void}
     */
    disposeArray : function(obj, field)
    {
      var data = obj[field];
      if (!data) {
        return;
      }

      // Fast path for application shutdown
      if (qx.core.ObjectRegistry.inShutDown)
      {
        obj[field] = null;
        return;
      }

      // Dispose all content
      try
      {
        var entry;
        for (var i=data.length-1; i>=0; i--)
        {
          entry = data[i];
          if (entry) {
            entry.dispose();
          }
        }
      }
      catch(ex) {
        throw new Error("The array field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      }

      // Reduce array size to zero
      data.length = 0;

      // Finally remove field
      obj[field] = null;
    },


    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param obj {Object} Object which contains the field
     * @param field {String} Name of the field which refers to the array
     * @return {void}
     */
    disposeMap : function(obj, field)
    {
      var data = obj[field];
      if (!data) {
        return;
      }

      // Fast path for application shutdown
      if (qx.core.ObjectRegistry.inShutDown)
      {
        obj[field] = null;
        return;
      }

      // Dispose all content
      try
      {
        var entry;
        for (var key in data)
        {
          entry = data[key];
          if (data.hasOwnProperty(key) && entry) {
            entry.dispose();
          }
        }
      }
      catch(ex) {
        throw new Error("The map field: " + field + " of object: " + obj + " has non disposable entries: " + ex);
      }

      // Finally remove field
      obj[field] = null;
    },

    /**
     * Disposes a given object when another object is disposed
     *
     * @param disposeMe {Object} Object to dispose when other object is disposed
     * @param trigger {Object} Other object
     *
     */
    disposeTriggeredBy : function(disposeMe, trigger)
    {
      var triggerDispose = trigger.dispose;
      trigger.dispose = function(){
        triggerDispose.call(trigger);
        disposeMe.dispose();
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The data binding package is still under development so there will be changes
 * to the API. This Features is for testing purpose only.
 */
qx.Class.define("qx.data.SingleValueBinding",
{

  statics :
  {
    /** internal reference for all bindings */
    __bindings: {},


    /**
     * The function is responsible for binding a source objects property to
     * a target objects property. Both properties have to have the usual qooxdoo
     * getter and setter. The source property also needs to fire change-events
     * on every change of its value.
     * Please keep in mind, that this binding is unidirectional. If you need
     * a binding in both directions, you have to use two of this bindings.
     *
     * It's also possible to bind some kind of a hierarchy as a source. This
     * means that you can separate the source properties with a dot and bind
     * by that the object referenced to this property chain.
     * Example with an object 'a' which has object 'b' stored in its 'child'
     * property. Object b has a string property named abc:
     * <pre><code>
     * qx.data.SingleValueBinding.bind(a, "child.abc", textfield, "value");
     * </code></pre>
     * In that case, if the property abc of b changes, the textfield will
     * automatically contain the new value. Also if the child of a changes, the
     * new value (abc of the new child) will be in the textfield.
     *
     * There is also a possibility of binding an array. Therefor the array
     * {@link qx.data.IListData} is needed because this array has change events
     * which the native does not. Imagine a qooxdoo object a which has a
     * children property containing an array holding more of its own kind.
     * Every object has a name property as a string.
     * <pre><code>
     * var svb = qx.data.SingleValueBinding;
     * // bind the first childs name of 'a' to a textfield
     * svb.bind(a, "children[0].name", textfield, "value");
     * // bind the last childs name of 'a' to a textfield
     * svb.bind(a, "children[last].name", textfield2, "value");
     * // also deeper bindinds are possible
     * svb.bind(a, "children[0].children[0].name", textfield3, "value");
     * </code></pre>
     *
     * As you can see in this example, the abc property of a's b will be bound
     * to the textfield. If now the value of b changed or even the a will get a
     * new b, the binding still shows the right value.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property chain to the target
     *   object.
     * @param options {Map?null} A map containing the options.
     *   <li>converter: A converter function which takes four parameters
     *       and should return the converted value. The first parameter is the
     *       data to convert and the second one is the corresponding model
     *       object, which is only set in case of the use of an controller.
     *       The third parameter is the source object for the binding and the
     *       fourth parameter the target object. If no conversion has been
     *       done, the given value should be returned.</li>
     *   <li>onUpdate: A callback function can be given here. This method will be
     *       called if the binding was updated successful. There will be
     *       three parameter you do get in that method call: the source object,
     *       the target object and the data as third parameter.</li>
     *   <li>onSetFail: A callback function can be given here. This method will
     *       be called if the set of the value fails.</li>
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind : function(
      sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
    )
    {
      // set up the target binding
      var targetListenerMap = this.__setUpTargetBinding(
        sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
      );

      // get the property names
      var propertyNames = sourcePropertyChain.split(".");

      // stuff that's needed to store for the listener function
      var arrayIndexValues =
        this.__checkForArrayInPropertyChain(propertyNames);
      var sources = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var source = sourceObject;

      // add a try catch to make it possible to remove the listeners of the
      // chain in case the loop breaks after some listeners already added.
      try {
        // go through all property names
        for (var i = 0; i < propertyNames.length; i++) {
          // check for the array
          if (arrayIndexValues[i] !== "") {
            // push the array change event
            eventNames.push("change");
          } else {
            eventNames.push(this.__getEventNameForProperty(source, propertyNames[i]));
          }

          // save the current source
          sources[i] = source;

          // check for the last property
          if (i == propertyNames.length -1) {
            // if it is an array, set the initial value and bind the event
            if (arrayIndexValues[i] !== "") {
              // getthe current value
              var itemIndex = arrayIndexValues[i] === "last" ?
                source.length - 1 : arrayIndexValues[i];
              var currentValue = source.getItem(itemIndex);

              // set the initial value
              this.__setInitialValue(currentValue, targetObject, targetPropertyChain, options, sourceObject);

              // bind the event
              listenerIds[i] = this.__bindEventToProperty(
                source, eventNames[i], targetObject, targetPropertyChain, options, arrayIndexValues[i]
              );
            } else {
              // try to set the initial value
              if (propertyNames[i] != null && source["get" + qx.lang.String.firstUp(propertyNames[i])] != null) {
                var currentValue = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
                this.__setInitialValue(currentValue, targetObject, targetPropertyChain, options, sourceObject);
              }
              // bind the property
              listenerIds[i] = this.__bindEventToProperty(
                source, eventNames[i], targetObject, targetPropertyChain, options
              );
            }

          // if its not the last property
          } else {

            // create the contenxt for the listener
            var context = {
              index: i,
              propertyNames: propertyNames,
              sources: sources,
              listenerIds: listenerIds,
              arrayIndexValues: arrayIndexValues,
              targetObject: targetObject,
              targetPropertyChain: targetPropertyChain,
              options: options,
              listeners: listeners
            };

            // create a listener
            var listener = qx.lang.Function.bind(this.__chainListener, this, context);

            // store the listener for further processing
            listeners.push(listener);

            // add the chaining listener
            listenerIds[i] = source.addListener(eventNames[i], listener);
          }

          // get and store the next source
          if (source["get" + qx.lang.String.firstUp(propertyNames[i])] == null) {
            source = null;
          } else if (arrayIndexValues[i] !== "") {
            source = source["get" + qx.lang.String.firstUp(propertyNames[i])](arrayIndexValues[i]);
          } else {
            source = source["get" + qx.lang.String.firstUp(propertyNames[i])]();
          }
          if (!source) {
            break;
          }
        }

      } catch (ex) {
        // remove the already added listener
        // go threw all added listeners (source)
        for (var i = 0; i < sources.length; i++) {
          // check if a source is available
          if (sources[i] && listenerIds[i]) {
            sources[i].removeListenerById(listenerIds[i]);
          }
        }
        var targets = targetListenerMap.targets;
        var targetIds = targetListenerMap.listenerIds[i];
        // go threw all added listeners (target)
        for (var i = 0; i < targets.length; i++) {
          // check if a target is available
          if (targets[i] && targetIds[i]) {
            targets[i].removeListenerById(targetIds[i]);
          }
        }

        throw ex;
      }

      // create the id map
      var id = {
        type: "deepBinding",
        listenerIds: listenerIds,
        sources: sources,
        targetListenerIds: targetListenerMap.listenerIds,
        targets: targetListenerMap.targets
      };
      // store the bindings
      this.__storeBinding(
        id, sourceObject, sourcePropertyChain, targetObject, targetPropertyChain
      );

      return id;
    },


    /**
     * Event listener for the chaining of the properties.
     *
     * @param context {Map} The current context for the listener.
     */
    __chainListener : function(context)
    {

      // invoke the onUpdate method
      if (context.options && context.options.onUpdate) {
        context.options.onUpdate(
          context.sources[context.index], context.targetObject
        );
      }

      // delete all listener after the current one
      for (var j = context.index + 1; j < context.propertyNames.length; j++) {
        // remove the old sources
        var source = context.sources[j];
        context.sources[j] = null;
        if (!source) {
          continue;
        }

        // remove the listeners
        source.removeListenerById(context.listenerIds[j]);
      }

      // get the current source
      var source = context.sources[context.index];
      // add new once after the current one
      for (var j = context.index + 1; j < context.propertyNames.length; j++) {
        // get and store the new source
        if (context.arrayIndexValues[j - 1] !== "") {
          source = source["get" + qx.lang.String.firstUp(context.propertyNames[j - 1])](context.arrayIndexValues[j - 1]);
        } else {
          source = source["get" + qx.lang.String.firstUp(context.propertyNames[j - 1])]();
        }
        context.sources[j] = source;
        // reset the target object if no new source could be found
        if (!source) {
          this.__resetTargetValue(context.targetObject, context.targetPropertyChain);
          break;
        }

        // if its the last property
        if (j == context.propertyNames.length - 1) {
          // if its an array
          if (qx.Class.implementsInterface(source, qx.data.IListData)) {
            // set the inital value
            var itemIndex = context.arrayIndexValues[j] === "last" ?
              source.length - 1 : context.arrayIndexValues[j];
            var currentValue = source.getItem(itemIndex);
            this.__setInitialValue(
              currentValue, context.targetObject, context.targetPropertyChain, context.options, context.sources[context.index]
            );

            // bind the item event to the new target
            context.listenerIds[j] = this.__bindEventToProperty(
              source, "change", context.targetObject, context.targetPropertyChain, context.options, context.arrayIndexValues[j]
            );

          } else {
            if (context.propertyNames[j] != null && source["get" + qx.lang.String.firstUp(context.propertyNames[j])] != null) {
              var currentValue = source["get" + qx.lang.String.firstUp(context.propertyNames[j])]();
              this.__setInitialValue(currentValue, context.targetObject, context.targetPropertyChain, context.options, context.sources[context.index]);
            }
            var eventName = this.__getEventNameForProperty(source, context.propertyNames[j]);
            // bind the last property to the new target
            context.listenerIds[j] = this.__bindEventToProperty(
              source, eventName, context.targetObject, context.targetPropertyChain, context.options
            );
          }
        } else {
          // check if a listener already created
          if (context.listeners[j] == null) {
            var listener = qx.lang.Function.bind(this.__chainListener, this, context);
            // store the listener for further processing
            context.listeners.push(listener);
          }
          // add a new listener
          if (qx.Class.implementsInterface(source, qx.data.IListData)) {
            var eventName = "change";
          } else {
            var eventName = this.__getEventNameForProperty(source, context.propertyNames[j]);
          }
          context.listenerIds[j] = source.addListener(eventName, context.listeners[j]);
        }
      }
    },


    /**
     * Internal helper for setting up the listening to the changes on the
     * target side of the binding. Only works if the target property is a
     * property chain
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     * @return {var} A map containing the listener ids and the targets.
     */
    __setUpTargetBinding : function(
      sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
    ) {
      // get the property names
      var propertyNames = targetPropertyChain.split(".");

      var arrayIndexValues =
        this.__checkForArrayInPropertyChain(propertyNames);
      var targets = [];
      var listeners = [];
      var listenerIds = [];
      var eventNames = [];
      var target = targetObject;

      // go through all property names
      for (var i = 0; i < propertyNames.length - 1; i++) {
        // check for the array
        if (arrayIndexValues[i] !== "") {
          // push the array change event
          eventNames.push("change");
        } else {
          try {
            eventNames.push(
              this.__getEventNameForProperty(target, propertyNames[i])
            );
          } catch (e) {
            // if the event names could not be terminated,
            // just ignore the target chain listening
            break;
          }
        }

        // save the current source
        targets[i] = target;

        // create a listener
        var listener = function() {
          // delete all listener after the current one
          for (var j = i + 1; j < propertyNames.length - 1; j++) {
            // remove the old sources
            var target = targets[j];
            targets[j] = null;
            if (!target) {
              continue;
            }

            // remove the listeners
            target.removeListenerById(listenerIds[j]);
          }

          // get the current target
          var target = targets[i];
          // add new once after the current one
          for (var j = i + 1; j < propertyNames.length - 1; j++) {

            var firstUpPropName = qx.lang.String.firstUp(propertyNames[j - 1]);
            // get and store the new target
            if (arrayIndexValues[j - 1] !== "") {
              var currentIndex = arrayIndexValues[j - 1] === "last" ?
                target.getLength() - 1 : arrayIndexValues[j - 1];
              target = target["get" + firstUpPropName](currentIndex);
            } else {
              target = target["get" + firstUpPropName]();
            }
            targets[j] = target;

            // check if a listener already created
            if (listeners[j] == null) {
              // store the listener for further processing
              listeners.push(listener);
            }

            // add a new listener
            if (qx.Class.implementsInterface(target, qx.data.IListData)) {
              var eventName = "change";
            } else {
              try {
                var eventName =
                  qx.data.SingleValueBinding.__getEventNameForProperty(
                    target, propertyNames[j]
                  );
              } catch (e) {
                // if the event name could not be terminated,
                // ignore the rest
                break;
              }
            }

            listenerIds[j] = target.addListener(eventName, listeners[j]);
           }

          qx.data.SingleValueBinding.updateTarget(
            sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
          );
        };

        // store the listener for further processing
        listeners.push(listener);

        // add the chaining listener
        listenerIds[i] = target.addListener(eventNames[i], listener);

        var firstUpPropName = qx.lang.String.firstUp(propertyNames[i]);
        // get and store the next target
        if (target["get" + firstUpPropName] == null) {
          target = null;
        } else if (arrayIndexValues[i] !== "") {
          target = target["get" + firstUpPropName](arrayIndexValues[i]);
        } else {
          target = target["get" + firstUpPropName]();
        }
        if (!target) {
          break;
        }
      }

      return {listenerIds: listenerIds, targets: targets};
    },


    /**
     * Helper for updating the target. Gets the current set data from the source
     * and set that on the target.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetPropertyChain {String} The property name of the target
     *   object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     *
     * @internal
     */
    updateTarget : function(
      sourceObject, sourcePropertyChain, targetObject, targetPropertyChain, options
    )
    {
      var value = this.getValueFromObject(sourceObject, sourcePropertyChain);

      // convert the data before setting
      value = qx.data.SingleValueBinding.__convertValue(
        value, targetObject, targetPropertyChain, options, sourceObject
      );

      this.__setTargetValue(targetObject, targetPropertyChain, value);
    },


    /**
     * Internal helper for getting the current set value at the property chain.
     *
     * @param o {qx.core.Object} The source of the binding.
     * @param propertyChain {String} The property chain which represents
     *   the source property.
     * @return {var?undefined} Returns the set value if defined.
     *
     * @internal
     */
    getValueFromObject : function(o, propertyChain) {
      var source = this.__getTargetFromChain(o, propertyChain);

      var value;
      if (source != null) {
        // geht the name of the last property
        var lastProperty = propertyChain.substring(
          propertyChain.lastIndexOf(".") + 1, propertyChain.length
        );

        // check for arrays
        if (lastProperty.charAt(lastProperty.length - 1) == "]") {
          // split up the chain into property and index
          var index = lastProperty.substring(
            lastProperty.lastIndexOf("[") + 1, lastProperty.length - 1
          );
          var prop = lastProperty.substring(0, lastProperty.lastIndexOf("["));

          // get the array
          var sourceArray = source["get" + qx.lang.String.firstUp(prop)]();
          if (index == "last") {
            index = sourceArray.length - 1;
          }
          if (sourceArray != null) {
            value = sourceArray.getItem(index);
          }

        } else {
          // set the given value
          value = source["get" + qx.lang.String.firstUp(lastProperty)]();
        }
      }

      return value;
    },


    /**
     * Tries to return a fitting event name to the given source object and
     * property name. First, it assumes that the propertyname is a real property
     * and therefore it checks the property definition for the event. The second
     * possibility is to check if there is an event with the given name. The
     * third and last possibility checked is if there is an event which is named
     * change + propertyname. If this three possibilities fail, an error will be
     * thrown.
     *
     * @param source {qx.core.Object} The source where the property is stored.
     * @param propertyname {String} The name of the property.
     * @return {String} The name of the corresponding property.
     */
    __getEventNameForProperty : function(source, propertyname)
    {
      // get the current event Name from the property definition
      var eventName = this.__getEventForProperty(source, propertyname);
      // if no event name could be found
      if (eventName == null) {
        // check if the propertyname is the event name
        if (qx.Class.supportsEvent(source.constructor, propertyname)) {
          eventName = propertyname;
        // check if the change + propertyname is the event name
        } else if (qx.Class.supportsEvent(
          source.constructor, "change" + qx.lang.String.firstUp(propertyname))
        ) {
          eventName = "change" + qx.lang.String.firstUp(propertyname);
        } else {
          throw new qx.core.AssertionError(
            "Binding property " + propertyname + " of object " + source +
            " not possible: No event available. "
          );
        }
      }
      return eventName;
    },


    /**
     * Resets the value of the given target after resolving the target property
     * chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     */
    __resetTargetValue : function(targetObject, targetPropertyChain)
    {
      // get the last target object of the chain
      var target = this.__getTargetFromChain(targetObject, targetPropertyChain);
      if (target != null) {
        // get the name of the last property
        var lastProperty = targetPropertyChain.substring(
          targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length
        );
        // check for an array and set the value to null
        if (lastProperty.charAt(lastProperty.length - 1) == "]") {
          this.__setTargetValue(targetObject, targetPropertyChain, null);
          return;
        }
        // try to reset the property
        if (target["reset" + qx.lang.String.firstUp(lastProperty)] != undefined) {
          target["reset" + qx.lang.String.firstUp(lastProperty)]();
        } else {
          // fallback if no resetter is given (see bug #2456)
          target["set" + qx.lang.String.firstUp(lastProperty)](null);
        }
      }
    },


    /**
     * Sets the given value to the given target after resolving the
     * target property chain.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @param value {var} The value to set.
     */
    __setTargetValue : function(targetObject, targetPropertyChain, value)
    {
      // get the last target object of the chain
      var target = this.__getTargetFromChain(targetObject, targetPropertyChain);
      if (target != null) {
        // geht the name of the last property
        var lastProperty = targetPropertyChain.substring(
          targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length
        );

        // check for arrays
        if (lastProperty.charAt(lastProperty.length - 1) == "]") {
          // split up the chain into property and index
          var index = lastProperty.substring(lastProperty.lastIndexOf("[") + 1, lastProperty.length - 1);
          var prop = lastProperty.substring(0, lastProperty.lastIndexOf("["));

          // get the array
          var targetArray = targetObject;
          if (!qx.Class.implementsInterface(targetArray, qx.data.IListData)) {
            targetArray = target["get" + qx.lang.String.firstUp(prop)]();
          }

          if (index == "last") {
            index = targetArray.length - 1;
          }
          if (targetArray != null) {
            targetArray.setItem(index, value);
          }

        } else {
          // set the given value
          target["set" + qx.lang.String.firstUp(lastProperty)](value);
        }
      }
    },


    /**
     * Helper-Function resolving the object on which the last property of the
     * chain should be set.
     *
     * @param targetObject {qx.core.Object} The object where the property chain
     *   starts.
     * @param targetPropertyChain {String} The names of the properties,
     *   separated with a dot.
     * @return {qx.core.Object | null} The object on which the last property
     *   should be set.
     */
    __getTargetFromChain : function(targetObject, targetPropertyChain)
    {
      var properties = targetPropertyChain.split(".");
      var target = targetObject;
      // ignore the last property
      for (var i = 0; i < properties.length - 1; i++) {
        try {
          var property = properties[i];
          // if there is an array notation
          if (property.indexOf("]") == property.length - 1) {
            var index = property.substring(
              property.indexOf("[") + 1, property.length - 1
            );
            property = property.substring(0, property.indexOf("["));
          }
          // in case there is a property infront of the brackets
          if (property != "") {
            target = target["get" + qx.lang.String.firstUp(property)]();
          }

          // if there is an index, we can be sure its an array
          if (index != null) {
            // check for the 'last' notation
            if (index == "last") {
              index = target.length - 1;
            }
            // get the array item
            target = target.getItem(index);
            index = null;
          }
        } catch (ex) {
          return null;
        }
      }
      return target;
    },


    /**
     * Set the given value to the target property. This method is used for
     * initially set the value.
     *
     * @param value {var} The value to set.
     * @param targetObject {qx.core.Object} The object which contains the target
     *   property.
     * @param targetPropertyChain {String} The name of the target property in the
     *   target object.
     * @param options {Map} The options map perhaps containing the user defined
     *   converter.
     * @param sourceObject {qx.core.Object} The source object of the binding (
     *   used for the onUpdate callback).
     */
    __setInitialValue : function(value, targetObject, targetPropertyChain, options, sourceObject)
    {
      // first convert the initial value
      value = this.__convertValue(
        value, targetObject, targetPropertyChain, options, sourceObject
      );
      // check if the converted value is undefined
      if (value === undefined) {
        this.__resetTargetValue(targetObject, targetPropertyChain);
      }
      // only set the initial value if one is given (may be null)
      if (value !== undefined) {
        try {
          this.__setTargetValue(targetObject, targetPropertyChain, value);

          // tell the user that the setter was invoked probably
          if (options && options.onUpdate) {
            options.onUpdate(sourceObject, targetObject, value);
          }
        } catch (e) {
          if (! (e instanceof qx.core.ValidationError)) {
            throw e;
          }

          if (options && options.onSetFail) {
            options.onSetFail(e);
          } else {
            qx.log.Logger.warn(
              "Failed so set value " + value + " on " + targetObject
               + ". Error message: " + e
            );
          }
        }
      }
    },


    /**
     * Checks for an array element in the given property names and adapts the
     * arrays to fit the algorithm.
     *
     * @param propertyNames {Array} The array containing the property names.
     *   Attention, this method can chang this parameter!!!
     * @return {Array} An array containing the values of the array properties
     *   corresponding to the property names.
     */
    __checkForArrayInPropertyChain: function(propertyNames) {
      // array for the values of the array properties
      var arrayIndexValues = [];

      // go through all properties and check for array notations
      for (var i = 0; i < propertyNames.length; i++) {
        var name = propertyNames[i];
        // if its an array property in the chain
        if (qx.lang.String.endsWith(name, "]")) {
          // get the inner value of the array notation
          var arrayIndex = name.substring(name.indexOf("[") + 1, name.indexOf("]"));

          // check the arrayIndex
          if (name.indexOf("]") != name.length - 1) {
            throw new Error("Please use only one array at a time: "
              + name + " does not work.");
          }
          if (arrayIndex !== "last") {
            if (arrayIndex == "" || isNaN(parseInt(arrayIndex, 10))) {
              throw new Error("No number or 'last' value hast been given"
                + " in an array binding: " + name + " does not work.");
            }
          }

          // if a property is infront of the array notation
          if (name.indexOf("[") != 0) {
            // store the property name without the array notation
            propertyNames[i] = name.substring(0, name.indexOf("["));
            // store the values in the array for the current iteration
            arrayIndexValues[i] = "";
            // store the properties for the next iteration (the item of the array)
            arrayIndexValues[i + 1] = arrayIndex;
            propertyNames.splice(i + 1, 0, "item");
            // skip the next iteration. its the array item and its already set
            i++;
          // it the array notation is the beginning
          } else {
            // store the array index and override the entry in the property names
            arrayIndexValues[i] = arrayIndex;
            propertyNames.splice(i, 1, "item");
          }

        } else {
          arrayIndexValues[i] = "";
        }
      }

      return arrayIndexValues;
    },


    /**
     * Internal helper method which is actually doing all bindings. That means
     * that an event listener will be added to the source object which listens
     * to the given event and invokes an set on the target property on the
     * targetObject.
     * This method does not store the binding in the internal reference store
     * so it should NOT be used from outside this class. For an outside usage,
     * use {@link #bind}.
     *
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourceEvent {String} The event of the source object which could
     *   be the change event in common but has to be an
     *   {@link qx.event.type.Data} event.
     * @param targetObject {qx.core.Object} The object which the source should
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See
     *   {@link #bind} for more information.
     * @param arrayIndex {String} The index of the given array if its an array
     *   to bind.
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding or e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned by the {@link qx.core.Object#addListener} method.
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for the target object and target
     *   property.
     */
    __bindEventToProperty : function(sourceObject, sourceEvent, targetObject,
      targetProperty, options, arrayIndex)
    {
      // checks
      if (qx.core.Environment.get("qx.debug")) {
        // check for the data event
        var eventType = qx.Class.getEventType(
          sourceObject.constructor, sourceEvent
        );
        qx.core.Assert.assertEquals(
          "qx.event.type.Data", eventType, sourceEvent
          + " is not an data (qx.event.type.Data) event on "
          + sourceObject + "."
        );
      }

      var bindListener = function(arrayIndex, e) {
        // if an array value is given
        if (arrayIndex !== "") {
          //check if its the "last" value
          if (arrayIndex === "last") {
            arrayIndex = sourceObject.length - 1;
          }
          // get the data of the array
          var data = sourceObject.getItem(arrayIndex);

          // reset the target if the data is not set
          if (data === undefined) {
            qx.data.SingleValueBinding.__resetTargetValue(targetObject, targetProperty);
          }

          // only do something if the curren array has been changed
          var start = e.getData().start;
          var end = e.getData().end;
          if (arrayIndex < start || arrayIndex > end) {
            return;
          }
        } else {
          // get the data out of the event
          var data = e.getData();
        }

        // debug message
        if (qx.core.Environment.get("qx.debug.databinding")) {
          qx.log.Logger.debug("Binding executed from " + sourceObject + " by " +
            sourceEvent + " to " + targetObject + " (" + targetProperty + ")");
          qx.log.Logger.debug("Data before conversion: " + data);
        }

        // convert the data
        data = qx.data.SingleValueBinding.__convertValue(
          data, targetObject, targetProperty, options, sourceObject
        );

        // debug message
        if (qx.core.Environment.get("qx.debug.databinding")) {
          qx.log.Logger.debug("Data after conversion: " + data);
        }

        // try to set the value
        try {
          if (data !== undefined) {
            qx.data.SingleValueBinding.__setTargetValue(targetObject, targetProperty, data);
          } else {
            qx.data.SingleValueBinding.__resetTargetValue(targetObject, targetProperty);
          }

          // tell the user that the setter was invoked probably
          if (options && options.onUpdate) {
            options.onUpdate(sourceObject, targetObject, data);
          }

        } catch (e) {
          if (! (e instanceof qx.core.ValidationError)) {
            throw e;
          }

          if (options && options.onSetFail) {
            options.onSetFail(e);
          } else {
            qx.log.Logger.warn(
              "Failed so set value " + data + " on " + targetObject
               + ". Error message: " + e
            );
          }
        }
      }

      // check if an array index is given
      if (!arrayIndex) {
        // if not, signal it a s an empty string
        arrayIndex = "";
      }
      // bind the listener function (make the array index in the listener available)
      bindListener = qx.lang.Function.bind(bindListener, sourceObject, arrayIndex);

      // add the listener
      var id = sourceObject.addListener(sourceEvent, bindListener);

      return id;
    },


    /**
     * This method stores the given value as a binding in the internal structure
     * of all bindings.
     *
     * @param id {var} The listener id of the id for a deeper binding.
     * @param sourceObject {qx.core.Object} The source Object of the binding.
     * @param sourceEvent {String} The name of the source event.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetProperty {String} The name of the property on the target
     *   object.
     */
    __storeBinding : function(
      id, sourceObject, sourceEvent, targetObject, targetProperty
    )
    {
      // add the listener id to the internal registry
      if (this.__bindings[sourceObject.toHashCode()] === undefined) {
        this.__bindings[sourceObject.toHashCode()] = [];
      }
      this.__bindings[sourceObject.toHashCode()].push(
        [id, sourceObject, sourceEvent, targetObject, targetProperty]
      );
    },


    /**
     * This method takes the given value, checks if the user has given a
     * converter and converts the value to its target type. If no converter is
     * given by the user, the {@link #__defaultConversion} will try to convert
     * the value.
     *
     * @param value {var} The value which possibly should be converted.
     * @param targetObject {qx.core.Object} The target object.
     * @param targetPropertyChain {String} The property name of the target object.
     * @param options {Map} The options map which can includes the converter.
     *   For a detailed information on the map, take a look at
     *   {@link #bind}.
     * @param sourceObject {qx.core.Object} The source obejct for the binding.
     *
     * @return {var} The converted value. If no conversion has been done, the
     *   value property will be returned.
     * @throws {qx.core.AssertionError} If there is no property definition
     *   of the given target object and target property.
     */
    __convertValue : function(
      value, targetObject, targetPropertyChain, options, sourceObject
    ) {
      // do the conversion given by the user
      if (options && options.converter) {
        var model;
        if (targetObject.getModel) {
          model = targetObject.getModel();
        }
        return options.converter(value, model, sourceObject, targetObject);
      // try default conversion
      } else {
        var target = this.__getTargetFromChain(targetObject, targetPropertyChain);
        var lastProperty = targetPropertyChain.substring(
          targetPropertyChain.lastIndexOf(".") + 1, targetPropertyChain.length
        );
        // if no target is currently available, return the original value
        if (target == null) {
          return value;
        }

        var propertieDefinition = qx.Class.getPropertyDefinition(
          target.constructor, lastProperty
        );
        var check = propertieDefinition == null ? "" : propertieDefinition.check;
        return this.__defaultConversion(value, check);
      }
    },


    /**
     * Helper method which tries to figure out if the given property on the
     * given object does have a change event and if returns the name of it.
     *
     * @param sourceObject {qx.core.Object} The object to check.
     * @param sourceProperty {String} The name of the property.
     *
     * @return {String} The name of the change event.
     * @throws {qx.core.AssertionError} If there is no property definition of
     *   the given object property pair.
     */
    __getEventForProperty : function(sourceObject, sourceProperty) {
      // get the event name
      var propertieDefinition =  qx.Class.getPropertyDefinition(
        sourceObject.constructor, sourceProperty
      );

      if (propertieDefinition == null) {
        return null;
      }
      return propertieDefinition.event;
    },


    /**
     * Tries to convert the data to the type given in the targetCheck argument.
     *
     * @param data {var} The data to convert.
     * @param targetCheck {String} The value of the check property. That usually
     *   contains the target type.
     */
    __defaultConversion : function(data, targetCheck) {
      var dataType = qx.lang.Type.getClass(data);

      // to integer
      if ((dataType == "Number" || dataType == "String") &&
          (targetCheck == "Integer" || targetCheck == "PositiveInteger")) {
        data = parseInt(data, 10);
      }

      // to string
      if ((dataType == "Boolean" || dataType == "Number" || dataType == "Date")
        && targetCheck == "String") {
        data = data + "";
      }

      // to float
      if ((dataType == "Number" || dataType == "String") &&
        (targetCheck == "Number" || targetCheck == "PositiveNumber")) {
        data = parseFloat(data);
      }

      return data;
    },


    /**
     * Removes the binding with the given id from the given sourceObject. The
     * id hast to be the id returned by any of the bind functions.
     *
     * @param sourceObject {qx.core.Object} The source object of the binding.
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBindingFromObject : function(sourceObject, id) {
      // check for a deep binding
      if (id.type == "deepBinding") {
        // go threw all added listeners (source)
        for (var i = 0; i < id.sources.length; i++) {
          // check if a source is available
          if (id.sources[i]) {
            id.sources[i].removeListenerById(id.listenerIds[i]);
          }
        }
        // go threw all added listeners (target)
        for (var i = 0; i < id.targets.length; i++) {
          // check if a target is available
          if (id.targets[i]) {
            id.targets[i].removeListenerById(id.targetListenerIds[i]);
          }
        }
      } else {
        // remove the listener
        sourceObject.removeListenerById(id);
      }

      // remove the id from the internal reference system
      var bindings = this.__bindings[sourceObject.toHashCode()];
      // check if the binding exists
      if (bindings != undefined) {
        for (var i = 0; i < bindings.length; i++) {
          if (bindings[i][0] == id) {
            qx.lang.Array.remove(bindings, bindings[i]);
            return;
          }
        }
      }
      throw new Error("Binding could not be found!");
    },


    /**
     * Removes all bindings for the given object.
     *
     * @param object {qx.core.Object} The object of which the bindings should be
     *   removed.
     * @throws {qx.core.AssertionError} If the object is not in the internal
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeAllBindingsForObject : function(object) {
      // check for the null value

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertNotNull(object,
          "Can not remove the bindings for null object!");
      }

      // get the bindings
      var bindings = this.__bindings[object.toHashCode()];
      if (bindings != undefined)
      {
        // remove every binding with the removeBindingFromObject function
        for (var i = bindings.length - 1; i >= 0; i--) {
          this.removeBindingFromObject(object, bindings[i][0]);
        }
      }
    },


    /**
     * Returns an array which lists all bindings.
     *
     * @param object {qx.core.Object} The object of which the bindings should
     *   be returned.
     *
     * @return {Array} An array of binding informations. Every binding
     *   information is an array itself containing id, sourceObject,
     *   sourceEvent, targetObject and targetProperty in that order.
     */
    getAllBindingsForObject : function(object) {
      // create an empty array if no binding exists
      if (this.__bindings[object.toHashCode()] === undefined) {
        this.__bindings[object.toHashCode()] = [];
      }

      return this.__bindings[object.toHashCode()];
    },


    /**
     * Removes all binding in the whole application. After that not a single
     * binding is left.
     */
    removeAllBindings : function() {
      // go threw all registerd objects
      for (var hash in this.__bindings) {
        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        // check for the object, perhaps its already deleted
        if (object == null) {
          delete this.__bindings[hash];
          continue;
        }
        this.removeAllBindingsForObject(object);
      }
      // reset the bindings map
      this.__bindings = {};
    },


    /**
     * Returns a map containing for every bound object an array of data binding
     * information. The key of the map is the hashcode of the bound objects.
     * Every binding is represented by an array containing id, sourceObject,
     * sourceEvent, targetObject and targetProperty.
     *
     * @return {Map} Map containing all bindings.
     */
    getAllBindings : function() {
      return this.__bindings;
    },


    /**
     * Debug function which shows some valuable information about the given
     * binding in console. For that it uses {@link qx.log.Logger}.
     *
     * @param object {qx.core.Object} the source of the binding.
     * @param id {var} The id of the binding.
     */
    showBindingInLog : function(object, id) {
      var binding;
      // go threw all bindings of the given object
      for (var i = 0; i < this.__bindings[object.toHashCode()].length; i++) {
        // the first array item is the id
        if (this.__bindings[object.toHashCode()][i][0] == id) {
          binding = this.__bindings[object.toHashCode()][i];
          break;
        }
      }

      if (binding === undefined) {
        var message = "Binding does not exist!"
      } else {
        var message = "Binding from '" + binding[1] + "' (" + binding[2] +
          ") to the object '" + binding[3] + "' ("+ binding[4] + ").";
      }

      qx.log.Logger.debug(message);
    },


    /**
     * Debug function which shows all bindings in the log console. To get only
     * one binding in the console use {@link #showBindingInLog}
     */
    showAllBindingsInLog : function() {
      // go threw all objects in the registry
      for (var hash in this.__bindings) {
        var object = qx.core.ObjectRegistry.fromHashCode(hash);
        for (var i = 0; i < this.__bindings[hash].length; i++) {
          this.showBindingInLog(object, this.__bindings[hash][i][0]);
        }
      }
    }

  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * Helper functions for dates.
 *
 * The native JavaScript Date is not modified by this class.
 */
qx.Class.define("qx.lang.Date",
{
  statics :
  {
    /**
     * Returns the current time
     *
     * @return {Integer} Time in ms from 1970.
     */
    now : function() {
      return +new Date;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This exception is thrown by the {@link qx.event.GlobalError} handler if a
 * <code>window.onerror</code> event occurs in the browser.
 */
qx.Bootstrap.define("qx.core.WindowError",
{
  extend : Error,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param failMessage {String} The error message
   * @param uri {String} URI where error was raised
   * @param lineNumber {Integer} The line number where the error was raised
   */
  construct : function(failMessage, uri, lineNumber)
  {
    Error.call(this, failMessage);

    this.__failMessage = failMessage;
    this.__uri = uri || "";
    this.__lineNumber = lineNumber === undefined ? -1 : lineNumber;
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __failMessage : null,
    __uri : null,
    __lineNumber : null,


    /**
     * Returns the error message.
     *
     * @return {String} error message
     */
    toString : function() {
      return this.__failMessage;
    },


    /**
     * Get the URI where error was raised
     *
     * @return {String} URI where error was raised
     */
    getUri : function() {
      return this.__uri;
    },


    /**
     * Get the line number where the error was raised
     *
     * @return {Integer} The line number where the error was raised
     */
    getLineNumber : function() {
      return this.__lineNumber;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * A validation Error which should be thrown if a validation fails.
 */
qx.Class.define("qx.core.ValidationError",
{
    extend : qx.type.BaseError
});
/*
 * Copyright:
 *   2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   * Derrell Lipman (derrell)
 */

/*
#asset(rpcjs/*)
*/

/**
 * JSON-RPC server
 */
qx.Class.define("rpcjs.rpc.Server",
{
  extend : qx.core.Object,

  
  /**
   * Constructor for a JSON_RPC server.
   *
   * @param serviceFactory {Function}
   *   A function which provides an interface to a service method. The
   *   function will be called with a namespaced method name, and an
   *   rpcjs.rpc.error.Error object. Under normal circumstances (success), it
   *   should return a function reference. If the method identified by name is
   *   not available, either because it does not exist, or for some other
   *   reason (e.g. the function's was called in a cross-domain fashion but
   *   the function is not permitted to be used in that fashion), the provided
   *   error object's methods should be used to provide details of the error,
   *   and then the error object should be returned.
   */
  construct : function(serviceFactory)
  {
    // Call the superclass constructor
    this.base(arguments);

    // The service factory is mandatory
    if (! qx.lang.Type.isFunction(serviceFactory))
    {
      throw new Error("Missing service factory function");
    }
    
    // Save the parameters for future use
    this.setServiceFactory(serviceFactory);
  },
  
  properties :
  {
    /**
     * A function which provides an interface to a service method. The
     * function will be called with a namespaced method name, and an
     * rpcjs.rpc.error.Error object. Under normal circumstances (success), it
     * should return a function reference. If the method identified by name is
     * not available, either because it does not exist, or for some other
     * reason (e.g. the function's was called in a cross-domain fashion but
     * the function is not permitted to be used in that fashion), the provided
     * error object's methods should be used to provide details of the error,
     * and then the error object should be returned.
     */
    serviceFactory :
    {
      check    : "Function"
    }
  },

  members :
  {
    /**
     * Process a single remote procedure call request.
     *
     * @param jsonInput {String}
     *   The input string, containing the JSON-encoded RPC request.
     *
     * @return {String}
     *   The JSON response.
     */
    processRequest : function(jsonInput)
    {
      var             timer;      // timer manager object
      var             ret;        // error return object
      var             bBatch;     // whether a batch request is received
      var             requests;   // the parsed input request
      var             error;      // an error object
      var             reply;      // a textual reply in case garbage input
      var             protocol;   // protocol version being used
      var             fqMethod;   // fully-qualified method name
      var             service;    // service function to call
      var             result;     // result of calling service function
      var             parameters; // the parameter list for the RPC
      var             run;        // function to run the service call
      var             responses;  // array of responses (in case of batch)
      
      // Get a timer instance
      timer = qx.util.TimerManager.getInstance();

      // Assume protocol is 2.0 until we (might) discover otherwise
      protocol = "2.0";

      try
      {
        // Parse the JSON
        requests = qx.lang.Json.parse(jsonInput);
      }
      catch(e)
      {
        // We couldn't parse the request.
        // Get a new version 2.0 error object.
        error = new rpcjs.rpc.error.Error("2.0");
        error.setCode(qx.io.remote.RpcError.v2.error.ParseError);
        error.setMessage("Could not parse request");

        // Build the error response
        ret = 
          {
            jsonrpc : "2.0",
            id      : null,
            error   : qx.lang.Json.parse(error.stringify())
          };

        return qx.lang.Json.stringify(ret);
      }

      // Determine if this is normal or batch mode
      if (qx.lang.Type.isArray(requests))
      {
        // It's batch mode.
        bBatch = true;
        
        // Ensure that there's at least one element in the array
        if (requests.length === 0)
        {
          // Get a new version 2.0 error object.
          error = new rpcjs.rpc.error.Error("2.0");
          error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
          error.setMessage("Empty batch array");

          // Build the error response
          ret = 
            {
              jsonrpc : "2.0",
              id      : null,
              error   : qx.lang.Json.parse(error.stringify())
            };

          return qx.lang.Json.stringify(ret);
        }
      }
      else if (qx.lang.Type.isObject(requests))
      {
        // It's normal mode
        bBatch = false;
        
        // Create an array as if it were batch mode
        requests = [ requests ];
      }
      else
      {
        // Get a new version 2.0 error object.
        error = new rpcjs.rpc.error.Error("2.0");
        error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
        error.setMessage("Unrecognized request type");
        error.setData("Expected an array or an object");

        // Build the error response
        ret = 
          {
            jsonrpc : "2.0",
            id      : null,
            error   : qx.lang.Json.parse(error.stringify())
          };

        return qx.lang.Json.stringify(ret);
      }

      // For each request in the batch (or the single non-batch request)...
      responses = requests.map(
        function(request)
        {
          var             ret;
          var             id;

          // Get the id value to use in error responses
          id = typeof request.id == "undefined" ? null : request.id;

          // Ensure that this is a valid request object
          if (! qx.lang.Type.isObject(request))
          {
            // Get a new version 2.0 error object.
            error = new rpcjs.rpc.error.Error("2.0");
            error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
            error.setMessage("Unrecognized request");
            error.setData("Expected an object");

            // Build the error response
            ret = 
              {
                jsonrpc : "2.0",
                id      : id,
                error   : qx.lang.Json.parse(error.stringify())
              };

            return ret;
          }

          // Determine which protocol to use. Is there a jsonrpc member?
          if (typeof(request.jsonrpc) == "string")
          {
            // Get a new version 2.0 error object.
            error = new rpcjs.rpc.error.Error("2.0");

            // Yup. It had better be "2.0"!
            if (request.jsonrpc != "2.0")
            {
              error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
              error.setMessage("'jsonrpc' member must be \"2.0\".");
              error.setData("Found value " + request.jsonrpc + "in 'jsonrpc'.");

              // Build the error response
              ret = 
                {
                  jsonrpc : "2.0",
                  id      : id,
                  error   : qx.lang.Json.parse(error.stringify())
                };

              return ret;
            }

            // Validate that the method is a string
            if (! qx.lang.Type.isString(request.method))
            {
              error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
              error.setMessage("JSON-RPC method name is missing or " +
                               "incorrect type");
              error.setData("Method name must be a string.");

              // Build the error response
              ret = 
                {
                  jsonrpc : "2.0",
                  id      : id,
                  error   : qx.lang.Json.parse(error.stringify())
                };

              return ret;
            }

            // Validate that the params member is undefined, an object, or an
            // array.
            if (typeof(request.params) != "undefined" &&
                ! qx.lang.Type.isObject(request.params) &&
                ! qx.lang.Type.isArray(request.params))
            {
              error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
              error.setMessage("JSON-RPC params is missing or incorrect type");
              error.setData("params must be null, an object, or an array.");

              // Build the error response
              ret = 
                {
                  jsonrpc : "2.0",
                  id      : id,
                  error   : qx.lang.Json.parse(error.stringify())
                };

              return ret;
            }

            // We have what appears to be a valid version 2.0 request
            protocol = "2.0";
          }
          else if (bBatch)
          {
            // We're in batch mode so we had to have been in 2.0 mode
            error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
            error.setMessage("JSON-RPC params is missing or incorrect type");
            error.setData("params must be null, an object, or an array.");

            // Build the error response
            ret = 
              {
                jsonrpc : "2.0",
                id      : id,
                error   : qx.lang.Json.parse(error.stringify())
              };

            return ret;
          }
          else
          {
            protocol = "qx1";

            // Ensure all of the required members are present in the request
            if (! qx.lang.Type.isString(request.service) ||
                ! qx.lang.Type.isString(request.method) ||
                ! qx.lang.Type.isArray(request.params))
            {
              // Invalid. We still send back a 2.0 error object, however.
              error.setCode(qx.io.remote.RpcError.v2.error.InvalidRequest);
              error.setMessage("Missing service, method, or params");

              // Build the error response
              ret = 
                {
                  id      : id,
                  error   : qx.lang.Json.parse(error.stringify())
                };

              return ret;
            }

            // Get a qooxdoo-modified version 1 error object
            error = new rpcjs.rpc.error.Error("qx1");
          }

          // Generate the fully-qualified method name
          fqMethod =
            (protocol == "qx1"
             ? request.service + "." + request.method
             : request.method);

          /*
           * Ensure the requested method name is kosher.  It should be:
           *
           *   First test for:
           *   - a dot-separated sequences of strings
           *   - first character of each string is in [a-zA-Z] 
           *   - other characters are in [_a-zA-Z0-9]
           *
           *   Then verify:
           *   - no two adjacent dots
           */

          // First test for valid characters
          if (! /^[a-zA-Z][_.a-zA-Z0-9]*$/.test(fqMethod))
          {
            // There's some illegal character in the service or method name
            error.setCode(
              {
                "qx1" : qx.io.remote.RpcError.qx1.error.server.MethodNotFound,
                "2.0" : qx.io.remote.RpcError.v2.error.MethodNotFound
              }[protocol]);
            error.setMessage("Illegal character found in service name.");

            // Build the error response
            ret = 
              {
                id      : id,
                error   : qx.lang.Json.parse(error.stringify())
              };

            // If this is v2, we need to add the indicator of such.
            if (protocol == "2.0")
            {
              ret.jsonrpc = "2.0";
            }

            return ret;
          }

          // Next, ensure there are no double dots
          if (fqMethod.indexOf("..") != -1)
          {
            error.setCode(
              {
                "qx1" : qx.io.remote.RpcError.qx1.error.server.MethodNotFound,
                "2.0" : qx.io.remote.RpcError.v2.error.MethodNotFound
              }[protocol]);
            error.setMessage("Illegal use of two consecutive dots " +
                             "in service name.");

            // Build the error response
            ret = 
              {
                id      : id,
                error   : qx.lang.Json.parse(error.stringify())
              };

            // If this is v2, we need to add the indicator of such.
            if (protocol == "2.0")
            {
              ret.jsonrpc = "2.0";
            }

            return ret;
          }

          // Use the registered callback to get a service function associated
          // with this method name.
          service = this.getServiceFactory()(fqMethod, protocol, error);

          // Was there an error?
          if (service == null)
          {
            // Yup. Is this a notification?
            if (typeof request.id == "undefined")
            {
              // Yes. Just return undefined so the error is ignored.
              return undefined;
            }

            // Give 'em the error.
            // The error class knows how to stringify itself, but we need a map.
            // Go both directions, to obtain the map.
            error.setCode(
              {
                "qx1" : qx.io.remote.RpcError.qx1.error.server.MethodNotFound,
                "2.0" : qx.io.remote.RpcError.v2.error.MethodNotFound
              }[protocol]);
            error.setMessage("Method " + fqMethod + " not found.");

            // Build the error response
            ret = 
              {
                id    : request.id,
                error : qx.lang.Json.parse(error.stringify())
              };
            
            // If this is v2, we need to add the indicator of such.
            if (protocol == "2.0")
            {
              ret.jsonrpc = "2.0";
            }

            return ret;
          }

          // Were we given a parameter array, or a parameter map, or none?
          if (qx.lang.Type.isArray(request.params))
          {
            // Use the provided parameter list
            parameters = request.params;
          }
          else if (qx.lang.Type.isObject(request.params))
          {
            // Does this service allow a map of parameters?
            if (service.parameterNames)
            {
              // Yup. Initialize to an empty parameter list
              parameters = [];

              // Map the arguments into the parameter array. (We are forgiving
              // of members of request.params that are not in the formal
              // parameter list. We just ignore them.)
              service.parameterNames.forEach(
                function(paramName)
                {
                  // Add the parameter. If it's undefined, so be it.
                  parameters.push(request.params[paramName]);
                });
            }
          }
          else
          {
            // No provided parameters is equivalent to an empty parameter list
            parameters = [];
          }

          // Create a function that will run this one request. We do this to
          // allow notifications to be run after we return from
          // processRequest().
          run = qx.lang.Function.bind(
            function(request)
            {
              var             result;
              var             params = qx.lang.Array.clone(parameters);
              var             error;

              // provide the error object as the last parameter.
              params.push(error); 

              // We should now have a service function to call. Call it.
              try
              {
                result = service.apply(window, params);
              }
              catch(e)
              {
                // The service method threw an error. Create our own error from
                // it.
                error.setCode(
                  {
                    "qx1" : qx.io.remote.RpcError.qx1.error.server.ScriptError,
                    "2.0" : qx.io.remote.RpcError.v2.error.InternalError
                  }[protocol]);

                // Combine the message from the original error
                error.setMessage("Method threw an error: " + e);

                // This is classified as a server error, not application-origin.
                if (protocol == "qx1")
                {
                  error.setOrigin(qx.io.remote.RpcError.qx1.origin.Server);
                }

                // Use this error as the result
                result = error;
              }

              return result;
            },
            this);

          // Is this request a notification?
          if (typeof(request.id) == "undefined")
          {
            // Yup. Schedule this method to be called later, but ASAP. We
            // don't care about the result, so we needn't wait for it to
            // complete.
            timer.start(
              function(userData, timerId)
              {
                run(request);
              });            
            
            // Set result to the timer object, so we'll ignore it, below.
            result = timer;
          }
          else
          {
            // It's not a notification. Run the requested service method now.
            result = run(request);
          }

          // Was this a notification?
          if (result === timer)
          {
            // Yup. Return undefined so it'll be ignored.
            return undefined;
          }
          
          // Was the result an error?
          if (result instanceof rpcjs.rpc.error.Error)
          {
            // Yup. Stringify and return it.
            // The error class knows how to stringify itself, but we need a map.
            // Go both directions, to obtain the map.

            // Build the error response
            ret = 
              {
                id    : request.id,
                error : qx.lang.Json.parse(error.stringify())
              };
            
            // If this is v2, we need to add the indicator of such.
            if (protocol == "2.0")
            {
              ret.jsonrpc = "2.0";
            }

            return ret;
          }

          // We have a standard result. Stringify and return a proper response.
          ret = 
            {
              id     : request.id,
              result : result
            };

          // If this is v2, we need to add the indicator of such.
          if (protocol == "2.0")
          {
            ret.jsonrpc = "2.0";
          }

          return ret;
        },
        this);
      
      // Remove any responses that were for notifications (undefined ones)
      responses = responses.filter(
        function(response)
        {
          return typeof(response) !== "undefined";
        });

      // Is there a response, i.e. were there any non-notifications?
      if (responses.length == 0)
      {
        // Nope. Return null to indicate that no response should be returned.
        return null;
      }

      // Give 'em the response(s)
      return (bBatch
              ? qx.lang.Json.stringify(responses)
              : qx.lang.Json.stringify(responses[0]));
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Timer manipulation for handling multiple timed callbacks with the use of
 * only a single native timer object.
 *
 * Use of these timers is via the methods start() and stop().  Examples:
 * <pre class='javascript'>
 * var timer = qx.util.TimerManager.getInstance();
 *
 * // Start a 5-second recurrent timer.
 * // Note that the first expiration is after 3 seconds
 * // (last parameter is 3000) but each subsequent expiration is
 * // at 5 second intervals.
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("Recurrent 5-second timer: " + timerId);
 *             },
 *             5000,
 *             this,
 *             null,
 *             3000);
 *
 * // Start a 1-second one-shot timer
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("One-shot 1-second timer: " + timerId);
 *             },
 *             0,
 *             this,
 *             null,
 *             1000);
 *
 * // Start a 2-second recurrent timer that stops itself after
 * // three iterations
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("Recurrent 2-second timer with limit 3:" +
 *                          timerId);
 *               if (++userData.count == 3)
 *               {
 *                 this.debug("Stopping recurrent 2-second timer");
 *                 timer.stop(timerId);
 *               }
 *             },
 *             2000,
 *             this,
 *             { count : 0 });
 *
 * // Start an immediate one-shot timer
 * timer.start(function(userData, timerId)
 *             {
 *               this.debug("Immediate one-shot timer: " + timerId);
 *             });
 * </pre>
 */
qx.Class.define("qx.util.TimerManager",
{
  extend : qx.core.Object,
  type   : "singleton",

  statics :
  {
    /** Time-ordered queue of timers */
    __timerQueue : [],

    /** Saved data for each timer */
    __timerData  : {},

    /** Next timer id value is determined by incrementing this */
    __timerId    : 0
  },

  members :
  {
    /** Whether we're currently listening on the interval timer event */
    __timerListenerActive : false,

    /**
     * Start a new timer
     *
     * @param callback {Function}
     *   Function to be called upon expiration of the timer.  The function is
     *   passed these parameters:
     *   <dl>
     *     <dt>userData</dt>
     *       <dd>The user data provided to the start() method</dd>
     *     <dt>timerId</dt>
     *       <dd>The timer id, as was returned by the start() method</dd>
     *   </dl>
     *
     * @param recurTime {Integer|null}
     *   If null, the timer will not recur.  Once the callback function
     *   returns the first time, the timer will be removed from the timer
     *   queue.  If non-null, upon return from the callback function, the
     *   timer will be reset to this number of milliseconds.
     *
     * @param context {qx.core.Object|null}
     *   Context (this) the callback function is called with.  If not
     *   provided, this Timer singleton object is used.
     *
     * @param userData {Any}
     *   Data which is passed to the callback function upon timer expiry
     *
     * @param initialTime {Integer|null}
     *   Milliseconds before the callback function is called the very first
     *   time.  If not specified and recurTime is specified, then recurTime
     *   will be used as initialTime; otherwise initialTime will default
     *   to zero.
     *
     * @return {Integer}
     *   The timer id of this unique timer.  It may be provided to the stop()
     *   method to cancel a timer before expiration.
     */
    start : function(callback, recurTime, context, userData, initialTime)
    {
      // Get the expiration time for this timer
      if (! initialTime)
      {
        initialTime = recurTime || 0;
      }

      var expireAt = (new Date()).getTime() + initialTime;

      // Save the callback, user data, and requested recurrency time as well
      // as the current expiry time
      this.self(arguments).__timerData[++this.self(arguments).__timerId] =
        {
          callback  : callback,
          userData  : userData || null,
          expireAt  : expireAt,
          recurTime : recurTime,
          context   : context || this
        };

      // Insert this new timer on the time-ordered timer queue
      this.__insertNewTimer(expireAt, this.self(arguments).__timerId);

      // Give 'em the timer id
      return this.self(arguments).__timerId;
    },

    /**
     * Stop a running timer
     *
     * @param timerId {Integer}
     *   A timer id previously returned by start()
     *
     * @return {Boolean}
     *   <i>true</i> if the specified timer id was found (and removed);
     *   <i>false</i> if no such timer was found (i.e. it had already expired)
     */
    stop : function(timerId)
    {
      // Find this timer id in the time-ordered list
      var timerQueue = this.self(arguments).__timerQueue;
      var length = timerQueue.length;
      for (var i = 0; i < length; i++)
      {
        // Is this the one we're looking for?
        if (timerQueue[i] == timerId)
        {
          // Yup.  Remove it.
          timerQueue.splice(i, 1);

          // We found it so no need to continue looping through the queue
          break;
        }
      }

      // Ensure it's gone from the timer data map as well
      delete this.self(arguments).__timerData[timerId];

      // If there are no more timers pending...
      if (timerQueue.length == 0 && this.__timerListenerActive)
      {
        // ... then stop listening for the periodic timer
        qx.event.Idle.getInstance().removeListener("interval",
                                                   this.__processQueue,
                                                   this);
        this.__timerListenerActive = false;
      }
    },

    /**
     * Insert a timer on the time-ordered list of active timers.
     *
     * @param expireAt {Integer}
     *   Milliseconds from now when this timer should expire
     *
     * @param timerId {Integer}
     *   Id of the timer to be time-ordered
     *
     * @return {void}
     */
    __insertNewTimer : function(expireAt, timerId)
    {
      // The timer queue is time-ordered so that processing timers need not
      // search the queue; rather, it can simply look at the first element
      // and if not yet ready to fire, be done.  Search the queue for the
      // appropriate place to insert this timer.
      var timerQueue = this.self(arguments).__timerQueue;
      var timerData = this.self(arguments).__timerData;
      var length = timerQueue.length;
      for (var i = 0; i < length; i++)
      {
        // Have we reached a later time?
        if (timerData[timerQueue[i]].expireAt > expireAt)
        {
          // Yup.  Insert our new timer id before this element.
          timerQueue.splice(i, 0, timerId);

          // No need to loop through the queue further
          break;
        }
      }

      // Did we find someplace in the middle of the queue for it?
      if (timerQueue.length == length)
      {
        // Nope.  Insert it at the end.
        timerQueue.push(timerId);
      }

      // If this is the first element on the queue...
      if (! this.__timerListenerActive)
      {
        // ... then start listening for the periodic timer.
        qx.event.Idle.getInstance().addListener("interval",
                                                this.__processQueue,
                                                this);
        this.__timerListenerActive = true;
      }

    },

    /**
     * Process the queue of timers.  Call the registered callback function for
     * any timer which has expired.  If the timer is marked as recurrent, the
     * timer is restarted with the recurrent timeout following completion of
     * the callback function.
     *
     * @return {void}
     */
    __processQueue : function()
    {
      // Get the current time
      var timeNow = (new Date()).getTime();

      // While there are timer elements that need processing...
      var timerQueue = this.self(arguments).__timerQueue;
      var timerData = this.self(arguments).__timerData;

      // Is it time to process the first timer element yet?
      while (timerQueue.length > 0 &&
             timerData[timerQueue[0]].expireAt <= timeNow)
      {
        // Yup.  Do it.  First, remove element from the queue.
        var expiredTimerId = timerQueue.shift();

        // Call the handler function for this timer
        var expiredTimerData = timerData[expiredTimerId];
        expiredTimerData.callback.call(expiredTimerData.context,
                                       expiredTimerData.userData,
                                       expiredTimerId);

        // If this is a recurrent timer which wasn't stopped by the callback...
        if (expiredTimerData.recurTime && timerData[expiredTimerId])
        {
          // ... then restart it.
          var now = (new Date()).getTime();
          expiredTimerData.expireAt = now + expiredTimerData.recurTime;

          // Insert this timer back on the time-ordered timer queue
          this.__insertNewTimer(expiredTimerData.expireAt, expiredTimerId);
        }
        else
        {
          // If it's not a recurrent timer, we can purge its data too.
          delete timerData[expiredTimerId];
        }
      }

      // If there are no more timers pending...
      if (timerQueue.length == 0 && this.__timerListenerActive)
      {
        // ... then stop listening for the periodic timer
        qx.event.Idle.getInstance().removeListener("interval",
                                                   this.__processQueue,
                                                   this);
        this.__timerListenerActive = false;
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The well-defined error codes for JSON-RPC.
 */
qx.Class.define("qx.io.remote.RpcError",
{
  statics :
  {
    /** Information pertaining to qooxdoo's modified JSON-RPC Version 1 */
    qx1:
    {
      /** Origin of the error */
      origin :
      {
        Server      : 1,
        Application : 2,
        Transport   : 3,
        Client      : 4
      },

      /**
       * Error data. In Version 1, each origin can have its own error codes.
       * Only 'Server' error codes are globally-defined, however.
       */
      error :
      {
        /** Error codes for the Server origin */
        server :
        {
          /*
           * Script Error
           *
           * An error was thrown during the processing of a remote procedure
           * call.
           */
          ScriptError       : -1,


          /*
           * Unknown Error
           *
           * The default error code, used only when no specific error code is
           * passed to the JsonRpcError constructor.  This code should
           * generally not be used.
           */
          Unknown           : 0,


          /**
           * Illegal Service
           *
           * The service name contains illegal characters or is otherwise
           * deemed unacceptable to the JSON-RPC server.
           */
          IllegalService    : 1,


          /**
           * Service Not Found
           *
           * The requested service does not exist at the JSON-RPC server.
           */
          ServiceNotFound   : 2,


          /**
           * Class Not Found
           *
           * If the JSON-RPC server divides service methods into subsets
           * (classes), this indicates that the specified class was not found.
           * This is slightly more detailed than "Method Not Found", but that
           * error would always also be legal (and true) whenever this one is
           * returned. (Not used in this implementation)
           */
          ClassNotFound     : 3, // not used in this implementation


          /**
           * Method Not Found
           *
           * The method specified in the request is not found in the requested
           * service.
           */
          MethodNotFound    : 4,


          /**
           * Parameter Mismatch
           *
           * If a method discovers that the parameters (arguments) provided to
           * it do not match the requisite types for the method's parameters,
           * it should return this error code to indicate so to the caller.
           *
           * This error is also used to indicate an illegal parameter value,
           * in server scripts.
           */
          ParameterMismatch : 5,


          /**
           * Permission Denied
           *
           * A JSON-RPC service provider can require authentication, and that
           * authentication can be implemented such the method takes
           * authentication parameters, or such that a method or class of
           * methods requires prior authentication.  If the caller has not
           * properly authenticated to use the requested method, this error
           * code is returned.
           */
          PermissionDenied  : 6
        }
      }
    },

    /** Information pertaining to a conformant JSON-RPC Version 2 */
    v2 :
    {
      /**
       * Error data. In Version 1, each origin can have its own error codes.
       * Only 'Server' error codes are globally-defined, however.
       */
      error :
      {
        /**
         * Parse Error
         *
         * Invalid JSON was received by the server.
         * An error occurred on the server while parsing the JSON text.
         */
        ParseError     : -32700,

        /**
         * Invalid Request
         *
         * The JSON received by the server is not a valid Request object.
         */
        InvalidRequest : -32600,

        /**
         * Method Not Found
         *
         * The method specified in the request is not found in the requested
         * service.
         */
        MethodNotFound : -32601,

        /**
         * Invalid method parameter(s)
         *
         * If a method discovers that the parameters (arguments) provided to
         * it do not match the requisite types for the method's parameters,
         * it should return this error code to indicate so to the caller.
         */
        InvalidParams  : -32602,

        /**
         * Internal JSON-RPC error
         */
        InternalError  : -32603,

        /*********************************************************************
         * The values -32099 to -32000 are reserved for implementation-defined
         * server errors. RPC-specific error codes must be outside of this
         * range, and should generally be positive values.
         *********************************************************************/

        /**
         * Permission Denied
         *
         * A JSON-RPC service provider can require authentication, and that
         * authentication can be implemented such the method takes
         * authentication parameters, or such that a method or class of
         * methods requires prior authentication.  If the caller has not
         * properly authenticated to use the requested method, this error
         * code is returned.
         */
        PermissionDenied  : -32000
      }
    }
  }
});
/*
 * Copyright:
 *   2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   * Derrell Lipman (derrell)
 */

/*
#asset(rpcjs/*)
*/

/**
 * Origin constants
 */
qx.Class.define("rpcjs.rpc.error.Error",
{
  extend : qx.core.Object,
  
  construct : function(protocolId)
  {
    // Call the superclass constructor
    this.base(arguments);
    
    // Save the protocol id
    this.setProtocol(protocolId);
  },

  properties :
  {
    /**
     * The version of the JSON-RPC protocol to use.  If null, the protocol is
     * auto-identified from the request. Otherwise, the strings "qx1"
     * (qooxdoo's modified Version 1) and "2.0" are currently allowed.
     *
     * @note
     *   At this time, only qooxdoo's modified version 1 ("qx1") is supported.
     */
    protocol :
    {
      init     : "qx1",
      nullable : false,         // server knows the protocol by now.
      check    : function(protocolId)
      {
        return [ "qx1", "2.0" ].indexOf(protocolId) != -1;
      }
    },

    /**
     * The origin of the error. Its value must be one of the values of
     * qx.io.remote.RpcError.qx1.origin. This is used only for protocol "qx1"
     */
    origin :
    {
      check   : "Integer",
      init    : qx.io.remote.RpcError.qx1.origin.Server
    },
    
    /**
     * The error code. If the origin is Server, then this value must be one of
     * the values of qx.io.remote.RpcError.qx1.error.server.*
     */
    code :
    {
      check   : "Integer",
      init    : qx.io.remote.RpcError.qx1.error.server.Unknown
    },
    
    /**
     * A descriptive message for the error.
     */
    message :
    {
      check   : "String",
      init    : "Unspecified error"
    },
    
    /**
     * A primitive or structured value that contains additional information
     * about the error. It is optional. This is used only for protocol "2.0".
     */
    data :
    {
      init     : null,
      nullable : true
    }
  },
  
  members :
  {
    stringify : function()
    {
      var             data;
      var             error;

      // Create an object which will contain the appropriate members
      error = { };
      
      // We stringify differently depending on the protocol
      switch(this.getProtocol())
      {
      case "2.0":
        error.code = this.getCode();
        error.message = this.getMessage();
        
        // See if there's any data
        data = this.getData();
        if (data !== null)
        {
          // There is, so return it.
          error.data = this.getData();
        }
        break;
        
      case "qx1":
        error.origin = this.getOrigin();
        error.code = this.getCode();
        error.message = this.getMessage();
        break;
      }
      
      // Format the error object into a JSON response
      return qx.lang.Json.stringify(error);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */


/**
 * A generic singleton that fires an "interval" event all 100 miliseconds. It
 * can be used whenever one needs to run code periodically. The main purpose of
 * this class is reduce the number of timers.
 */

qx.Class.define("qx.event.Idle",
{
  extend : qx.core.Object,
  type : "singleton",

  construct : function()
  {
    this.base(arguments);

    var timer = new qx.event.Timer(this.getTimeoutInterval());
    timer.addListener("interval", this._onInterval, this);
    timer.start();

    this.__timer = timer;
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Interval for the timer, which periodically fires the "interval" event,
     * in milliseconds.
     */
    timeoutInterval :
    {
      check: "Number",
      init : 100,
      apply : "_applyTimeoutInterval"
    }
  },



  members :
  {

    __timer : null,

    // property apply
    _applyTimeoutInterval : function(value) {
      this.__timer.setInterval(value);
    },

    /**
     * Fires an "interval" event
     */
    _onInterval : function() {
      this.fireEvent("interval");
    }

  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__timer) {
      this.__timer.stop();
    }

    this.__timer = null;
  }

});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Global timer support.
 *
 * This class can be used to periodically fire an event. This event can be
 * used to simulate e.g. a background task. The static method
 * {@link #once} is a special case. It will call a function deferred after a
 * given timeout.
 */
qx.Class.define("qx.event.Timer",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param interval {Number} initial interval in milliseconds of the timer.
   */
  construct : function(interval)
  {
    this.base(arguments);

    this.setEnabled(false);

    if (interval != null) {
      this.setInterval(interval);
    }

    // don't use qx.lang.Function.bind because this function would add a
    // disposed check, which could break the functionality. In IE the handler
    // may get called after "clearInterval" (i.e. after the timer is disposed)
    // and we must be able to handle this.
    var self = this;
    this.__oninterval = function() {
      self._oninterval.call(self);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Start a function after a given timeout.
     *
     * @param func {Function} Function to call
     * @param obj {Object} context (this), the function is called with
     * @param timeout {Number} Number of milliseconds to wait before the
     *   function is called.
     * @return {qx.event.Timer} The timer object used for the timeout. This
     *    object can be used to cancel the timeout. Note that the timer is
     *    only valid until the timer has been executed.
     */
    once : function(func, obj, timeout)
    {
      if (qx.core.Environment.get("qx.debug")) {
        // check the given parameter
        qx.core.Assert.assertFunction(func, "func is not a function");
        qx.core.Assert.assertNotUndefined(timeout, "No timeout given");
      }

      // Create time instance
      var timer = new qx.event.Timer(timeout);

      // Bug #3481: append original function to timer instance so it can be
      // read by a debugger
      timer.__onceFunc = func;

      // Add event listener to interval
      timer.addListener("interval", function(e)
      {
        timer.stop();
        func.call(obj, e);
        timer.dispose();

        obj = null;
      },
      obj);

      // Directly start timer
      timer.start();
      return timer;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * With the enabled property the Timer can be started and suspended.
     * Setting it to "true" is equivalent to {@link #start}, setting it
     * to "false" is equivalent to {@link #stop}.
     */
    enabled :
    {
      init : true,
      check : "Boolean",
      apply : "_applyEnabled"
    },

    /**
     * Time in milliseconds between two callback calls.
     * This property can be set to modify the interval of
     * a running timer.
     */
    interval :
    {
      check : "Integer",
      init : 1000,
      apply : "_applyInterval"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __intervalHandler : null,
    __oninterval : null,



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * Apply the interval of the timer.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyInterval : function(value, old)
    {
      if (this.getEnabled()) {
        this.restart();
      }
    },


    /**
     * Apply the enabled state of the timer.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyEnabled : function(value, old)
    {
      if (old)
      {
        window.clearInterval(this.__intervalHandler);
        this.__intervalHandler = null;
      }
      else if (value)
      {
        this.__intervalHandler = window.setInterval(this.__oninterval, this.getInterval());
      }
    },




    /*
    ---------------------------------------------------------------------------
      USER-ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Start the timer
     *
     */
    start : function() {
      this.setEnabled(true);
    },


    /**
     * Start the timer with a given interval
     *
     * @param interval {Integer} Time in milliseconds between two callback calls.
     */
    startWith : function(interval)
    {
      this.setInterval(interval);
      this.start();
    },


    /**
     * Stop the timer.
     *
     */
    stop : function() {
      this.setEnabled(false);
    },


    /**
     * Restart the timer.
     * This makes it possible to change the interval of a running timer.
     *
     */
    restart : function()
    {
      this.stop();
      this.start();
    },


    /**
     * Restart the timer. with a given interval.
     *
     * @param interval {Integer} Time in milliseconds between two callback calls.
     */
    restartWith : function(interval)
    {
      this.stop();
      this.startWith(interval);
    },




    /*
    ---------------------------------------------------------------------------
      EVENT-MAPPER
    ---------------------------------------------------------------------------
    */

    /**
     * timer callback
     *
     * @signature function()
     */
    _oninterval : qx.event.GlobalError.observeMethod(function()
    {
      if (this.$$disposed) {
        return;
      }

      if (this.getEnabled()) {
        this.fireEvent("interval");
      }
    })
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__intervalHandler) {
      window.clearInterval(this.__intervalHandler);
    }

    this.__intervalHandler = this.__oninterval = null;
  }
});
/*
 * Copyright:
 *   2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   * Derrell Lipman (derrell)
 */

/*
#asset(rpcjs/*)
*/


/**
 * Abstract handler for remote procedure calls.
 */
qx.Class.define("rpcjs.AbstractRpcHandler",
{
  extend : qx.core.Object,

  construct : function(services)
  {
    // Save the services map.
    rpcjs.AbstractRpcHandler._services = services;
    
    // Get an RPC Server instance.
    this._rpcServer = new rpcjs.rpc.Server(
      rpcjs.AbstractRpcHandler._serviceFactory);
  },
  
  statics :
  {
    /** The services map */
    _services : null,

    /**
     *  Function to call for authentication to run the service method. If
     *  null, no authentication is required. Otherwise this should be a
     *  function which takes as a parameter, the fully-qualified name of the
     *  method to be called, and must return true to allow the function to be
     *  called, or false otherwise, to indicate permission denied.
     */
    authenticationFunction : null,

    /**
     * The service factory takes a method name and attempts to produce a
     * service method that corresponds to that name. In this implementation,
     * it concatenates the method name to the name of the variable holding the
     * service map, and looks for corresponding method.
     * 
     * @param fqMethodName {String}
     *   The fully-qualified name of the method to be called.
     * 
     * @param protocol {String}
     *   The JSON-RPC protocol being used ("qx1", "1.0", "2.0")
     * 
     * @param error {rpcjs.rpc.error.Error}
     *   An error object to be set if an error is encountered in instantiating
     *   the requested serviced method.
     * 
     * @return {Function}
     *   The service method associated with the specified method name.
     */
    _serviceFactory : function(fqMethodName, protocol, error)
    {
      var             method;

      // Append the fully-qualified method name to the services map and
      // evaluate it in hopes of getting a method reference.
      try
      {
        // We have a dot-separated fully-qualified method name. We want to
        // access that entry in the map of maps in this.__services. Using the
        // index notation won't work, since it's multiple levels deep
        // (i.e. fqMethodName might be something like "a.b.c").
        // 
        // fqMethodName was sanitized by rpcjs.rpc.Server:processRequest()
        // so this eval is reasonably safe. (I know... Famous last words!)
        method = eval("rpcjs.AbstractRpcHandler._services" +
                      "." + fqMethodName);
        
        // We might have just gotten null, which also means no such method
        if (! method)
        {
          throw new Error("No such method");
        }

        // Validate allowability of calling this function
        if (rpcjs.AbstractRpcHandler.authenticationFunction &&
            !rpcjs.AbstractRpcHandler.authenticationFunction(fqMethodName))
        {
          // No such method.
          if (protocol == "qx1")
          {
            error.setCode(
              qx.io.remote.RpcError.qx1.error.server.PermissionDenied);
          }
          else
          {
            error.setCode(qx.io.remote.RpcError.v2.error.PermissionDenied);
          }
          error.setMessage("Permission denied.");
          return null;
        }
      }
      catch(e)
      {
        // No such method.
        if (protocol == "qx1")
        {
          error.setCode(qx.io.remote.RpcError.qx1.error.server.MethodNotFound);
        }
        else
        {
          error.setCode(qx.io.remote.RpcError.v2.error.MethodNotFound);
        }
        error.setMessage(e.message);
        return null;
      }
      
      // Give 'em the reference to the method they can call.
      return method;
    }
  }
});
/*
 * Copyright:
 *   2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *   See the LICENSE file in the project's top-level directory for details.
 *
 * Authors:
 *   * Derrell Lipman (derrell)
 */

/*
#asset(rpcjs/*)
*/


/**
 * Handler for remote procedure calls.
 */
qx.Class.define("rpcjs.jetty.Rpc",
{
  extend : rpcjs.AbstractRpcHandler,

  construct : function(services, url)
  {
    // Call the superclass constructor
    this.base(arguments, services);

    // The url is ignored in this implementation. We only get here if the url
    // is pre-determined to be destined to us.
  },
  
  members :
  {
    /**
     * Process an incoming request which is presumably a JSON-RPC request.
     * 
     * @param jsonData {String}
     *   The data provide in a POST request
     * 
     * @return {String}
     *   Upon success, the JSON-encoded result of the RPC request is returned.
     *   Otherwise, null is returned.
     */
    processRequest : function(jsonData)
    {
      // Call the RPC server to process this request
      return this._rpcServer.processRequest(jsonData);
    }
  }
});


if (typeof exports != "undefined") {for (var key in qx) {exports[key] = qx[key];}}