exports.config = {
    onPrepare: function () {
        require('ts-node').register();
    },
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['todo-spec.ts']
};