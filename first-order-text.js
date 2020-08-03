/**
 * Word generator using Markov's chain of the first order
 * @author afmika
 */
const fs = require("fs");

function tokenize ( text ) {
	return text.split(/[ \t]+/gi);
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
function generateUsing ( data_source, length) {	
	const text = fs.readFileSync( data_source ).toString();
	const tokens = tokenize( text );
	const start = ['Descente'];
	const type = 'suffix';
	const trans = firstOrderTransitionMapping( tokens, type );
	console.log(`Tokens ${trans.count}`);
	const result = invent(trans, start, length, type);
	console.log(result.join(' '))
}

const data_source = "datas/speech/alice.fr.txt";
const length = 500; // max word
generateUsing (data_source, length);