console.log("window loaded");

// var api_url = "http://localhost:3000/";
let api_url = "https://nezabudu-api.herokuapp.com/" // real project
let cookie_name_token = "project_token";
let cookie_token = getCookie(cookie_name_token);

//Google registration
function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	console.log(profile);
	signOut();
	function signOut() {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function () {
			console.log('User signed out.');
		});
	};
	var id_token = googleUser.getAuthResponse().id_token;
	const uid = profile.getId();
	const email = profile.getEmail();
	const first_name = profile.getGivenName();
	const last_name = profile.getFamilyName();
	const avatar = profile.getImageUrl();
	//console.log(uid, email, first_name, last_name, avatar)
	if (id_token) {
		const user = {
			email: email,
			uid: uid,
			first_name: first_name,
			last_name: last_name,
			avatar: avatar,
			google_id_token: id_token
		}
		//console.log(user);
		fetch(
			`${api_url}user_oauth_create`,
			{
				method: 'POST',
				body: JSON.stringify(user),
				headers: {
					// 'Authorization': 'Token token=' + cookie_token,
					'Content-Type': 'application/json'
				}
			})
			.then(response => response.json())
			.then(json => {
				if (json.error == 0) {
					console.log("success get token");
					setCookie(cookie_name_token, json.token, 3600);
					cookie_token = getCookie(cookie_name_token);
					//console.log(cookie_token);
					window.location.reload();
				} else {
					showErrorSuccess("Такой пользователь уже существует", 2000);
					clearInput();
				}

			})
			.catch(error => {
				console.log('error:', error);
				showErrorSuccess("Ошибка соединения", 1500);
			});
	} else {
		showErrorSuccess("Ошибка подключения", 1500);
	};
};

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
};
function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
};
function deleteCookie(name) {
	document.cookie = name + '=undefined; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
};
$(document).ready(function () {

	var currentProfile = window.location.hash;
	currentProfile = +currentProfile.substring(1);
	var currentUser;
	var userParent = 0;
	let bookmark = [];



	//show message notifications*********************************
	function showErrorSuccess(textToShow, time) {
		$('#error-message').addClass('show');
		$('.success').text(textToShow);
		setTimeout(() => {
			$('#error-message').removeClass('show');
		}, time);
	};



	//if Register user*********************************
	var user = false;
	var userAvatar = '';
	var user_data = false;
	function ifLogin() {
		if (typeof cookie_token !== 'undefined' && cookie_token !== 'undefined') {
			start();
		} else {
			confirmUser();
			loadQuestionnaries();
		}
	};
	ifLogin();

	//Icon user if login**************************
	function confirmUser() {
		if (user) {
			$('#menu-guest').remove();
			if (userAvatar) {
				$('.header__user').attr('src', userAvatar);
			};
		} else {
			$('#menu-user').remove();
			$('#candle').remove();
			$('#bookmark').remove();
		};
	};

	//if user auth************************************************
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
			.then(data => {
				console.log('wellcome');
				//console.log('Data:', JSON.stringify(data));
				userParent = data.user.id;
				user = true;
				userAvatar = data.user.avatar;
				bookmark = data.favorite_profiles_id;
				isBookmark(bookmark);
				confirmUser();
				loadQuestionnaries();
			})
			.catch(error => {
				console.error('error1:', error);
				deleteCookie(cookie_name_token);
				window.location.reload();
			});

	};


	function isBookmark(data) {
		$.each(data, function (index, value) {
			if (value == currentProfile) {
				$('#bookmark').addClass('active').attr('src', './img/bookmark-black.svg');
			} else {
				return false;
			};
		});
	};


	//If user is not parent****************************
	function isNotParentUser() {
		$('.brief__edit').remove();
		$('.brief__descr-edit').remove();
		$('.default-add').remove();
		$('.tab__btn-save').remove();
		$('.story__edit-cont').remove();
		$('.textarea').attr('contenteditable', false);
	};

	//if user parent*************
	function parentUser() {
		//$('#candle').remove();
		$('#bookmark').remove();
	}


	function isLife(mine) {
		$('.brief__location').remove();
		$('.brief__end').remove();
		$('#candle').remove();
		$('#dash').remove();
		//$('#bookmark').remove();
		$('.share__support').remove();
		if (mine == true) {
			$('.brief__img-wrap').css('border-color', '#b0dcbf');
		} else {
			$('.brief__img-wrap').css('border-color', '#fce176');
		}
	};

	function renderDescrFull(data, text, userParent) {
		if (data.profile.short_life_1 == null && userParent == false) {
			$('.brief__descr-wrap-1').remove();
		} else if (data.profile.short_life_1 == null || data.profile.short_life_1 == '' && userParent == true) {
			$('.brief__descr-1').text(text);
		} else {
			if (userParent == false) {
				$('.brief__descr-wrap-1').css('padding-left', '10px');
			}
			$('.brief__descr-1').text(data.profile.short_life_1);
		};
		if (data.profile.short_life_2 == null && userParent == false) {
			$('.brief__descr-wrap-2').remove();
		} else if (data.profile.short_life_2 == null || data.profile.short_life_1 == '' && userParent == true) {
			$('.brief__descr-2').text(text);
		} else {
			if (userParent == false) {
				$('.brief__descr-wrap-2').css('padding-left', '10px');
			}
			$('.brief__descr-2').text(data.profile.short_life_2);
		};
		if (data.profile.short_life_3 == null && userParent == false) {
			$('.brief__descr-wrap-3').remove();
		} else if (data.profile.short_life_3 == null || data.profile.short_life_1 == '' && userParent == true) {
			$('.brief__descr-3').text(text);
		} else {
			if (userParent == false) {
				$('.brief__descr-wrap-3').css('padding-left', '10px');
			}
			$('.brief__descr-3').text(data.profile.short_life_3);
		};
		if (data.profile.short_life_4 == null && userParent == false) {
			$('.brief__descr-wrap-4').remove();
		} else if (data.profile.short_life_4 == null || data.profile.short_life_1 == '' && userParent == true) {
			$('.brief__descr-4').text(text);
		} else {
			if (userParent == false) {
				$('.brief__descr-wrap-4').css('padding-left', '10px');
			}
			$('.brief__descr-4').text(data.profile.short_life_4);
		};
		if (data.profile.short_life_5 == null && userParent == false) {
			$('.brief__descr-wrap-5').remove();
		} else if (data.profile.short_life_5 == null || data.profile.short_life_1 == '' && userParent == true) {
			$('.brief__descr-5').text(text);
		} else {
			if (userParent == false) {
				$('.brief__descr-wrap-5').css('padding-left', '10px');
			}
			$('.brief__descr-5').text(data.profile.short_life_5);
		};
	};

	//show more btn fuul story*****************************************
	function ifShowMore() {
		let text_to_show = $('.story__descr');
		text_to_show.each(function (index, elem) {
			let _lenght = $(this).text().length;
			if (_lenght < 240) {
				$(this).next().hide();
			} else {
				$(this).addClass('init');
			}
		});
	};
	//show more brief description**************************
	function ifShowMoreBrief() {
		let bref_text = $('.brief__text');
		if (bref_text.height() > '55') {
			bref_text.addClass('init');
		} else {
			bref_text.next().hide();
		}
	};

	//render timeline story**********************************
	async function loaddLiveFull(dataToLoad, outHtml) {
		var outAll = '';
		if (dataToLoad != []) {
			for (var i = 0; i < dataToLoad.length; i++) {
				if (dataToLoad[i].event_img != null) {
					var dateLoad = dataToLoad[i].event_date;
					dateLoad = dateLoad.split('-').reverse().join('.');
					outAll += `<div class="story__content" data-id="${dataToLoad[i].id}" data-prof-id="${dataToLoad[i].profile_id}" data-type="${dataToLoad[i].event_type}"><span class="story__date"><span>${dateLoad}</span><span class="story__data-place">${dataToLoad[i].event_place}</span></span><div class="story__img-wrap"><img data-src="${dataToLoad[i].event_img}" alt="photo" class="story__pict lazyload"></div>
				<span class="story__content-title">${dataToLoad[i].event_header}</span><div class="story__text story__text--content"><p class="story__descr">${dataToLoad[i].event_text}</p><button class="more">Подробнее</button><div class="story__edit-cont"><span></span><span></span><span></span></div><div class="story__context context-story"><button class="context-story__item editOLdStory" disabled="disabled">Редактировать</button>
				<button class="context-story__item delete-story">Удалить</button>
			</div></div></div>`;
				} else {
					outAll += `<div class="story__content" data-id="${dataToLoad[i].id}" data-prof-id="${dataToLoad[i].profile_id}" data-type="${dataToLoad[i].event_type}"><span class="story__date">${dataToLoad[i].event_date}(${dataToLoad[i].event_place})</span><span class="story__content-title">${dataToLoad[i].event_header}</span><div class="story__text story__text--content"><p class="story__descr">${dataToLoad[i].event_text}</p><button class="more">Подробнее</button>
				<div class="story__edit-cont"><span></span><span></span><span></span></div><div class="story__context context-story"><button class="context-story__item editOLdStory" disabled="disabled">Редактировать</button>
				<button class="context-story__item delete-story">Удалить</button>
			</div></div></div>`;
				}
			}
			outHtml.append(outAll);
			initDelStory();
			initEditStory();
			initDelBtn();
		}
	};

	//render main short story*************************************
	async function loadLive(dataToRender, outHtml, linkToSection) {
		var out = '';
		if (dataToRender != []) {
			for (var k = 0; k < dataToRender.length; k++) {
				if (!dataToRender[k].event_img) {
					dataToRender[k].event_img = './img/default-bg-img.webp';
				}
				out += `<a href="#${currentProfile}#${linkToSection}" class="brief__photo-wrap btn-tab-link"><img data-src="${dataToRender[k].event_img}" alt="photo" class="brief__photo lazyload"></a>`;
			}
			outHtml.prepend(out);
		};
	};

	//collects events******************************
	var arrData = [];
	function collectArr($data) {
		var arrData1 = $data.timelines.block1;
		var arrData2 = $data.timelines.block2;
		var arrData3 = $data.timelines.block3;
		var arrData4 = $data.timelines.block4;
		var arrData5 = $data.timelines.block5;
		arrData = arrData1.concat(arrData2, arrData3, arrData4, arrData5);
	};


	//hide age block**********************
	function hideAgeBlock(age) {
		if (age < 14) {
			$('#ageSection2').remove();
			$('#ageSection3').remove();
			$('#ageSection4').remove();
			$('#ageSection5').remove();
			$('#preyouth').remove();
			$('#youth').remove();
			$('#ripeness').remove();
			$('#elderhood').remove();
		} else if (age < 22) {
			$('#ageSection3').remove();
			$('#ageSection4').remove();
			$('#ageSection5').remove();
			$('#youth').remove();
			$('#ripeness').remove();
			$('#elderhood').remove();
		} else if (age < 41) {
			$('#ageSection4').remove();
			$('#ageSection5').remove();
			$('#ripeness').remove();
			$('#elderhood').remove();
		} else if (age < 66) {
			$('#ageSection5').remove();
			$('#elderhood').remove();
		};
	};

	//global data for tabs*************
	var allData = [];
	let short_def_text = 'Описание периода жизни';
	//Load brief user info******************************************
	function loadQuestionnaries() {
		let avaProfile = $('.brief__icon'),
			birthProfile = $('.brief__both'),
			dieProfile = $('.brief__die'),
			ageProfile = $('#user-old'),
			textProfile = $('#user-about-short'),
			nameProfile = $('#user-name'),
			surmaneProfile = $('#user-surname'),
			patronimycProfile = $('#user-patronimyc'),
			maidenProfile = $('#user-mainden');
		timelinebirthProfile = $('.data-birth'),
			timelinedieProfile = $('.data-die'),
			cause = $('#cause'),
			cemeteryName = $('#cemetery_name'),
			sector = $('#sector'),
			square = $('#square'),
			row = $('#row'),
			number = $('#number'),
			city_birth = $('.brief__city-birth'),
			city_die = $('.brief__city-die'),
			htmlOut1 = $('.brief__gall1'),
			htmlOut2 = $('.brief__gall2'),
			htmlOut3 = $('.brief__gall3'),
			htmlOut4 = $('.brief__gall4'),
			htmlOut5 = $('.brief__gall5'),
			liveFull1 = $('#childhood'),
			liveFull2 = $('#preyouth'),
			liveFull3 = $('#youth'),
			liveFull4 = $('#ripeness'),
			liveFull5 = $('#elderhood');
		// shortlife1 = $('.brief__descr-edit-1 + span');
		// shortlife2 = $('.brief__descr-edit-2 + span');
		// shortlife3 = $('.brief__descr-edit-3 + span');
		// shortlife4 = $('.brief__descr-edit-4 + span');
		// shortlife5 = $('.brief__descr-edit-5 + span');

		//Execute number of profile to show and show it**********************
		fetch(
			`${api_url}get_profile?profile_id=${currentProfile}`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Token token=' + cookie_token,
					'Content-Type': 'application/json'
				}
			})
			.then(response => response.json())
			.then(data => {
				allData = data;
				//console.log('Data:', JSON.stringify(data.profile));
				currentUser = data.profile.user_id;
				//console.log(currentUser, userParent);
				//let ageNum;
				if (currentUser == userParent) {
					parentUser();
					if (data.profile.avatar && data.profile.avatar !== './img/default-foto.png') {
						avaProfile.attr('src', data.profile.avatar);
					};
					let preBirth;
					if (data.profile.birth_date) {
						preBirth = data.profile.birth_date;
					};
					if (data.profile.death_date) {
						let preDie = data.profile.death_date;
						//ageNum = preDie.split(".").pop() - preBirth.split(".").pop();
						if (data.profile.cementry_name) {
							cemeteryName.text(data.profile.cementry_name);
						};
						if (data.profile.cementry_square) {
							square.text(data.profile.cementry_square);
						};
						if (data.profile.cementry_row) {
							row.text(data.profile.cementry_row);
						};
						if (data.profile.cementry_place) {
							number.text(data.profile.cementry_place);
						};
						if (data.profile.cementry_sector) {
							sector.text(data.profile.cementry_sector);
						};
						if (data.profile.death_city) {
							city_die.text(data.profile.death_city);
						};
						if (data.profile.birth_city) {
							city_birth.text(data.profile.birth_city);
						};
						dieProfile.text(preDie);
						timelinedieProfile.text(preDie);
						if (data.profile.death_cause) {
							cause.text(data.profile.death_cause);
						};
					} else {
						isLife(data.profile.profile_mine);
					};
					var ageNumBirth = new Date().getFullYear() - preBirth.split(".").pop();
					ageProfile.text(ageNumBirth);
					birthProfile.text(preBirth);
					timelinebirthProfile.text(preBirth);
					nameProfile.text(data.profile.last_name);
					surmaneProfile.text(data.profile.first_name);
					patronimycProfile.text(data.profile.patronymic);
					if (data.profile.maiden_name) {
						maidenProfile.text(`(${data.profile.maiden_name})`);
					};
					if (data.profile.birth_city) {
						city_birth.text(data.profile.birth_city);
					};
					if (data.profile.short_story == '') {
						$('.brief__text').css('opacity', 0);
						$('#user-about').css('opacity', 0).css('position', 'relative').css('z-index', '-1');
					} else {
						textProfile.text(data.profile.short_story);
					};
					// if (data.profile.short_life_1 && data.profile.short_life_1 != '') {
					// 	shortlife1.text(data.profile.short_life_1);

					// } else {
					// 	shortlife1.text(short_def_text);
					// };
					// if (data.profile.short_life_2 && data.profile.short_life_2 != '') {
					// 	shortlife2.text(data.profile.short_life_2);
					// } else {
					// 	shortlife2.text(short_def_text);
					// };
					// if (data.profile.short_life_3 && data.profile.short_life_3 != '') {
					// 	shortlife3.text(data.profile.short_life_3);
					// } else {
					// 	shortlife3.text(short_def_text);
					// };
					// if (data.profile.short_life_4 && data.profile.short_life_4 != '') {
					// 	shortlife4.text(data.profile.short_life_4);
					// } else {
					// 	shortlife4.text(short_def_text);
					// };
					// if (data.profile.short_life_5 && data.profile.short_life_4 != '') {
					// 	shortlife5.text(data.profile.short_life_5);
					// } else {
					// 	shortlife5.text(short_def_text);
					// };
					loadLive(data.timelines.block1, htmlOut1, 'childhood');
					loadLive(data.timelines.block2, htmlOut2, 'preyouth');
					loadLive(data.timelines.block3, htmlOut3, 'youth');
					loadLive(data.timelines.block4, htmlOut4, 'ripeness');
					loadLive(data.timelines.block5, htmlOut5, 'elderhood');
					hideAgeBlock(ageNumBirth);
					var btnAddClick = $('.btn-tab-link');
					if (btnAddClick) {
						clickToLive(btnAddClick);
					};
					loaddLiveFull(data.timelines.block1, liveFull1);
					loaddLiveFull(data.timelines.block2, liveFull2);
					loaddLiveFull(data.timelines.block3, liveFull3);
					loaddLiveFull(data.timelines.block4, liveFull4);
					loaddLiveFull(data.timelines.block5, liveFull5);
					renderDescrFull(data, short_def_text, true);
					collectArr(allData);
					renderEvents();
					ifShowMore();
					initMore();
					ifShowMoreBrief();
				} else {
					if (data.profile.avatar && data.profile.avatar !== './img/default-foto.png') {
						avaProfile.attr('src', data.profile.avatar);
					};
					let preBirth;
					if (data.profile.birth_date) {
						preBirth = data.profile.birth_date;
					};
					if (data.profile.death_date) {
						var preDie = data.profile.death_date;
						//ageNum = preDie.split(".").pop() - preBirth.split(".").pop();
						if (data.profile.cementry_name) {
							cemeteryName.text(data.profile.cementry_name);
						};
						if (data.profile.cementry_square) {
							square.text(data.profile.cementry_square);
						};
						if (data.profile.cementry_row) {
							row.text(data.profile.cementry_row);
						};
						if (data.profile.cementry_place) {
							number.text(data.profile.cementry_place);
						};
						if (data.profile.cementry_sector) {
							sector.text(data.profile.cementry_sector);
						};
						if (data.profile.death_city) {
							city_die.text(data.profile.death_city);
						};
						if (data.profile.birth_city) {
							city_birth.text(data.profile.birth_city);
						};
						dieProfile.text(preDie);
						timelinedieProfile.text(preDie);
					} else {
						isLife(data.profile.profile_mine);
					};
					// var ageNumBirth = new Date().getFullYear() - preBirth.split(".").pop();
					// var preBirth = (data.profile.birth_date).split('-').reverse().join('.');
					// var preDie = (data.profile.death_date).split('-').reverse().join('.');
					// var ageNum = preDie.split(".").pop() - preBirth.split(".").pop();
					var ageNumBirth = new Date().getFullYear() - preBirth.split(".").pop();
					ageProfile.text(ageNumBirth);
					birthProfile.text(preBirth);
					timelinebirthProfile.text(preBirth);
					dieProfile.text(preDie);
					timelinedieProfile.text(preDie);
					//ageProfile.text(ageNum);
					nameProfile.text(data.profile.last_name);
					surmaneProfile.text(data.profile.first_name);
					patronimycProfile.text(data.profile.patronymic);
					if (data.profile.maiden_name) {
						maidenProfile.text(`(${data.profile.maiden_name})`);
					};
					// if (data.profile.short_life_1) {
					// 	shortlife1.text(data.profile.short_life_1);
					// };
					// if (data.profile.short_life_2) {
					// 	shortlife2.text(data.profile.short_life_2);
					// };
					// if (data.profile.short_life_3) {
					// 	shortlife3.text(data.profile.short_life_3);
					// };
					// if (data.profile.short_life_4) {
					// 	shortlife4.text(data.profile.short_life_4);
					// };
					// if (data.profile.short_life_5) {
					// 	shortlife5.text(data.profile.short_life_5);
					// };
					if (data.profile.short_story == '') {
						$('.brief__text').css('opacity', 0);
						$('#user-about').css('opacity', 0).css('position', 'relative').css('z-index', '-1');
					} else {
						textProfile.text(data.profile.short_story);
					};
					if (data.profile.profile_open !== true) {
						$('.brief__timelaps').css('display', 'none');
						$('.brief__location').css('display', 'none');
						$('.data-tab-content').css('display', 'none');
						$('.menu__item').css('pointer-events', 'none').css('opacity', '.5');
						$('.profile__data').append(`<p class="life-profile-notification">Это закрытая анкета</p>`);
						isNotParentUser();
					} else {
						if (data.profile.cementry_name) {
							cemeteryName.text(data.profile.cementry_name);
						};
						if (data.profile.cementry_square) {
							square.text(data.profile.cementry_square);
						};
						if (data.profile.cementry_row) {
							row.text(data.profile.cementry_row);
						};
						if (data.profile.cementry_place) {
							number.text(data.profile.cementry_place);
						};
						if (data.profile.cementry_sector) {
							sector.text(data.profile.cementry_sector);
						};
						if (data.profile.death_city) {
							city_die.text(data.profile.death_city);
						};
						if (data.profile.birth_city) {
							city_birth.text(data.profile.birth_city);
						};
						if (data.profile.profile_open !== true) {
							$('.brief__timelaps').css('display', 'none');
							$('.brief__location').css('display', 'none');
							$('.data-tab-content').css('display', 'none');
						};
						if (data.profile.short_story == '') {
							$('.brief__text').css('opacity', 0);
							$('#user-about').css('opacity', 0).css('position', 'relative').css('z-index', '-1');
						} else {
							textProfile.text(data.profile.short_story);
						};
						if (data.profile.death_cause) {
							cause.text(data.profile.death_cause);
						};
						loadLive(data.timelines.block1, htmlOut1, 'childhood');
						loadLive(data.timelines.block2, htmlOut2, 'preyouth');
						loadLive(data.timelines.block3, htmlOut3, 'youth');
						loadLive(data.timelines.block4, htmlOut4, 'ripeness');
						loadLive(data.timelines.block5, htmlOut5, 'elderhood');
						hideAgeBlock(ageNumBirth);
						var btnAddClick = $('.btn-tab-link');
						if (btnAddClick) {
							clickToLive(btnAddClick);
						};
						loaddLiveFull(data.timelines.block1, liveFull1);
						loaddLiveFull(data.timelines.block2, liveFull2);
						loaddLiveFull(data.timelines.block3, liveFull3);
						loaddLiveFull(data.timelines.block4, liveFull4);
						loaddLiveFull(data.timelines.block5, liveFull5);
						renderDescrFull(data, short_def_text, false);
						collectArr(allData);
						renderEvents();
						initMore();
						ifShowMore();
						ifShowMoreBrief();
						isNotParentUser();
					}
				};
			})
			.then(() => {
				$('#p_prldr').fadeOut('slow');
				addEvents(userParent, currentProfile);
			})
			.catch(error => {
				console.error('error1:', error);
				showErrorSuccess('Нет данных', 1500);
				window.location.href = '../index.html';
			});
	};


	//User input first screen**********************************
	var status_prof = '';
	$('.about__check').on('change', function () {
		status_prof = $(this).attr('data-status');
	});
	//show form edit profile****************************
	$('.editOLdData').click(function () {
		let whois = $('#whois');
		let userName = $('.user__name');
		let userSurname = $('.user__surname');
		let userPatronymic = $('.user__patronymic');
		let userGirlName = $('.user__surname-girl');
		let ava = $('#output');
		let both = $('.user__both');
		let die = $('.user__die');
		let cityBoth = $('.user__both-loc');
		let cityDie = $('.user__die-loc');
		let info = $('#area-lives');
		let cityCemetery = $('#city');
		let cemetery = $('#cemetery');
		let sector = $('#cementry_sector');
		let square = $('#cementry_square');
		let row = $('#cementry_row');
		let place = $('#cementry_place');
		let lon = $('#grave_lon');
		let lat = $('#grave_lat');
		let cause = $('#die-select');
		cause.val(allData.profile.death_cause);
		$('#editOldData').css('display', 'block');
		$('.life').css('opacity', '0.1');
		$('body').css('background', 'rgba(0,0,0, .9)').css('z-index', '-1');
		$('.header').css('opacity', '0');
		$('.brief__context').removeClass('active');
		//console.log(allData.profile);
		if (allData.profile.who_for_profile != '') {
			whois.val(allData.profile.who_for_profile);
		};
		if (allData.profile.avatar != '') {
			ava.attr('src', allData.profile.avatar);
		};
		if (allData.profile.profile_open == true) {
			$('#open').click();
		} else {
			$('#close').click();
		};
		if (allData.profile.first_name != null) {
			userSurname.val(allData.profile.first_name);
		}
		if (allData.profile.last_name != null) {
			userName.val(allData.profile.last_name);
		}
		if (allData.profile.patronymic != null) {
			userPatronymic.val(allData.profile.patronymic);
		}
		if (allData.profile.maiden_name != null) {
			userGirlName.val(allData.profile.maiden_name);
		};
		if (allData.profile.death_date) {
			die.val(allData.profile.death_date);

		} else {
			$('.data__relative').remove();
			$('.user__die-loc').remove();
			$('.data__title-location').remove();
			$('.user__inp-wrap-die').remove();
			$('.data-place').remove();
		}
		if (allData.profile.birth_date) {
			both.val(allData.profile.birth_date);
		}
		if (allData.profile.birth_city != null) {
			cityBoth.val(allData.profile.birth_city);
		};
		if (allData.profile.death_city != null) {
			cityDie.val(allData.profile.death_city);
		};
		if (allData.profile.short_story != null) {
			info.val(allData.profile.short_story);
		};
		if (allData.profile.cementry_city != null) {
			cityCemetery.val(allData.profile.cementry_city);
		};
		if (allData.profile.cementry_name != null) {
			cemetery.val(allData.profile.cementry_name);
		};
		if (allData.profile.cementry_sector != null) {
			sector.val(allData.profile.cementry_sector);
		};
		if (allData.profile.cementry_square != null) {
			square.val(allData.profile.cementry_square);
		};
		if (allData.profile.cementry_row != null) {
			row.val(allData.profile.cementry_row);
		};
		if (allData.profile.cementry_place != null) {
			place.val(allData.profile.cementry_place);
		};
		if (allData.profile.grave_lon != null) {
			lon.val(allData.profile.grave_lon);
		};
		if (allData.profile.grave_lat != null) {
			lat.val(allData.profile.grave_lat);
		};
		if (allData.profile.death_cause != null) {
			$('#die-select-val').text(allData.profile.death_cause);
		};


		//Edit data to input from calendar******************
		$('#user-both').change(function () {
			var dataBoth = $('#user-both').val();
			dataBoth = dataBoth.split('-').reverse().join('.');
			$('.user__both').val(dataBoth);
		});
		$('#user-die').change(function () {
			var dataDie = $('#user-die').val();
			dataDie = dataDie.split('-').reverse().join('.');
			$('.user__die').val(dataDie);
		});



		//send first request**************************
		$('#sendEditRequest').click(function (e) {
			e.preventDefault();
			// let foto;
			// let fotoNotFull = $('#fileFotoAvatar');
			// console.log(fotoNotFull[0].files[0]);
			// if (fotoNotFull[0].files[0] != undefined) {
			// 	foto = fotoNotFull[0].files[0];
			// } else {
			// 	foto = ava.attr('src');
			// };
			let edit_data = {};
			if (!die.val()) {
				edit_data = {
					avatar: ava.attr('src'),
					first_name: userSurname.val(),
					last_name: userName.val(),
					patronymic: userPatronymic.val(),
					maiden_name: userGirlName.val(),
					birth_date: both.val(),
					birth_city: cityBoth.val(),
					short_story: info.val(),
					profile_open: status_prof,
					profile_id: currentProfile
				};
			} else {
				edit_data = {
					who_for_profile: whois.val(),
					avatar: ava.attr('src'),
					first_name: userSurname.val(),
					last_name: userName.val(),
					patronymic: userPatronymic.val(),
					maiden_name: userGirlName.val(),
					birth_date: both.val(),
					death_date: die.val(),
					birth_city: cityBoth.val(),
					death_city: cityDie.val(),
					short_story: info.val(),
					cementry_city: cityCemetery.val(),
					cementry_name: cemetery.val(),
					cementry_sector: sector.val(),
					cementry_square: square.val(),
					cementry_row: row.val(),
					cementry_place: place.val(),
					grave_lon: lon.val(),
					grave_lat: lat.val(),
					death_cause: cause.val(),
					profile_open: status_prof,
					profile_id: currentProfile
				};
			}

			//console.log(edit_data);
			fetch(
				`${api_url}update_profile`,
				{
					method: 'POST',
					body: JSON.stringify(edit_data),
					headers: {
						'Authorization': 'Token token=' + cookie_token,
						'Content-Type': 'application/json'
					}
				})
				.then($('body').css('opacity', 0.5))
				.then(response => response.json())
				.then(data => {

					if (data) {
						$('body').css('opacity', 1);
						console.log("success send");
						//console.log('Data:', JSON.stringify(data));
						showErrorSuccess(data.status, 1500);
						window.location.reload();
					} else {
						showErrorSuccess('Ошибка сохранения', 1500);
						window.location.reload();
					}

				})
				.catch(error => {
					console.log('error:', error);
					showErrorSuccess('Ошибка соединения', 1500);
					window.location.reload();
				});
		});

	});







	//show-hide context menu****************************
	$('.brief__edit').click(function () {
		$('.brief__context').addClass('active');
		function hideBlock(e) {
			if ($(e.target).closest('.brief__context').length) {
				return;
			} else {
				$('.brief__context').removeClass('active');
			}
		}
		setTimeout(() => {
			$(document).on('click', function (e) {
				hideBlock(e);
				$(document).off('click', hideBlock(e));
			});

		}, 0);
	});


	//show delete profile popup*****************************
	$('#delete-profile').click(function () {
		$('body').addClass('no-scroll');
		$('.form-del-profile').css('display', 'flex');
		$('.context').removeClass('active');
	});
	//close delete profile popup**************************
	$('#del-cancel').click(function () {
		$('body').removeClass('no-scroll');
		$('.form-del-profile').css('display', 'none');
	});

	//request to delete profile**************************
	$('#del-confirm').click(function () {
		let del_data_prof = {
			id: currentProfile,
			user_id: currentUser
		};
		//console.log(JSON.stringify(del_data));
		fetch(
			`${api_url}destroy_user_profile`,
			{
				method: 'DELETE',
				body: JSON.stringify(del_data_prof),
				headers: {
					'Authorization': 'Token token=' + cookie_token,
					'Content-Type': 'application/json'
				}
			})
			.then($('body').css('opacity', 0.5))
			.then(response => response.json())
			.then(data => {

				if (data) {
					$('body').css('opacity', 1);
					console.log("success send");
					//console.log('Data:', JSON.stringify(data));
					showErrorSuccess(data.status, 1500);
					window.location.href = '../cabinet-page/';
				} else {
					$('body').css('opacity', 1);
					showErrorSuccess('Ошибка сохранения', 1500);
					window.location.reload();
				}

			})
			.catch(error => {
				$('body').css('opacity', 1);
				console.log('error:', error);
				showErrorSuccess('Ошибка соединения', 3000);
				window.location.reload();
			});
	})



	//data for event*********************************
	var id_timeline,
		event_date,
		event_type,
		event_header,
		event_place,
		event_text;
	//show-hide context menu****************************
	function initDelStory() {
		let storyItem = $('.story__edit-cont');
		for (let i = 0; i < storyItem.length; i++) {
			storyItem[i].addEventListener('click', function () {
				let editBnt = $(this);
				id_timeline = editBnt.parent().parent().attr('data-id');
				event_text = editBnt.siblings('.story__context').text();
				event_date = editBnt.parent().siblings('.story__date > span').text();
				event_title = editBnt.parent().siblings('.story__content-title').text();
				event_place = editBnt.parent().siblings('.story__date').children('.story__data-place').text();
				event_type = editBnt.parent().parent().attr('data-type');
				editBnt.siblings('.story__context').addClass('active');
				function hideBlock(e) {
					if ($(e.target).closest('.story__context').length) {
						return;
					} else {
						$('.story__context').removeClass('active');
					}
				}
				setTimeout(() => {
					$(document).on('click', function (e) {
						hideBlock(e);
						$(document).off('click', hideBlock(e));
					});

				}, 0);
			});
		};

	};

	//show delete story popup*****************************
	function initDelBtn() {
		$('.delete-story').on('click', function (e) {
			e.preventDefault();
			$('body').addClass('no-scroll');
			$('.form-del-story').css('display', 'flex');
			$('.context-story').removeClass('active');
		});
	};

	//close delete story popup**************************
	$('#del-cancel-story').click(function () {
		$('body').removeClass('no-scroll');
		$('.form-del-story').css('display', 'none');
	});
	//request to delete story**************************
	$('#del-confirm-stories').click(function () {
		let del_data_event = {
			timeline_id: id_timeline
		};
		fetch(
			`${api_url}destroy_timeline_event`,
			{
				method: 'DELETE',
				body: JSON.stringify(del_data_event),
				headers: {
					'Authorization': 'Token token=' + cookie_token,
					'Content-Type': 'application/json'
				}
			})
			.then($('body').css('opacity', 0.5))
			.then(response => response.json())
			.then(data => {

				if (data) {
					$('body').css('opacity', 1);
					console.log("success send");
					//console.log('Data:', JSON.stringify(data));
					showErrorSuccess('Событие удалено', 1500);
					window.location.href = `#${currentProfile}`;
					window.location.reload();
				} else {
					$('body').css('opacity', 1);
					showErrorSuccess('Ошибка сохранения', 1500);
					window.location.href = `#${currentProfile}`;
					window.location.reload();
				}

			})
			.catch(error => {
				$('body').css('opacity', 1);
				console.log('error:', error);
				showErrorSuccess('Ошибка соединения', 3000);
				window.location.href = `#${currentProfile}`;
				window.location.reload();
			});
	})



	//Edit stoty event*************************************
	function initEditStory() {
		//show edit story popup*****************************
		$('.editOLdStory').on('click', function () {
			$('body').addClass('no-scroll');
			$('.edit-story').css('display', 'flex');
			$('.context-story').removeClass('active');
			// initDelStory();
			// console.log(id_timeline,
			// 	event_date,
			// 	event_type,
			// 	event_header,
			// 	event_place,
			// 	event_text)



		});
		//close delete story popup**************************
		$('#story-edit-cancel').click(function () {
			$('body').removeClass('no-scroll');
			$('.edit-story').css('display', 'none');
		});


		// if (data_event.val() != '' && category_event.val() != '' && place_event.val() != '' && title_event.val() != '' && text_event.val() != '') {
		// 	return true;
		// } else {
		// 	return false;
		// }
		// var data_event_add = $('.story-date');
		// var category_event_add = $('#category');
		// var place_event = $('#memory_place');
		// var title_event = $('#memory_title');
		// var text_event = $('#memory_text-add');

		// $('#story-add').click(function (e) {
		// 	e.preventDefault();
		// 	var timeline_event = {
		// 		event_date: data_event.val(),
		// 		event_header: title_event.val(),
		// 		event_type: category_event.val(),
		// 		event_img: $('.memory_foto').attr('src'),
		// 		event_text: text_event.val(),
		// 		event_place: place_event.val(),
		// 		profile_id: currentProfile
		// 	};
		//console.log(timeline_event);
		// 	if (validate_event()) {
		// 		fetch(
		// 			`${api_url}create_timeline_event`,
		// 			{
		// 				method: 'POST',
		// 				body: JSON.stringify(timeline_event),
		// 				headers: {
		// 					'Authorization': 'Token token=' + cookie_token,
		// 					'Content-Type': 'application/json'
		// 				}
		// 			})
		// 			.then($('body').css('opacity', 0.5))
		// 			.then(response => response.json())
		// 			.then(data => {
		// 				if (data) {
		// 					$('body').css('opacity', 1);
		// 					console.log("success send");
		// 					// console.log('Data:', JSON.stringify(data));
		// 					// $('#error').text("Данные сохранены").removeClass('error').addClass('success').show().delay(1500).fadeOut(300);
		// 					window.location.href = `#${currentProfile}`;
		// 					window.location.reload();
		// 				} else {
		// 					showErrorSuccess('Ошибка,попробуйте еще', 300);
		// 					$('body').css('opacity', 1);
		// 				}

		// 			})
		// 			.catch(error => {
		// 				console.log('error:', error);
		// 				showErrorSuccess('Ошибка соединения', 300);
		// 				$('body').css('opacity', 1);
		// 			});
		// 	} else {
		// 		showErrorSuccess('Заполните все поля', 300);
		// 		$('body').css('opacity', 1);
		// 	}
		// })
	};



	//edit text of questions************************
	function sendQuestions(text) {
		fetch(
			`${api_url}update_highlight`,
			{
				method: 'POST',
				body: JSON.stringify(text),
				headers: {
					'Authorization': 'Token token=' + cookie_token,
					'Content-Type': 'application/json'
				}
			})
			.then($('body').css('opacity', 0.5))
			.then(response => response.json())
			.then(data => {
				if (data) {
					console.log("success send");
					console.log('Data:', JSON.stringify(data));
					showErrorSuccess('Данные сохранены', 1500);
					$('body').css('opacity', 1);
				} else {
					showErrorSuccess('Ошибка,попробуйте еще', 1500);
					$('body').css('opacity', 1);
				}

			})
			.catch(error => {
				console.log('error:', error);
				showErrorSuccess('Ошибка соединения', 1500);
				$('body').css('opacity', 1);
			});
	}

	//family
	$('#question-family').click(function () {
		let text1 = $('#parents').text();
		let text2 = $('#relatives').text();
		let text3 = $('#nationality').text();
		let text4 = $('#cities').text();
		let text5 = $('#values').text();
		let saveText = {
			family_parents: text1,
			family_siblings: text2,
			family_nationalities: text3,
			family_country: text4,
			family_values: text5,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});
	//holiday
	$('#question-holiday').click(function () {
		let text1 = $('#holiday-favorite').text();
		let text2 = $('#newyear').text();
		let text3 = $('#recipes').text();
		let text4 = $('#famity-recipes').text();
		let saveText = {
			holiday_favorite: text1,
			holiday_new_year: text2,
			holiday_recipes: text3,
			holiday_traditions: text4,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});
	//Activity
	$('#question-activity').click(function () {
		let text1 = $('#work').text();
		let text2 = $('#first').text();
		let text3 = $('#carrier').text();
		let text4 = $('#public').text();
		let saveText = {
			activity_field: text1,
			activity_first: text2,
			activity_career: text3,
			activity_social: text4,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});
	//Interest
	$('#question-interest').click(function () {
		let text1 = $('#spots').text();
		let text2 = $('#hobies').text();
		let text3 = $('#books').text();
		let text4 = $('#favorite').text();
		let saveText = {
			passion_sport: text1,
			passion_hobbie: text2,
			passion_book: text3,
			passion_cinema: text4,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});
	//Travel
	$('#question-travel').click(function () {
		let text1 = $('#travel-city').text();
		let text2 = $('#travel-country').text();
		let text3 = $('#travel-school').text();
		let text4 = $('#travel-family').text();
		let saveText = {
			trip_city: text1,
			trip_country: text2,
			trip_student: text3,
			trip_family: text4,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});
	//Friends
	$('#question-friends').click(function () {
		let text1 = $('#best-friend').text();
		let text2 = $('#friends-all').text();
		let text3 = $('#teacher').text();
		let text4 = $('#schooll').text();
		let text5 = $('#college').text();
		let saveText = {
			studies_best_friend: text1,
			studies_school_friend: text2,
			studies_teacher: text3,
			studies_school: text4,
			studies_university: text5,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});
	//heritage
	$('#question-heritage').click(function () {
		let text1 = $('#links').text();
		let text2 = $('#house').text();
		let text3 = $('#teacher').text();
		let text4 = $('#child').text();
		let text5 = $('#achievement').text();
		let saveText = {
			heritage_blog: text1,
			heritage_house: text2,
			studies_teacher: text3,
			heritage_children: text4,
			heritage_progress: text5,
			profile_id: currentProfile
		};
		sendQuestions(saveText);
	});








	//add event to candle and bookmark***************
	function addEvents(user, targetUser) {
		//Show candle fire
		$('#candle').click(function () {
			$('#candle').toggleClass('active');
		});
		//change icon bookmark when click
		$('#bookmark').click(function () {
			const bookmark = {
				user_id: user,
				profile_id: targetUser
			};
			if ($(this).hasClass('active')) {
				$(this).toggleClass('active');
				$(this).attr('src', './img/bookmark.svg');
				fetch(
					`${api_url}delete_profile_from_favorite`,
					{
						method: 'DELETE',
						body: JSON.stringify(bookmark),
						headers: {
							'Authorization': 'Token token=' + cookie_token,
							'Content-Type': 'application/json'
						}
					})
					.then($('body').css('opacity', 0.5))
					.then(response => response.json())
					.then(data => {
						if (data) {
							console.log("success send");
							//console.log('Data:', JSON.stringify(data));
							showErrorSuccess('Анкета удалена из закладок', 1500);
							$('body').css('opacity', 1);
						} else {
							showErrorSuccess('Ошибка,попробуйте еще', 1500);
							$('body').css('opacity', 1);
						}

					})
					.catch(error => {
						console.log('error:', error);
						showErrorSuccess('Ошибка соединения', 1500);
						$('body').css('opacity', 1);
					});

			} else {
				$(this).attr('src', './img/bookmark-black.svg');
				$(this).toggleClass('active');
				fetch(
					`${api_url}add_profile_to_favorite`,
					{
						method: 'POST',
						body: JSON.stringify(bookmark),
						headers: {
							'Authorization': 'Token token=' + cookie_token,
							'Content-Type': 'application/json'
						}
					})
					.then($('body').css('opacity', 0.5))
					.then(response => response.json())
					.then(data => {
						if (data) {
							console.log("success send");
							//console.log('Data:', JSON.stringify(data));
							showErrorSuccess('Анкета добавлена в закладки', 1500);
							$('body').css('opacity', 1);
						} else {
							showErrorSuccess('Ошибка,попробуйте еще', 1500);
							$('body').css('opacity', 1);
						}

					})
					.catch(error => {
						console.log('error:', error);
						showErrorSuccess('Ошибка соединения', 1500);
						$('body').css('opacity', 1);
					});
			};
		});
		//show text more description*******************************
		$('.brief__descr').click(function () {
			$(this).toggleClass('active');
		});
	};

	//load more timeline******************************************
	function initMore() {
		let list = document.querySelectorAll('.more');
		for (let i = 0; i < list.length; i++) {
			list[i].addEventListener('click', function (e) {
				let target = e.target;
				//console.log(target.previousElementSibling);
				target.previousElementSibling.classList.toggle('active');
				target.classList.toggle('active');
				if (target.classList.contains('active')) {
					target.innerHTML = 'Свернуть';
				} else {
					target.innerHTML = 'Подробнее';
				}
			});
		};
	};






	//Exit account***************************************************
	$('#logout').click(function () {
		deleteCookie(cookie_name_token);
		window.location.reload();

	});





	//Registration input ****************************************************
	var registration = $('#sendReg');
	var formReg = $('#reg-form');
	var userName = $('#reg-name');
	var userSoname = $('#reg-soname');
	var userPatronymic = $('#reg-patronymic');
	var userTel = $('#reg-tel');
	var userEmail = $('#reg-email');
	var userPassword = $('#reg-password');


	//Validate input field************************************************
	function validateMail() {
		var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		var regEmail = $('#reg-email').val();
		if (reg.test(regEmail) == false || regEmail == '') {
			showErrorSuccess('Введите корректный e-mail', 1500);

			return false;
		} else {
			return true;
		}
	};
	function validateSurname() {
		//var reg = /^[A-zА-яЁё]+$/;
		var surname = $('#reg-soname').val();
		if (surname == '') {
			showErrorSuccess('Введите фамилию', 1500);
			return false;
		} else {
			return true;
		}
	};
	function validateName() {
		//var reg = /^[A-zА-яЁё]+$/;
		var name = $('#reg-name').val();
		if (name == '') {
			showErrorSuccess('Введите имя', 1500);
			return false;
		} else {
			return true;
		}
	};
	// function validateName() {
	//     var reg = /^[А-Яа-яЁё\s]+$/;
	//     var name = $('#reg-name').val();
	//     if (reg.test(name) == false || name == '') {
	//         $('#error').text("Введите корректное имя").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
	//         return false;
	//     } else {
	//         return true;
	//     }
	// };
	function validatePatronymic() {
		//var reg = /^[A-zА-яЁё]+$/;
		var patronymic = $('#reg-patronymic').val();
		if (patronymic == '') {
			showErrorSuccess('Введите отчество', 1500);
			return false;
		} else {
			return true;
		}
	};
	function validateTel() {
		//var reg = /^\+380\d{3}\d{2}\d{2}\d{2}$/;
		var tel = $('#reg-tel').val();
		if (tel == '') {
			showErrorSuccess('Введите корректный телефон', 1500);
			return false;
		} else {
			return true;
		}
	};
	function validatePass() {
		var pass = $('#reg-password').val();
		if (pass == '' || pass.length < 6) {
			showErrorSuccess('Введите корректный пароль мин 6 символов', 1500);
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



	//Registration user**************************************************
	registration.click(function (e) {
		e.preventDefault();
		var data = {
			first_name: userName.val(),
			last_name: userSoname.val(),
			patronymic: userPatronymic.val(),
			tel_number: userTel.val(),
			email: userEmail.val(),
			password: userPassword.val(),
		};
		if (validateSurname() && validateName() && validatePatronymic() && validateTel() && validateMail() && validatePass()) {
			fetch(
				`${api_url}user_create`,
				{
					method: 'POST',
					body: JSON.stringify(data),
					headers: {
						// 'Authorization': 'Token token=' + cookie_token,
						'Content-Type': 'application/json'
					}
				})
				.then(response => response.json())
				.then(json => {

					if (json.error == 0) {
						console.log("success get token");
						setCookie(cookie_name_token, json.token, 3600);
						cookie_token = getCookie(cookie_name_token);
						clearInput();
						window.location.href = '../cabinet-page';
						//$('.reg__btn-enter').addClass('active').click();
					} else {
						showErrorSuccess('Такой пользователь уже существует', 1500);
						clearInput();
					}

				})
				.catch(error => {
					console.log('error:', error);
					showErrorSuccess('Ошибка соединения', 1500);
					deleteCookie(cookie_name_token);
					window.location.reload();
				});
		}
	});



	//Auth user**************************************************
	$('#authSend').click(function (e) {
		e.preventDefault();
		function validateMail() {
			var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			var email = $('#auth-email').val();
			if (reg.test(email) == false || email == '') {
				showErrorSuccess('Введите корректный e-mail', 1500);
				return false;
			} else {
				return true;
			}
		}
		var authPassword = $('#auth-password').val();
		if (authPassword === '') {
			showErrorSuccess('Введите пароль', 1500);
		}
		if (validateMail() && authPassword != '') {
			var token_web = btoa($('#auth-email').val() + ":" + $('#auth-password').val());
			//console.log(token_web);
			try {

				fetch(
					`${api_url}token`,
					{
						method: 'GET',
						headers: {
							'Authorization': 'Basic ' + token_web,
							'Content-Type': 'application/json'
						}
					})
					.then(response => response.json())
					.then(json => {
						// console.log("token ", json)
						if (typeof json.token !== 'undefined') {
							console.log("success get token");
							setCookie(cookie_name_token, json.token, 3600);
							cookie_token = getCookie(cookie_name_token);
							// $('#error').text("Вы успешно авторизировались").removeClass('error').addClass('success').show().delay(2000).fadeOut(300);
							window.location.reload();
						} else {
							showErrorSuccess('Проверьте логин и пароль', 1500);
							clearInput();
						}

					})
					.catch(error => {
						console.log('error:', error);
						showErrorSuccess('Ошибка подключения', 1500);
						deleteCookie(cookie_name_token);
						window.location.reload();
					});
			}
			catch (err) {
				console.log(err);
				deleteCookie(cookie_name_token);
				window.location.reload();
			}
		}

	});



	//send request to remember********************
	$('#remember').click(function () {
		var email = $('#auth-email').val();
		function validateMail(email) {
			var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
			if (reg.test(email) == false || email == '') {
				showErrorSuccess('Введите корректный e-mail', 1500);
				return false;
			} else {
				return true;
			}
		}
		if (validateMail(email)) {
			fetch(
				`${api_url}send_password?email=${email}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.then(response => response.json())
				.then(json => {
					if (json.error == 0) {
						showErrorSuccess("Пароль отправлен на почту", 2000);
					} else {
						showErrorSuccess("Ошибка отправки", 2000);
						clearInput();
					}
				})
				.catch(error => {
					console.log('error:', error);
					showErrorSuccess("Ошибка соединения", 1500);
				});
		} else {
			showErrorSuccess('Введите сначала e-mail', 1500);
		}
	});







	//send story timeline**************************
	function validate_event() {
		if (data_event.val() != '' && category_event.val() != '') {
			return true;
		} else {
			return false;
		}
	};
	var data_event = $('.story-date');
	var category_event = $('#category');
	var place_event = $('#memory_place');
	var title_event = $('#memory_title');
	var text_event = $('#memory_text-add');

	$('#story-add').click(function (e) {
		e.preventDefault();
		var timeline_event = {
			event_date: data_event.val(),
			event_header: title_event.val(),
			event_type: category_event.val(),
			event_img: $('#output2').attr('src'),
			event_text: text_event.val(),
			event_place: place_event.val(),
			profile_id: currentProfile
		};
		if (timeline_event.event_img == './img/default-foto.png') {
			timeline_event.event_img = './img/default-bg-img.webp';
		};
		//console.log(timeline_event);
		if (validate_event()) {
			fetch(
				`${api_url}create_timeline_event`,
				{
					method: 'POST',
					body: JSON.stringify(timeline_event),
					headers: {
						'Authorization': 'Token token=' + cookie_token,
						'Content-Type': 'application/json'
					}
				})
				.then($('body').css('opacity', 0.5))
				.then(response => response.json())
				.then(data => {
					if (data) {
						$('body').css('opacity', 1);
						console.log("success send");
						// console.log('Data:', JSON.stringify(data));
						// $('#error').text("Данные сохранены").removeClass('error').addClass('success').show().delay(1500).fadeOut(300);
						window.location.href = `#${currentProfile}`;
						window.location.reload();
					} else {
						showErrorSuccess('Ошибка,попробуйте еще', 1500);
						$('body').css('opacity', 1);
					}

				})
				.catch(error => {
					console.log('error:', error);
					showErrorSuccess('Ошибка соединения', 1500);
					$('body').css('opacity', 1);
				});
		} else {
			showErrorSuccess('Заполните все поля', 1500);
			$('body').css('opacity', 1);

		}
	})





	//burger***************************************
	$('.drawer-burg').click(function () {
		burgerShow();
	})
	$('.drawer-close').on('click', function () {
		burgerShow();
		console.log('click');
	})
	function burgerShow() {
		$('body').toggleClass('no-scroll');
	};


	// $('.nav__link').click(function () {
	// 	burgerShow();
	// });
	// $('.burger__bg-body').click(function (e) {
	// 	var container = $('.burger-wrap');
	// 	if (container.has(e.target).length === 0) {
	// 		burgerShow();
	// 	}
	// });

	//hive nav on scroll*******************
	if ($(window).width() < 1024) {
		let burger = $('.drawer-burg');
		var navbar = $('.header');
		var hightlight = $('.profile__menu--mob');
		var backStory = $('.story__back');
		var storyTitle = $('.story__title');
		var storyTitleTab = $('.story__title-tab');
		// Hide Header on on scroll down
		var didScroll;
		var lastScrollTop = 0;
		var delta = 5;
		var navbarHeight = $('header').outerHeight();

		$(window).scroll(function (event) {
			didScroll = true;
		});

		setInterval(function () {
			if (didScroll) {
				hasScrolled();
				didScroll = false;
			}
		}, 150);

		function hasScrolled() {
			var st = $(this).scrollTop();

			// Make sure they scroll more than delta
			if (Math.abs(lastScrollTop - st) <= delta)
				return;

			// If they scrolled down and are past the navbar, add class .nav-up.
			// This is necessary so you never see what is "behind" the navbar.
			if (st > lastScrollTop && st > navbarHeight) {
				// Scroll Down				
				burger.css('z-index', '-1');
				navbar.css('z-index', '-1');
				hightlight.css('top', '0');
				backStory.css('top', '82px');
				storyTitle.css('top', '100px');
				storyTitleTab.css('top', '60px');

			} else {
				// Scroll Up
				if (st + $(window).height() < $(document).height()) {
					burger.css('z-index', '310');
					navbar.css('z-index', '300');
					hightlight.css('top', '50px');
					backStory.css('top', '133px');
					storyTitle.css('top', '136px');
					storyTitleTab.css('top', '115px');
				}
			}

			lastScrollTop = st;
		}
	}





	//tabs forms***********************************************
	$(".reg__main").not(":first").hide();
	$(".reg-tab").click(function () {
		$(".reg-tab").removeClass("active").eq($(this).index()).addClass("active");
		$(".reg__main").hide().eq($(this).index()).fadeIn();
	}).eq(0).addClass("active");

	//close forms popup********************************************
	$('.reg__close').click(function () {
		$('.reg-bg').hide();
		$('body').removeClass('no-scroll');
	})

	//Show forms***************************************************
	$('.enter').click(function () {
		$('.reg-bg').show().css('display', 'flex');
		$('body').addClass('no-scroll');
	})


	//select category***************************
	$('#category').each(function () {
		var $this = $(this), numberOfOptions = $(this).children('option').length;

		$this.addClass('select-hidden');
		$this.wrap('<div class="select select--category"></div>');
		$this.after('<div class="select-styled"></div>');

		var $styledSelect = $this.next('div.select-styled');
		$styledSelect.text($this.children('option').eq(0).text());

		var $list = $('<ul />', {
			'class': 'select-options select-options--category'
		}).insertAfter($styledSelect);

		for (var i = 0; i < numberOfOptions; i++) {
			$('<li />', {
				text: $this.children('option').eq(i).text(),
				rel: $this.children('option').eq(i).val()
			}).appendTo($list);
		}

		var $listItems = $list.children('li');

		$styledSelect.click(function (e) {
			e.stopPropagation();
			$('div.select-styled.select-active').not(this).each(function () {
				$(this).removeClass('select-active').next('ul.select-options').hide().css('height', '0');
			});
			$(this).toggleClass('select-active').next('ul.select-options').toggle().css('height', 'auto');
		});

		$listItems.click(function (e) {
			e.stopPropagation();
			$styledSelect.text($(this).text()).removeClass('select-active');
			$this.val($(this).attr('rel'));
			$list.hide();
			//console.log($this.val());
		});

		$(document).click(function () {
			$styledSelect.removeClass('select-active');
			$list.hide();
		});

	});


	//select category***************************
	$('.die__select').each(function () {
		var $this = $(this), numberOfOptions = $(this).children('option').length;

		$this.addClass('select-hidden');
		$this.wrap('<div class="select"></div>');
		$this.after('<div class="select-styled" id="die-select-val"></div>');

		var $styledSelect = $this.next('div.select-styled');
		$styledSelect.text($this.children('option').eq(0).text());

		var $list = $('<ul />', {
			'class': 'select-options'
		}).insertAfter($styledSelect);

		for (var i = 0; i < numberOfOptions; i++) {
			$('<li />', {
				text: $this.children('option').eq(i).text(),
				rel: $this.children('option').eq(i).val()
			}).appendTo($list);
		}

		var $listItems = $list.children('li');

		$styledSelect.click(function (e) {
			e.stopPropagation();
			$('div.select-styled.select-active').not(this).each(function () {
				$(this).removeClass('select-active').next('ul.select-options').hide().css('height', '0');
			});
			$(this).toggleClass('select-active').next('ul.select-options').toggle().css('height', '186px');
		});

		$listItems.click(function (e) {
			e.stopPropagation();
			$styledSelect.text($(this).text()).removeClass('select-active');
			$this.val($(this).attr('rel'));
			$list.hide();
			//console.log($this.val());
		});

		$(document).click(function () {
			$styledSelect.removeClass('select-active');
			$list.hide();
		});

	});

	//close edit form*******************************
	$('.about__close').click(function () {
		$('#editOldData').hide();
		$('.life').css('opacity', '1');
		$('body').css('background', 'none').css('z-index', '0');
		$('.header').css('opacity', '1');
	})











	//Search show***************************************

	// $('.search__btn-showHide').click(function () {
	// 	$('.search__more-wrap').toggleClass('show-select');
	// 	$('.search__btn-showHide').toggleClass('active-btn');
	// });



	//Set data to input from calendar******************
	// $('#user-both').change(function () {
	// 	var dataBoth = $('#user-both').val();
	// 	dataBoth = dataBoth.split('-').reverse().join('-');
	// 	$('.user__both').val(dataBoth);
	// });
	// $('#user-die').change(function () {
	// 	var dataDie = $('#user-die').val();
	// 	dataDie = dataDie.split('-').reverse().join('-');
	// 	$('.user__die').val(dataDie);
	// });






	//Sудусе settings user***********************************
	// $('#settings').click(function () {
	// 	$('.about__subsettings').toggleClass('show-settings');
	// })

	// $('#settings-mob').click(function () {
	// 	$('.profile__about').toggleClass('settings');
	// })

	$('.about__show-item').click(function (event) {
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
		$(this).next($(this)[0]).addClass('active');
	});


	async function renderQuestions() {
		let text1 = $('#parents');
		let text2 = $('#relatives');
		let text3 = $('#nationality');
		let text4 = $('#cities');
		let text5 = $('#values');
		let text6 = $('#holiday-favorite');
		let text7 = $('#newyear');
		let text8 = $('#recipes');
		let text9 = $('#famity-recipes');
		let text10 = $('#work');
		let text11 = $('#first');
		let text12 = $('#carrier');
		let text13 = $('#public');
		let text14 = $('#spots');
		let text15 = $('#hobies');
		let text16 = $('#books');
		let text17 = $('#favorite');
		let text18 = $('#travel-city');
		let text19 = $('#travel-country');
		let text20 = $('#travel-school');
		let text21 = $('#travel-family');
		let text22 = $('#best-friend');
		let text23 = $('#friends-all');
		let text24 = $('#teacher');
		let text25 = $('#schooll');
		let text26 = $('#college');
		let text27 = $('#links');
		let text28 = $('#house');
		let text29 = $('#child');
		let text30 = $('#achievement');


		fetch(
			`${api_url}get_highlight?profile_id=${currentProfile}`,
			{
				method: 'GET'
			})
			.then(response => response.json())
			.then(data => {
				text1.text(data.highlight.family_highlight.family_parents);
				text2.text(data.highlight.family_highlight.family_siblings);
				text3.text(data.highlight.family_highlight.family_nationalities);
				text4.text(data.highlight.family_highlight.family_country);
				text5.text(data.highlight.family_highlight.family_values);
				text6.text(data.highlight.holiday_highlight.holiday_favorite);
				text7.text(data.highlight.holiday_highlight.holiday_new_year);
				text8.text(data.highlight.holiday_highlight.holiday_recipes);
				text9.text(data.highlight.holiday_highlight.holiday_traditions);
				text10.text(data.highlight.activity_highlight.activity_field);
				text11.text(data.highlight.activity_highlight.activity_first);
				text12.text(data.highlight.activity_highlight.activity_career);
				text13.text(data.highlight.activity_highlight.activity_social);
				text14.text(data.highlight.passion_highlight.passion_sport);
				text15.text(data.highlight.passion_highlight.passion_hobbie);
				text16.text(data.highlight.passion_highlight.passion_book);
				text17.text(data.highlight.passion_highlight.passion_cinema);
				text18.text(data.highlight.trip_highlight.trip_city);
				text19.text(data.highlight.trip_highlight.trip_country);
				text20.text(data.highlight.trip_highlight.trip_student);
				text21.text(data.highlight.trip_highlight.trip_family);
				text22.text(data.highlight.studies_highlight.studies_best_friend);
				text23.text(data.highlight.studies_highlight.studies_school_friend);
				text24.text(data.highlight.studies_highlight.studies_teacher);
				text25.text(data.highlight.studies_highlight.studies_school);
				text26.text(data.highlight.studies_highlight.studies_university);
				text27.text(data.highlight.heritage_highlight.heritage_blog);
				text28.text(data.highlight.heritage_highlight.heritage_house);
				text29.text(data.highlight.heritage_highlight.heritage_children);
				text30.text(data.highlight.heritage_highlight.heritage_progress);

			})
			.catch(error => console.error('error1:', error));

	};


	async function renderEvents() {
		//filter events****************************************
		function filterEvent(events, event1, event2, event3, event4, event5, event6, event7, event8) {
			for (let x = 0; x < events.length; x++) {
				var typeEvent = events[x].event_type;
				switch (typeEvent) {
					case 'Семья':
						event1.push(events[x]);
						break;
					case 'Традиции':
						event2.push(events[x]);
						break;
					case 'Деятельность':
						event3.push(events[x]);
						break;
					case 'Увлечения':
						event4.push(events[x]);
						break;
					case 'Путешествия':
						event5.push(events[x]);
						break;
					case 'Учеба/Друзья':
						event6.push(events[x]);
						break;
					case 'Наследие':
						event7.push(events[x]);
						break;
					case 'Веселые истории':
						event8.push(events[x]);
						break;
				}
			};
		};

		//show questionnarie item menu(tabs)*******************
		var event_1 = [],
			event_2 = [],
			event_3 = [],
			event_4 = [],
			event_5 = [],
			event_6 = [],
			event_7 = [],
			event_8 = [];
		var liveEventFamily = $('#family');
		var liveEventHoliday = $('#holiday');
		var liveEventWorks = $('#works');
		var liveEventInterest = $('#interest');
		var liveEventTravel = $('#travel');
		var liveEventFriends = $('#friends');
		var liveEventHeritage = $('#heritage');
		var liveEventHistory = $('#happy-history');
		filterEvent(arrData, event_1, event_2, event_3, event_4, event_5, event_6, event_7, event_8);
		loaddLiveFull(event_1, liveEventFamily);
		loaddLiveFull(event_2, liveEventHoliday);
		loaddLiveFull(event_3, liveEventWorks);
		loaddLiveFull(event_4, liveEventInterest);
		loaddLiveFull(event_5, liveEventTravel);
		loaddLiveFull(event_6, liveEventFriends);
		loaddLiveFull(event_7, liveEventHeritage);
		loaddLiveFull(event_8, liveEventHistory);
		renderQuestions();
	};


	$('.data__tab').not(':first').hide();
	$('.menu__item').click(function (e) {
		e.preventDefault();
		if ($(window).width() < 935) {
			$('.profile__about').hide();
		}
		$(this).addClass('active-items').siblings().removeClass('active-items');
		$('.data__tab').hide().eq($(this).index()).fadeIn();
		window.location.href = `#${currentProfile}`;
		// fetch(`${api_url}show_timeline?profile_id=${currentProfile}`,
		// 	{
		// 		method: 'GET',
		// 		headers: {
		// 			'Authorization': 'Token token=' + cookie_token,
		// 			'Content-Type': 'application/json'
		// 		}
		// 	})
		// 	.then(response => response.json())
		// 	.then(data => {
		// 		//console.log('Data:', JSON.stringify(data));

		// 	})
		// 	.catch(error => console.error('error1:', error));
		// $('.data__form-text').focus();
		if ($(this).index() == 0) {
			$('.profile__about').show();
		};

	});


	$('.tab__form-title').each(function () {
		$(this).on('click', function () {
			$(this).siblings().toggleClass('active');
			$(this).toggleClass('active');
			if ($(this).next('.tab__form').hasClass('active')) {
				$(this).next('.tab__form').slideUp();
			} else {
				$(this).next('.tab__form').slideDown();

			};
		});
	})




	//show-hide live story*******************************
	function clickToLive(target) {
		target.click(function () {
			$('.brief').fadeOut(0);
			$('.story__back').show();
			$('.story').fadeIn(500);
			setTimeout(() => {
				window.location.href = `#${currentProfile}`;
			}, 1000);
		});
	};
	$('.story__back').click(function () {
		$('.story').fadeOut(0);
		$('.story__back').hide();
		$('body,html').scrollTop(0);
		$('.brief').fadeIn(500);
		window.location.href = `#${currentProfile}`;
		setTimeout(() => {

		}, 1000);
	});

	//story popup close*********************************
	$('#story-cancel').click(function (e) {
		e.preventDefault();
		$('.add-story').hide();
		$('body').toggleClass('no-scroll');
	});

	//story popup open********************************
	$('.default-add').click(function () {
		$('.add-story').show().css('display', 'flex');
		$('body').toggleClass('no-scroll');
	});


	//edit popup edit descr*************************
	$('.brief__descr-edit').click(function (e) {
		$('.edit-story-descr').show().css('display', 'flex');
		$('body').css('overflow', 'hidden');
		let shortStory = $(this).attr('data-shot-story');
		let shortStoryText = $(this).next().text();
		let oldText = $('#memory_text');
		if (shortStoryText != '') {
			oldText.val(shortStoryText);
		} else {
			oldText.val('');
		};
		$('#story-add-description').click(function (e) {
			e.preventDefault();
			let newText = $('#memory_text').val();
			let edit_data;
			switch (shortStory) {
				case ('1'):
					edit_data = {
						profile_id: currentProfile,
						short_life_1: newText
					};
					break;
				case ('2'):
					edit_data = {
						profile_id: currentProfile,
						short_life_2: newText
					};
					break;
				case ('3'):
					edit_data = {
						profile_id: currentProfile,
						short_life_3: newText
					};
					break;
				case ('4'):
					edit_data = {
						profile_id: currentProfile,
						short_life_4: newText
					};
					break;
				case ('5'):
					edit_data = {
						profile_id: currentProfile,
						short_life_5: newText
					};
					break;
			}
			//console.log(edit_data);

			fetch(
				`${api_url}update_profile`,
				{
					method: 'POST',
					body: JSON.stringify(edit_data),
					headers: {
						'Authorization': 'Token token=' + cookie_token,
						'Content-Type': 'application/json'
					}
				})
				.then($('body').css('opacity', 0.5))
				.then(response => response.json())
				.then(data => {

					if (data) {
						$('body').css('opacity', 1);
						console.log("success send");
						//console.log('Data:', JSON.stringify(data));
						showErrorSuccess(data.status, 1500);
						window.location.reload();
					} else {
						showErrorSuccess('Ошибка сохранения', 1500);
						window.location.reload();
					}

				})
				.catch(error => {
					console.log('error:', error);
					showErrorSuccess('Ошибка соединения', 1500);
					window.location.reload();
				});
		});
	});



	//story popup close*********************************
	$('#edit-cancel').click(function (e) {
		e.preventDefault();
		$('.edit-story-descr').hide();
		$('body').css('overflow', 'visible');
	});




	//upload foto to fotoalbum****************************
	// function hideAddfoto() {
	// 	var foto = $('.add-story__foto');
	// 	// console.log(foto.length);
	// 	if (foto.length >= 1) {
	// 		$('.def-btn').hide();
	// 	} else {
	// 		$('.def-btn').show();
	// 	};
	// };


	//New upload foto*************************************
	// $('#edit-foto').change(function (e) {
	// 	//var input = e.target;
	// 	//var elem = $('<span class="add-story__foto"><img src="" alt="foto" class="memory_foto"><span class="add-story__foto-delete"><img src="./img/trash-with-white.png"></span></div>');
	// 	// var reader = new FileReader();
	// 	// reader.onload = function () {
	// 	// 	var dataURL = reader.result;
	// 	// 	var output = $('#output2');
	// 	// 	output.attr('src', dataURL);
	// 	// };
	// 	//$(elem).insertBefore($('.def-btn'));
	// 	//reader.readAsDataURL(input.files[0]);
	// 	$('.add-story__del').show();
	// 	//input.files[0] = '';
	// 	delFoto();
	// });


	//delete foto in form************************
	// function delFoto() {
	// $('.add-story__del').on('click', function () {
	// 	let targetFoto = $('#output2');
	// 	targetFoto.attr('src', './img/default-foto.png');
	// 	$(this).hide();
	// });
	// }

	//end new upload foto************************************************

	$('.add-story__del').on('click', function () {
		let targetFoto = $('#output2');
		targetFoto.attr('src', './img/default-foto.png');
		$(this).hide();
	});





	//Read more*************************************
	$('#user-about').click(function () {
		$('#user-about-short').toggleClass('more-text');
		if ($('#user-about-short').hasClass('more-text')) {
			$('#user-about').text('Свернуть');
		} else {
			$('#user-about').text('Читать дальше...');
		}
	});


	//Set data to input from calendar******************

	$("#datepicker").datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: "c-200:c",
		dateFormat: "dd.mm.yy",
		showButtonPanel: true,
		monthNamesShort: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
		dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
	});

	// $('#datepicker').change(function () {
	// 	var dataBoth = $('#datepicker').val();
	// 	dataBoth = dataBoth.split('-').reverse().join('.');
	// 	$('.story-date').val(dataBoth);
	// });


	setTimeout(() => {

		let languages = [
			"Русский",
			"Українська",
			"English"

		];

		let selectLang = document.getElementById("select-language1");
		let selectLang2 = document.getElementById("select-language2");
		if (selectLang) {
			autocomplete(selectLang, languages);
		};
		if (selectLang2) {
			autocomplete(selectLang2, languages);
		};

		function autocomplete(inp, arr) {

			let currentFocus;


			inp.addEventListener("click", showAutocompleteList);

			function addActive(x) {
				if (!x) return false;
				removeActive(x);
				if (currentFocus >= x.length) currentFocus = 0;
				if (currentFocus < 0) currentFocus = (x.length - 1);
				x[currentFocus].classList.add("autocomplete-active");
			}
			function removeActive(x) {
				for (var i = 0; i < x.length; i++) {
					x[i].classList.remove("autocomplete-active");
				}
			}


			function showAutocompleteList(e) {

				inp.selectionStart = inp.value.length;
				let a, b, i, k, val = this.value;
				if (document.getElementById(this.id + "autocomplete-list")) {
					closeAllLists();
					//  if (!val) { return false; }
				} else {
					currentFocus = -1;
					a = document.createElement("DIV");
					a.setAttribute("id", this.id + "autocomplete-list");
					a.setAttribute("class", "autocomplete-items");
					this.parentNode.appendChild(a);
					for (i = 0; i < arr.length; i++) {
						b = document.createElement("DIV");
						b.innerHTML = '<string class="autocomplete-value">' + arr[i] + "</string>";
						b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
						b.addEventListener("click", function (e) {
							inp.value = this.getElementsByTagName("input")[0].value;
							closeAllLists();
						});
						a.appendChild(b);
					}
				}
			}
			document.addEventListener("click", function (e) {
				if (e.target != inp) {
					closeAllLists(e.target);
				}
			}, true);
			function closeAllLists(elmnt) {
				var x = document.getElementsByClassName("autocomplete-items");
				for (var i = 0; i < x.length; i++) {
					if (elmnt != x[i] && elmnt != inp) {
						x[i].parentNode.removeChild(x[i]);
					}
				}
			}
		}
	}, 0);

});


//Edit avatar*************************************
//upload avatar*************************************


async function loadWidget() {

	//show message notifications*********************************
	// function showErrorSuccess2(textToShow, time) {
	// 	$('#error-message').addClass('show');
	// 	$('.success').text(textToShow);
	// 	setTimeout(() => {
	// 		$('#error-message').removeClass('show');
	// 	}, time);
	// };

	class UploadWidget {
		width;
		height;
		text;
		widgetId;
		key;
		_location;
		iframe;

		constructor(location, widgetId, bucketId) {
			this.location = location;
			this.width = location.dataset.width || '100%';
			this.height = location.dataset.height || '100%';
			this.text = location.dataset.text;
			this.widgetId = widgetId;
			this.key = bucketId;
			this.createWidget()
		}

		set location(value) {
			if (!value) {
				alert("No file input")
				return;
			}
			this._location = value;
		}

		get location() {
			return this._location
		}

		createWidget() {
			let small = "false"
			let iframe = window.document.createElement('iframe');

			if (parseInt(this.width) < 120) {
				small = "true"
			}
			iframe.src = "https://app.simplefileupload.com" + `/buckets/${this.key}?widgetId=${this.widgetId}&elementValue=${this.location.value}&preview=${this.location.dataset.preview}&text=${this.text}&small=${small}`
			iframe.className = 'widgetFrame'
			iframe.width = this.width;
			iframe.height = this.height;
			iframe.style.cssText = 'border:none; opacity:0;'

			this.iframe = iframe;

			//Attach iframe to DOM after the existing file input
			if (!this.location.form) {
				alert("The input you created is not in a form. In order to send the string url to your server the input needs to be in a form. Please reach out at support@simplefileupload.com for assistance.")
				return
			}
			insertAfter(iframe, this.location);

		}

		open() {
			this.iframe.style = 'border:none; opacity:1;'
		}
	}

	function insertAfter(el, referenceNode) {
		return referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
	}

	function uniqueWidget(location) {
		const widgetId = location.dataset.id
		new UploadWidget(location, widgetId, "824d5800b5e42b3c0a21a4441095b081").open();
	}

	const getUrlData = (e) => {
		if (e.origin !== "https://app.simplefileupload.com")
			return;
		if (e.data["uploadResult"] == 'queuecomplete') {
			const data = e.data;
			let hiddenInput = document.querySelector(`input.simple-file-upload[data-id="${data.widgetId}"]`)
			//Backwards compatibility - no simple-file-upload class.
			if (hiddenInput == null) {
				hiddenInput = document.querySelector(`input[data-id="${data.widgetId}"]`)
			}
			const event = new CustomEvent('multipleUploadComplete', { detail: e.data.widgetId })
			hiddenInput.dispatchEvent(event)
		}
		if (e.data["uploadResult"] == 'success') {
			const data = e.data;
			let output = $('#output');
			let output2 = $('#output2');
			let hiddenInput = document.querySelector(`input.simple-file-upload[data-id="${data.widgetId}"]`)
			//Backwards compatibility - no simple-file-upload class.
			if (hiddenInput == null) {
				hiddenInput = document.querySelector(`input[data-id="${data.widgetId}"]`)
			}
			if (data["url"] != '') {
				output.attr('src', data["url"]);
			}
			hiddenInput.value = data["url"];
			let editFotoUrl = $('#edit-foto').val();
			//console.log(editFotoUrl);
			if (editFotoUrl) {
				output2.attr('src', editFotoUrl);
				$('.add-story__del').show();
			}
			const event = new Event('fileUploadSuccess')
			hiddenInput.dispatchEvent(event)
		}
	}

	window.addEventListener('message', getUrlData, false);

	function setId(location, index) {
		location.type = "hidden"; //Make hidden for legacy implementation
		location.dataset.id = `widget${index}`
		location.dataset.preview ||= "true"
	}

	document.addEventListener('DOMContentLoaded', function () {
		let locations = document.querySelectorAll("input.simple-file-upload");
		if (locations.length == 0) {
			locations = document.querySelectorAll("input[type=file]");
		}
		locations.forEach(setId);
		locations.forEach(uniqueWidget);
	});

	document.addEventListener('turbolinks:render', function () {
		let locations = document.querySelectorAll("input.simple-file-upload");
		if (locations.length == 0) {
			locations = document.querySelectorAll("input[type=file]");
		}
		locations.forEach(setId);
		locations.forEach(uniqueWidget);
	});

};




loadWidget();





