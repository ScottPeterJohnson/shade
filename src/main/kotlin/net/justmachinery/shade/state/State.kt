package net.justmachinery.shade.state

fun <T> react(value: T) = ObservableValue(value)
fun <T> observable(value: T) = ObservableValue(value)
fun <T> computed(lazy : Boolean = true, block: () -> T) =
    ComputedValue(block, lazy)
fun reaction(block: () -> Unit) = Reaction(block)
fun <T> action(block: () -> T) = runChangeBatch(ChangeBatchChangePolicy.ALLOWED, block = block)