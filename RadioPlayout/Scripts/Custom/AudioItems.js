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
        artistNameRef: null,
        audioTitleRef: null,
        audioTypeRef: null,
        audioReleaseYearRef: null,

        // Audio form error references
        artistNameErrorRef: null,
        audioTitleErrorRef: null,
        audioTypeErrorRef: null,
        audioReleaseYearErrorRef: null
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

        s.artistNameRef = $("#artist_name");
        s.audioTitleRef = $("#audio_title");
        s.audioTypeRef = $("#audio_type");
        s.audioReleaseYearRef = $("#audio_release_year");

        s.artistNameErrorRef = $("#artist_name_error");
        s.audioTitleErrorRef = $("#audio_title_error");
        s.audioTypeErrorRef = $("#audio_type_error");
        s.audioReleaseYearErrorRef = $("#audio_release_year_error");

        $("#add_audio_button").click(function () {
            // Show the audio items modal
            $("#audio_items_modal").modal('show');

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

            // Set the audioModalType to reference adding a new audio type
            s.audioModalType = "editAudioItem";

            // Set the audio item title
            s.audioModalTitle.text("Edit Audio Item");

            // Set the audio item button
            s.audioModalButton.val("Edit Audio Item");

            // Load audio into WaveSurfer
            editAudioItems.loadWaveForm('/Content/Audio/Olly Murs - Excuses.wav');
        });

        $("#audio_modal_pause").click(function () {
            editAudioItems.settings.wavesurfer.pause();
        });

        $("#audio_modal_play").click(function () {
            editAudioItems.settings.wavesurfer.play();
        });

        $("#audio_item_form").on('submit', function (e) {
            e.preventDefault();

            if (editAudioItems.validateAudioForm()){
                // Form is valid and can submit
                if (s.audioModalType == "addAudioItem") {
                    editAudioItems.addNewAudioItemSubmit();
                }
                else {
                    editAudioItems.editAudioItemSubmit();
                }
            }
        });
    },
    loadWaveForm: function (filePath) {
        // Load the audio file into WaveSurfer
        editAudioItems.settings.wavesurfer.load('/Content/Audio/Olly Murs - Excuses.wav');

        // When the audio track has laoded into WaveSurfer
        editAudioItems.settings.wavesurfer.on('ready', function () {
            // Get the duration and display it to the user
            let date = new Date(null);
            date.setSeconds(editAudioItems.settings.wavesurfer.getDuration());
            $("#audio_duration").attr("placeholder", date.toISOString().substr(11, 8));

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

        $("#audioIn").attr("placeholder", date.toISOString().substr(11, 8));
    },
    setAudioOut: function () {
        // Get the duration and display it to the user
        let date = new Date(null);
        date.setSeconds(editAudioItems.settings.wavesurfer.getCurrentTime());

        $("#audioOut").attr("placeholder", date.toISOString().substr(11, 8));
    },
    validateAudioForm: function () {
        if (editAudioItems.validateArtistName() && editAudioItems.validateAudioTitle() && editAudioItems.validateAudioType() && editAudioItems.validateReleaseYears()) {
            // Form can submit
            return true;
        }
        else {
            // Form cannot submit
            return false;
        }
    },
    addNewAudioItemSubmit: function () {
        console.log("Sending....");
        $.ajax({
            url: $("#audio_item_form").data("add-url"),
            type: "POST",
            data: {},
            success: function () {

            },
            error: function (jqXHR, textStatus, errorThrown) {
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        });
    },
    editAudioItemSubmit: function () {
        console.log("Upading....");
        $.ajax({
            url: $("#audio_item_form").data("update-url"),
            type: "POST",
            data: {},
            success: function () {

            },
            error: function (jqXHR, textStatus, errorThrown) {
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        });
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
    }
}

$(document).ready(function () {
    editAudioItems.init();
})