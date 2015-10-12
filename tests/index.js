'use strict'

var expect = require('chai').expect,
    middleware_pattern = require('../lib/index.js')
    
describe('middleware-pattern', function ()
{
    it('creates a use() function on an object', function ()
    {
        var foo = {}
        middleware_pattern(foo)
        expect(foo.use).to.not.be.undefined
        expect(typeof foo.use).to.equal('function')
    })
    
    it('creates a run_middleware() function on an object', function ()
    {
        var foo = {}
        middleware_pattern(foo)
        expect(foo.run_middleware).to.not.be.undefined
        expect(typeof foo.run_middleware).to.equal('function')
    })
    
    it('returns the object after a use() call', function ()
    {
        var foo = {}
        middleware_pattern(foo)
        expect(foo.use()).to.equal(foo)
    })
    
    it('calls done() when no middleware has been added', function (done)
    {
        var foo = {}
        middleware_pattern(foo)
        foo.run_middleware([], done)
    })
    
    it('calls done() after running middleware', function (done)
    {
        var foo = {}
        middleware_pattern(foo)
        foo.use(function (params, next)
        {
            params.bar = 'baz'
            next()
        })
        
        var params = {}
        foo.run_middleware([params], function ()
        {
            expect(params.bar).to.equal('baz')
            done()
        })
    })
    
    it('runs middleware in the order it was added', function (done)
    {
        var foo = {}
        middleware_pattern(foo)
        
        foo
            .use(function (params, next)
            {
                params.push(1)
                next()
            })
            .use(function (params, next)
            {
                params.push(2)
                next()
            })
            .use(function (params, next)
            {
                params.push(3)
                next()
            })
        
        var params = []
        
        foo.run_middleware([params], function ()
        {
            expect(params).to.deep.equal([1,2,3])
            done()
        })
    })
    
    it('short circuits if middleware fails', function (done)
    {
        var foo = {}
        middleware_pattern(foo)
        
        foo
            .use(function (params, next)
            {
                params.push(1)
                next()
            })
            .use(function (params, next)
            {
                params.push(2)
                next('error')
            })
            .use(function (params, next)
            {
                params.push(3)
                next()
            })
        
        var params = []
        
        foo.run_middleware([params], function (err)
        {
            expect(params).to.deep.equal([1,2])
            expect(err).to.equal('error')
            done()
        })
    })
    
    it('short circuits if middleware throws an error', function (done)
    {
        var foo = {}
        middleware_pattern(foo)
        
        foo
            .use(function (params, next)
            {
                params.push(1)
                next()
            })
            .use(function (params, next)
            {
                params.push(2)
                throw new Error('error')
            })
            .use(function (params, next)
            {
                params.push(3)
                next()
            })
        
        var params = []
        
        foo.run_middleware([params], function (err)
        {
            expect(params).to.deep.equal([1,2])
            expect(err.message).to.equal('error')
            done()
        })
    })
    
    it('can have a custom name for use()', function (done)
    {
        var foo = {}
        middleware_pattern(foo, { use: 'add_a_thing' })
        
        foo.add_a_thing(function (params, next)
        {
            params.skidoo = 23
            next()
        })
        
        var params = {}
        
        foo.run_middleware([params], function ()
        {
            expect(params.skidoo).to.equal(23)
            done()
        })
    })
    
    it('can have a custom name for run_middleware()', function (done)
    {
        var foo = {}
        middleware_pattern(foo, { run: 'run_things' })
        
        foo.use(function (params, next)
        {
            params.skidoo = 23
            next()
        })
        
        var params = {}
        
        foo.run_things([params], function ()
        {
            expect(params.skidoo).to.equal(23)
            done()
        })
    })
})