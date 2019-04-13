let s;

let editAudioItems = {
    settings: {
        // WaveSurfer to display the audio waveform
        addWaveSurfer: null,
        editWaveSurfer: null,

        // Audio Modal references
        currentModalType: null,
        addAudioModal: null,
        editAudioModal: null,

        // Audio form references
        audioItemForm: null,

        // Audio field references
        artistNameRef: null,
        audioTitleRef: null,
        audioTypeRef: null,
        audioReleaseYearRef: null,
        audioInCheck: null,
        audioInRef: null,
        audioOutCheck: null,
        audioOutRef: null,
        audioDuration: null,
        audioFile: null,
        audioFileLocation: null,

        audioSuccess: null,
        audioErrorList: null
    },
    init: function () {
        s = editAudioItems.settings;

        editAudioItems.bindUIElements();

        // Create a WaveSurfer object and set it's reference to the 'waveform' div
        editAudioItems.settings.editWaveSurfer = WaveSurfer.create({
            container: '#edit_waveform'
        });

        editAudioItems.settings.addWaveSurfer = WaveSurfer.create({
            container: '#add_waveform'
        });
    },
    bindUIElements: function () {
        // Modal references
        s.addAudioModal = $("#add_audio_items_modal");
        s.editAudioModal = $("#edit_audio_items_modal");

        // Form references
        s.audioItemForm = $("#audio_item_form");

        // Global fields
        s.artistNameRef = $(".artist_name_ref");
        s.audioTitleRef = $(".audio_title_ref");
        s.audioTypeRef = $(".audio_type_select");
        s.audioReleaseYearRef = $(".audio_release_year_ref");
        s.audioInCheck = $(".audio_in_check");
        s.audioInRef = $(".audio_in_value");
        s.audioOutCheck = $(".audio_out_check");
        s.audioOutRef = $(".audio_out_value");
        s.audioDuration = $(".audio_duration");
        s.audioFile = $(".audio_file");
        s.audioFileLocation = $(".audio_file_location");

        // Add new audio item element references
        s.audioItemForm = $("#audio_item_modal");
        s.audioSuccess = $("#audio_modal_success");
        s.audioErrorList = $("#audio_modal_error");

        // Event handlers
        $("#add_audio_button").click(function () {
            s.currentModalType = "add";

            // Show the audio items modal
            $("#add_audio_items_modal").modal('show');

            // reset the Audio Item form
            s.audioItemForm.trigger("reset");

            // reset form messages
            s.audioSuccess.empty();
            s.audioErrorList.empty();

            // reset the track duration
            s.audioFileLocation.val("");
            s.audioDuration.val("00:00:00");
        });

        $(".edit_audio_item").on("click", function () {
            s.currentModalType = "edit";

            // Show the audio items modal
            $("#edit_audio_items_modal").modal('show');

            // reset the Audio Item form
            s.audioItemForm.trigger("reset");

            editAudioItems.getAudioItemInfo($(this).data("audio-id"), $(this).data("get-audio"));
        });

        $(".delete_audio_item").on("click", function () {
            editAudioItems.deleteAudioItem($(this).data("audio-id"));
        });

        $("#add_audio_modal_play").click(function () {
            editAudioItems.settings.addWaveSurfer.play();
        });

        $("#add_audio_modal_pause").click(function () {
            editAudioItems.settings.addWaveSurfer.pause();
        });

        $("#edit_audio_modal_play").click(function () {
            editAudioItems.settings.editWaveSurfer.play();
        });

        $("#edit_audio_modal_pause").click(function () {
            editAudioItems.settings.editWaveSurfer.pause();
        });

        s.audioFile.on('change', function () {
            // Create a FormData object in order to store the file data
            let formData = new FormData();
            // Get the file data from the input field
            let files = $(this)[0].files;
            // Add the file to the form data
            formData.append("audioFile", files[0]);

            // Send the FormData to the AudioController and wait for a response
            let xhr = new XMLHttpRequest();
            xhr.open('POST', $(".audio_file_outer").data("upload-audio"));
            xhr.send(formData);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    // Call the loadWaveFrom function passing in the file path without the quotes
                    // Match one or more ["] double quotes and apply to the entire string an empty ''
                    if (s.currentModalType == "add") {
                        editAudioItems.loadWaveForm("add", s.addWaveSurfer, xhr.responseText.replace(/["]+/g, ''));
                    }
                    else {
                        editAudioItems.loadWaveForm("edit", s.editWaveSurfer, xhr.responseText.replace(/["]+/g, ''));
                    }

                    s.audioFileLocation.val(xhr.responseText.split("/").pop());
                }
                else if (xhr.status == 404) {
                    // If we get a 404 error here. It is usually because the file being uploaded it to big
                    s.audioErrorList.empty().append("<li>The file uploaded is to big. Please try again.</li>");
                }
            }

        });
    },
    loadWaveForm: function (type, wavesurfer, filePath) {
        // Load the audio file into WaveSurfer
        wavesurfer.load(filePath);

        // When the audio track has laoded into WaveSurfer
        wavesurfer.on('ready', function () {
            // Get the duration and display it to the user
            let date = new Date(null);
            date.setSeconds(wavesurfer.getDuration());
            s.audioDuration.val(date.toISOString().substr(11, 8));

            let audioInCheck = false;
            // Set a click event handler on both of the AudioIn and AudioOut input boxes
            s.audioInCheck.click(function () {
                if (!audioInCheck) {
                    audioInCheck = true;
                    $(this).css("border", "1px solid red");

                    if (type == "add") {
                        wavesurfer.on("seek", editAudioItems.setAddAudioIn);
                    }
                    else {
                        wavesurfer.on("seek", editAudioItems.setEditAudioIn);
                    }
                }
                else {
                    audioInCheck = false;
                    $(this).css("border", "");

                    if (type == "add") {
                        wavesurfer.un("seek", editAudioItems.setAddAudioIn);
                    }
                    else {
                        wavesurfer.un("seek", editAudioItems.setEditAudioIn);
                    }
                }
            });

            let audioOutCheck = false;
            // Set a click event handler on both of the AudioOut and AudioOut input boxes
            s.audioOutCheck.click(function () {
                if (!audioOutCheck) {
                    audioOutCheck = true;
                    $(this).css("border", "1px solid red");

                    if (type == "add") {
                        wavesurfer.on("seek", editAudioItems.setAddAudioOut);
                    }
                    else {
                        wavesurfer.on("seek", editAudioItems.setEditAudioOut);
                    }
                }
                else {
                    audioOutCheck = false;
                    $(this).css("border", "");

                    if (type == "add") {
                        wavesurfer.un("seek", editAudioItems.setAddAudioOut);
                    }
                    else {
                        wavesurfer.un("seek", editAudioItems.setEditAudioOut);
                    }
                }
            });
        });
    },
    setAddAudioIn: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.addWaveSurfer.getCurrentTime());

        s.audioInRef.val(date.toISOString().substr(11, 8));
    },
    setEditAudioIn: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.editWaveSurfer.getCurrentTime());

        s.audioInRef.val(date.toISOString().substr(11, 8));
    },
    setAddAudioOut: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.addWaveSurfer.getCurrentTime());

        s.audioOutRef.val(date.toISOString().substr(11, 8));
    },
    setEditAudioOut: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.editWaveSurfer.getCurrentTime());

        s.audioOutRef.val(date.toISOString().substr(11, 8));
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
                $(".audio_id_ref").val(audioItem.AudioId);
                s.artistNameRef.val(audioItem.ArtistName);
                s.audioTitleRef.val(audioItem.AudioTitle);
                s.audioTypeRef.val(audioItem.AudioType.AudioTypeId)
                s.audioReleaseYearRef.val(audioItem.AudioReleaseYear);

                s.audioItemForm.attr("data-audio-id", audioItem.AudioId);
                s.audioFileLocation.val(audioItem.AudioLocation); // Split the file path just to get the filename

                let date = new Date(null);
                date.setSeconds(audioItem.AudioIn);
                s.audioInRef.val(date.toISOString().substr(11, 8));

                date.setSeconds(audioItem.AudioOut);
                s.audioOutRef.val(date.toISOString().substr(11, 8));

                editAudioItems.loadWaveForm("edit", s.editWaveSurfer, "Content/Audio/" + audioItem.AudioLocation);
            },
            error: function (jqXHR, textStatus, errorThrown) {
            }
        })
    }
}

$(document).ready(function () {
    editAudioItems.init();
});