$(document).ready(function () {

    var cookies = (function(){
        var createCookie = function(name, value, days) {
            var expires;

            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            } else {
                expires = "";
            }
            document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
        };
        var readCookie = function (name) {
            var nameEQ = encodeURIComponent(name) + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
            return null;
        };
        var eraseCookie =function (name){
            createCookie(name, "", -1);
        },
            $ = {

            };

        return {
            createCookie: createCookie,
            readCookie: readCookie,
            eraseCookie: eraseCookie,
        };
    })();
    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    }
    /********************************************* JSON handling and listeners */

    $.getJSON("data.json", function (allQuestions) {
        /***************************************************** Initializing "global" variables */

        var e = (function(){
            var init = {
                    varContainer: {

                    },
                variables: function(){

                },
                res: function(){}
                },
                update = {
                    cookies: function(){
                        while (!cookies.readCookie("name")) {
                            cookies.createCookie("name", prompt("Jak masz na imię?"), 30);
                            if (!cookies.readCookie("name")) {
                                alert("Wpisz swoje imię!");
                            }
                        }
                        $('.jumbotron').find('h1').text("Witaj w moim quizie, " + cookies.readCookie("name") + ".");
                    },
                    data: function(number) {
                        var i = allQuestions[number]["choices"].length, // Retrieve number of options
                            j = 0;
                        if ($('#createOption').children().length == "0") { // Create nodes
                            e.create.questions(number, i, j, "");
                        }
                        if($('#createOptionPrev').children().length == "0"){
                            e.create.questions(number, i, j, "-");
                        }
                        e.update.questions(number, i, j, "");
                        e.update.questions(number, i, j, "-");
                        // Updating score status
                        $("#correctQuestions").find("span").text(correctAnswers);
                        $("#overallQuestions").find("span").text(overallAnswers);
                        if (overallAnswers != "0" && correctAnswers != "0") {
                            $("#percentage").find("span").text(((correctAnswers / overallAnswers) * 100).toFixed(2)); // works?
                        }
                    },
                    questions: function(qNumber, i, j, char) {
                        var question = "question";
                        if (char == "-") {
                            qNumber--;
                            question = "questionPrev";
                        }
                        if (qNumber >= 0 && qNumber < allQuestions.length) {
                            $('#' + question).text((allQuestions)[qNumber]["question"]);
                            while (j < i) {  // Fill them in
                                $('#' + char + j).text((allQuestions)[qNumber]["choices"][j]);
                                j++;
                            }
                        }
                    },
                    classes: function(add) {
                        $('.highlight').removeClass('highlight');
                        $('.incorrect').removeClass('incorrect');
                        $('.correct').removeClass('correct');
                        switch (add) {
                            case "highlight":
                                $('.highlight').addClass('highlight');
                                break;
                            case "incorrect":
                                $('.highlight').addClass('incorrect');
                                break;
                            case "correct":
                                $('.highlight').addClass('correct');
                                break;
                        }

                    },
                    history: function(){
                        if($('.history').length < historyCount) {
                            $('#score').empty();
                            var i = 0;
                            while( i < historyCount) {
                                $('#score').append("<div class='history'>" +
                                    localStorage.getItem('name' + i) + " " +
                                    localStorage.getItem('date' + i) + " " +
                                    localStorage.getItem("score" + i) + "</div>");
                                i++;
                            }
                        }
                        if($('.history').length == 0){
                            $('#score').empty();
                        }
                    },
                    choices: function(){
                        if (tab[currentQuestion] == allQuestions[currentQuestion]['correctAnswer']) {
                            $('#createOption').find('#' + tab[currentQuestion]).addClass('correct');
                        } else {
                            $('#createOption').find('#' + tab[currentQuestion]).addClass('incorrect');
                        }
                        if (currentQuestion > 0) {
                            if (tab[currentQuestion - 1] == allQuestions[currentQuestion - 1]['correctAnswer']) {
                                $('#createOptionPrev').find('#-' + tab[currentQuestion - 1]).addClass('correct');
                            } else {
                                $('#createOptionPrev').find('#-' + tab[currentQuestion - 1]).addClass('incorrect');
                            }
                        }
                    },
                    historyCount: function(){
                        var i = 0;
                        while (localStorage.getItem("name" + i)){
                            i++;
                        }
                        return i;
                    },
                },
                create = {
                    history: function(){
                        if (storageAvailable('localStorage')) {
                            var temp = new Date(),
                                date = temp.getDate() + "/" + (temp.getMonth() + 1) + "/" + temp.getFullYear();
                            localStorage.setItem(("score" + historyCount), (((correctAnswers / overallAnswers) * 100).toFixed(2) + "%"));
                            localStorage.setItem(("date" + historyCount), date);
                            localStorage.setItem(("name" + historyCount), cookies.readCookie("name"));
                            historyCount++;
                        }
                        else {
                            alert("Nie obsługujesz funkcji localStorage, nie będzie historii!");
                        }

                    },
                    questions: function(qNumber, i, j, char) {
                        var createOption = "createOption";
                        if (char == "-") {
                            createOption = "createOptionPrev";
                        }
                        $("#" + createOption).empty();
                        while (j < i) {
                            $('#' + createOption).append("<div id='" + char + j + "'" + "class='option'></div>");
                            j++;
                        }
                    }
                },
                reset = {};

            return {
                init: init,
                update: update,
                create: create
            };
        })();
        var currentQuestion = 0,
            correctAnswers = 0,
            overallAnswers = 0,
            percentage = ((correctAnswers / overallAnswers) * 100).toFixed(2), // Not used :<
            name,
            tab = new Array(allQuestions.length),
            wasPrev = 0,
            wasHistory = 0,
            historyCount = e.update.historyCount();


        /****************************************** Init */
        e.update.cookies();
        e.update.data(currentQuestion);

        /******************************************* Listeners */
        $('#current').on("click", '.option', function () { //Highlighting an option
            if ($('#createOption').find('.correct').length == "0" && $('#createOption').find('.incorrect').length == "0") {
                $('.highlight').removeClass('highlight');
                $(this).addClass('highlight');
                //updateClasses('highlight');
                e.update.data(currentQuestion);
            }
        });
        $('#btnCheck').on("click", function () { // Checking answer
            if ($('#createOption').find('.correct').length == "0" &&
                $('#createOption').find('.incorrect').length == "0" &&
                $('.highlight').length == "1" ) { //|| wasPrev == "1"
                overallAnswers++;
                tab[currentQuestion] = $('.highlight')[0].id;
                $('.hint').css("visibility", 'hidden');
                if ($('.highlight').attr('id') == allQuestions[currentQuestion]["correctAnswer"]) {
                    $('.highlight').addClass('correct');
                    correctAnswers++;
                } else {
                    $('.highlight').addClass('incorrect');
                }
                e.update.data(currentQuestion);
            }
        });
        $('#btnNext').on("click", function () {
            wasPrev = 0;
            if (currentQuestion <=  2) {  //allQuestions.length) {
                if (currentQuestion == 2 && ($('#createOption').find('.correct').length == "1" || $('#createOption').find('.incorrect').length == "1")) {//allQuestions.length - 1 ) {
                    $('.jumbotron').fadeIn("slow", function () {
                        $('.jumbotron').find('h1').text("Koniec quizu, " + cookies.readCookie("name") + "!");
                        //$('.jumbotron').css("background-color", 'darkred');
                    });
                    if (currentQuestion == 2 && wasHistory == 0) {
                        e.create.history();
                        e.update.data(currentQuestion);
                        e.update.history();
                        wasHistory = 1;
                    }
                } else if ($('#createOption').find('.correct').length == "1" || $('#createOption').find('.incorrect').length == "1") {
                    currentQuestion++;
                    $('#current, #previous').fadeToggle("slow", function () {
                        e.update.classes();
                        e.update.data(currentQuestion);
                        e.update.choices(); //Błąd jesli klika sie wystarczajaco szybko??
                    });
                    $('#current, #previous').fadeToggle("slow", "linear");
                } else {
                    $('.hint').css("visibility", 'visible');
                    $('#btnNext').animate({
                        width: '+=20px'
                    }, 100);
                    $('#btnNext').animate({
                        width: '-=20px'
                    }, 100);
                }
            }
        });
        $('#btnPrev').on("click", function () {
            if (!wasPrev && !wasHistory) {
                if (currentQuestion > 0) {
                    //$('#current, #previous').fadeToggle("slow", function () {     // Causing weird problems?
                        currentQuestion--;
                        e.update.classes();
                        e.update.data(currentQuestion);
                    //});
                    //$('#current, #previous').fadeToggle("slow", "linear");

                } else {
                    alert("Nie ma czego wcześniej szukać!");
                }
                e.update.choices();

                if (currentQuestion == "0"){
                    $('#createOptionPrev').empty();
                    $('#questionPrev').text("Poprzednie pytanie");
                }
                wasPrev = 1;
            } else {
                alert("Nie możesz wracać się więcej niż jeden raz!");
            }
        });
        $('.btn-group-justified').on("click", "button" ,function() {
                if (this.id == "scoreInfo"){
                    if($('#correctQuestions').length == "0") {
                        $('#score').empty();
                        $('#score').append("<div id='correctQuestions'>Odpowiedziano poprawnie na: <span> 0 </span> pytań.</div>");
                        $('#score').append("<div id='overallQuestions'>Odpowiedziano ogółem na: <span> 0 </span> pytań.</div>");
                        $('#score').append("<div id='percentage'>Co daje ci skuteczność na poziomie <span> 0 </span> %.</div>");
                        e.update.data(currentQuestion);
                    }
                } else if (this.id == "scoreHistory"){
                    e.update.history();
                }
        });
        $('#changeName').on("click", function(){
            if(confirm("Chcesz zmienić imię?")) {
                cookies.eraseCookie("name");
                e.update.cookies();
            }
            currentQuestion = 0;
            correctAnswers = 0;
            overallAnswers = 0;
            wasHistory = 0;
            e.update.classes();
            tab = new Array(allQuestions.length);
            if (currentQuestion == "0"){
                $('#createOptionPrev').empty();
                $('#questionPrev').text("Poprzednie pytanie");
            }
            e.update.data(currentQuestion);
        });
        $('#clearHistory').on("click", function(){
           i = 0;
            while (localStorage.getItem("name" + i)){
                localStorage.removeItem("name" + i);
                localStorage.removeItem("date" + i);
                localStorage.removeItem("score" + i);
                i++;
            }
            historyCount = 0;
            $('#score').empty();
        });
    });
});