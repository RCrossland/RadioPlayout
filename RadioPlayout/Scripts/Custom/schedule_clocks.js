﻿let scheduleClock = {
    settings: {
        scheduleForm: null,
        scheduleFormSuccessRef: null,
        scheduleFormErrorRef: null,
        scheduleFormNameRef: null,
        scheduleDurationRef: null,

        scheduleClockList: []
    },
    init: function () {
        scheduleClock.bindUIAction();
    },
    bindUIAction: function () {
        scheduleClock.settings.scheduleForm = $("#schedule_clock_form");
        scheduleClock.settings.scheduleFormSuccessRef = $("#schedule_clock_form_success");
        scheduleClock.settings.scheduleFormErrorRef = $("#schedule_clock_form_error");
        scheduleClock.settings.scheduleFormNameRef = $("#schedule_clock_name_Ref")[0];
        scheduleClock.settings.scheduleDurationRef = $("#schedule_clock_duration");

        $("#schedule_clock_outer").sortable({
            items: ".schedule_clock_item",
            start: function (e, ui) {
                $(this).attr('data-previndex', ui.item.index());
            },
            update: function (event, ui) {
                if ($(ui.item[0]).hasClass("schedule_audio_item")) {
                    // Get the items audio item ref
                    let audioItemRef = $(ui.item[0]).data("ref");

                    // Fetch the data
                    let audioItem = $.grep(audioItems.settings.audioTypeItems, function (e) { return e.AudioTypeName == audioItemRef; });

                    if (audioItem.length > 0) {
                        // HTML to add the audio item to the clock
                        let scheduleClockItemHTML = '<div class="col-3 schedule_clock_item_duration" data-duration="' + audioItem[0].AudioAverageDuration + '">00:00:00</div>' +
                            '<div class="col-8">' + audioItem[0].AudioTypeName + '</div>' + 
                            '<div class="col-1 schedule_clock_item_remove"><i class="fas fa-times"></i></div>';

                        // Append the item to the clock
                        // Set the class of the new item
                        $(ui.item[0]).attr("class", "row no-gutters border border-dark p-2 pointer no_select schedule_clock_item");
                        // Remove the items styling
                        $(ui.item[0]).removeAttr("style");
                        // Add data attribute of the audio item
                        $(ui.item[0]).attr("data-ref", audioItem[0].AudioTypeName);
                        // Empty the internal part of the attribute
                        $(ui.item[0]).empty();
                        // Append the new HTML to the element
                        $(ui.item[0]).append(scheduleClockItemHTML);

                        // Call the function to calculate the schedule item times
                        scheduleClock.calculateScheduleItemsDuration();

                        // Update the schedule clock array
                        scheduleClock.addNewScheduleClockItem(ui);

                        // Remove the started attribute
                        $(this).removeAttr('data-previndex');

                        scheduleClock.bindUIAction();
                    }
                    else {
                        console.log("No audio item was returned from the Audio Items array");
                    }
                }
                else {
                    // Schedule clock items were reordered in the list
                    scheduleClock.calculateScheduleItemsDuration();

                    scheduleClock.updateScheduleClockItems(parseInt($(this).attr('data-previndex')) + 1, parseInt(ui.item.index()) + 1);

                    // Remove the started attribute
                    $(this).removeAttr('data-previndex');
                }
            }
        });

        $(".schedule_audio_item").draggable({
            connectToSortable: "#schedule_clock_outer",
            helper: "clone",
            revert: "invalid"
        });

        $("#schedule_clock_form").on("submit", function (e) {
            e.preventDefault();

            if (scheduleClock.validateScheduleClockForm()) {
                scheduleClock.submitScheduleClock();
            }
        });

        $(".schedule_clock_item_remove").one("click", function (e) {
            // Stop the click propogating up the DOM
            e.stopImmediatePropagation();
            // Pass the GUI index to the remove schedule clock item
            scheduleClock.removeScheduleClockItem($(this).parent(".schedule_clock_item").index() + 1);
            // Remove this element frmo the DOM
            $(this).parent(".schedule_clock_item").remove();
        })
    },
    calculateScheduleItemsDuration: function () {
        // Placeholder for current time
        let currentTime = 0;

        $.each($(".schedule_clock_item_duration"), function (index) {
            if (String($(this).data("duration")).match("^\\d+$")) {
                // Add the current clock items duration to the current time
                currentTime = currentTime + $(this).data("duration");

                // Conver the current time from seconds to a date format
                let date = new Date(null);
                date.setSeconds(currentTime);

                $(this).text(date.toISOString().substr(11, 8));
            }
        });

        // Update the schedule item duration
        let date = new Date(null);
        date.setSeconds(currentTime);

        $("#schedule_clock_duration").attr("value", date.toISOString().substr(11, 8));
    },
    addNewScheduleClockItem: function (ui) {
        if (ui.item.index() == 0) {
            // Item was added to the start of the list
            // Move each of the other items up the list by one
            $.each(scheduleClock.settings.scheduleClockList, function (key, value) {
                value.schedule_clock_index = value.schedule_clock_index + 1;
            });

            // Add the item to the start of the array
            scheduleClock.settings.scheduleClockList.unshift({
                "schedule_clock_index": 1,
                "schedule_clock_name": ui.item.data("ref")
            });
        }
        else if (ui.item.index() == scheduleClock.settings.scheduleClockList.length) {
            // Schedule clock item was inputted at the end of the array
            scheduleClock.settings.scheduleClockList.push({
                "schedule_clock_index": scheduleClock.settings.scheduleClockList.length + 1,
                "schedule_clock_name": ui.item.data("ref")
            });
        }
        else {
            // Schedule clock item was inputted in the middle of the array
            // Move the items above the index up by one
            $.each(scheduleClock.settings.scheduleClockList, function (key, value) {
                if (value.schedule_clock_index >= (ui.item.index() + 1)) {
                    value.schedule_clock_index = value.schedule_clock_index + 1;
                }
            });

            // Add the new item to the list in that index position
            scheduleClock.settings.scheduleClockList.push({
                "schedule_clock_index": ui.item.index() + 1,
                "schedule_clock_name": ui.item.data("ref")
            });
        }
    },
    updateScheduleClockItems: function (old_index, new_index) {
        // Find the id value from the array with the current index
        // Set the index to 0
        $.each(scheduleClock.settings.scheduleClockList, function (index, value) {
            if (value.schedule_clock_index == old_index) {
                value.schedule_clock_index = parseInt("-1");
            }
        });

        if (new_index > old_index) {
            // Item has been moved down the list
            $.each(scheduleClock.settings.scheduleClockList, function (index, value) {
                if (value.schedule_clock_index <= new_index &&
                    value.schedule_clock_index > old_index &&
                    value.schedule_clock_index != "-1")
                {
                    value.schedule_clock_index = value.schedule_clock_index - 1;
                }
            });
        }
        else {
            // Item has moved up the list
            $.each(scheduleClock.settings.scheduleClockList, function (index, value) {
                if (value.schedule_clock_index >= new_index &&
                    value.schedule_clock_index < old_index)
                {
                    value.schedule_clock_index = value.schedule_clock_index + 1;
                }
            });
        }

        // Find the id value from the array with the index of 0
        // Set the index to the new index
        $.each(scheduleClock.settings.scheduleClockList, function (index, value) {
            if (value.schedule_clock_index == "-1") {
                value.schedule_clock_index = new_index;
            }
        });
    },
    removeScheduleClockItem: function (item_index) {
        // Remove the item from the array
        // Minus one from the index to be the array index position
        scheduleClock.settings.scheduleClockList.splice(item_index - 1, 1);

        // Cycle through the array and move the items index of the items above or below
        $.each(scheduleClock.settings.scheduleClockList, function (index, value) {
            if (value.schedule_clock_index > item_index) {
                value.schedule_clock_index = value.schedule_clock_index - 1;
            }
        });

        console.log(scheduleClock.settings.scheduleClockList);
    },
    validateScheduleClockForm: function () {
        // Validate the schedule clock form input
        if (scheduleClock.settings.scheduleFormNameRef.value === "") {
            scheduleClock.settings.scheduleFormSuccessRef.text("");
            scheduleClock.settings.scheduleFormErrorRef.text("Schedule clock must have a name.");

            return false;
        }
        else if (scheduleClock.settings.scheduleDurationRef.value === "00:00:00") {
            scheduleClock.settings.scheduleFormSuccessRef.text("");
            scheduleClock.settings.scheduleFormErrorRef.text("There was an error with the schedule clocks duration.");

            return false;
        }
        else {
            scheduleClock.settings.scheduleFormSuccessRef.text("");
            scheduleClock.settings.scheduleFormErrorRef.text("");

            return true;
        }
    },
    //submitScheduleClock: function () {
    //    // This should only run if the form has been validated
    //    $.ajax({
    //        type: "POST",
    //        url:,
    //        data: {
    //            "schedule_clock_name": scheduleClock.settings.scheduleFormNameRef.value,
    //            "schedule_clock_duration": scheduleClock.settings.scheduleDurationRef.value
    //        },
    //        success: function () {
    //            console.log("Form was successful");
    //        },
    //        error: function (jqXHR, textStatus, errorThrown) {
    //            console.log("An error occured");
    //        }
    //    });
    //},
    stripInput: function (data) {

    }
}

let audioItems = {
    settings: {
        audioTypeItems: []
    },
    init: function () {
        audioItems.getAudioTypes();
    },
    bindUIActions: function () {

    },
    getAudioTypes: function () {
        $.ajax({
            type: "POST",
            url: $("#schedule_audio_items_outer").data("url-get"),
            data: {},
            success: function (data) {
                audioItems.settings.audioTypeItems = data;
                audioItems.displayAudioItemTypes(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
            }
        })
    },
    displayAudioItemTypes: function (audioTypes) {
        let audioItemsHTML = "";

        // Loop over the audio type items and add the construction html
        $.each(audioTypes, function (index, value) {
            audioItemsHTML = audioItemsHTML + '<div class="row no-gutters border border-dark p-2 pointer no_select schedule_audio_item" data-ref="' + value.AudioTypeName + '">' +
                '<div class="col-12">' + value.AudioTypeName + '</div></div>';
        });
        // Add the constructed HTML to the page
        $("#schedule_audio_items_outer").append(audioItemsHTML);
        // Call the schedule clock bindUIActions to set the draggable elements
        scheduleClock.bindUIAction();
    }
}

$(document).ready(function () {
    scheduleClock.init();
    audioItems.init();
});