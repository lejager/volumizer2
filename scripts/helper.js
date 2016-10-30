var helper = {
	round : function(num) {
		if (num % 1 !== 0) {
			return num.toFixed(2);
		} else {
			return num;
		}
	}
};

module.exports = helper;