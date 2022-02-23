import Sinon from 'sinon';

export const mochaHooks = {
    beforeEach (done: () => void): void
    {
        // Restore Sinon's sandbox before each test:
        Sinon.restore();

        done();
    }
};
