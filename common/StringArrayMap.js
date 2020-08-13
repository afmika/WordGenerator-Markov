module.exports = class StringArrayMap {
	/**
	 * @constructor
	 */
	constructor () {
		/**
		 * Nothing special
		 * All we need to do is to find a simple way to map a string array with an Object
		 * Ex: key = ['i', 'am'] -> value = AnObject
		 */
		this.value_map = {};
		this.key_map = {};
		this.separator = `__$$__`;
	}

	/**
	 * @param {string[]} key 
	 * @param {any} value 
	 */
	set(key, value) {
		const hashValue = this.hash(key);
		this.key_map[hashValue] = key;
		this.value_map[ hashValue ] = value;
	}
	
	/**
	 * @param {string[]} key 
	 */
	get(key) {
		const hashValue = this.hash(key);
		return this.value_map[hashValue];
	}
	
	/**
	 * @param {Function} fun (key, value) => { }
	 */
	iterate(fun) {
		for (let hashed in this.value_map ) {
			fun(this.key_map[hashed], this.value_map[hashed]);
		}
	}
	
	/**
	 * @param {string[]} key
	 */
	hash (key) {
		if (key.constructor.name != 'Array')
			throw "The object given is not a string array";
		return key.join(this.separator);
	}
}