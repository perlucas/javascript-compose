function compose(...functions) {
    const functionsSortedInverse = functions.reverse()

    if (functionsSortedInverse.length === 0) {
        throw new Error('error, should provide at least 1 callback to compose')
    }

    return (input, providedCallback) => {

        let callbackForNextFunction = null
        
        // last function's handler callback will be providedCallback
        let callbackFromPreviousIteration = providedCallback 
        
        for (const aFunction of functionsSortedInverse) {
            // this is just to avoid referencing callbackFromPreviousIteration within the callbackForNextFunction body
            // this way we avoid dynamic binding issues
            const handlerCallbackToUseIfNoError = callbackFromPreviousIteration
            
            callbackForNextFunction = (input, err) => {
                if (err) {
                    return providedCallback(null, err)
                }

                aFunction(input, handlerCallbackToUseIfNoError)
            }

            callbackFromPreviousIteration = callbackForNextFunction

        }

        // this is triggers the callback chain
        (() => {
            try {
                callbackForNextFunction(input, null)
            } catch (err) {
                providedCallback(null, err)
            }
        })()

    }

}

module.exports = { compose }