import com.github.gradle.node.npm.task.NpmTask
import com.github.gradle.node.npm.task.NpxTask

plugins {
    id("com.vanniktech.maven.publish") version "0.37.0"
    signing
    kotlin("jvm") version "2.4.0"
    id("com.github.ben-manes.versions") version "0.54.0"
    id("com.github.node-gradle.node") version "7.1.0"
    id("com.google.devtools.ksp") version "2.3.10"
}

repositories {
    mavenCentral()
}

group = "net.justmachinery"
version = "1.0.0"

tasks.register<JavaExec>("testServer") {
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("net.justmachinery.shade.TestServerKt")
}

tasks.register<NpmTask>("buildJs") {
    args.set(listOf("run", "build"))
    workingDir = (file("./src/main/typescript"))
}

tasks.register<NpxTask>("jsTest") {
    command.set("vitest")
    args.set(listOf("run"))
    workingDir = (file("./src/main/typescript"))
}

kotlin {
    jvmToolchain(21)
}
tasks.named<UpdateDaemonJvm>("updateDaemonJvm") {
    languageVersion = JavaLanguageVersion.of(21)
}

tasks.test {
    useJUnitPlatform()
}
tasks.check {
    dependsOn("jsTest")
}

val sourcesJar by tasks.register<Jar>("sourcesJar") {
    from(sourceSets["main"].allSource)
    archiveClassifier.set("sources")
}

val javadocJar by tasks.register<Jar>("javadocJar") {
    from(tasks["javadoc"])
    archiveClassifier.set("javadoc")
}

artifacts {
    add("archives", tasks["javadocJar"])
    add("archives", tasks["sourcesJar"])
}


mavenPublishing {
    publishToMavenCentral()
    signAllPublications()

    coordinates(groupId = "net.justmachinery", artifactId="shade")
    pom {
        name.set("Shade")
        description.set("Experimental Kotlin web library")
        url.set("https://github.com/ScottPeterJohnson/shade")
        licenses {
            license {
                name.set("The Apache License, Version 2.0")
                url.set("https://www.apache.org/licenses/LICENSE-2.0.txt")
            }
        }
        developers {
            developer {
                name.set("Scott Johnson")
                email.set("shademaven@justmachinery.net")
            }
        }
        scm {
            connection.set("scm:git:git://github.com/ScottPeterJohnson/shade.git")
            developerConnection.set("scm:git:ssh://github.com:ScottPeterJohnson/shade.git")
            url.set("https://github.com/ScottPeterJohnson/shade/tree/master")
        }
    }
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation(kotlin("reflect"))

    api("org.jetbrains.kotlinx:kotlinx-html-jvm:0.12.0")
    api("org.jetbrains.kotlin-wrappers:kotlin-css:2026.7.1")

    implementation("com.google.code.gson:gson:2.14.0")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:1.10.2")
    implementation("net.justmachinery.futility:futility-core:1.1.0")

    implementation("com.google.devtools.ksp:symbol-processing-api:2.3.10")


    //Logging
    api("org.slf4j:slf4j-api:2.0.17")
    implementation("io.github.oshai:kotlin-logging-jvm:8.0.4")
    implementation("com.squareup:kotlinpoet:2.3.0")
    implementation("com.squareup:kotlinpoet-ksp:2.3.0")

    testImplementation("ch.qos.logback:logback-classic:1.5.38")
    testImplementation("ch.qos.logback:logback-core:1.5.38")
    testImplementation("org.slf4j:jcl-over-slf4j:2.0.17")
    testImplementation("org.junit.jupiter:junit-jupiter:6.1.2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    kspTest(project(":"))

    testImplementation("io.javalin:javalin:7.2.2")
}