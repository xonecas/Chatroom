/*!
  * qwery.js - copyright @dedfat
  * https://github.com/ded/qwery
  * Follow our software http://twitter.com/dedfat
  * MIT License
  */
!function (context, doc) {

  var c, i, j, k, l, m, o, p, r, v,
      el, node, len, found, classes, item, items, token, collection,
      id = /#([\w\-]+)/,
      clas = /\.[\w\-]+/g,
      idOnly = /^#([\w\-]+$)/,
      classOnly = /^\.([\w\-]+)$/,
      tagOnly = /^([\w\-]+)$/,
      tagAndOrClass = /^([\w]+)?\.([\w\-])+$/,
      html = doc.getElementsByTagName('html')[0],
      tokenizr = /\s(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\])/,
      simple = /^([a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,
      attr = /\[([\w\-]+)(?:([\^\$\*]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/,
      chunker = new RegExp(simple.source + '(' + attr.source + ')?');

  function array(ar) {
    r = [];
    for (i = 0, len = ar.length; i < len; i++) {
      r[i] = ar[i];
    }
    return r;
  }


  var cache = function () {
    this.c = {};
  };
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined;
    },
    s: function (k, v) {
      this.c[k] = v;
      return v;
    }
  };

  var classCache = new cache(),
      cleanCache = new cache(),
      attrCache = new cache(),
      tokenCache = new cache();

  function q(query) {
    return query.match(chunker);
  }

  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value) {
    var m, c, k;
    if (tag && this.tagName.toLowerCase() !== tag) {
      return false;
    }
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) {
      return false;
    }
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) {
        c = classes[i].slice(1);
        if (!(classCache.g(c) || classCache.s(c, new RegExp('(^|\\s+)' + c + '(\\s+|$)'))).test(this.className)) {
          return false;
        }
      }
    }
    if (wholeAttribute && !value) {
      o = this.attributes;
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this;
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, this.getAttribute(attribute) || '', value)) {
      return false;
    }
    return this;
  }

  function loopAll(tokens) {
    var r = [], token = tokens.pop(), intr = q(token), tag = intr[1] || '*', i, l;
    var root = tokens.length && (m = tokens[0].match(idOnly)) ? doc.getElementById(m[1]) : doc,
        els = root.getElementsByTagName(tag);
    for (i = 0, l = els.length; i < l; i++) {
      el = els[i];
      if (item = interpret.apply(el, intr)) {
        r.push(item);
      }
    }
    return r;
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(/([\.\*\+\?\^\$\{\}\(\)\|\[\]\/\\])/g, '\\$1'));
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val;
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, new RegExp('^' + clean(val))));
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, new RegExp('$' + clean(val))));
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, new RegExp(clean(val))));
    }
    return false;
  }

  function _qwery(selector) {
    var r = [], ret = [], i,
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
    tokens = tokens.slice(0);
    if (!tokens.length) {
      return r;
    }
    r = loopAll(tokens);
    if (!tokens.length) {
      return r;
    }
    // loop through all descendent tokens
    for (j = r.length; j--;) {
      node = r[j];
      p = node;
      // loop through each token
      for (i = tokens.length; i--;) {
        parents:
        while (p !== html && (p = p.parentNode)) { // loop through parent nodes
          if (found = interpret.apply(p, q(tokens[i]))) {
            break parents;
          }
        }
      }
      found && ret.push(node);
    }
    return ret;
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16;
    } : 'contains' in html ?
    function (element, container) {
      return container !== element && container.contains(element);
    } :
    function (element, container) {
      while ((element = element.parentNode)) {
        if (element === container) {
          return true;
        }
      }
      return false;
    };

  var qwery = function () {
    function qsa(selector, root) {
      root = (typeof root == 'string') ? qsa(root)[0] : root;
      if (m = selector.match(idOnly)) {
        return [doc.getElementById(m[1])];
      }
      if (doc.getElementsByClassName && (m = selector.match(classOnly))) {
        return array((root || doc).getElementsByClassName(m[1]), 0);
      }
      return array((root || doc).querySelectorAll(selector), 0);
    }

    // return fast. boosh.
    if (doc.querySelector && doc.querySelectorAll) {
      return qsa;
    }

    return function (selector, root) {
      root = (typeof root == 'string') ? qwery(root)[0] : (root || doc);
      var i, result = [], collections = [], element;
      if (m = selector.match(idOnly)) {
        return [doc.getElementById(m[1])];
      }
      if (m = selector.match(tagOnly)) {
        return root.getElementsByTagName(m[1]);
      }
      if (m = selector.match(tagAndOrClass)) {
        items = root.getElementsByTagName(m[1] || '*');
        r = classCache.g(m[2]) || classCache.s(m[2], new RegExp('(^|\\s+)' + m[2] + '(\\s+|$)'));
        for (i = items.length; i--;) {
          r.test(items[i].className) && result.push(items[i]);
        }
        return result;
      }
      // here we allow combinator selectors: $('div,span');
      for (items = selector.split(','), i = items.length; item = items[--i];) {
        collections[i] = _qwery(item);
      }

      for (i = collections.length; collection = collections[--i];) {
        var ret = collection;
        if (root !== doc) {
          ret = [];
          for (j = collection.length; element = collection[--j];) {
            // make sure element is a descendent of root
            isAncestor(element, root) && ret.push(element);
          }
        }
        result = result.concat(ret);
      }
      return result;
    };
  }();

  // being nice
  var oldQwery = context.qwery;
  qwery.noConflict = function () {
    context.qwery = oldQwery;
    return this;
  };
  context.qwery = qwery;

}(this, document);
