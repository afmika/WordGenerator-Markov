/**
 * Word generator using Markov chains of the first order
 * @author afmika
 */
 
const fs = require("fs");
const Tools = require("./common/Tools");

/**
 * @param {string[]} tokens 
 * @param {string} type 
 */
function firstOrderTransitionMapping( tokens, type ) {
	let map = {};
	let sum = {};
	let token_count = 0;
	// build the alphabet
	for (let token of tokens) {
		for (let i = 0; i < token.length; i++) {
			if ( map[token[i]] == undefined ) 
				token_count++;
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
		sum : sum,
		count : token_count
	};
}
/**
 * @param {object} transition 
 * @param {string} start 
 * @param {number} length_word 
 * @param {string} type 
 */
function invent(transition, start, length_word, type) {
	if ( start == '' ) {
		let c  = Math.floor(97 + 26 * Math.random());
		start  = String.fromCharCode(c);
	}
	let lword  = length_word - start.length;
	let result = start;
	while ( lword-- ) {
		const last = type == 'suffix' ? result[ result.length - 1 ] : result[0];
		const from = transition.map;
		const sum  = transition.sum[last];
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
function generate ( number ) {	
	const text = fs.readFileSync("datas/words.fr.txt").toString().toUpperCase();
	const tokens = Tools.tokenize( text );
	const start = 'er';
	const type = 'prefix';
	const trans = firstOrderTransitionMapping( tokens, type );
	console.log(`Tokens ${trans.count}`);
	for ( let i = 0; i < number; i++ ) {
		const length = Math.floor( 5 + Math.random() * 10 );
		const result = invent(trans, start, length, type);
		console.log(result)
	}
}

generate (20);