/**
 * Text generator using Markov chains of the first order
 * @author afmika
 */
const fs = require("fs");
const Tools = require("./common/Tools");

/**
 * @param {strin} tokens 
 */
function firstOrderTransitionMapping( tokens ) {
	console.log(`PROCESSING ${tokens.length} tokens... `);

	let map = {};
	let sum = {};
	let token_count = 0;
	// build the alphabet
	for (let token of tokens) {
		if ( map[token] == undefined ) 
			token_count++;
		map[token] = {}; // new token
		sum[token] = 0; // new sum to compute later
	}
	for (let cur in map ) {
		for (let next in map ) {
			map[cur][next] = 0;
		}
	}
	
	// build the transition matrix
	for ( let i = 1; i < tokens.length; i++) {
		const [a, b] = [tokens[i-1], tokens[i]];
		const [cur, next] = [a, b];
		map[cur][next]++;
		sum[cur]++;	
	}
	
	return {
		map : map,
		sum : sum,
		count : token_count
	};
}

/**
 * @param {object} transition 
 * @param {string[]} start 
 * @param {number} length_text 
 */
function invent(transition, start, length_text) {
	let ltext  = length_text - start.length;
	let result = start;
	let word_count = 0;
	while ( word_count < length_text ) {
		const current = result[ result.length - 1 ];
		const map   = transition.map;
		const total = transition.sum[current];
		
		let candidates = [];
		let taken = null;
		if (map[current] != undefined) {			
			for (let item in map[current] ) {
				if ( total > 0 ) {
					// P(next | prev) = transition[prev][next] / sum[prev]
					const prob = map[current][item] / total;
					if ( prob > 0 )	
						candidates.push(item);
					if ( Math.random() <= prob ) {
						if ( taken == null) {
							taken = item;
						}
					}
				}
			}
			// debug
			Tools.debug('--------------------------------');
			Tools.debug('Candidates for', current, '->', candidates.join(', '));
			Tools.debug(result.join(','), '+', taken);			
			
			// update
			if ( taken != null )
				result = [...result, taken];
			
			Tools.debug('Result ',result.join(','),'\n');
		} else {
			console.warn('< Terminal state reached. Unable to continue >');
			break;
		}
		word_count++;
	}
	return result;
}

/**
 * @param {string} data_source 
 * @param {string} start 
 * @param {number} length 
 */
function generateUsing ( data_source, start, length) {
	const text = fs.readFileSync( data_source ).toString().toUpperCase();
	const tokens = Tools.tokenize( text );
	if ( start == null || start == '') {
		start = [ tokens[0] ];
	} else {
		start = Tools.tokenize (start.toUpperCase());
	}
	const trans = firstOrderTransitionMapping( tokens );
	console.log(`Distinct tokens ${trans.count} / ${tokens.length}`);
	const randomness = (1 - (trans.count / tokens.length) )* 100;
	console.log(`Randomness ${ Math.floor(randomness) } %`);

	const result = invent(trans, start, length);
	const rtext =  Tools.formatWordArrayAsText(result);
	console.log( rtext );
	fs.writeFileSync('output/first-order.output.txt', rtext);
}

Tools.DEBUG_FLAG = false;
const data_source = "datas/speech/quotes.en.txt";
const length = 100; // max word_count
let start = null;
generateUsing (data_source, start, length);