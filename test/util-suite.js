module.exports = function() {
var suites = [];

suites.push({
    name: "util.js tests",
    desc: "a collection of tests for util.js",
    setup: function(env) {
        if (typeof define !== 'function') {
            var define = require('amdefine')(module);
        }
        var requirejs = require('requirejs');
        requirejs.config({
            // can't we specify the base repository dir instead of having to
            // juggle relative paths?
            baseUrl: __dirname+'/../src/',
            nodeRequire: require
        });
        var _this = this;
        var _env = env;
        requirejs(['lib/util'], function(util) {
            _env.util = util;
            _this.assertType(env.util.baseName, 'function');
        });
    },
    takedown: function(env) {
        env = '';
        this.result(true);
    },
    tests: [
        {
            desc: "util.toArray()",
            run: function(env) {
                var test = {
                    0: "one1",
                    1: "two2"
                };
                var r = env.util.toArray(test);
                if( Object.prototype.toString.call( r ) === '[object Array]' ) {
                    this.result(true);
                } else {
                    this.result(false);
                }
            }
        },
        {
            desc: "util.isDir()",
            run: function(env) {
                this.assertAnd(env.util.isDir('yes/i/am/a/path/'));
                this.assertFail(env.util.isDir('yes/i/am/a/path'));
            }
        },
        {
            desc: "util.pathParts()",
            run: function(env) {
                var ret = env.util.pathParts('get/me/the/parts');
                var should_be = ['get/', 'me/', 'the/', 'parts', '/'];
                this.assert(ret, should_be);
            }
        },
        {
            desc: "util.extend() should merge b to a",
            run: function(env) {
                var a = {
                    'one1': 'foo',
                    'two': 'bar',
                    'three3': 'baz'
                };
                var b = {
                    'nine9': 'chocolate',
                    'eight8': 'cherry',
                    'seven7': 'grapes'
                };
                var should_be = {
                    'one1': 'foo',
                    'two': 'bar',
                    'three3': 'baz',
                    'nine9': 'chocolate',
                    'eight8': 'cherry',
                    'seven7': 'grapes'
                };
                var ret = env.util.extend(a, b);
                this.assert(ret, should_be);
            }
        },
        {
            desc: 'util.containingDir() gives parent dir',
            run: function(env) {
                var ret = env.util.containingDir('where/is/my/containing/dir');
                this.assert(ret, 'where/is/my/containing/');
            }
        },
        {
            desc: "util.baseName()",
            run: function(env) {
                var ret = env.util.baseName('where/is/my/basename/');
                this.assertAnd(ret, 'basename/');
                ret = env.util.baseName('where/is/my/basename');
                this.assert(ret, 'basename');
            }
        },
        {
            // XXX - not sure how to best test this function
            desc: "util.bindAll()",
            run: function(env) {
                var obj = {
                    'test': 'foo',
                    'thing': function() {
                        return this.test;
                    }
                };
                var ret = env.util.bindAll(obj);
                var r = ret.thing();
                this.assert(r, 'foo');
            }
        },
        {
            // XXX - not sure how to best test this function
            desc: 'util.curry()',
            run: function(env) {
                var t = function() {
                    return 'foobar';
                };
                var ret = env.util.curry(t, 'blah');
                this.assert(ret(), 'foobar');
            }
        },
        {
            desc: 'util.bind()',
            run: function(env) {
                var context = {
                    foo: 'bar'
                };
                var callback = function() {
                    if (typeof this.foo === 'string') {
                        return this.foo;
                    } else {
                        return false;
                    }
                };
                var ret = env.util.bind(callback, context);
                this.assert(ret(), 'bar');
            }
        },
        {
            desc: 'util.highestAccess()',
            run: function(env) {
                var r1 = env.util.highestAccess('rw', 'r');
                this.assertAnd(r1, 'rw');
                var r2 = env.util.highestAccess('', 'r');
                this.assertAnd(r2, 'r');
                var r3 = env.util.highestAccess('', '');
                this.assert(r3, null);
            }
        },
        {
            desc: 'util.getEventEmiter()',
            run: function(env) {
                env.events = env.util.getEventEmitter('change', 'error', 'ready');
                this.assertType(env.events, 'object');
            }
        },
        {
            desc: "events.emit('error')",
            run: function(env) {
                var _this = this;
                env.events.on('error', function(what) {
                    _this.assert(what, 'happened');
                });
                env.events.emit('error', 'happened');
            }
        },
        {
            desc: "events.emit('change')",
            run: function(env) {
                var _this = this;
                env.events.on('change', function(what) {
                    _this.assert(what, 'happened');
                });
                env.events.emit('change', 'happened');
            }
        },
        {
            desc: "events.emit('change')",
            willFail: true,
            timeout: 1000,
            run: function(env) {
                var _this = this;
                env.events.on('oogabooga', function(what) {
                    _this.assert(what, 'happened');
                });
                env.events.emit('change', 'happened');
            }
        },
        {
            desc: "events.once()",
            run: function(env) {
                var _this = this;
                env.events.once('ready', function(what) {
                    _this.assert(what, 'happened');
                });
                env.events.emit('ready', 'happened');
            }
        },
        {
            desc: "events.reset()",
            timeout: 1000,
            willFail: true,
            run: function(env) {
                var _this = this;
                env.events.on('change', function(what) {
                    _this.result(true, what);
                });
                env.events.reset();
                env.events.emit('change', 'yoyo');
            }
        },
        {
            desc: "util.getLogger()",
            run: function(env) {
                env.logger = env.util.getLogger('test');
                this.assertTypeAnd(env.logger.log, 'function');

                var _this = this;
                env.util.setLogFunction(function(name, msg) {
                    _this.assert(msg, 'hello log function');
                });
                env.logger.log('hello log function');
            }
        },
        {
            desc: "util.silenceLogger()",
            willFail: true,
            timeout: 1000,
            run: function(env) {
                var _this = this;
                env.util.setLogFunction(function(name, level, msg) {
                    _this.assert(msg.toString(), 'hello log function');
                });
                env.util.silenceLogger('test');
                env.logger.info('hello log function');
            }
        },
        {
            desc: "util.unsilenceLogger()",
            run: function(env) {
                var _this = this;
                env.util.setLogFunction(function(name, level, msg) {
                    _this.write('log function called: '+typeof msg+' '+msg);
                    _this.assert(msg.toString(), 'helloworld');
                });
                env.util.silenceLogger('test');
                env.logger.info('blah blah');
                env.util.unsilenceLogger('test');
                env.logger.info('helloworld');
            }
        },
        {
            desc: "util.setLogLevel()",
            run: function(env) {
                var _this = this;
                env.util.setLogFunction(function(name, level, msg) {
                    _this.write('log function called: '+typeof msg+' '+msg);
                    _this.assert(msg.toString(), 'helloworld');
                });
                env.util.setLogLevel('error');
                env.logger.info('blah blah');
                env.util.setLogLevel('info');
                env.logger.info('helloworld');
            }
        }
    ]
});
return suites;
}();