# ES6 Callback Compose

How to compose many ES6 callbacks into one, hence avoiding _callback hell_

## Examples

```js
const f1 = (input, callback) => {
    callback(input + 'f1', null)
}

const f2 = (input, callback) => {
    try {
        callback(input.toLowerCase(), null)
    } catch (err) {
        callback(null, err)
    }
}

const f3 = (input, callback) => {
    try {
        const result = input.replace(/[aeiou]/, '0')
        callback(result, null)
    } catch (err) {
        callback(null, err)
    }

}

// without compose
f1('TEST', (out1, err) => {
    if (err) {
        return console.error(err)
    }

    f2 (out1, (out2, err) => {
        if (err) {
            return console.error(err)
        }

        f3 (out2, (final, err) => {
            if (err) {
                return console.error(err)
            }

            console.log('Result is: ' + result) // Result is: t0stf1
        })
    })
})


// using compose
const composedFn = compose(f1, f2, f3)
composedFn('TEST', (result, err) => {
    if (err) {
        return console.error(err)
    }
     console.log('Result is: ' + result) // Result is: t0stf1
})


// composing async functions
const sleep = ms => new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
})

const asyncFn = async (input, callback) => {
    await sleep(2000) // e.g. this could be an HTTP request

    callback(input + '-with async-', null)
}

const composedFn = compose(f1, f2, asyncFn)
composedFn('TEST', (result, err) => {
    if (err) {
        return console.error(err)
    }
     console.log('Result is: ' + result) // Result is: testf1-with async-
})

// unhandled errors thrown within callbacks won't crash the composed function
const fnWithError = (input, callback) => {
    throw new Error('test') // error thrown without calling callback(null, err)
}

const composedFn = compose(f1, f2, fnWithError)
composedFn('TEST', (result, err) => {
    if (err) {
        return console.error(err) // Error: test
    }
     console.log('Result is: ' + result)
})

```
