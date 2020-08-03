/**
 * Word generator using Markov's chain of the first order
 * @author afmika
 */
const fs = require("fs");

function tokenize ( text ) {
	return text.split(/[ \t\n'_?.,]+/gi);
}

function firstOrderTransitionMapping( tokens, type ) {
	let map = {};
	let sum = {};
	// build the alphabet
	for (let token of tokens) {
		for (let i = 0; i < token.length; i++) {
			map[token[i]] = {}; // new char
			sum[token[i]] = 0; // new sum to compute later
		}
	}
	for (let cur in map ) {
		for (let next in map ) {
			map[cur][next] = 0;
		}
	}
	
	// build the statistic transition matrix
	for ( let i = 0; i < tokens.length; i++) {
		const word = tokens[i];
		if ( type == 'suffix') {
			for (let j = 1; j < word.length; j++) {
				const [cur, next] = [word[j-1], word[j]];
				map[cur][next]++;
				sum[cur]++;	
			}
		} else if (type == 'prefix') {
			for (let j = word.length - 1; j >= 1; --j) {
				const [cur, next] = [word[j], word[j-1]];
				map[cur][next]++;
				sum[cur]++;
			}
		} else {
			throw "Undefined option, Can process 'suffix', 'prefix' only";
		}
	}
	
	return {
		map : map,
		sum : sum
	};
}

function invent(transition, start, length_word, type) {
	if ( start == '' ) {
		let c  = Math.floor(97 + 26 * Math.random());
		start  = String.fromCharCode(c);
	}
	let lword  = length_word - start.length;
	let result = start;
	while ( lword-- ) {
		const last = type == 'suffix' ? result[ result.length - 1 ] : result[0];
		const from = trans.map;
		const sum  = trans.sum[last];
		for (let item in from[last] ) {
			// P(Current | Before) = transition[Before][Current] / sum[Before]
			const prob = from[last][item] / sum;
			if ( Math.random() <= prob ) {
				// console.log(prob)
				if ( type == 'suffix' ) {					
					result = result + item;
				} else if (type == 'prefix') {
					result = item + result;
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
const text = fs.readFileSync("datas/verb.fr.txt").toString();
const tokens = tokenize( text );
const start = 'er';
const type = 'prefix';
const trans = firstOrderTransitionMapping( tokens, type );
for ( let i = 0; i < 20; i++ ) {
	const length = Math.floor( 5 + Math.random() * 10 );
	const result = invent(trans, start, length, type);
	console.log(result)
}