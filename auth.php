<?php  
// session_start();
$servername = "localhost:8889";
$username = "root";
$password = "";
$database = "Nezabudu";
$conn = mysqli_connect($servername, $username, $password, $database);

 
if (isset($_POST['userEmail']))  
{$userEmail = $_POST['userEmail'];}

if (isset($_POST['authPassword']))  
{$authPassword = $_POST['authPassword'];}



if (!$conn) {
       echo ("Произошла ошибка при подключении к базе данных " . mysqli_connect_error());
} else {
       echo ("Соединение установленно");
       mysqli_set_charset($conn, "utf8");
       $sql = "SELECT * FROM users WHERE userEmail = '$userEmail' AND userPassword = '$authPassword'";
       $result = mysqli_query($conn, $sql);
       $count = mysqli_num_rows($result);
       if (!$result) {
              $response[error] = "Произошла ошибка при выполнении запроса ". mysqli_error($conn);
       } else {
              if ($count == 1) {
                   $response[status] = 1;
              //      $_SESSION['userEmail'] = $userEmail;
                   echo "$userEmail";
            } else {
                   echo "Ошибка сессии!!!";
            }

       }
       // echo (json_encode($response));
}

// if (isset($_SESSION['userEmail'])) {
//        $userEmail = $_SESSION['userEmail'];
//        echo "Вы вошли";
// }  
// if (mysqli_query($conn, $sql)) {
//        echo "New record created successfully";
// } else {
//        echo die("Error: (" . mysqli_connect_errno() . "). ".$sql. mysqli_error($conn));
// }
// mysqli_close($conn);
  
?>
