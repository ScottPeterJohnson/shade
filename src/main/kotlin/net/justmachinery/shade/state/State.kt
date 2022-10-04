package net.justmachinery.shade.state

fun <T> obs(value: T) = observable(value)

/**
 * Creates an observable value, which will cause dependent blocks (like renders) to update when it changes.
 * In Shade, [value] should not be derived from props; use [rivObservable] instead.
 */
fun <T> observable(value: T) = ObservableValue(value)

/**
 * Create a computed value, which automatically updates itself when required.
 * @param lazy If true, will not immediately compute the value, will only compute when requested.
 */
fun <T> computed(lazy : Boolean = true, block: () -> T) =
    ComputedValue(block, lazy)

/**
 * Create an observable value. The value will reset to the output of
 * block() whenever it changes, but can be otherwise set.
 */
fun <T> rivObservable(block: () -> T) =
    RivObservableValue(block)

/**
 * Creates a block that runs now and whenever its dependencies change.
 */
fun reaction(block: () -> Unit) = Reaction(block)

/**
 * Runs a block in a change batch, so that all of its changes are only visible at the end.
 */
fun <T> action(block: () -> T) = runChangeBatch(ChangeBatchChangePolicy.ALLOWED, block = block)