const hasProp = {}.hasOwnProperty;

export const _ = {};
export const id = x => x;
export const K = x => () => x;

export const builtin = id.bind.bind( id.call );
export const toArray = builtin( Array.prototype.slice );
export const variadic = ( ...as ) => as;

export const ncurry = ( n, f, as=[] ) => ( ...bs ) =>
{
    bs = as.concat( bs );
    return bs.length < n ? ncurry( n, f, bs ) : f( ...bs );
};


export const curry = f => ( ...as ) =>
{
    return f.length > as.length ? ncurry( f.length, f, as ) : f( ...as );
};

export const apply = curry( ( f, as ) => f( ...as ) );
export const applyNew = curry( ( f, ...as ) => new ( f.bind( ...[null, ...as] ) ) );

export const partial = ( f, ...as ) => ( ...bs ) =>
{
    const args = as.concat( bs );
    let i = args.length;

    while ( i-- )
    {
        if ( args[i] === _ )
        {
            args[i] = args.splice( -1 )[0];
        }
    }
    return f( ...args );
};

export const flip = curry( ( f, x, y ) => f( y, x ) );
export const flip3 = curry( ( f, x, y, z ) => f( z, y, x ) );
export const nflip = curry( f => ( ...as ) => f( ...as.reverse() ) );

export const unary = curry( ( f, x ) => f( x ) );
export const binary = curry(  ( f, x, y ) => f( x, y ) );
export const nary = curry( ( n, f ) => ( ...as ) => f( ...as.slice( 0, n ) ) );

export const compose = ( ...fs ) => fs.reduce( ( f, g ) => ( ...as ) => f( g( ...as ) ) );
export const pcompose = ( ...fs ) => ( xs ) => xs.map( ( x, i ) => typeof fs[i] === 'function' ? fs[i]( x ) : undefined );
export const sequence = nflip( compose );

export const over = curry( ( f, g, x, y ) => f( g( x), g( y ) ) );

export const notF = f => ( ...as ) => !f( ...as );
export const not = notF;
export const eq = curry( ( x, y ) => y === x );
export const notEq = curry( ( x, y ) => y !== x );

export const typeOf = x => Object.prototype.toString.call( x ).slice( 8, -1 );
export const isType = curry( ( t, x ) => typeOf( x ).toLowerCase() === t.toLowerCase() );

export const toObject = xs =>
{
    return xs.reduce( ( acc, x, i ) =>
    {
        if ( i % 2 )
        {
            acc[xs[i - 1]] = x;
        }

        return acc;
    }, {} );
};

export const extend = ( a, ...bs ) =>
{
    for ( let i = 0, len = bs.length; i < len; i++ )
    {
        for ( let k in bs[i] )
        {
            if ( hasProp.call( bs[i], k ) )
            {
                a[k] = bs[i][k];
            }
        }
    }

    return a;
};

const _deepExtend = ( a, ...bs ) =>
{
    for ( let i = 0, len = bs.length; i < len; i++ )
    {
        for ( let k in bs[i] )
        {
            if ( hasProp.call( bs[i], k ) )
            {
                a[k] = typeof bs[i][k] === 'object' ? _deepExtend( a[k], bs[i][k] ) : bs[i][k];
            }
        }
    }

    return a;
};
export const deepExtend = _deepExtend;

const _deepClone = obj =>
{
    const init = Array.isArray( obj ) ? [] : {};

    return Object.keys( obj ).reduce( ( acc, k ) =>
    {
        const x = obj[k];
        acc[k] = typeof x === 'object' ? _deepClone( x ) : x;

        return acc;
    }, init );
};
export const deepClone = _deepClone;

export const forOwn = curry( ( acc, f, obj ) =>
{
    Object.keys( obj ).forEach( ( k, i) =>
    {
        acc = f( acc, k, obj[k], i );
    } );

    return acc;
} );

export const fold = flip3( builtin( Array.prototype.reduce ) );
export const fold1 = curry( ( f, xs ) => fold( xs[0], f, xs ) );
export const foldr = flip3( builtin( Array.prototype.reduceRight ) );
export const foldr1 = curry( ( f, xs ) => foldr( xs[0], f, xs ) );
export const map = flip( builtin( Array.prototype.map ) );
export const filter = flip( builtin( Array.prototype.filter ) );
export const any = flip( builtin( Array.prototype.some ) );
export const all = flip( builtin( Array.prototype.every ) );
export const each = flip( builtin( Array.prototype.forEach ) );
export const indexOf = flip( builtin( Array.prototype.indexOf ) );
export const concat = builtin( Array.prototype.concat );

export const slice = curry( ( i, j, xs ) => j != null ? xs.slice( i, j ) : xs.slice( i ) );

export const first = xs => xs[0];
export const last = xs => xs[xs.length - 1];
export const rest = slice( 1, null );
export const initial = slice( 0, -1 );
export const take = slice( 0 );
export const drop = partial( slice, _, null, _ );

export const inArray = curry( ( xs, x) => xs.indexOf( x ) > -1 );

export const remove = curry( (x, xs ) =>
{
    let ys = xs.slice( 0 );
    ys.splice( xs.indexOf( x ), 1 );
    return ys;
} );

export const uniqueBy = curry( ( f, xs ) =>
{
    let seen = [];

    return xs.filter( x =>
    {
        const fx = f( x );

        if ( seen.indexOf( fx ) === -1 )
        {
            seen.push( fx );

            return true;
        }

        return false;
    } );
} );

export const unique = uniqueBy( id );

export const dups = ( xs ) => xs.filter( ( x, i ) => xs.indexOf( x ) !== i );

export const flatten = xs =>
{
    let ys = [];

    for ( let i = 0, len = xs.length; i < len; i++ )
    {
        Array.prototype.push.apply( ys, Array.isArray( xs[i] ) ? flatten( xs[i] ) : [xs[i]] );
    }

    return ys;
};

export const flatMap = flip( compose( flatten, map ) );

export const union = compose( unique, flatten, variadic );
export const intersection = compose( unique, dups, flatten, variadic );

export const pluck = curry( ( x , xs ) =>
{
    return String( x ).split( '.' ).reduce( ( acc, x ) =>
    {
        return acc == null ? null : acc[x];
    }, xs );
} );

export const deepPluck = curry( ( x, xs ) =>
{
    let results = [];
    while ( ( xs = pluck( x, xs ) ) )
    {
        results.push( xs );
    }

    return results;
} );

export const where = curry( ( obj, xs ) =>
{
    return xs.filter( x => Object.keys( obj ).every( k => obj[k] === x[k] ) );
} );

export const deepWhere = curry( ( match, xs ) =>
{
    const find = curry( ( match, obj ) =>
    {
        return Object.keys( obj ).every( k =>
        {
            const mustFind = [obj[k], match[k]].every( x => typeof x === 'object' );

            return mustFind ? find( match[k], obj[k] ) : match[k] === obj[k];
        } );
    } );

    return xs.filter( find( match ) );
} );

export const values = obj => Object.keys( obj ).map( k => obj[k] );
export const pairs = forOwn( [], ( acc, k, v ) => acc.concat( [[k,v]] ) );

export const interleave = curry( ( [x, ...xs], ys ) =>
{
    return x == null ? ys : [x].concat( interleave( ys, xs ) );
} );

export const intersperse = curry ( ( _x, [x, ...xs] ) =>
{
    let results = [x];

    for ( let i = 0, len = xs.length; i < len; i++ )
    {
        results.push( _x, xs[i] );
    }

    return results;
} );

export const intercalate = compose( flatten, intersperse );

export const zip = ( ...xss ) => xss[0].map( ( _, i ) => xss.map( pluck( i ) ) );
export const zipWith = (f, ...xss ) => apply( zip, xss ).map( partial( apply, f ) );

export const zipObject = compose( toObject, flatten, zip );

export const unzipObject = forOwn( [[], []], ( acc, k, v, i ) =>
{
    acc[0][i] = k;
    acc[1][i] = v;

    return acc;
} );

export const range = curry( ( m, n ) =>
{
    let results = [];

    for ( var i = m; m <= n ? i <= n : i >= n; m <= n ? i++ : i-- )
    {
        results.push( i );
    }

    return results;
} );

export const shuffle = xs =>
{
    let ys = xs.slice( 0 );
    for ( let i = 0, len = ys.length; i < len; i++ )
    {
        const j = Math.random() * ( i + 1 ) | 0;
        [ys[i], ys[j]] = [ys[j], ys[i]];
    }

    return ys;
};

export const sortBy = curry( ( f, xs ) =>
{
    return xs.sort( ( x, y ) =>
    {
        const fx = f( x );
        const fy = f( y );

        switch( true )
        {
            case fx > fy:
                return 1;
            case fx < fy:
                return -1;
            default:
                return 0;
        }
    } );
} );

export const groupBy = curry( ( f, xs ) =>
{
    return xs.reduce( ( acc, x ) =>
    {
        const fx = f( x );
        acc[fx] = ( acc[fx] || [] ).concat( [x] );
        return acc;
    }, {} );
} );

export const countBy = sequence( groupBy, forOwn( {}, ( acc, k, v ) =>
{
    acc[k] = v.length;
    return acc;
} ) );

export const format = curry( ( xs, x ) =>
{
    return x.replace( /%(\d+)/g, ( _, i ) => xs[--i] || '' );
} );

export const template = curry( ( obj, x ) =>
{
    return x.replace( /#\{(.+?)\}/g, ( _, k ) => obj[k] || '' );
} );

export const gmatch = curry( ( re, x ) =>
{
    let results = [];
    x.replace( re, ( ...as ) => results.push.apply( results, as.slice( 1, -2 ) ) );

    return results;
} );

export const permutations = xs =>
{
    if ( !xs.length )
    {
        return [[]];
    }

    let results = [];
    for ( let i = 0, len = xs.length; i < len; i++ )
    {
        const x = xs[i];
        const _permutations = permutations( remove( x, xs ) );
        for ( let i = 0, len = _permutations.length; i < len; i++ )
        {
            const ys = _permutations[i];
            results.push( [x].concat( ys) );
        }
    }

    return results;
};

export const powerset = ( [x, ...xs] ) =>
{
    if ( !x )
    {
        return [[]];
    }

    const xss = powerset( xs );
    return interleave( xss, xss.map( binary( concat, [x] ) ) );
};

const exposed =
{
  _, id, K,
  builtin, toArray,
  variadic, apply, applyNew,
  ncurry, curry, partial,
  flip, flip3, nflip,
  unary, binary, nary,
  compose, pcompose, sequence, over,
  notF, not, eq, notEq, typeOf, isType,
  toObject, extend, deepExtend,
  deepClone, forOwn,
  fold, fold1, foldr, foldr1, map, filter, any, all, each, indexOf, concat,
  slice, first, last, rest, initial, take, drop,
  inArray, remove, uniqueBy, unique, dups,
  flatten, union, intersection, flatMap,
  pluck, deepPluck, where, deepWhere,
  values, pairs, interleave, intersperse, intercalate,
  zip, zipWith, zipObject, unzipObject,
  range, shuffle,
  sortBy, groupBy, countBy,
  format, template, gmatch, permutations, powerset
};

export default exposed;
