/**
 * Word generator using Markov chains of the second order
 * @author afmika
 */
 
const fs = require("fs");
const Tools = require("./common/Tools");
const StringArrayMap = require("./common/StringArrayMap");

/**
 * @param {string[]} tokens 
 */
function firstOrderTransitionMapping( tokens ) {
	console.log(`PROCESSING ${tokens.length} tokens... `);

	let map = new StringArrayMap();
	let sum = new StringArrayMap(); 
	let token_count = 0;
	// build the alphabet
	for (let i = 1; i < tokens.length; i++) {
		let pair_token = [tokens[i-1], tokens[i]];
		if ( map.get(pair_token) == undefined )
			token_count++;
		map.set(pair_token, new StringArrayMap()); // new token
		sum.set(pair_token, 0); // new sum to compute later
	}
	
	// key, value == curr, next
	map.iterate((curr, value) => {
		map.iterate((next, value) => {
			map.get(curr).set(next, 0);
		});
	});
	
	// build the transition matrix
	for ( let i = 2; i < tokens.length; i++) {
		const [a, b, c] = [tokens[i-2], tokens[i-1], tokens[i]];
		const [cur, next] = [[a, b], [b, c]];
		let value = map.get(cur).get(next);
		map.get(cur).set(next, value + 1);
		sum.set(cur, sum.get(cur) + 1);	
	}
	
	return {
		map : map,
		sum : sum,
		count : token_count
	};
}

/**
 * @param {StringArrayMap} transition 
 * @param {string} start 
 * @param {number} length_text 
 * @param {string} algorithm 
 */
function invent(transition, start, length_text, algorithm) {
	let result = start;
	
	if ( transition.map.get(start) == undefined ) {
		throw new Error(`"${ start.join(', ') }" can't be used as starting value. The parsed seems to not contain it.`);
	}
	
	let current_algo = 'strict_transition';
	if ( algorithm != 'strict_transition' && algorithm != 'random' && algorithm != null && algorithm != undefined ) {
		throw new Error(`Invalid algorithm, 'random', 'strict_transition', undefined or null expected`); 
	}
	if ( algorithm == 'random' )
		current_algo = 'random';
	
	console.log(`[MODE = ${current_algo}]`);
	let word_count = 0;
	while ( word_count < length_text ) {
		let s = result.length;
		const pair_last = [result[s-2], result[s-1]];
		const current = pair_last;
		let next_map = transition.map.get(current);
		if ( next_map != undefined ) {
			const total = transition.sum.get(current);
			let candidates = [];
			let taken = null;
			next_map.iterate((next, count) => {
				const picked = next[1];
				if ( count > 0 )
					candidates.push(picked);
				if ( current_algo == 'strict_transition' ) {
					// picking the next token according 
					// to its transition probability
					if ( total != 0 ) {							
						// P(next | prev) = transition[prev][next] / sum[prev]
						const prob = count / total;
						if ( Math.random() <= prob ) {
							taken = picked;
							return;
						}
					}
				}
			});	
			
			if ( current_algo == 'random' ) {					
				if ( candidates.length > 0 ) {
					let rand = Math.floor(Math.random() * candidates.length);
					taken = candidates[rand];
				}
			}
			
			// debug
			Tools.debug('--------------------------------');
			Tools.debug('Candidates for', current, '->', candidates.join(', '));
			Tools.debug(result.join(','), '+', taken);
			Tools.debug('Result ',result.join(','),'\n');
			
			// update
			if ( taken != null )
				result = [...result, taken]; 
			
			Tools.debug('Result ',result.join(','),'\n');
		} else {
			console.warn('< Terminal state reached. Unable to continue >');
			break;
		}
		++word_count;
	}
	
	return result;
}

/**
 * @param {string} data_source 
 * @param {string} start 
 * @param {number} length 
 * @param {string} algorithm 
 */
function generateUsing ( data_source, start, length, algorithm) {
	const text = fs.readFileSync( data_source ).toString().toUpperCase();
	const tokens = Tools.tokenize( text );
	if ( start == null || start == '') {
		start = [tokens[0], tokens[1]];
	} else {
		start = Tools.tokenize (start.toUpperCase());
	}
	const trans = firstOrderTransitionMapping( tokens );
	console.log(`Distinct tokens ${trans.count} / ${tokens.length}`);
	const randomness = (1 - (trans.count / tokens.length) ) * 100;
	console.log(`Randomness ${ Math.floor(randomness) } %`);

	const result = invent(trans, start, length, algorithm);
	const rtext =  Tools.formatWordArrayAsText(result);
	console.log('\n', rtext);
	fs.writeFileSync('output/second-order.output.txt', rtext);
}

Tools.DEBUG_FLAG = false;
Tools.ENABLE_DEBUGGER = false;
const data_source = "datas/speech/poeme.fr.txt";
// const algorithm = 'strict_transition';
const algorithm = 'random';
const max_length = 200; // max word_count
let start = '';
generateUsing (data_source, start, max_length, algorithm);