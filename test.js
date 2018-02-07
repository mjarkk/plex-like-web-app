const test = require('ava')

test('arrays are equal', t => {
	t.deepEqual([1, 2], [1, 2]);
});
