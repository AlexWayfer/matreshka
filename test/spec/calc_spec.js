import calc from 'src/calc';
import addListener from 'src/on/_addlistener';
import makeObject from '../helpers/makeobject';
import createSpy from '../helpers/createspy';

describe('calc', () => {
	it('adds simple dependency', () => {
		const obj = {
			a: 1,
			b: 2
		};

		calc(obj, 'c', ['a', 'b'], (a, b) => a + b);
		expect(obj.c).toEqual(3);
		obj.a = 3;
		expect(obj.c).toEqual(5);
		obj.b = 3;
		expect(obj.c).toEqual(6);
	});

	it('adds simple dependency for an object with a property isMK=true', () => {
		const obj = {
			isMK: true,
			a: 1,
			b: 2
		};

		calc.call(obj, 'c', ['a', 'b'], (a, b) => a + b);
		expect(obj.c).toEqual(3);
		obj.a = 3;
		expect(obj.c).toEqual(5);
		obj.b = 3;
		expect(obj.c).toEqual(6);
	});

	it('adds dependency from another object', () => {
		const obj = {
			a: 1,
			b: 2
		};
		const obj2 = {
			c: 4,
			d: 8
		};

		calc(obj, 'e', [{
			object: obj,
			key: ['a', 'b']
		}, {
			object: obj2,
			key: ['c', 'd']
		}], (a, b, c, d) => a + b + c + d);

		expect(obj.e).toEqual(15);
	});

	it(`doesn't set on init via setOnInit=false`, () => {
		const obj = {
			a: 1,
			b: 2,
			c: 0
		};

		calc(obj, 'c', ['a', 'b'], (a, b) => a + b, {
			setOnInit: false
		});

		expect(obj.c).toEqual(0);
	});

	it('protects from cyclical links', () => {
		const obj = {
			a: 1,
			b: 2,
			c: 3
		};

		calc(obj, 'a', ['b', 'c'], (x, y) => x + y);
		calc(obj, 'b', ['a', 'c'], (x, y) => x + y);
		calc(obj, 'c', ['a', 'b'], (x, y) => x + y);

		expect(obj.a).toEqual(27);
	});

	xit('throws error when target is not a string', () => {});
	xit('throws error when source is not an object', () => {});
	xit('throws error when source key is not a string', () => {});
	xit('throws error when source object is not an object', () => {});

	it('allows deep dependencies', () => {
		const obj = makeObject('a.b.c', 1);

		calc(obj, 'd', 'a.b.c', (c) => c);
		expect(obj.d).toEqual(1);
		obj.a.b.c = 2;
		expect(obj.d).toEqual(2);

		const b = obj.a.b;
		obj.a.b = {c: 3};
		b.c = 'nope';
		expect(obj.d).toEqual(3);

		const a = obj.a;
		obj.a = {b: {c: 4}};
		a.b = {c: 'nope'};
		expect(obj.d).toEqual(4);
	});

	it('allows deep dependencies from another object', () => {
		const obj = makeObject('a', 1);
		const obj2 = makeObject('b.c.d', 2);

		calc(obj, 'd', {
			object: obj2,
			key: 'b.c.d'
		}, (c) => c*2);

		expect(obj.d).toEqual(4);
	});

	it('uses event options', () => {
		const obj = {};
		const handler = createSpy(evt => {
			expect(evt.foo).toEqual('bar');
		});
		calc(obj, 'c', ['a', 'b'], (a, b) => a + b, { foo: 'bar' });

		addListener(obj, 'change:c', handler);

		obj.a = 2;
		obj.b = 3;

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('uses silent=true from event options', () => {
		const obj = {};
		const handler = createSpy();

		addListener(obj, 'change:c', handler);

		calc(obj, 'c', ['a', 'b'], (a, b) => a + b, { silent: true });

		obj.a = 2;
		obj.b = 3;

		expect(handler).not.toHaveBeenCalled();
	});

	it('allows to debounce handler', done => {
		const obj = {
			a: 1,
			b: 2
		};
		const handler = createSpy(() => {
			expect(obj.c).toEqual(5);
		});

		addListener(obj, 'change:c', handler);

		calc(obj, 'c', ['a', 'b'], (a, b) => a + b, {
			debounce: true
		});

		obj.a = 0;
		obj.a = 1;
		obj.a = 2;
		obj.b = 0;
		obj.b = 1;
		obj.b = 2;
		obj.b = 3;

		setTimeout(() => {
			expect(handler).toHaveBeenCalledTimes(1);
			done();
		}, 400);
	});
});