// tslint:disable: no-console
// tslint:disable: only-arrow-functions
import * as assert from 'assert';
import 'mocha';

import { deserializeRGB, serializeRGB } from '../common/utils';

describe('Common Utils Tests', function () {

    it('should serialize color according to yeelight specification', function () {
        const red = 123;
        const green = 210;
        const blue = 95;
        const serialized = serializeRGB(red, green, blue);
        const realValue = 8114783;
        assert.equal(realValue, serialized);
    });

    it('should deserialize color according to yeelight specification', function () {
        const red = 123;
        const green = 210;
        const blue = 95;
        const serialized = serializeRGB(red, green, blue);
        const deserialized = deserializeRGB(serialized);
        assert.equal(red, deserialized[0]);
        assert.equal(green, deserialized[1]);
        assert.equal(blue, deserialized[2]);
    });
});
