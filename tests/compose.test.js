const { compose } = require('../src/compose')

const sleep = ms => new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
})

describe('should compose callbacks as expected', () => {

    test('should throw error if no callback provided', async () => {

        expect(() => compose()).toThrow('error, should provide at least 1 callback to compose')

    })
    
    test.each([
        {
            functions: [
                (input, cb) => {
                    cb(input + 'test', null)
                }
            ],
            expectedResult: 'testtest',
            input: 'test'
        },
        {
            functions: [
                (input, cb) => {
                    cb(input + 'test1', null)
                },
                (input, cb) => {
                    cb(input + 'test2', null)
                },
                (input, cb) => {
                    cb(input + 'test3', null)
                },
                (input, cb) => {
                    cb(input + 'test4', null)
                }
            ],
            expectedResult: 'testtest1test2test3test4',
            input: 'test'
        },
        {
            functions: [
                (input, cb) => {
                    cb(input + 'test1')
                },
                (input, cb) => {
                    cb(input + 'test2')
                },
                (input, cb) => {
                    cb(input + 'test3')
                }
            ],
            expectedResult: 'testtest1test2test3',
            input: 'test'
        },
        {
            functions: [
                (input, cb) => {
                    cb(input + 'test1', null)
                },
                async (input, cb) => {
                    await sleep(500)
                    cb(input + 'test2')

                },
                (input, cb) => {
                    const promise = new Promise((resolve, reject) => {
                        sleep(500).then(resolve).catch(reject)
                    })

                    promise.then(() => cb(input + 'test3', null)).catch(err => cb(null, err))

                },
                (input, cb) => {
                    cb(input + 'test4', null)
                }
            ],
            expectedResult: 'testtest1test2test3test4',
            input: 'test'
        },
        
    ])('should work as expected when no errors', async ({ functions, input, expectedResult }) => {

        const handler = compose(...functions)
        handler(input, (result, err = null) => {
            expect(err).toBeNull()
            expect(result).toEqual(expectedResult)
        })

    })
    
    test.each([
        {
            functions: [
                (input, cb) => {
                    cb(input + 'test1', null)
                },
                (input, cb) => {
                    cb(null, 'test error')
                },
                (input, cb) => {
                    cb(input + 'test3', null)
                }
            ],
            expectedError: 'test error',
            input: 'test'
        },
        {
            functions: [
                (input, cb) => {
                    cb(input + 'test1', null)
                },
                (input, cb) => {
                    throw new Error('test error')
                },
                (input, cb) => {
                    cb(input + 'test3', null)
                }
            ],
            expectedError: new Error('test error'),
            input: 'test'
        },
        
    ])('should work as expected when an error occurs', async ({ functions, input, expectedError }) => {

        const handler = compose(...functions)
        handler(input, (result, err) => {
            expect(result).toBeNull()
            expect(err).toEqual(expectedError)
        })

    })

})