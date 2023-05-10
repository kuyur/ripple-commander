/**
 * Utility for object.
 * Some codes are from Google closure library(Apache License).
 * @see https://github.com/google/closure-library
 * @author kuyur@kuyur.net
 */

/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 *
 * @param {Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in
 *     {@code var_args}.
 * @param {...Object} var_args The objects from which values will be copied.
 * @return {Object} the target object.
 */
exports.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }
  }

  return target;
};

/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object.<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,K,Object.<K,V>):boolean} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     key and the object) and should return a boolean. If the return value
 *     is true the element is added to the result object. If it is false the
 *     element is not included.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object.<K,V>} a new object in which only elements that passed the
 *     test are present.
 * @template T,K,V
 */
exports.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};

/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
exports.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};

/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is global.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
exports.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || global;
  for (var part; part = parts.shift(); ) {
    if (cur[part] != null) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
