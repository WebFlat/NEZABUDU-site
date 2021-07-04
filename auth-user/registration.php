<?php  

$servername = "localhost:8887";
$username = "root";
$password = "root";
$database = "Nezabudu";
$conn = mysqli_connect($servername, $username, $password, $database);

  

// $userName = $_POST['userName'];
// $userSoname = $_POST['userSoname'];
// $userPatronymic = $_POST['userPatronymic']; 
// $userTel = $_POST['userTel'];
// $userEmail = $_POST['userEmail'];
// $userPassword = $_POST['userPassword'];

if (!$conn) {
       echo ('Произошла ошибка при подключении к базе данных ' . mysqli_connect_error());
} else {
       mysqli_set_charset($conn, "utf8");
       $sql = "INSERT INTO users (userName, userSurname, userPatronimyc, userEmail, userTel, userPassword) VALUES ('$userName','$userSoname','$userPatronymic','$userEmail','$userTel','$userPassword')";
       $result = mysqli_query($conn, $sql);
       if ($result === true) {
              // $response = [
              //        "status" => true,
              //        "message" => 'Вы успешно зарегистрированы',
              // ];
              // echo json_encode($response);
              echo ('Вы успешно зарегистрированы');

       } else {
              $response = [
                     "status" => false,
                     "error" => 'Ошибка подключения или такой пользователь уже зарегистрирован',
              ];
              echo json_encode($response);
              echo ('Ошибка');

       }
}
mysqli_close($conn);
  
?>
