let date;
let btn_year_month_day = ''; //텍스트 박스와 캘린더 연동 위한 달력 버튼 ID 값 저장
let nick_name;
let team_name;
let selected_calendar_id;
let rCheck;
$(document).ready(function () {
    getInfo()
    renderCalendar();
    getMemo()
});
//캘린더 렌더링 함수
const renderCalendar = () => {
    const viewYear = date.getFullYear();
    const viewMonth = date.getMonth();
    let getMonth = ''
    // year-month 채우기
    document.querySelector('.year-month').textContent = `${viewYear}년 ${viewMonth + 1}월`;
    // 지난 달 마지막 Date, 이번 달 마지막 Date
    const prevLast = new Date(viewYear, viewMonth, 0);
    const thisLast = new Date(viewYear, viewMonth + 1, 0);
    const PLDate = prevLast.getDate();
    const PLDay = prevLast.getDay();
    const TLDate = thisLast.getDate();
    const TLDay = thisLast.getDay();
    // Dates 기본 배열들
    const prevDates = [];
    const thisDates = [...Array(TLDate + 1).keys()].slice(1);
    const nextDates = [];
    // prevDates 계산
    if (PLDay !== 6) {
        for (let i = 0; i < PLDay + 1; i++) {
            prevDates.unshift(PLDate - i);
        }
    }
    // nextDates 계산
    for (let i = 1; i < 7 - TLDay; i++) {
        nextDates.push(i)
    }
    // Dates 합치기
    const dates = prevDates.concat(thisDates, nextDates);
    // Dates 정리
    const firstDateIndex = dates.indexOf(1);
    const lastDateIndex = dates.lastIndexOf(TLDate);
    dates.forEach((date, i) => {
        const condition = i >= firstDateIndex && i < lastDateIndex + 1
            ? 'this'
            : 'other';
        if (condition == 'this') {   //viewMonth 는 condition이 변해도 그대로이기 때문에 other 변경.
            getMonth = viewMonth + 1;
        } else if (condition == 'other' && date <= 10) {
            getMonth = viewMonth + 2;
        } else {
            getMonth = viewMonth;
        }
        dates[i] = `<div class="date">
                        <button id="${viewYear}Y${getMonth}M${date}" onclick="clickedDayGetMemo(this)" class="${condition}">${date} <span id="${viewYear}Y${getMonth}M${date}text" class="date-on-text"></span></button>
                    </div>`;
    })
    // Dates 그리기
    document.querySelector('.dates').innerHTML = dates.join('');
}
const prevMonth = () => {
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    sessionStorage.setItem("date", date);
    renderCalendar();
    getMemo();
}
const nextMonth = () => {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    sessionStorage.setItem("date", date);
    renderCalendar();
    getMemo();
}
const goToday = () => {
    date = new Date();
    renderCalendar();
}
function checkingOnce(id) {
    rCheck = sessionStorage.getItem("rCheck");
    nick_name = sessionStorage.getItem("username");
    if (rCheck == null){
        selected_calendar_id = id;
        sessionStorage.setItem("selected_calendar_id", selected_calendar_id);
        rCheck = sessionStorage.setItem("rCheck", true);
        date = new Date();
        sessionStorage.setItem("date", date)
    }else if (rCheck) {
        selected_calendar_id = sessionStorage.getItem("selected_calendar_id");
        date = new Date(sessionStorage.getItem("date"));
    }
}
//캘린더 페이지 접속 시 가져오는 정보
function getInfo() {
    $.ajax({
        type: "GET",
        url: "https://api.bbichul.shop/api/calendars",
        contentType: "application/json",
        async: false, //전역변수에 값을 저장하기 위해 동기 방식으로 전환,
        data: {},
        success: function (response) {
            checkingOnce(response[0].id)
            let team_calendar_count = 0;
            let user_calendar_count = 0;
            let calendar_id;
            for (let i = 0; i < response.length; i++) {
                if (response[i].team != null) {
                    team_calendar_count++;
                    team_name = response[i].team.teamname;
                    calendar_id = response[i].id;
                    let temp_html = `<li>
                        <button onclick="setCalender(this)" class="dropdown-item" id="${calendar_id}" value="T${team_calendar_count}">${team_name}의 캘린더 ${team_calendar_count}</button>
                    </li>`
                    $('#team-selected').append(temp_html);
                }else if(response[i].isPrivate){
                    user_calendar_count++;
                    calendar_id = response[i].id;
                    let temp_html = `<li>
                        <button onclick="setCalender(this)" class="dropdown-item" id="${calendar_id}" value="P${user_calendar_count}">${nick_name}의 캘린더 ${user_calendar_count}</button>
                    </li>`
                    $('#private-selected').append(temp_html);
                }
            }
            let calender_info = $("#"+selected_calendar_id).val();
            if (calender_info.substr(0,1) =="T") {
                $("#dropdownMenuLink").text(team_name + " 의 캘린더 " + calender_info.substr(1,2));
            } else if(calender_info.substr(0,1) =="P"){
                $("#dropdownMenuLink").text(nick_name + " 의 캘린더 " + calender_info.substr(1,2));
            }
        }
    })
}
//텍스트 업데이트 함수
function updateText() {
    let varMemoText = $('#calenderNote').val();
    let doc = {
        "calendarId" : selected_calendar_id,
        "contents" : varMemoText,
        "dateData" : btn_year_month_day
    }
    $.ajax({
        type: "PUT",
        // headers: {
        //     Authorization: getCookie('access_token')
        // },
        url: "https://api.bbichul.shop/api/calendars/calendar/memo",
        contentType: "application/json",
        data: JSON.stringify(doc),
        success: function (response) {
        }
    })
    location.reload();
    //현재 새로고침 안하면 메모 입력 시 반영 안 되는 버그로 넣어놨습니다
}
function clickedDayGetMemo(obj) {
    let btn_year_month_day = $(obj).attr('id'); // 달력 날짜를 클릭 했을 때 받아온 날짜 ID 를 변수에 초기화.
    let set_memo_date = btn_year_month_day.replace("Y", "년 ").replace("M", "월 ") + "일";
    $('.select-date').text(set_memo_date);
    $.ajax({
        type: "GET",
        // headers: {
        //     Authorization: getCookie('access_token')
        // },
        url: `https://api.bbichul.shop/api/calendars/calendar/memo?id=${selected_calendar_id}&date=${btn_year_month_day}`,
        // data: {date_give: btn_year_month_day, select_cal_give: selected_cal_now},
        success: function (response) {
            console.log(response);
            let receive_memo = response.contents;
            $('#calenderNote').text(receive_memo);
        }
    })
}
//달력 추가하기
function addCalender() {
    let add_btn_checked = $('input[name="add-calender-group"]:checked').val();
    let is_private;
    if (add_btn_checked == 1) {
        is_private = 0;
    } else if (add_btn_checked == 2) {
        is_private = 1;
    }
    let doc = {
        "isPrivate" : is_private
    }
    $.ajax({
        type: "POST",
        // headers: {
        //     Authorization: getCookie('access_token')
        // },
        url: "https://api.bbichul.shop/api/calendars/calendar",
        contentType: "application/json",
        data: JSON.stringify(doc),
        success: function (response) {
            alert(response)
            window.location.reload();
        }
    })
}
//선택한 캘린더로 세팅합니다.
function setCalender(obj) {
    let selected_check = $(obj).attr("id");
    if (select_calender_id == selected_check) {
        alert("현재 선택 된 캘린더입니다.")
    } else {
        select_calender_id = selected_check;
        sessionStorage.setItem("selected_calender_id", select_calender_id)
        let calender_info = $(obj).attr('value');
        let private_or_team = calender_info.substr(0, 1);
        let calender_num = calender_info.substr(1, 1);
        if (private_or_team == 'T') {
            $('#dropdownMenuLink').text(team_name + " 캘린더 " + calender_num);
            alert(team_name + " 캘린더"+ calender_num+ "로 변경 되었습니다.");
        } else if (private_or_team == 'P') {
            $('#dropdownMenuLink').text(nick_name + " 캘린더 " + calender_num);
            alert(nick_name + " 캘린더"+ calender_num+ "로 변경 되었습니다.");
        }
        date = new Date();
        sessionStorage.setItem("date", date)
        renderCalendar();
        getMemo();
    }
}
//시작 시 입력 된 메모 가져와 달력 본체에 입력하는 함수
function getMemo() {
    $.ajax({
        type: "GET",
        // headers: {
        //     Authorization: getCookie('access_token')
        // },
        url: `https://api.bbichul.shop/api/calendars/calendar?id=${selected_calendar_id}`,
        // data: {calendarType: selected_cal_now},
        success: function (response) {
            console.log(response)
            for (let i = 0; i < response.length; i++) {
                let text_id = response[i].dateData + "text";
                let load_text = response[i].contents.substr(0, 5);
                if(load_text.length > 4){
                    $('#' + text_id).text(load_text + "・・・");
                }else{
                    $('#' + text_id).text(load_text);
                }
                if (load_text == "") {
                    $('#' + text_id).text('');
                }
            }
        }
    })
}
// 캘린더 노트 실시간 반영
let oldVal ='';
$("#calenderNote").on("propertychange change keyup paste input", function () {
    let currentVal = $(this).val();
    if (currentVal == oldVal) {
        return;
    }
    console.log(btn_year_month_day)
    oldVal = currentVal;
    if( oldVal.length > 4){
        $('#' + btn_year_month_day + "text").text(oldVal.substr(0, 5) + '・・・');
    }else{
        $('#' + btn_year_month_day + "text").text(oldVal.substr(0, 5));
    }
    if (currentVal == '') {
        $('#' + btn_year_month_day + "text").text('');
    }
});
//유저이름 가져오기
$("#username").html(sessionStorage.getItem("username"));