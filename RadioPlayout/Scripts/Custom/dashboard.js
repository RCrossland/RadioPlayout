let s;

let weather = {
    settings: {
        weatherContentListRef: null
    },
    init: function () {
        s = weather.settings;

        weather.bindUIElements();
        weather.getWeatherDate();
    },
    bindUIElements: function () {
        s.weatherContentListRef = $("#weatherContentList");
    },
    getWeatherDate: function () {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/forecast?q=Leeds,UK&units=metric",
            data: {
                APPID: "be41abf68ec34c87c051878531c0bfc3"
            },
            success: function (data) {
                let dateCaptured = [];
                let tempCaptured = [];
                let weatherCaptured = [];

                $.each(data.list, function (index, element) {
                    let date = element.dt_txt.split(" ")[0];

                    if ($.inArray(date, dateCaptured) == -1) {
                        // Add the current date to the array
                        dateCaptured.push(date);
                        weatherCaptured.push(element.weather[0].main);
                        tempCaptured.push(element.main.temp_max);
                    } else {
                        // The current date has already been captured
                        return true;
                    }
                });


                $.each(weatherCaptured, function (index, element) {
                    let weatherSymbol;

                    if (weatherCaptured[index] == "Sun") {
                        weatherSymbol = "fa-sun";
                    }
                    else if (weatherCaptured[index] == "Clouds") {
                        weatherSymbol = "fa-cloud";
                    }
                    else if (weatherCaptured[index] == "Rain") {
                        weatherSymbol = "fa-cloud-rain";
                    }
                    else if (weatherCaptured[index] == "Snow") {
                        weatherSymbol = "fa-snowflake";
                    }
                    else if (weatherCaptured[index] == "Clear") {
                        weatherSymbol = "fa-sun";
                    }
                    else {
                        weatherSymbol = "";
                        console.log("Symbol not found for - " + weatherCaptured[index]);
                    }

                    let weatherHTML = '<li class="list-group-item pt-2 pb-2">' +
                        '<div class="row">' +
                        '<div class="col-4 pl-1 pr-1">' + dateCaptured[index] + '</div>' +
                        '<div class="col-5 col-sm-0 pl-1 pr-1">High: ' + tempCaptured[index] + '	&deg;</div>' +
                        '<div class="col-2 pl-1 pr-1"><i class="fas ' + weatherSymbol + '"></i></div>' +
                        '</div>' +
                        '</li>';

                    s.weatherContentListRef.append(weatherHTML);
                });
            }
        });
    }
};

$(document).ready(function () {
    weather.init();
});