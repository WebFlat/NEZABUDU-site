<?php
$to = 'y.vacheslav@gmail.com';
$from = "From: Предложение о сотрудничестве с сайта <nezabudu.com>\n\r";
$name = $_POST['name'];
$tel = $_POST['tel'];
$helps = $_POST['helps'];
$message = '
    <html>
        <body>
        <center>	
            <table border=1 cellpadding=6 cellspacing=0 width=90% bordercolor="#DBDBDB">
            <tr><td colspan=2 align=center bgcolor="#E4E4E4"><b>Информация</b></td></tr>
            <tr>
            <td><b>От кого</b></td>
            <td>'.$name.'</td>
            </tr>
            <tr>
            <td><b>Телефон</b></td>
            <td><a href="tel:'.$tel.'">'.$tel.'</a></td>
            </tr>
            <tr>
            <td><b>Имя</b></td>
            <td>'.$name.'</td>
            </tr>
            <tr>
            <td><b>Вид помощи</b></td>
            <td>'.$helps.'</td>
            </tr>
            </table>
        </center>	
        </body>
    </html>'; 

$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers  .= $from;


    mail($to, $name, $message, $headers);

?>
