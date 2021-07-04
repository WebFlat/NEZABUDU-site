console.log("window loaded");


$(document).ready(function () {



    var api_url = "http://localhost:3000/";
    // var api_url = "https://nezabuduapi0.herokuapp.com/" // real project

    var cookie_name_token = "project_token";
    var cookie_token = getCookie(cookie_name_token);


    function ifLogin() {
        if (typeof cookie_token !== 'undefined' && cookie_token !== 'undefined') {
            start();
        }
    }


    function start() {

        fetch(
            `${api_url}get_start_info`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Token token=' + cookie_token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(json => {
                document.getElementById('page_login').style.display = 'none'
                document.getElementById('page_main').style.display = 'block'
            })
            .catch(error => console.error('error1:', error));
    }







    //Registration****************************************************
    var registration = $('#sendReg');
    var formReg = $('#reg-form');
    var userName = $('#reg-name');
    var userSoname = $('#reg-soname');
    var userPatronymic = $('#reg-patronymic');
    var userTel = $('#reg-tel');
    var userEmail = $('#reg-email');
    var userPassword = $('#reg-password');



    function validateMail() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        var regEmail = $('#reg-email').val();
        if (reg.test(regEmail) == false || regEmail == '') {
            $('#error').text("Введите корректный e-mail").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
            return false;
        } else {
            return true;
        }
    };
    function validateSoname() {
        var reg = /^[А-Яа-яЁё\s]+$/;
        var soname = $('#reg-soname').val();
        if (reg.test(soname) == false || soname == '') {
            $('#error').text("Введите корректную фамилию").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
            return false;
        } else {
            return true;
        }
    };
    function validateName() {
        var reg = /^[А-Яа-яЁё\s]+$/;
        var name = $('#reg-name').val();
        if (reg.test(name) == false || name == '') {
            $('#error').text("Введите корректное имя").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
            return false;
        } else {
            return true;
        }
    };
    function validatePatronymic() {
        var reg = /^[А-Яа-яЁё\s]+$/;
        var patronymic = $('#reg-patronymic').val();
        if (reg.test(patronymic) == false || patronymic == '') {
            $('#error').text("Введите корректное отчество").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
            return false;
        } else {
            return true;
        }
    };
    function validateTel() {
        var reg = /^\+380\d{3}\d{2}\d{2}\d{2}$/;
        var tel = $('#reg-tel').val();
        if (reg.test(tel) == false || tel == '') {
            $('#error').text("Введите корректный телефон").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
            return false;
        } else {
            return true;
        }
    };
    function validatePass() {
        var pass = $('#reg-password').val();
        if (pass == '' || pass.length < 6) {
            $('#error').text("Введите корректный пароль мин 6 символов").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
            return false;
        } else {
            return true;
        }
    };

    function clearInput() {
        $('#reg-name').val('');
        $('#reg-soname').val('');
        $('#reg-patronymic').val('');
        $('#reg-tel').val('');
        $('#reg-email').val('');
        $('#reg-password').val('');
    };




    //Registration**************************************************
    registration.click(function (e) {
        e.preventDefault();
        if (validateSoname() && validatePatronymic() && validateName() && validateTel() && validateMail() && validatePass()) {
            fetch(
                `${api_url}user_create`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        name: userName.value,
                        surname: userSoname.value,
                        patronymic: userPatronymic.value,
                        tel: userTel.value,
                        email: userEmail.value,
                        password: userPassword.value,
                    }),
                    headers: {
                        'Authorization': 'Token token=' + cookie_token,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(json => {

                    if (json.error == 0) {
                        //console.log("success get token");
                        setCookie(cookie_name_token, json.token, 3600);
                        cookie_token = getCookie(cookie_name_token);
                        $('#error').text("Вы успешно авторизировались").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
                        clearInput();
                        $('.reg__btn-enter').addClass('active').click();
                        // window.location.reload();
                    } else {
                        $('#error').text("Такой пользователь уже существует").removeClass('success').addClass('error').show().delay(2000).fadeOut(300);
                        clearInput();
                    }

                })
                .catch(error => console.error('error:', error));
        }
    });



    //Login in**************************************************
    $('#authSend').click(function (e) {
        e.preventDefault();

        function validateMail() {
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            var email = $('#auth-email').val();
            if (reg.test(email) == false || email == '') {
                $('#error').text("Введите корректный e-mail").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
                return false;
            } else {
                return true;
            }
        }
        var authPassword = $('#auth-password').val();
        if (authPassword === '') {
            $('#error').text("Введите пароль").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
        }
        if (validateMail() && authPassword != '') {
            var token_web = $.base64.encode($('#auth-email').val() + ":" + $('#auth-password').val());
            //  console.log(token_web);
            try {

                fetch(
                    `${api_url}token`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic ' + token_web,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                    .then(response => response.json())
                    .then(json => {

                        console.log("token ", json)
                        if (typeof json.token !== 'undefined') {
                            //console.log("success get token");
                            setCookie(cookie_name_token, json.token, 3600);
                            cookie_token = getCookie(cookie_name_token);
                            $('#error').text("Вы успешно авторизировались").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
                            setTimeout(function () {
                                document.location.href = 'index-auth.html';
                            }, 2000);
                            // window.location.reload();
                        } else {
                            // alert("Проверьте логин и пароль");
                            $('#error').text("Проверьте логин и пароль").removeClass('success').addClass('error').show().delay(2000).fadeOut(300);
                        }

                    })
                    .catch(error => console.error('error:', error));
            }
            catch (err) {
                //  console.log(err);
            }
        }

    });



    //Exit account***************************************************
    $('#btn_exit').click(function () {
        deleteCookie(cookie_name_token)
        window.location.reload();

    });





    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function deleteCookie(name) {
        document.cookie = name + '=undefined; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }

});
