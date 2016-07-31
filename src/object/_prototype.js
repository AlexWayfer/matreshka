import assign from '../_helpers/assign';
import _afterInit from './_afterinit';
import addDataKeys from './adddatakeys';
import removeDataKeys from './removedatakeys';
import isDataKey from './isdatakey';
import setData from './setdata';
import keyOf from './keyof';
import keys from './keys';
import toJSON from './tojson';
import each from './each';
import iterator from './iterator';


export default {
    _afterInit,
    setData,
    addDataKeys,
    removeDataKeys,
    isDataKey,
    keys,
    keyOf,
    toJSON,
    each,
    [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']: iterator
};