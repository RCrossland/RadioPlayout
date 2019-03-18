let scheduleClock = {
    settings: {

    },
    init: function () {
        scheduleClock.bindUIAction();
    },
    bindUIAction: function () {
        $("#schedule_clock_outer").sortable({
            items: ".schedule_clock_item",
            update: function (event, ui) {
                if ($(ui.item[0]).hasClass("schedule_audio_item")) {
                    // Get the items audio item ref
                    let audioItemRef = $(ui.item[0]).data("ref");

                    // Fetch the data
                    let audioItem = $.grep(audioItems.settings.audioTypeItems, function (e) { return e.AudioTypeName == audioItemRef; });

                    if (audioItem.length > 0) {
                        // HTML to add the audio item to the clock
                        let scheduleClockItemHTML = '<div class="col-3 schedule_clock_item_duration" data-duration="' + audioItem[0].AudioAverageDuration + '">00:00:00</div>' +
                            '<div class="col-9">' + audioItem[0].AudioTypeName + '</div>';

                        // Append the item to the clock
                        // Set the class of the new item
                        $(ui.item[0]).attr("class", "row no-gutters border border-dark p-2 pointer no_select schedule_clock_item");
                        // Remove the items styling
                        $(ui.item[0]).removeAttr("style");
                        // Empty the internal part of the attribute
                        $(ui.item[0]).empty();
                        // Append the new HTML to the element
                        $(ui.item[0]).append(scheduleClockItemHTML);

                        // Call the function to calculate the schedule item times
                        scheduleClock.calculateScheduleItemsDuration();
                    }
                    else {
                        console.log("No audio item was returned from the Audio Items array");
                    }
                }
                else {
                    // Schedule clock items were reordered in the list
                    scheduleClock.calculateScheduleItemsDuration();
                }
            }
        });

        $(".schedule_audio_item").draggable({
            connectToSortable: "#schedule_clock_outer",
            helper: "clone",
            revert: "invalid"
        });
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