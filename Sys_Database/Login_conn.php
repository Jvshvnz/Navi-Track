<?php
session_start();
include "db_connection.php";
global $conn;

// Check connection
//if ($conn) {
 //   echo "Database connected successfully!";
//} else {
  //  echo "Database connection failed!";
//}

$username = $_POST['username'];
$password = $_POST['password'];`

$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);

    $_SESSION['username'] = $row['username'];
    $_SESSION['role'] = $row['role'];

    if ($row['role'] == 'admin') {
        header('Location: ../Sys_Admin/index.php');
        exit;
    } elseif ($row['role'] == 'teacher') {
        header('Location: ../Sys_Teacher/index.php');
        exit;
    } elseif ($row['role'] == 'student') {
        header('Location: ../Sys_User/index.php');
        exit;
    } else {
        echo "Invalid credentials, please check carefully.";
    }
} else {
    echo "Invalid credentials, please check carefully.";
}
?>