/**
 * jii.js library
 *
 * Adds some awesome sugar with Ruby and Python flavour.
 * Functional programming should be more fun.
 *
 * @author: hamrammi@gmail.com
 */
(function() {
  'use strict';

  var VERSION = '0.6.0';
  var root = this;

  var arrayProto = Array.prototype,
      stringProto = String.prototype,
      unshift = Array.prototype.unshift,
      toString = Object.prototype.toString;

  // Local copy of `jii` for using below.
  var jii = function(obj) { return new Wrapper(obj); };

  jii.fn = jii.prototype;

  jii.VERSION = VERSION;

  // -------------------- HELPERS --------------------

  var objArray = '[object Array]',
      objString = '[object String]',
      objNumber = '[object Number]',
      objObject = '[object Object]',
      objFunction = '[object Function]',
      objBoolean = '[object Boolean]',
      objNull = '[object Null]',
      objRegExp = '[object RegExp]',
      objGlobal = '[object global]';

  // Acts as a `flag`
  var got = false;

  var isArray = jii.isArray = function(obj) {
    return typeof obj === 'object' && obj !== null && Array.isArray(obj);
  };
  var isNumber = jii.isNumber = function(obj) {
    return toString.call(obj) === objNumber;
  };
  var isString = jii.isString = function(obj) {
    return toString.call(obj) === objString;
  };
  var isObject = jii.isObject = function(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
  };
  var isFunction = jii.isFunction = function(obj) {
    return toString.call(obj) === objFunction;
  };
  var isBoolean = jii.isBoolean = function(obj) {
    return toString.call(obj) === objBoolean;
  };
  var isNull = jii.isNull = function(obj) {
    return toString.call(obj) === objNull;
  };
  var isRegExp = jii.isRegExp = function(obj) {
    return toString.call(obj) === objRegExp;
  };
  var isGlobal = jii.isGlobal = function(obj) {
    return toString.call(obj) === objGlobal;
  };

  var typeError = function(expected, got, func) {
    throw new TypeError('"jii.' + func + '": expected "' + expected + '",' +
      ' got "' + got + '"');
  };

  var error = function(func, message) {
    throw new Error('"jii.' + func + '" says: "' + message + '"');
  };

  var validateType = function(func, arg, expected) {
    var got = typeof arg;
    if (got !== expected) {
      var error = '"jii.' + func + '": expected "' + expected +
        '", got "' + got + '"';
      throw new TypeError(error);
    }
    return arg;
  };

  // Make sure an `obj` has `length` property
  // e.g.: string, array
  var isStringOrArray = function(func, obj) {
    var type = toString.call(obj);
    switch (type) {
      case objString: break;
      case objArray: break;
      default: validateType(func, obj, 'string or array');
    }
    return obj;
  };

  // -------------------- STRINGS --------------------

  // Capitalize string
  jii.capitalize = function(string, num) {
    string = validateType('capitalize', string, 'string');
    num = num || null;
    if (!num) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
      var transformed = [];
      num = validateType('capitalize', num, 'number');
      for (var i = 0; i < num; i++) {
        transformed[i] = string.charAt(i).toUpperCase();
      }
      return transformed.join('') + string.slice(num);
    }
  };

  jii.swapCase = function(string) {
    string = validateType('swapCase', string, 'string');
    var swapCase = function(chr) {
      return (jii.isUpperCased(chr)) ? chr.toLowerCase() : chr.toUpperCase();
    };
    return jii.walk(string, swapCase);
  };

  jii.isUpperCased = function(string) {
    for (var i = 0, l = string.length; i < l; i++) {
      if (!string[i].match(/[A-ZА-Я]+/)) return false;
    }
    return true;
  };

  jii.isLowerCased = function(string) {
    for (var i = 0, l = string.length; i < l; i++) {
      if (!string[i].match(/[a-zа-я]+/)) return false;
    }
    return true;
  };

  // Convert string to unicode
  jii.toUnicode = function(string) {
    var uniChar;
    return jii.walk(string, function(chr) {
      uniChar = chr.charCodeAt(0).toString(16);
      while (uniChar.length < 4) {
        uniChar = '0' + uniChar;
      }
      return '\\u' + uniChar;
    });
  };

  // Convert string to hex
  jii.toCharCode = function(string) {
    return jii.walk(string, function(chr) {
      return '\\x' + chr.charCodeAt(0).toString(16);
    });
  };

  // Checks whether last character of string equals to lastChar
  jii.endsWith = function(string, value, caseInsensitive) {
    string = validateType('endsWith', string, 'string');
    value = value || null;
    caseInsensitive = caseInsensitive || false;
    var length = string.length;
    if (value && !caseInsensitive) {
      if (typeof value === 'string') {
        length = value.length;
        return string.slice(string.length - length) === value;
      } else if (typeof value === 'number') {
        if (value > string.length) error('endsWith', 'string length exceeded');
        return string.slice(string.length - value);
      } else {
        typeError('string or number', typeof value, 'endsWith');
      }
    } else if (value && caseInsensitive) {
      if (typeof value === 'number') {
        typeError('string', 'number', 'endsWith');
      } else if (typeof value === 'string') {
        length = value.length;
        var lowerCased = string.slice(string.length - length).toLowerCase();
        return lowerCased === value.toLowerCase();
      } else {
        typeError('string', typeof value, 'endsWith');
      }
    }
    return string.charAt(length - 1);
  };

  // Check whether first letter of string equals to firstChar
  jii.startsWith = function(string, value, caseInsensitive) {
    string = validateType('startsWith', string, 'string');
    value = value || null;
    caseInsensitive = caseInsensitive || false;
    var length = 0;
    if (value && !caseInsensitive) {
      if (typeof value === 'string') {
        length = value.length;
        return string.slice(0, length) === value;
      } else if (typeof value === 'number') {
        if (value > string.length)
          error('startsWith', 'string length exceeded');
        return string.slice(0, value);
      } else {
        typeError('string or number', typeof value, 'startsWith');
      }
    } else if (value && caseInsensitive) {
      if (typeof value === 'number') {
        typeError('string', 'number', 'startsWith');
      } else if (typeof value === 'string') {
        length = value.length;
        return string.slice(0, length).toLowerCase() === value.toLowerCase();
      } else {
        typeError('string', typeof value, 'startsWith');
      }
    }
    return string.charAt(0);
  };

  // Find positions of the character in the string
  jii.positions = function(string, chr) {
    string = validateType('position', string, 'string');
    chr = validateType('position', chr, 'string');
    var positions = [];
    for (var i = 0, l = string.length; i < l; i++) {
      if (string[i] === chr) {
        positions.push(i);
      }
    }
    return positions;
  };

  // Reverse string
  jii.reverse = function(string) {
    string = validateType('reverse', string, 'string');
    var reversed = '';
    for (var i = 0, l = string.length - 1; i <= l; i++) {
      reversed += string.charAt(l - i);
    }
    return reversed;
  };

  // Trim strings
  jii.trim = function(string, position) {
    string = validateType('trim', string, 'string');
    position = position ? validateType('trim', position, 'string') : 'both';
    switch (position) {
      case 'both':
        return string.replace(/^\s+|\s+$/g, ''); break;
      case 'left':
        return string.replace(/^\s+/, ''); break;
      case 'right':
        return string.replace(/\s+$/, ''); break;
      case 'full':
        return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
          .replace(/\s+/g, ' '); break;
      default:
        throw new Error('"jii.trim": unexpected param "' + position + '"');
    }
  };

  // Capitalize each word in a string
  jii.title = function(string) {
    string = validateType('title', string, 'string');
    var _title = function(word) { return jii.capitalize(word); };
    return string.replace(/[^\s]+/gm, _title);
  };

  // -------------------- ARRAYS --------------------

  var value = function(obj, what) {
    var i, l, value, words;
    var _result = function(obj, what) {
      var value, i, l = obj.length, currentLength = obj[0].length;
      if (l === 1) return obj[0];
      for (i = 0; i < l; i++) {
        if (what === 'max')
          if (currentLength <= obj[i].length) {
            value = obj[i]; currentLength = obj[i].length;
          }
        if (what === 'min')
          if (currentLength >= obj[i].length) {
            value = obj[i]; currentLength = obj[i].length;
          }
      }
      return value;
    };
    switch (toString.call(obj)) {
      case objArray:
        value = obj[0]; l = obj.length;
        var type = toString.call(value);
        if (type === objNumber) {
          for (i = 0; i < l; i++) {
            if (typeof obj[i] !== 'number')
              typeError('number', typeof obj[i], 'core::value');
            if (what === 'max') value = value > obj[i] ? value : obj[i];
            if (what === 'min') value = value < obj[i] ? value : obj[i];
          }
        }
        if (type === objString || type === objArray) return _result(obj, what);
        break;
      case objString:
        words = jii.trim(obj, 'full').split(' '); l = words.length;
        return _result(words, what); break;
      default: typeError('string or array', typeof obj, 'core::value');
    }
    return value;
  };

  // Compares similar arrays [1, 2, 3, 4] == [3, 4, 2, 1]
  jii.similar = function(a, b) {
    if (!isArray(a)) typeError('array', typeof a, 'similar');
    var i, similar = true, l = a.length;
    if (l !== b.length) return false;
    for (i = 0; i < l; i++) {
      if (!jii.has(b, a[i])) { similar = false; break; }
    }
    return similar;
  };

  // Max value of an array
  jii.max = function(array) { return value(array, 'max'); };

  // Min value of an array
  jii.min = function(array) { return value(array, 'min'); };

  jii.zip = function(a, b) {
    if (!isArray(a) || !isArray(b))
      typeError('array', [typeof a, typeof b], 'zip');
    if (a.length !== b.length)
      throw new Error('jii.zip: arrays are not the same length');
    var result = [];
    for (var i = 0, l = a.length; i < l; i++) result.push([a[i], b[i]]);
    return result;
  };

  // Maps each value of `obj` with `iterator` function
  jii.map = function(obj, iterator, context) {
    var result = [];
    if (obj == null) return result;
    // Delegate to `ECMAScript 5` native `map` if available
    if (arrayProto.map) {
      return obj.map(iterator, context);
    }
    var map = function(el, index, obj) {
      result[index] = iterator.call(context, el, index, obj);
    };
    jii.each(obj, map);
    return result;
  };

  // Check whether an object has chain of properties
  jii.hasChain = function(obj, chain, cb) {
    if (!isObject(obj)) typeError('object', typeof obj, 'hasChain');
    chain = validateType('hasChain', chain, 'string');
    cb = cb || null;
    // Keys to be evaluated
    var keys = chain.split('.');
    // Result object or other typed data
    var result = obj;
    for (var i = 0, l = keys.length; i < l; i++) {
      result = result[keys[i]];
      if (typeof result === 'undefined') {
        if (cb && typeof cb === 'function') {
          return cb(true, null);
        } else {
          return false;
        }
      }
    }
    if (cb && typeof cb === 'function') {
      return cb(false, result);
    } else {
      return result;
    }
  };

  // Select elements that meet the condition
  jii.select = jii.filter = function(array, selector, context) {
    if (!isArray(array)) typeError('array', typeof array, 'select');
    if (arrayProto.filter) {
      return array.filter(selector, context);
    }
    var result = [];
    jii.map(array, function(x) {
      if (selector.call(context, x) === true) result.push(x);
    });
    return result;
  };

  // Reject elements that meet the condition
  jii.reject = function(array, rejector, context) {
    if (!isArray(array)) typeError('array', typeof array, 'reject');
    var result = [];
    jii.map(array, function(x) {
      if (rejector.call(context, x) === false) result.push(x);
    });
    return result;
  };

  // Flatten an array. Can flatten only with `depth` level
  jii.flatten = function(array, depth) {
    if (!isArray(array)) typeError('array', typeof array, 'flatten');
    depth = depth || null;
    var result = [], depthCounter = 0;
    var flatten = function(chr) {
      if (isArray(chr)) {
        depthCounter++;
        if (!depth || (depth && depth >= depthCounter)) {
          jii(chr).map(flatten); depthCounter = 0;
        } else result.push(chr);
      } else result.push(chr);
    };
    jii(array).map(flatten);
    return result;
  };

  // Core reduce functionality
  jii.reduce = function(array, iterator, initialValue, context) {
    if (!isArray(array)) typeError('array', typeof array, 'reduce');
    if (arrayProto.reduce) {
      if (!initialValue) return array.reduce(iterator);
      else return array.reduce(iterator, initialValue);
    }
    var value, isValueSet = (initialValue) ? true : false;
    if (isValueSet) value = initialValue;
    var reduce = function(el, index, arr) {
      if (isValueSet) value = iterator.call(context, value, el, index, arr);
      else { value = el; isValueSet = true; }
    };
    jii.each(array, reduce);
    if (!value) throw new Error('Reduce of empty array with no initial value');
    return value;
  };

  // Summarize all elements of the array
  jii.sum = function(array) {
    if (!isArray(array)) typeError('array', typeof array, 'sum');
    var sum = function(sum, chr) { return sum + chr; };
    return jii.reduce(array, sum);
  };

  // Multiply all elements of the array
  jii.multiply = function(array) {
    if (!isArray(array)) typeError('array', typeof array, 'multiply');
    var mulitply = function(multi, chr) { return multi * chr; };
    return jii.reduce(array, mulitply);
  };

  // Test if all elements of an array match criteria
  jii.all = jii.every = function(array, comparator, context) {
    if (!isArray(array)) typeError('array', typeof array, 'all(every)');
    if (arrayProto.every) {
      return array.every(comparator, context);
    }
    var value = true, index = array.length;
    while (index--) {
      if (!comparator.call(context, array[index], index, array)) {
        value = false; break;
      }
    }
    return value;
  };

  // Test if any elements of an array match criteria
  jii.any = jii.some = function(array, comparator, context) {
    if (!isArray(array)) typeError('array', typeof array, 'any(some)');
    if (arrayProto.some) {
      return array.some(comparator, context);
    }
    var value = false, index = array.length;
    while (index--) {
      if (comparator.call(context, array[index], index, array)) {
        value = true; break;
      }
    }
    return value;
  };

  // Permutations
  jii.permutation = function(array, length) {
    if (!isArray(array)) typeError('array', typeof array, 'permutation');
    var l = array.length;
    length = length || l;
    if (length > l) throw new Error('No permutations with length ' + length);
    var result = [];

    return result;
  };

  // ------------------ OBJECTS -------------------

  // Returns the length (size) of an object
  jii.size = function(obj) {
    var length = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) length++;
    }
    return length;
  };

  // -------------------- MISC --------------------

  // Split obj into characters and count occurrence of each one
  jii.occurrences = function(obj, chr) {
    chr = chr || null;
    obj = isStringOrArray('occurrences', obj);
    var dict = {};
    for (var i = 0, l = obj.length; i < l; i++) {
      dict[obj[i]] = dict[obj[i]] ? dict[obj[i]] + 1 : 1;
    }
    if (chr) return dict[chr];
    return dict;
  };

  // Remove duplicates
  jii.uniq = function(obj) {
    var result = [];
    if (!(isString(obj) || isArray(obj)))
      validateType('uniq', obj, 'string or array');
    var _uniq = function(el) {
      if (!jii.has(result, el)) result.push(el);
    };
    jii.each(obj, _uniq);
    return (typeof obj === 'string') ? result.join('') : result;
  };

  // Count occurrences that match criteria
  jii.count = function(obj, criteria, uniqCriteria) {
    uniqCriteria = uniqCriteria || false;
    var result = 0;
    var regExpCount = function(el) {
      if (!isString(el)) typeError('string', typeof el, 'count');
      if (el.match(criteria)) result++;
    };
    var arrayCount = function(el) {
      var __ = function(criterion) { if (criterion === el) result++; };
      if (uniqCriteria) criteria = jii.uniq(criteria);
      jii.each(criteria, __);
    };
    if (isRegExp(criteria)) jii.each(obj, regExpCount);
    if (isArray(criteria)) jii.each(obj, arrayCount);
    return result;
  };

  // Retrieve each `slice` elements from an `obj`
  jii.eachSlice = function(obj, slice) {
    obj = isStringOrArray('eachSlice', obj);
    var result = [], length = obj.length, index = 0;
    var count = Math.floor(length / slice) + 1;
    if (slice <= 0) throw new Error('number should be positive');
    if (slice === length) count--;
    if (slice > length) slice = length;
    while (count--) {
      result.push(obj.slice(index, index + slice)); index += slice;
    }
    return result;
  };

  // Similar to jii.eachSlice() method but with some changes:
  // jii.eachCons([1, 2, 3, 4, 5]) => [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
  jii.eachCons = function(obj, slice) {
    obj = isStringOrArray('eachCons', obj);
    var result = [], length = obj.length, index = 0;
    if (slice <= 0) throw new Error('number should be positive');
    if (slice > length) slice = length;
    while (index + slice <= length) {
      result.push(obj.slice(index, index + slice)); index++;
    }
    return result;
  };

  // Drop first n elements from an array and return the rest
  jii.dropFirst = function(obj, number) {
    if (number <= 0) throw new Error('number should be positive');
    switch (toString.call(obj)) {
      case objString: return stringProto.slice.call(obj, number); break;
      case objArray: return arrayProto.slice.call(obj, number); break;
      default: return typeError('string or array', typeof obj, 'dropFirst');
    }
  };

  // Drop last n elements from an array and return the rest
  jii.dropLast = function(obj, number) {
    if (number <= 0) throw new Error('number should be positive');
    switch (toString.call(obj)) {
      case objString: return stringProto.slice.call(obj, 0, -number); break;
      case objArray: return arrayProto.slice.call(obj, 0, -number); break;
      default: return typeError('string or array', typeof obj, 'dropFirst');
    }
  };

  // Remove all falsy values from an array
  jii.compact = function(obj) {
    var _compact = function(x) { return !!x };
    return jii.select(obj, _compact);
  };

  // Basic function to walk through arrays.
  // Iterator function takes 3 arguments (element, index, array)
  jii.each = jii.forEach = function(obj, iterator, context) {
    var _each = function() {
      for (var i = 0, l = obj.length; i < l; i++)
        iterator.call(context, obj[i], i, obj);
    };
    switch (toString.call(obj)) {
      case objArray:
        if (arrayProto.forEach) obj.forEach(iterator, context);
        else _each(); break;
      case objString: _each(); break;
      case objObject:
        for (var key in obj)
          if (obj.hasOwnProperty(key))
            iterator.call(context, obj[key], key, obj);
        break;
      default: validateType('each(forEach)', obj, 'string or array or object');
    }
  };

  // Check whether `a` includes `b`
  var contains = function(a, b) {
    var prop, contains = true;
    for (prop in b) {
      if (b.hasOwnProperty(prop)) {
        if (!a.hasOwnProperty(prop)) return false;
        else if (a[prop] !== b[prop]) {
          if (!jii.isEqual(a[prop], b[prop])) contains = false;
        }
      }
    }
    return contains;
  };

  // Check whether an `obj` has `chr`
  jii.has = function(obj, chr, deepScan) {
    var has; deepScan = deepScan || false;
    switch (toString.call(obj)) {
      case objString:
        if (isString(chr)) return obj.indexOf(chr) !== -1;
        else return false; break;
      case objObject:
        if (isObject(chr)) return contains(obj, chr);
        else return false;
      case objArray:
        if (isString(chr) || isNumber(chr) || isBoolean(chr))
          return obj.indexOf(chr) !== -1;
        var seeker = function() {
          var i, l = obj.length; has = false;
          for (i = 0; i < l; i++) {
            if (has) break;
            if (deepScan) {
              if (isObject(obj[i]) && jii.has(obj[i], chr, deepScan))
                has = true;
            } else {
              if (jii.isEqual(obj[i], chr)) has = true;
            }
          }
          return has;
        };
        if (isArray(chr) || isObject(chr) || isFunction(chr)) return seeker();
        return false; break;
      default: return validateType('has', obj, 'string or array or object');
    }
  };

  // `jii.has` with swapped arguments
  jii.in = function(chr, obj) { return jii.has(obj, chr); };

  // Compares two objects
  jii.isEqual = function(a, b) {
    if (toString.call(a) !== toString.call(b)) return false;
    if (isGlobal(a)) return true;
    if (isObject(a)) {
      return jii.size(a) === jii.size(b) ? jii.has(a, b) : false;
    } else if (isArray(a)) {
      if (a.length !== b.length) return false;
      for (var i = 0, l = a.length; i < l; i++) {
        if (!jii.isEqual(a[i], b[i])) return false;
      }
      return true;
    } else if (isFunction(a)) {
      return a.toString() === b.toString();
    }
    return a === b;
  };

  jii.walk = function(obj, mutator, context) {
    var result;
    switch (toString.call(obj)) {
      case objString:
        result = '';
        for (var i = 0, l = obj.length; i < l; i++)
          result += mutator.call(context, obj[i]);
        break;
      case objArray:
        result = jii.map(obj, mutator, context); break;
      default: typeError('string or array', typeof obj, 'walk');
    }
    return result;
  };

  // Freeze script for a period of time
  // TODO: todo this todo
  jii.sleep = function(delay) {
    var ts = new Date().getTime();
    var sleep = (function() {
      while (new Date().getTime() - ts < delay) {
        setTimeout(function() { return sleep }, 100);
      }
    })();
    return sleep;
  };

  // -------------------- SYSTEM --------------------

  // Prototype native objects with jii methods
  jii.proto = function() {
    var STRING = ['capitalize', 'swapCase', 'isUpperCased', 'isLowerCased',
      'toUnicode', 'toCharCode', 'endsWith', 'startsWith', 'positions',
      'reverse', 'trim', 'title'];
    var ENUMS = ['occurrences', 'uniq', 'count', 'eachSlice', 'eachCons',
      'dropFirst', 'dropLast', 'each', 'has', 'in', 'walk'];
    var ARRAY = ['similar', 'min', 'max', 'zip', 'map', 'hasChain', 'select',
      'reject', 'flatten', 'reduce', 'sum', 'multiply', 'all', 'every',
      'any', 'some', 'filter', 'compact'];
    var OBJECT = ['size', 'count', 'each', 'has', 'in'];
    var stringExtender = function(method) {
      if (!stringProto[method]) {
        stringProto[method] = function() {
          unshift.call(arguments, this);
          return jii[method].apply(jii, arguments);
        };
      }
    };
    var arrayExtender = function(method) {
      if (!arrayProto[method]) {
        arrayProto[method] = function() {
          unshift.call(arguments, this);
          return jii[method].apply(jii, arguments);
        };
      }
    };
    var objectExtender = function(method) {
      if (!Object.prototype[method]) {
        Object.prototype[method] = function() {
          unshift.call(arguments, this);
          return jii[method].apply(jii, arguments);
        };
      }
    };
    jii.each(STRING, stringExtender); jii.each(ENUMS, stringExtender);
    jii.each(ARRAY, arrayExtender); jii.each(ENUMS, arrayExtender);
    jii.each(OBJECT, objectExtender);
  };

  // Extend `jii` with user methods
  jii.extend = function(obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        jii[i] = obj[i];
        extendWrapperPrototype(i, obj[i]);
      }
    }
  };

  // A `wrapper` function
  var Wrapper = function(obj) { this._wrapped = obj; };

  jii.prototype = Wrapper.prototype;

  // Helper function to continue chaining
  var result = function(obj, chain) {
    return chain ? jii(obj).begin() : obj;
  };

  // Helper function to extend `wrapper` prototype
  var extendWrapperPrototype = function(name, func) {
    Wrapper.prototype[name] = function() {
      // Add `this._wrapped` as a first element to `arguments`
      unshift.call(arguments, this._wrapped);
      return result(func.apply(jii, arguments), this._chain);
    };
  };

  // Extend `wrapper` prototype with `jii` methods
  (function() {
    for (var i in jii) {
      if (jii.hasOwnProperty(i)) {
        extendWrapperPrototype(i, jii[i]);
      }
    }
  })();

  Wrapper.prototype.begin = function() {
    this._chain = true;
    return this;
  };

  Wrapper.prototype['end'] = function() { return this._wrapped; };

  // Expose `jii` as a global variable
  root.jii = jii;
}).call(this);
