package net.justmachinery.shade.state

fun <T> obs(value: T) = observable(value)
fun <T> observable(value: T) = ObservableValue(value)

/**
 * Create a computed value, which automatically updates itself when required.
 * @param lazy If true, will not immediately compute the value, will only compute when requested.
 */
fun <T> computed(lazy : Boolean = true, block: () -> T) =
    ComputedValue(block, lazy)

/**
 * Creates a block that runs now and whenever its dependencies change.
 */
fun reaction(block: () -> Unit) = Reaction(block)

/**
 * Runs a block in a change batch, so that all of its changes are only visible at the end.
 */
fun <T> action(block: () -> T) = runChangeBatch(ChangeBatchChangePolicy.ALLOWED, block = block)