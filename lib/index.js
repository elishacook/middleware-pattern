'use strict'

module.exports = function (obj, options)
{
    options = options || {}
    var use_name = options.use || 'use',
        run_name = options.run || 'run_middleware',
        hooks = []
        
    obj[use_name] = function (hook)
    {
        hooks.push(hook)
        return obj
    }
    obj[run_name] = run_hooks.bind(obj, hooks)
}

function run_hooks (hooks, args, done)
{
    if (!hooks || hooks.length == 0)
    {
        done()
    }
    else
    {
        run_next_hook(hooks, 0, args, done)
    }
}

function run_next_hook (hooks, i, args, done)
{
    if (i >= hooks.length)
    {
        done()
        return
    }
    
    var hook = hooks[i],
        hook_args = args.slice(),
        next = function (err)
        {
            if (err)
            {
                done(err)
            }
            else
            {
                run_next_hook(hooks, i+1, args, done)
            }
        }
        
    hook_args.push(next)
    
    try
    {
        hook.apply(null, hook_args)
    }
    catch (e)
    {
        next(e)
    }
}
