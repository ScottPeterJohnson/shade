package net.justmachinery.shade.tests

internal fun waitFor(timeoutMs : Long = 5000, description : String = "condition", condition : () -> Boolean){
    val start = System.currentTimeMillis()
    while(!condition()){
        if(System.currentTimeMillis() - start > timeoutMs){
            throw AssertionError("Timed out waiting for $description")
        }
        Thread.sleep(20)
    }
}
