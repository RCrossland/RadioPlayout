let s;

let editAudioItems = {
    settings: {
        // Audio modal type
        audioModalType: null,

        // WaveSurfer to display the audio waveform
        wavesurfer: null,

        // Modal settings
        audioModalTitle: null,
        audioModalButton: null,

        // Audio form references
        audioItemForm: null,

        artistNameRef: null,
        audioTitleRef: null,
        audioTypeRef: null,
        audioReleaseYearRef: null,
        audioInRef: null,
        audioOutRef: null,
        audioDurationRef: null,
        audioFileRef: null,

        // Audio form error references
        audioModalError: null,
        artistNameErrorRef: null,
        audioTitleErrorRef: null,
        audioTypeErrorRef: null,
        audioReleaseYearErrorRef: null,
        audioInErrorRef: null,
        audioOutErrorRef: null,
        audioDurationErrorRef: null
    },
    init: function () {
        s = editAudioItems.settings;

        editAudioItems.bindUIElements();

        // Create a WaveSurfer object and set it's reference to the 'waveform' div
        editAudioItems.settings.wavesurfer = WaveSurfer.create({
            container: '#waveform'
        });
    },
    bindUIElements: function () {
        // Set a reference to the HTML elements
        s.audioModalTitle = $("#audio_modal_title");
        s.audioModalButton = $("#audio_modal_button");

        s.audioItemForm = $("#audio_item_form");

        s.artistNameRef = $("#artist_name");
        s.audioTitleRef = $("#audio_title");
        s.audioTypeRef = $("#audio_type");
        s.audioReleaseYearRef = $("#audio_release_year");
        s.audioInRef = $("#audio_in");
        s.audioOutRef = $("#audio_out");
        s.audioDurationRef = $(".audio_duration");
        s.audioFileRef = $("#audio_file_upload");

        s.audioModalError = $("#audio_modal_error");
        s.artistNameErrorRef = $("#artist_name_error");
        s.audioTitleErrorRef = $("#audio_title_error");
        s.audioTypeErrorRef = $("#audio_type_error");
        s.audioReleaseYearErrorRef = $("#audio_release_year_error");
        s.audioInErrorRef = $("#audio_in_error");
        s.audioOutErrorRef = $("#audio_out_error");
        s.audioDurationErrorRef = $("#audio_duration_error");

        $("#add_audio_button").click(function () {
            // Show the audio items modal
            $("#audio_items_modal").modal('show');

            // reset the Audio Item form
            s.audioItemForm.trigger("reset");

            // reset form messages
            $("#audio_modal_success").empty();
            $("#audio_modal_error").empty();

            // reset the track duration
            $(".audio_duration").attr("value", "00:00:00");

            // Reset the form error messages
            $(".audio_error").val("test");

            // Set the audioModalType to reference adding a new audio type
            s.audioModalType = "addAudioItem";

            // Set the audio item title
            s.audioModalTitle.text("Add New Audio Item");

            // Set the audio item button
            s.audioModalButton.val("Add Audio Item");
        });

        $(".edit_audio_item").on("click", function () {
            // Show the audio items modal
            $("#audio_items_modal").modal('show');

            // reset the Audio Item form
            s.audioItemForm.trigger("reset");

            // Set the audioModalType to reference adding a new audio type
            s.audioModalType = "editAudioItem";

            // Set the audio item title
            s.audioModalTitle.text("Edit Audio Item");

            // Set the audio item button
            s.audioModalButton.val("Edit Audio Item");

            editAudioItems.getAudioItemInfo($(this).data("audio-id"), $(this).data("get-audio"));
        });

        $(".delete_audio_item").on("click", function () {
            editAudioItems.deleteAudioItem($(this).data("audio-id"));
        });

        $("#audio_modal_pause").click(function () {
            editAudioItems.settings.wavesurfer.pause();
        });

        $("#audio_modal_play").click(function () {
            editAudioItems.settings.wavesurfer.play();
        });

        $("#audio_item_form").on('submit', function (e) {
            e.preventDefault();

            // TODO: Change this back to validate the audio form
            if (editAudioItems.validateAudioForm(s.audioModalType)) {
                // Form is valid and can submit
                if (s.audioModalType == "addAudioItem") {
                    editAudioItems.addNewAudioItemSubmit();
                }
                else {
                    editAudioItems.editAudioItemSubmit();
                }
            }
        });

        $("#audio_file_upload").on('change', function () {
            // Create a FormData object in order to store the file data
            let formData = new FormData();
            // Get the file data fromt he form
            let files = s.audioFileRef[0].files;
            // Add the file to the form data
            formData.append("audioFile", files[0]);

            // Send the FormData to the AudioController and wait for a response
            let xhr = new XMLHttpRequest();
            xhr.open('POST', s.audioFileRef.data("upload-url"));
            xhr.send(formData);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // Call the loadWaveFrom function passing in the file path without the quotes
                    // Match one or more ["] double quotes and apply to the entire string an empty ''
                    editAudioItems.loadWaveForm(xhr.responseText.replace(/["]+/g, ''));
                }
                else if (xhr.status == 404) {
                    // If we get a 404 error here. It is usually because the file being uploaded it to big
                    $("#audio_modal_error").empty().append("The file uploaded is to big. Please try again.");
                }
            }

        });
    },
    loadWaveForm: function (filePath) {
        // Load the audio file into WaveSurfer
        editAudioItems.settings.wavesurfer.load(filePath);

        // When the audio track has laoded into WaveSurfer
        editAudioItems.settings.wavesurfer.on('ready', function () {
            // Get the duration and display it to the user
            let date = new Date(null);
            date.setSeconds(editAudioItems.settings.wavesurfer.getDuration());
            $(".audio_duration").attr("value", date.toISOString().substr(11, 8));

            let audioInCheck = false;
            // Set a click event handler on both of the AudioIn and AudioOut input boxes
            $("#audio_in_check").click(function () {
                if (!audioInCheck) {
                    audioInCheck = true;
                    $(this).css("border", "1px solid red");

                    editAudioItems.settings.wavesurfer.on("seek", editAudioItems.setAudioIn);
                }
                else {
                    audioInCheck = false;
                    $(this).css("border", "");

                    editAudioItems.settings.wavesurfer.un("seek", editAudioItems.setAudioIn);
                }
            });

            let audioOutCheck = false;
            // Set a click event handler on both of the AudioOut and AudioOut input boxes
            $("#audio_out_check").click(function () {
                if (!audioOutCheck) {
                    audioOutCheck = true;
                    $(this).css("border", "1px solid red");

                    editAudioItems.settings.wavesurfer.on("seek", editAudioItems.setAudioOut);
                }
                else {
                    audioOutCheck = false;
                    $(this).css("border", "");

                    editAudioItems.settings.wavesurfer.un("seek", editAudioItems.setAudioOut);
                }
            });
        });
    },
    setAudioIn: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.wavesurfer.getCurrentTime());

        $("#audio_in").attr("value", date.toISOString().substr(11, 8));
    },
    setAudioOut: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.wavesurfer.getCurrentTime());

        $("#audio_out").attr("value", date.toISOString().substr(11, 8));
    },
    validateAudioForm: function () {
        if (editAudioItems.validateArtistName() && editAudioItems.validateAudioTitle() &&
            editAudioItems.validateAudioType() && editAudioItems.validateReleaseYears() &&
            editAudioItems.validateAudioLocation() && editAudioItems.validateAudioIn() &&
            editAudioItems.validateAudioOut() && editAudioItems.validateAudioDuration()) {
            // Form can submit
            return true;
        }
        else {
            // Form cannot submit
            return false;
        }
    },
    addNewAudioItemSubmit: function () {
        $.ajax({
            url: $("#audio_item_form").data("add-url"),
            type: "POST",
            data: {
                "artistName": s.artistNameRef.val(),
                "audioTitle": s.audioTitleRef.val(),
                "audioLocation": s.audioFileRef.val().split('\\').pop(), // Split the file path just to get the filename
                "audioDuration": editAudioItems.getSeconds(s.audioDurationRef.val()),
                "audioIn": editAudioItems.getSeconds(s.audioInRef.val()),
                "audioOut": editAudioItems.getSeconds(s.audioOutRef.val()),
                "audioReleaseYear": s.audioReleaseYearRef.val(),
                "audioType": s.audioTypeRef.val()
            },
            success: function () {
                $("#audio_modal_success").text("The audio item was successfully added");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let response = jqXHR.responseJSON;
                editAudioItems.displayValidation(response);
            }
        });
    },
    editAudioItemSubmit: function () {
        $.ajax({
            url: $("#audio_item_form").data("update-url"),
            type: "POST",
            data: {
                "audioId": $("#audio_item_form").attr("data-audio-id"),
                "artistName": s.artistNameRef.val(),
                "audioTitle": s.audioTitleRef.val(),
                "audioLocation": s.audioFileRef.data("file-name"),
                "audioDuration": editAudioItems.getSeconds(s.audioDurationRef.val()),
                "audioIn": editAudioItems.getSeconds(s.audioInRef.val()),
                "audioOut": editAudioItems.getSeconds(s.audioOutRef.val()),
                "audioReleaseYear": s.audioReleaseYearRef.val(),
                "audioType": s.audioTypeRef.val()
            },
            success: function () {
                $("#audio_modal_success").text("The audio item was successfully updated.");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let response = jqXHR.responseJSON;
                editAudioItems.displayValidation(response);
            }
        });
    },
    deleteAudioItem: function (audioId) {
        // Validate audioId has a value
        if (audioId == "" || audioId == null) {

        }
        else {
            $.ajax({
                url: $("#audio_card_outer").data("delete-item"),
                type: "POST",
                data: { "audioId": audioId },
                success: function () {
                    $("#autio_filter_success").text("Item deleted successfully.");
                    $("#audio_filter_error").text("")
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $("#autio_filter_success").text("")
                    $("#audio_filter_error").text("Error deleting item. Please try again");
                }
            })
        }
    },
    stripInput: function (input) {
        // Strip the user input of any harmful inputs
    },
    validateArtistName: function() {
        if (s.artistNameRef.val() == "") {
            // User hasn't entered an artist name
            s.artistNameErrorRef.text("Please enter an artist name.");
            return false;
        }
        else {
            // User has entered an artist name
            s.artistNameErrorRef.text("");
            return true;
        }
    },
    validateAudioTitle: function () {
        if (s.audioTitleRef.val() == "") {
            // User hasn't entered an artist name
            s.audioTitleErrorRef.text("Please enter an audio title.");
            return false;
        }
        else {
            // User has entered an artist name
            s.audioTitleErrorRef.text("");
            return true;
        }
    },
    validateAudioType: function () {
        if (s.audioTypeRef.val() == null){
            // User hasn't selected an audio type reference
            s.audioTypeErrorRef.text("Please select an audio type");
            return false;
        }
        else {
            // User has selected an audio type reference
            s.audioTypeErrorRef.text("");
            return true;
        }
    },
    validateReleaseYears: function () {
        if (s.audioReleaseYearRef.val() == null) {
            // User hasn't selected an audio release year
            s.audioReleaseYearErrorRef.text("Please select an audio release year");
            return false;
        }
        else {
            // User has selected an audio release year
            s.audioReleaseYearErrorRef.text("");
            return true;
        }
    },
    validateAudioLocation: function (audioModalType) {
        if (s.audioFileRef[0].files.length <= 0 && audioModalType == "addAudioItem") {
            // User has added any audio files
            s.audioModalError.text("Please upload an audio file");
            return false;
        }
        else {
            // User has uploaded an audio file
            s.audioModalError.text("");
            return true;
        }
    },
    validateAudioIn: function () {
        if (editAudioItems.getSeconds(s.audioInRef.val()) == -1) {
            s.audioInErrorRef.text("There was an error.");
            return false;
        }
        else {
            s.audioInErrorRef.text("");
            return true;
        }
    },
    validateAudioOut: function () {
        if (editAudioItems.getSeconds(s.audioOutRef.val()) == -1) {
            s.audioOutErrorRef.text("There wasn an error.");
            return false;
        }
        else {
            s.audioOutErrorRef.text("");
            return true;
        }
    },
    validateAudioDuration: function () {
        if (editAudioItems.getSeconds(s.audioDurationRef.val()) == -1) {
            s.audioDurationErrorRef.text("There was an error.");
            return false;
        }
        else {
            s.audioDurationErrorRef.text("");
            return true;
        }
    },
    displayValidation: function (ajaxResponse) {
        if (ajaxResponse.hasOwnProperty("ArtistName")) {
            s.artistNameErrorRef.text(ajaxResponse.ArtistName);
            return false;
        }
        else {
            s.artistNameErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioTitle")) {
            s.audioTitleErrorRef.text(ajaxResponse.AudioTitle);
            return false;
        }
        else {
            s.audioTitleErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioLocation")) {
            s.audioModalError.text(ajaxResponse.AudioLocation);
            return false;
        }
        else {
            s.audioModalError.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioDuration")) {
            s.audioDurationErrorRef.text(ajaxResponse.AudioDuration);
            return false;
        }
        else {
            s.audioDurationErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioIn")) {
            s.audioInErrorRef.text(ajaxResponse.AudioIn);
            return false;
        }
        else {
            s.audioInErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioOut")) {
            s.audioOutErrorRef.text(ajaxResponse.AudioOut);
            return false;
        }
        else {
            s.audioOutErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioReleaseYear")) {
            s.audioReleaseYearErrorRef.text(ajaxResponse.AudioReleaseYear);
            return false;
        }
        else {
            s.audioReleaseYearErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("AudioType")) {
            s.audioTypeErrorRef.text(ajaxResponse.AudioType);
            return false;
        }
        else {
            s.audioTypeErrorRef.text("");
        }

        if (ajaxResponse.hasOwnProperty("Audio")) {
            s.audioModalError.text(ajaxResponse.Audio);
            return false;
        }
        else {
            s.audioModalError.text("");
        }
    },
    getSeconds: function (timeRef) {
        // Split data based on ':'
        let timeRefSplit = timeRef.split(":");

        // Check timeRefSplit has two or three splits
        if (timeRefSplit.length == 2) {
            let minutesToSeconds = timeRefSplit[0] * 60;
            let seconds = timeRefSplit[1];

            return parseInt(seconds) + parseInt(minutesToSeconds);
        }
        else if (timeRefSplit.length == 3) {
            let hourstoSeconds = timeRefSplit[0] * 3600;
            let minutestoSeconds = timeRefSplit[1] * 60;
            let seconds = timeRefSplit[2];

            return parseInt(hourstoSeconds) + parseInt(minutestoSeconds) + parseInt(seconds);
        }
        else {
            return -1;
        }
    },
    getAudioItemInfo: function (audioId, getAudioItemFunction) {
        if (audioId == null || audioId == "") {
            s.audioModalError.text("The audio item couldn't be found. Please try again.");
        }

        $.ajax({
            url: getAudioItemFunction,
            type: "POST",
            data: { "audioId": audioId },
            success: function (data) {
                let audioItem = data[0];

                // Set the audio form values
                s.artistNameRef.val(audioItem.ArtistName);
                s.audioTitleRef.val(audioItem.AudioTitle);
                s.audioTypeRef.val(audioItem.AudioType.AudioTypeId)
                s.audioReleaseYearRef.val(audioItem.AudioReleaseYear);

                $("#audio_item_form").attr("data-audio-id", audioItem.AudioId);
                $("#audio_file_upload").attr("data-file-name", audioItem.AudioLocation); // Split the file path just to get the filename

                let date = new Date(null);
                date.setSeconds(audioItem.AudioIn);
                s.audioInRef.val(date.toISOString().substr(11, 8));

                date.setSeconds(audioItem.AudioOut);
                s.audioOutRef.val(date.toISOString().substr(11, 8));

                editAudioItems.loadWaveForm("Content/Audio/" + audioItem.AudioLocation);
            },
            error: function (jqXHR, textStatus, errorThrown) {
            }
        })
    }
}

$(document).ready(function () {
    editAudioItems.init();
});