import com.github.gradle.node.npm.task.NpxTask

plugins {
    id("com.vanniktech.maven.publish") version "0.34.0"
    signing
    kotlin("jvm") version "2.2.0"
    id("com.github.ben-manes.versions") version "0.53.0"
    id("com.github.node-gradle.node") version "7.1.0"
    id("com.google.devtools.ksp") version "2.2.0-2.0.2"
}

repositories {
    mavenCentral()
}

apply(plugin = "signing")
apply(plugin = "com.github.ben-manes.versions") //For finding outdated dependencies

group = "net.justmachinery"
version = "0.6.2"

tasks.register<JavaExec>("testServer") {
    classpath = sourceSets["test"].runtimeClasspath
    mainClass.set("net.justmachinery.shade.TestServerKt")
}

tasks.register("webpack") {
    dependsOn("webpackProduction", "webpackDevelopment")
}
tasks.register<NpxTask>("webpackProduction") {
    command.set("webpack")
    args.set(listOf("--mode=production"))
    workingDir = (file("./src/main/typescript"))
}
tasks.register<NpxTask>("webpackDevelopment") {
    command.set("webpack")
    args.set(listOf("--mode=development"))
    workingDir = (file("./src/main/typescript"))
}

kotlin {
    jvmToolchain(12)
}
tasks.named<UpdateDaemonJvm>("updateDaemonJvm") {
    languageVersion = JavaLanguageVersion.of(12)
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
                url.set("http://www.apache.org/licenses/LICENSE-2.0.txt")
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
            url.set("http://github.com/ScottPeterJohnson/shade/tree/master")
        }
    }
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    implementation(kotlin("reflect"))

    api("org.jetbrains.kotlinx:kotlinx-html-jvm:0.12.0")
    api("org.jetbrains.kotlin-wrappers:kotlin-css:2026.3.1")

    implementation("com.google.code.gson:gson:2.13.2")
    api("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:1.10.2")
    implementation("com.google.guava:guava:33.5.0-jre")
    implementation("org.apache.httpcomponents:httpclient:4.5.14")
    implementation("org.jetbrains.kotlinx:kotlinx-metadata-jvm:0.9.0")
    implementation("net.justmachinery.futility:futility-core:1.0.5")

    implementation("com.google.devtools.ksp:symbol-processing-api:2.2.0-2.0.2")


    //Logging
    api("org.slf4j:slf4j-api:2.0.3")
    api("io.github.microutils:kotlin-logging:3.0.0")
    implementation("com.squareup:kotlinpoet:2.2.0")
    implementation("com.squareup:kotlinpoet-ksp:2.2.0")

    testImplementation("ch.qos.logback:logback-classic:1.5.32")
    testImplementation("ch.qos.logback:logback-core:1.5.32")
    testImplementation("org.slf4j:jcl-over-slf4j:2.0.3")

    kspTest(project(":"))

    testImplementation("io.javalin:javalin:6.7.0")
}