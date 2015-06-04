/* jshint esnext: true */
import {expect} from 'chai';
import {
  _, id, K,
  builtin, toArray,
  variadic, apply, applyNew,
  ncurry, curry, partial,
  flip, flip3, nflip,
  unary, binary, nary,
  compose, pcompose, sequence, over,
  notF, eq, notEq, typeOf, isType,
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
} from '../../src/lambda.js';

// test helpers
const add = curry( ( x, y ) => x + y );
const mul = curry( ( x, y ) => x * y );
const sub = curry( ( x, y ) => x - y );
const sum = ( ...as ) => as.reduce( add );
const even = x => x % 2 === 0;

class Person
{
    constructor( name, age )
    {
        this.name = name; this.age = age;
    }
}

const test = ( x, y ) =>
{
    expect( x ).to.deep.equal( y );
};


// tests
it( 'ncurry', () => test( ncurry(2, add)(1)(2), 3) );

it( 'curry', () => test( curry(add)(1)(2), 3) );

it( 'partial - in order', () => test( partial(add, 1)(2), 3) );

it( 'partial - with placeholder', () => test( partial(add, _, 1)(2), 3) );

it( 'partial - with placeholder interleaved', () => test( partial(sum, _, 'b', _)('a', 'c'), 'abc') );

it( 'apply', () => test( apply(add, [1, 2]), 3) );

it( 'applyNew', () => test( applyNew(Person, ['Josh', 25]) instanceof Person, true) );

it( 'flip', () => test( flip(sub)(2, 3), 1) );

it( 'flip3', () => test( flip3((x, y, z) => x - y - z)(2, 3, 5), 0) );

it( 'nflip', () => test( nflip(sum)('a', 'b', 'c'), 'cba') );

it( 'unary', () => test( [1, 2, 3].map(unary(variadic)), [[1], [2], [3]]) );

it( 'binary', () => test( [1, 2, 3].map(binary(variadic)), [[1, 0], [2, 1], [3, 2]]) );

it( 'nary', () => test( [1, 2, 3].map(nary(1, variadic)), [[1], [2], [3]]) );

it( 'compose', () => test( compose(curry(add)(1), curry(mul)(2))(2), 5) );

it( 'sequence', () => test( sequence(curry(add)(1), curry(mul)(2))(2), 6) );

it( 'pcompose', () => test( pcompose(add(1), mul(2), add(3))([1, 2, 3]), [2, 4, 6]) );

it( 'over', () => test( over(add, mul(2), 3, 4), 14) );

it( 'notF', () => test( notF(even)(2), false) );

it( 'eq', () => test( eq('foo')('foo'), true) );

it( 'notEq', () => test( notEq('foo')('bar'), true) );

it( 'isType', () => test( [isType('Array', []), isType('Object', {})], [true, true]) );

it( 'toObject', () => test( toObject(['a', 1, 'b', 2, 'c', 3]), {a: 1, b: 2, c: 3}) );

let obj = {a: 1};

it( 'extend', () => test( extend(obj, {b: 2, c: 3}, {c: 4}), {a: 1, b: 2, c: 4}) );

it( 'extend - mutates target', () => test( obj, {a: 1, b: 2, c: 4}) );

let x = {a: {b: 1, c: 2}};

let y = {a: {b: 123}};

it( 'deepExtend - object', () => test( deepExtend(x, y), {a: {b: 123, c: 2}}) );

let a = ['foo',[1,{b:1}]];

it( 'deepClone', () => test( a, deepClone(a)) );

it( 'forOwn', () => test( forOwn([], (acc, k, v) => acc.concat([k, v]), {a:1, b:2, c:3}), ['a',1,'b',2,'c',3]) );

it( 'fold', () => test( fold(0, add, [1, 2, 3]), 6) );

it( 'foldr', () => test( foldr(6, sub, [1, 2, 3]), 0) );

it( 'map', () => test( map(curry(add)(1), [1, 2, 3]), [2, 3, 4]) );

it( 'filter', () => test( filter(even, [1, 2, 3, 4]), [2, 4]) );

it( 'any', () => test( any(even, [1, 2, 3, 4]), true) );

it( 'all', () => test( all(even, [1, 2, 3, 4]), false) );

it( 'indexOf', () => test( indexOf(2, [1, 2, 3]), 1) );

it( 'concat', () => test( concat([1, 2], [3, 4], [5, 6]), [1, 2, 3, 4, 5, 6]) );

it( 'first', () => test( first([1, 2, 3]), 1) );

it( 'last', () => test( last([1, 2, 3]), 3) );

it( 'rest', () => test( rest([1, 2, 3]), [2, 3]) );

it( 'initial', () => test( initial([1, 2, 3]), [1, 2]) );

it( 'take', () => test( take(2, [1, 2, 3]), [1, 2]) );

it( 'drop', () => test( drop(2, [1, 2, 3]), [3]) );

it( 'inArray', () => test( inArray([1, 2, 3], 2), true) );

it( 'uniqueBy', () => test( uniqueBy(x => x.length, ['a', 'b', 'aa', 'bb']), ['a', 'aa']) );

it( 'unique', () => test( unique([1, 1, 2, 2, 3, 3]), [1, 2, 3]) );

it( 'dups', () => test( dups([1, 1, 2, 2, 3, 4]), [1, 2]) );

it( 'flatten', () => test( flatten([1, [2, [3, [4]]]]), [1, 2, 3, 4]) );

it( 'union', () => test( union([1, 2], [2, 3], [3, 4]), [1, 2, 3, 4]) );

it( 'intersection', () => test( intersection([1, 2, 3], [1, 2, 4], [1, 2, 5]), [1, 2]) );

it( 'flatMap', () => test( flatMap([1, 2], x => flatMap([3, 4], y => x + y)), [4, 5, 5, 6]) );

it( 'pluck array', () => test( pluck(1, [1, 2, 3]), 2) );

it( 'pluck object', () => test( pluck('a', {a: 1, b: 2, c: 3}), 1) );

it( 'deepPluck', () => test( true, true) );

it( 'where', () => test( where({name:'Peter'}, [{name:'Peter'},{name:'Jon'},{name:'Mike'}]), [{name:'Peter'}]) );

it( 'deepWhere', () => test( deepWhere({a:{b:1}}, [{a:{b:1}}, {c:2}]), [{a:{b:1}}]) );

it( 'values', () => test( values({a:1, b:2, c:3}), [1,2,3]) );

it( 'pairs', () => test( pairs({a:1, b:2, c:3}), [['a', 1], ['b', 2], ['c', 3]]) );

it( 'zip', () => test( zip([1, 2, 3], [4, 5, 6]), [[1, 4], [2, 5], [3, 6]]) );

it( 'zipWith', () => test( zipWith(add, [1, 2, 3], [4, 5, 6]), [5, 7, 9]) );

it( 'zipObject', () => test( zipObject(['a', 'b', 'c'],[1, 2, 3]), {a:1, b:2, c:3}) );

it( 'unzipObject', () => test( unzipObject({a:1, b:2}), [['a', 'b'], [1, 2]]) );

it( 'range', () => test( range(0, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) );

let xs = [1, 2, 3, 4, 5];

it( 'shuffle - copies array', () => test( shuffle(xs) === xs, false) );

it( 'sortBy', () => test( sortBy(id, [3, 4, 2, 5, 1]), [1, 2, 3, 4, 5]) );

it( 'groupBy', () => test( groupBy(Math.round, [1.1, 1.2, 1.3, 1.6, 1.7, 1.8]), {1: [1.1, 1.2, 1.3],2: [1.6, 1.7, 1.8]}) );

it( 'groupBy - collection', () => test( groupBy(x => x.n, [{n:1},{n:1},{n:2},{n:2}]), {1:[{n:1},{n:1}],2:[{n:2},{n:2}]}) );

it( 'countBy', () => test( countBy(Math.round, [1.1, 1.2, 1.3, 1.6, 1.7, 1.8]), {1: 3, 2: 3}) );

it( 'format', () => test( format(['a', 'c'], '%1b%2d'), 'abcd') );

it( 'template', () => test( template({a: 'a', c: 'c'}, '#{a}b#{c}d'), 'abcd') );

it( 'gmatch', () => test( gmatch(/\{(.+?)\}/g, '{a}b{c}d'), ['a', 'c']) );
