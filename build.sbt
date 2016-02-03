name := "s3upload"

version := "1.0-SNAPSHOT"

scalaVersion := "2.11.2"

crossScalaVersions := Seq("2.10.4", "2.11.2")

libraryDependencies ++= Seq(
  javaJdbc,
  javaEbean,
  cache,
  "com.amazonaws" % "aws-java-sdk" % "1.3.11"
)     

play.Project.playJavaSettings
