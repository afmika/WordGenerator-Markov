/**
 * Text generator using Markov's chain of the first order
 * @author afmika
 */
const fs = require("fs");

function flatten ( array ) {
	let result = [];
	for (let value of array) {
		if ( typeof value != 'object') {
			result.push(value)
		} else {			
			for (let i = 0; i < value.length; i++) {
				result.push( value[i] );
			}
		}
	}
	return result;
}

function tokenize ( text ) {
	let tokens = text.split(/[ \t]+/gi);
	// \n|.|,|:|? should be treated as a word
	for (let i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		const symbols = /[\n.,:?]/gi;
		const sep = '___';
		let temp = token.replace(symbols, sep);
		let done = {};
		if ( temp != token ) {
			let squeue = token.match(symbols);
			let temp2 = temp.split( sep );
			let result = [];
			for ( let k = 0; k < temp2.length; k++) {
				let first = squeue.shift();
				if ( first != undefined ) {					
					if ( temp2 == '' ) {
						result.push( first );
					} else {
						if ( temp2[k] != '' )
							result.push( temp2[k] );
						result.push( first );
					}
				}
			}
			tokens[i] = result;
		}		
	}
	return flatten(tokens);
}

function formatWordArrayAsText ( text_array ) {
	let res = text_array.join(' ');
	const rg = '[\n.,:?]';
	return res.replace(new RegExp(' ' + rg, 'gi'), t => {
		return t.split(' ').join('');
	});
}

function firstOrderTransitionMapping( tokens, type ) {
	let map = {};
	let sum = {};
	let token_count = 0;
	// build the alphabet
	for (let token of tokens) {
		if ( map[token] == undefined ) 
			token_count++;
		map[token] = {}; // new char
		sum[token] = 0; // new sum to compute later
	}
	for (let cur in map ) {
		for (let next in map ) {
			map[cur][next] = 0;
		}
	}
	
	// build the statistic transition matrix
	for ( let i = 1; i < tokens.length; i++) {
		const [a, b] = [tokens[i-1], tokens[i]];
		if ( type == 'suffix') {
			const [cur, next] = [a, b];
			map[cur][next]++;
			sum[cur]++;	
		} else if (type == 'prefix') {
			const [cur, next] = [b, a];
			map[cur][next]++;
			sum[cur]++;
		} else {
			throw "Undefined option, Can process 'suffix', 'prefix' only";
		}
	}
	
	return {
		map : map,
		sum : sum,
		count : token_count
	};
}

function invent(transition, start, length_text, type) {
	let ltext  = length_text - start.length;
	let result = start;
	while ( ltext-- ) {
		const last = type == 'suffix' ? result[ result.length - 1 ] : result[0];
		const from = transition.map;
		const sum  = transition.sum[last];
		for (let item in from[last] ) {
			// P(Current | Before) = transition[Before][Current] / sum[Before]
			const prob = from[last][item] / sum;
			if ( Math.random() <= prob ) {
				// console.log(prob)
				if ( type == 'suffix' ) {					
					result = [...result, item];
				} else if (type == 'prefix') {
					result = [item, ...result];
				} else {
					throw "Undefined option, Can process 'suffix', 'prefix' only";
				}
				break;
			}
		}
	}
	return result;
}

// test
// const text = fs.readFileSync("datas/speech/speech.fr.txt").toString();
function generateUsing ( data_source, start, type, length) {	
	const text = fs.readFileSync( data_source ).toString();
	const tokens = tokenize( text );
	start = tokenize(start);
	const trans = firstOrderTransitionMapping( tokens, type );
	console.log(`Tokens ${trans.count}`);
	const result = invent(trans, start, length, type);
	console.log(' Result >>\n ', formatWordArrayAsText ( result ) );
}

const data_source = "datas/speech/konosuba.en.txt";
const length = 500; // max nb of word
let start = 'I';
const type = 'suffix';
generateUsing (data_source, start, type, length);