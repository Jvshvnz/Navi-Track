<?php
$dbserver = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "campusnav";

$conn = mysqli_connect($dbserver, $dbuser, $dbpass, $dbname);

if(!$conn){
    die("Connection failed: " . mysqli_connect_error());
}else{
    echo"connection succesful";
}

?>