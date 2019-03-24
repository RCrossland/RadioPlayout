﻿let leftNavigation = {
    settings: {

    },
    init: function () {
        leftNavigation.bindUIElements();
    },
    bindUIElements: function () {
        leftNavigation.toggleNavActive();

        $(".navigation_toggler").click(function () {
            if ($(this).hasClass("fa-bars")) {
                $(this).removeClass("fa-bars").addClass("fa-times");
                $(".navigation_outer").css("display", "block");
            }
            else {
                $(this).removeClass("fa-times").addClass("fa-bars");
                $(".navigation_outer").css("display", "none");
            }
        });

        $(".left_navigation_dropdown_toggle").click(function (e) {
            leftNavigation.dropdownToggle($(this));
        });
    },
    toggleNavActive: function () {
        let activeNav = $(".left_navigation_list").data("current");

        if (activeNav == "Dashboard") {
            $("#nav-dashboard").addClass("left_navigation_list_item_active");
        }
        else if (activeNav == "Schedule") {
            $("#nav-schedule").addClass("left_navigation_list_item_active");
        }
        else if (activeNav == "Music Catalogue") {
            $("#nav-catalogue").addClass("left_navigation_list_item_active");
        }
        else if (activeNav == "Radio Playout") {
            $("#nav-playout").addClass("left_navigation_list_item_active");
        }
        else if (activeNav == "My Account") {
            $("#nav-account").addClass("left_navigation_list_item_active");
        }
    },
    resetDropdownToggle: function () {
        // Set the background-color back to white
        $(".left_navigation_dropdown_toggle").css("background-color", "#FFFFFF");
        $(".left_navigation_dropdown").addClass("d-none");
    },
    dropdownToggle: function (reference) {
        leftNavigation.resetDropdownToggle();

        // Show the dropdown menu
        if ($(reference).next(".left_navigation_dropdown").hasClass("d-none")) {
            $(reference).css("background-color", "#EBEBED");
            $(reference).next(".left_navigation_dropdown").removeClass("d-none");
        }
        else {
            $(reference).css("background-color", "#FFFFFF");
            $(reference).next(".left_navigation_dropdown").addClass("d-none");
        }
    }
};

let topNavigation = {
    settings: {
    },
    init: function () {
        topNavigation.bindUIElements();

        setInterval(topNavigation.generateDate, 1000);
        setInterval(topNavigation.generateTime, 1000);
    },
    bindUIElements: function () {
    },
    generateDate: function () {
        let dates = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        let date = new Date();
        let generatedDate = dates[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
        let generatedDateHTML = "<li>" + generatedDate + "</li>";

        $("#date_ref").empty().append(generatedDateHTML);
    },
    generateTime: function () {
        let date = new Date();

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        let generatedTime = hours + ":" + minutes + ":" + seconds;
        let generatedTimeHTML = "<li>" + generatedTime + "</li>";

        $("#time_ref").empty().append(generatedTimeHTML);
    }
};

$(document).ready(function () {
    leftNavigation.init();
    topNavigation.init();
})