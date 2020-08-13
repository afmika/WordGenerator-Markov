const Tools = {};
const term_symb = '[\n.,:“”"?]';

/**
 * @param {string[]} array 
 */
Tools.flatten = function ( array ) {
	let result = [];
	for (let value of array) {
		if ( typeof value == 'string') {
			result.push( value );
		} else {	
			result = [...result, ...value];
		}
	}
	return result;
}

/**
 * @param {string} text 
 */
Tools.tokenize = function ( text ) {
	let tokens = text.split(/[ \r\t]+/gi);
	// \n|.|,|:|? should be treated as a word
	for (let i = 0; i < tokens.length; i++) {
		let token = tokens[i];
		const symbols = new RegExp(term_symb, 'gi');
		const sep = '___';
		let temp = token.replace(symbols, sep);
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
	return Tools.flatten(tokens);
}

/**
 * @param {string[]} text_array 
 */
Tools.formatWordArrayAsText = function( text_array ) {
	let res = text_array.join(' ');
	const rg = term_symb;
	return res.replace(new RegExp(' ' + rg , 'gi'), t => {
		return t.split(' ').join('');
	});
}

/**
 * @param  {...any} params 
 */
Tools.debug = function(...params) {
	if (Tools.DEBUG_FLAG) console.log(...params);
	if (Tools.ENABLE_DEBUGGER) debugger;
}
module.exports = Tools;