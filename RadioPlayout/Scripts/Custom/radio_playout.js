let s;

const enterRadioPlayoutModal = {
    settings: {
        modalOuter: null
    },
    init: function () {
        s = enterRadioPlayoutModal.settings;

        s.modalOuter = $("#enter_radio_playout_modal");

        enterRadioPlayoutModal.showModal();

        enterRadioPlayoutModal.bindUIAction();
    },
    bindUIAction: function () {
        $("#enter_radio_playout_button").click(function () {
            radioPlayout.init();
            $("#enter_radio_playout_modal").modal('hide');
        });
    },
    showModal: function () {
        s.modalOuter.modal({ backdrop: 'static', keyboard: false });
    }
};

const radioPlayout = {
    settings: {
        autoDJ: false,

        radioPlayerAudioContext: null,
        radioPlayerWebCast: null,

        radioPlayer1Locked: false,
        radioPlayer1AudioRef: null,
        radioPlayer1ElementSource: null,
        radioPlayer1SongDuration: null,

        radioPlayer2Locked: false,
        radioPlayer2AudioRef: null,
        radioPlayer2ElementSource: null,
        radioPlayer2SongDuration: null
    },
    init: function () {
        s = radioPlayout.settings;

        radioPlayout.createAudioContext();
        radioPlayout.createRadioPlayer1AudioNode();
        radioPlayout.createRadioPlayer2AudioNode();

        radioPlayout.bindUIActions();
    },
    bindUIActions: function () {
        $("#radio_player_1_play").click(function (e) {
            s.radioPlayer1AudioRef.play();
        });

        $("#radio_player_1_pause").click(function (e) {
            s.radioPlayer1AudioRef.pause();
        });

        $("#radio_player_1_eject").click(function () {
            radioPlayout.clearRadioPlayer1();
        });

        $("#radio_player_1_volume_slider").on('input', function (e) {
            s.radioPlayer1AudioRef.volume = ($(this)[0].value / 100);
        });

        $("#radio_player_1_duration_bar").click(function (e) {
            radioPlayout.clickSongDuration($(this), e, s.radioPlayer1SongDuration, s.radioPlayer1AudioRef);
        });

        $("#radio_player_2_play").click(function (e) {
            s.radioPlayer2AudioRef.play();
        });

        $("#radio_player_2_pause").click(function (e) {
            s.radioPlayer2AudioRef.pause();
        });

        $("#radio_player_2_eject").click(function () {
            radioPlayout.clearRadioPlayer2();
        });

        $("#radio_player_2_volume_slider").on('input', function (e) {
            s.radioPlayer2AudioRef.volume = ($(this)[0].value / 100);
        });

        $("#radio_player_2_duration_bar").click(function (e) {
            radioPlayout.clickSongDuration($(this), e, s.radioPlayer2SongDuration, s.radioPlayer2AudioRef);
        });

        $(".radio_player_outer").on('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $(".radio_player_outer").droppable({
            accept: ".music_library_item, .schedule_content_item",
            tolerance: "pointer",
            drop: function (event, ui) {
                let audio_id = $(ui.draggable).data("audio_id");

                radioPlayout.getTrackData(audio_id, function (track_data) {
                    if ($(event.target).attr("name") == "radio_player_1") {
                        radioPlayout.loadPlayer1Track(track_data);
                    }
                    else if ($(event.target).attr("name") == "radio_player_2") {
                        radioPlayout.loadPlayer2Track(track_data);
                    }
                    else {
                        console.log("Unrecognised");
                    }
                });
            }
        });

        $(".auto_dj_switch").click(function () {
            if ($(this).hasClass("fa-rotate-180")) {
                // Auto DJ has been turned on
                $(this).css("color", "green");
                $(this).removeClass("fa-rotate-180");

                s.autoDJ = true;
            }
            else {
                // Auto DJ has been turned off
                $(this).css("color", "red");
                $(this).addClass("fa-rotate-180");

                s.autoDJ = false;
            }
        });

        $(".toggle_connection_switch").click(function () {
            if ($(this).hasClass("fa-rotate-180")) {
                // Webcast connection has been activated
                $(this).css("color", "green");
                $(this).removeClass("fa-rotate-180");

                radioPlayout.connectWebcast();
            }
            else {
                // Webcast connection has been disabled
                $(this).css("color", "red");
                $(this).addClass("fa-rotate-180");

            }
        });
    },
    createAudioContext: function () {
        // For legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        // Initialise an Audio Context node
        s.radioPlayerAudioContext = new AudioContext();
    },
    createRadioPlayer1AudioNode: function () {
        // Initialise a new Audio object
        s.radioPlayer1AudioRef = new Audio("/Content/Audio/01SoAmI.mp3");
        // Set the default value of the audio to 90%
        s.radioPlayer1AudioRef.volume = 0.95;

        // Create a new AudioContext element source from the Player 1 Audio
        s.radioPlayer1ElementSource = s.radioPlayerAudioContext.createMediaElementSource(s.radioPlayer1AudioRef);

        s.radioPlayer1ElementSource.connect(s.radioPlayerAudioContext.destination);

        radioPlayout.setPlayer1Analyser();
    },
    createRadioPlayer2AudioNode: function () {
        // Initialise a new Audio object
        s.radioPlayer2AudioRef = new Audio("/Content/Audio/02NoOne.mp3");
        // Set the default value of the audio to 90%
        s.radioPlayer2AudioRef.volume = 0.95;

        // Create a new AudioContext element source from the Player 1 Audio
        s.radioPlayer2ElementSource = s.radioPlayerAudioContext.createMediaElementSource(s.radioPlayer2AudioRef);

        s.radioPlayer2ElementSource.connect(s.radioPlayerAudioContext.destination);

        radioPlayout.setPlayer2Analyser();
    },
    setPlayer1Analyser: function () {
        // Create a new analyser from the audio context
        let radioPlayer1Analyser = s.radioPlayerAudioContext.createAnalyser();
        // Create a new script processor from the audio context
        let radioPlayout1ScriptProcessor = s.radioPlayerAudioContext.createScriptProcessor(2048, 1, 1);

        // Loops over each channel of the input stream. This will be at '1' as specified above.
        radioPlayout1ScriptProcessor.onaudioprocess = function () {
            // Get the bit count from the analyser
            var array = new Uint8Array(radioPlayer1Analyser.frequencyBinCount);
            radioPlayer1Analyser.getByteFrequencyData(array);

            // Calculate the average bit count
            let averageFrequencyDataPercentage = Math.average(array);

            if (averageFrequencyDataPercentage > 95) {
                $("#radio_player_1_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_1_volume_level").children(".progress_bar").removeClass("bg-success").addClass("bg-danger");
            }
            else {
                $("#radio_player_1_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_1_volume_level").children(".progress_bar").removeClass("bg-danger").addClass("bg-success");
            }

            if (s.radioPlayer1AudioRef.currentTime >= s.radioPlayer1SongDuration) {
                radioPlayout.clearRadioPlayer1();
            }
        };

        Math.average = function (args) {
            var numbers;
            if (args[0] instanceof Array) {
                numbers = args[0];
            }
            else if (typeof args[0] == "number") {
                numbers = args;
            }
            var sum = 0;
            var average = 0;
            for (var i = 0; i < numbers.length; i++) {
                sum += numbers[i];
            }
            average = sum / numbers.length;
            return average;
        };

        s.radioPlayer1ElementSource.connect(radioPlayer1Analyser);
        radioPlayout1ScriptProcessor.connect(s.radioPlayerAudioContext.destination);
        radioPlayer1Analyser.connect(radioPlayout1ScriptProcessor);
    },
    setPlayer2Analyser: function () {
        // Create a new analyser from the audio context
        let radioPlayer2Analyser = s.radioPlayerAudioContext.createAnalyser();
        // Create a new script processor from the audio context
        let radioPlayout2ScriptProcessor = s.radioPlayerAudioContext.createScriptProcessor(2048, 1, 1);

        // Loops over each channel of the input stream. This will be at '1' as specified above.
        radioPlayout2ScriptProcessor.onaudioprocess = function () {
            // Get the bit count from the analyser
            var array = new Uint8Array(radioPlayer2Analyser.frequencyBinCount);
            radioPlayer2Analyser.getByteFrequencyData(array);

            // Calculate the average bit count
            let averageFrequencyDataPercentage = Math.average(array);

            if (averageFrequencyDataPercentage > 95) {
                $("#radio_player_2_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_2_volume_level").children(".progress_bar").removeClass("bg-success").addClass("bg-danger");
            }
            else {
                $("#radio_player_2_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_2_volume_level").children(".progress_bar").removeClass("bg-danger").addClass("bg-success");
            }

            if (s.radioPlayer2AudioRef.currentTime == s.radioPlayer2SongDuration) {
                radioPlayout.clearRadioPlayer2();
            }
        };

        Math.average = function (args) {
            var numbers;
            if (args[0] instanceof Array) {
                numbers = args[0];
            }
            else if (typeof args[0] == "number") {
                numbers = args;
            }
            var sum = 0;
            var average = 0;
            for (var i = 0; i < numbers.length; i++) {
                sum += numbers[i];
            }
            average = sum / numbers.length;
            return average;
        };

        s.radioPlayer2ElementSource.connect(radioPlayer2Analyser);
        radioPlayout2ScriptProcessor.connect(s.radioPlayerAudioContext.destination);
        radioPlayer2Analyser.connect(radioPlayout2ScriptProcessor);
    },
    loadPlayer1Track: function (trackData) {
        // Set the audio track source
        s.radioPlayer1AudioRef.setAttribute('src', "Content/Audio/" + trackData.AudioLocation);

        // When the track has loaded
        s.radioPlayer1AudioRef.onloadeddata = function () {
            s.radioPlayer1Locked = true;
            s.radioPlayer1AudioRef.volume = 0.75;
            s.radioPlayer1SongDuration = s.radioPlayer1AudioRef.duration;
            $("#radio_player_1_artist_name").text(trackData.ArtistName);
            $("#radio_player_1_song_title").text(trackData.AudioTitle);
            $("#radio_player_1_duration").text(radioPlayout.convertSecondsToMinutes(s.radioPlayer1SongDuration));


            $(s.radioPlayer1AudioRef).on('timeupdate', function () {
                let timeRemaining = radioPlayout.convertSecondsToMinutes(s.radioPlayer1SongDuration - s.radioPlayer1AudioRef.currentTime);

                // When the intro to the track is playing display green
                if (trackData.AudioIn > 0 && trackData.AudioIn > s.radioPlayer1AudioRef.currentTime) {
                    $("#radio_player_1_duration").text(radioPlayout.convertSecondsToMinutes(trackData.AudioIn - s.radioPlayer1AudioRef.currentTime));
                    $("#radio_player_1_duration").css("background-color", "green");
                }
                // When the outro to the track is playing display red
                else if (trackData.AudioOut > 0 && trackData.AudioOut < (s.radioPlayer1AudioRef.currentTime)) {
                    $("#radio_player_1_duration").text(timeRemaining);
                    $("#radio_player_1_duration").css("background-color", "red");
                }
                else {
                    $("#radio_player_1_duration").css("background-color", "");
                    $("#radio_player_1_duration").text(timeRemaining);
                }

                $("#radio_player_1_duration_bar").children(".progress-bar").css({ "width": (s.radioPlayer1AudioRef.currentTime / s.radioPlayer1SongDuration) * 100 + "%" });
                $("#radio_player_1_duration_bar").children(".progress-bar").text(radioPlayout.convertSecondsToMinutes(s.radioPlayer1AudioRef.currentTime));
            });
        };
    },
    loadPlayer2Track: function (trackData) {
        // Set the audio track source
        s.radioPlayer2AudioRef.setAttribute('src', "Content/Audio/" + trackData.AudioLocation);

        // When the track has loaded
        s.radioPlayer2AudioRef.onloadeddata = function () {
            s.radioPlayer2Locked = true;
            s.radioPlayer2AudioRef.volume = 0.75;
            s.radioPlayer2SongDuration = s.radioPlayer2AudioRef.duration;
            $("#radio_player_2_artist_name").text(trackData.ArtistName);
            $("#radio_player_2_song_title").text(trackData.AudioTitle);
            $("#radio_player_2_duration").text(radioPlayout.convertSecondsToMinutes(s.radioPlayer2SongDuration));


            $(s.radioPlayer2AudioRef).on('timeupdate', function () {
                let timeRemaining = radioPlayout.convertSecondsToMinutes(s.radioPlayer2SongDuration - s.radioPlayer2AudioRef.currentTime);

                // When the intro to the track is playing display green
                if (trackData.AudioIn > 0 && trackData.AudioIn > s.radioPlayer2AudioRef.currentTime) {
                    $("#radio_player_2_duration").text(radioPlayout.convertSecondsToMinutes(trackData.AudioIn - s.radioPlayer2AudioRef.currentTime));
                    $("#radio_player_2_duration").css("background-color", "green");
                }
                // When the outro to the track is playing display red
                else if (trackData.AudioOut > 0 && trackData.AudioOut < (s.radioPlayer2AudioRef.currentTime)) {
                    $("#radio_player_2_duration").text(timeRemaining);
                    $("#radio_player_2_duration").css("background-color", "red");
                }
                else {
                    $("#radio_player_2_duration").css("background-color", "");
                    $("#radio_player_2_duration").text(timeRemaining);
                }

                $("#radio_player_2_duration_bar").children(".progress-bar").css({ "width": (s.radioPlayer2AudioRef.currentTime / s.radioPlayer2SongDuration) * 100 + "%" });
                $("#radio_player_2_duration_bar").children(".progress-bar").text(radioPlayout.convertSecondsToMinutes(s.radioPlayer2AudioRef.currentTime));
            });
        };
    },
    clearRadioPlayer1: function () {
        // Remove the attributes from Radio Player 1
        s.radioPlayer1AudioRef.removeAttribute("src");
        $("#radio_player_1_artist_name").text("Player Waiting For Audio");
        $("#radio_player_1_song_title").html("<br>");
        $("#radio_player_1_duration").text("00:00:00");
        $("#radio_player_1_duration").css("background-color", "");

        s.radioPlayer1Locked = false;

        $("#radio_player_1_duration_bar").children(".progress-bar").css({ "width": "0%" });
        $("#radio_player_1_duration_bar").children(".progress-bar").text("00:00:00");
    },
    clearRadioPlayer2: function () {
        // Remove the attributes from Radio Player 2
        s.radioPlayer2AudioRef.removeAttribute("src");
        $("#radio_player_2_artist_name").text("Player Waiting For Audio");
        $("#radio_player_2_song_title").html("<br>");
        $("#radio_player_2_duration").text("00:00:00");
        $("#radio_player_2_duration").css("background-color", "");

        s.radioPlayer2Locked = false;

        $("#radio_player_2_duration_bar").children(".progress-bar").css({ "width": "0%" });
        $("#radio_player_2_duration_bar").children(".progress-bar").text("00:00:00");
    },
    clickSongDuration: function (songDurationBar, clickEvent, playerSong, audioRef) {
        let x = clickEvent.offsetX;
        let width = songDurationBar.width();

        // Find the percentage of the bar clicked
        let percentage = (x / width) * 100;

        let percentageOfSong = playerSong * (percentage / 100);
        let songPositionCombined = radioPlayout.convertSecondsToMinutes(percentageOfSong);

        audioRef.currentTime = percentageOfSong;
        songDurationBar.children(".progress-bar").css({ "width": percentage + "%" });
        songDurationBar.children(".progress-bar").text(songPositionCombined);
    },
    loadCurrentTrack: function () {
        // Find the track that has the ID of 'current_track' and get the audio_id
        let currentTrackId = $(".current_track").data("audio_id");

        // Load the track meta data
        radioPlayout.getTrackData(currentTrackId, function (currentTrackData) {
            // Check for an available player
            if (!s.radioPlayer1Locked) {
                // Pass the track data in order for it to be loaded
                radioPlayout.loadPlayer1Track(currentTrackData);

                // Once the track has been loaded run the rest of the schedule items
                radioPlayout.runScheduleItems(s.radioPlayer1AudioRef);
            }
            else if (!s.radioPlayer2Locked) {
                // Pass the track data in order for it to be loaded
                radioPlayout.loadPlayer2Track(currentTrackData);

                // Once the track has been loaded run the rest of the schedule items
                radioPlayout.runScheduleItems(s.radioPlayer2AudioRef);
            }
            else {
                // If both of the tracks are locked there has been an error
                // TODO: This needs to be handled,
                console.log("An error occured");
            }
        });
    },
    runScheduleItems: function (currentTrackPlayerRef) {
        // Next Radio Player placeholder
        let nextTrackPlayerRef;
        // Next track loaded reference
        let nextTrackLoaded = false;
        // Schedule classes changed reference
        let scheduleClassChange = false;

        // Track the current audio player
        $(currentTrackPlayerRef).on("timeupdate", function () {
            // Get the current time in the track
            let currentTime = radioPlayout.convertSecondsToMinutes(currentTrackPlayerRef.currentTime);
            // Minus the current time from the tracks duration to get the remaining time
            let timeRemaining = radioPlayout.convertSecondsToMinutes(currentTrackPlayerRef.duration - currentTrackPlayerRef.currentTime);

            // If there are less than 30 seconds of the song left and the next song has not already been loaded
            if (timeRemaining < 0.30 && !nextTrackLoaded) {
                // Start loading the next track
                // Find the track that has the ID of 'next_track' and get the audio_id
                let nextTrackId = $(".next_track").data("audio_id");

                if (nextTrackId) {
                    // Load the track meta data
                    radioPlayout.getTrackData(nextTrackId, function (nextTrackData) {
                        // Find a radio player that isn't locked
                        if (!s.radioPlayer1Locked) {
                            // If Radio Player 1 isn't locked
                            // Set the local variable to a reference of Radio Player 1
                            nextTrackPlayerRef = s.radioPlayer1AudioRef;
                            // Load the next track onto Radio Player 1 by passing the track data
                            radioPlayout.loadPlayer1Track(nextTrackData);
                            // Set the variable to let the function know that this function has ran
                            nextTrackLoaded = true;
                        }
                        else if (!s.radioPlayer2Locked) {
                            // If Radio Player 2 isn't locked
                            // Set the local variable to a reference of Radio Player 2
                            nextTrackPlayerRef = s.radioPlayer2AudioRef;
                            // Load the next track onto Radio Player 2 by passing the track data
                            radioPlayout.loadPlayer2Track(nextTrackData);
                            // Set the varaible to let the function know that this function has ran
                            nextTrackLoaded = true;
                        }
                        else {
                            // If both of the players are locked then an error has occured
                            // TODO: This needs to be handled
                            console.log("An error occured");
                        }
                    });
                }
                else {
                    // TODO: No audio item found
                }
            }

            // If there are less than 5 seconds of the song remaining, start playing the next song
            // TODO: This variable needs to change based on the END and START of either track
            if (timeRemaining < 0.05) {
                if (nextTrackPlayerRef) {
                    // Get the schedule content progress indication
                    if ($(".current_track").find(".fa-play").length > 0 || s.autoDJ) {
                        nextTrackPlayerRef.play();
                    }
                }
            }

            // If there is no time remaining
            if (timeRemaining <= 0 && !scheduleClassChange) {
                $(currentTrackPlayerRef).off("timeupdate");
                scheduleClassChange = true;
                // Remove the current_track class and add played_track to the track just played
                $(".current_track").removeClass("current_track").addClass("played_track");

                // Move the next track to the current track
                $(".next_track").addClass("current_track");

                // From the next_track item find the next track and add next_track
                $(".next_track").next().addClass("next_track");

                $(".next_track.current_track").removeClass("next_track");

                radioPlayout.runScheduleItems(nextTrackPlayerRef);
            }
        });
    },
    getTrackData: function (audioId, callbackFunction) {
        $.ajax({
            url: $("#music_catalogue_outer").data("request-url"),
            type: "POST",
            data: { "audioId": audioId },
            success: function (result) {
                callbackFunction(result[0]);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Unable to retrieve track information.");
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        })
    },
    convertSecondsToMinutes: function (durationSeconds) {
        let minutes = parseInt(durationSeconds / 60);
        let seconds = parseInt(durationSeconds % 60) < 10 ? "0" + parseInt(durationSeconds % 60).toString() : parseInt(durationSeconds % 60);

        let minutesAndSeconds = minutes.toString() + "." + seconds.toString();
        return minutesAndSeconds;
    },
    connectWebcast: function() {
        //WebCaster.js API
        // Initialise an MP3 encoder
        var encoder = new Webcast.Encoder.Mp3({
            channels: 2,
            samplerate: 44100,
            bitrate: 128
        });
        // If the Web Audio API sample rate is not equal to 44100, resample the encoder
        if (s.radioPlayerAudioContext.sampleRate !== 44100) {
            encoder = new Webcast.Encoder.Resample({
                encoder: encoder,
                samplerate: 192000
            });
        }

        // Add a webcast source to the Web Audio API audio context
        s.radioPlayerWebCast = s.radioPlayerAudioContext.createWebcastSource(4096, 2);
        // Add the track to the webcast
        s.radioPlayer1ElementSource.connect(s.radioPlayerWebCast);
        s.radioPlayer2ElementSource.connect(s.radioPlayerWebCast);
        // Add the final Web Audio API node to the webcast
        s.radioPlayerWebCast.connect(s.radioPlayerAudioContext.destination);
        // Connect the webcast to the web socket
        s.radioPlayerWebCast.connectSocket(encoder, "ws://source:hackme@51.141.104.113:8080/mount");
    },
}

const pressToTalk = {
    settings: {
        microphoneInput: null
    },
    init: function () {
        pressToTalk.bindUIActions();
        pressToTalk.getUserMicrophone();
    },
    bindUIActions: function () {
        $(".press_to_talk_button").click(function () {
            if ($(this).hasClass("mic_live")) {
                $(this).removeClass("mic_live");
            }
            else {
                $(this).addClass("mic_live");
                let microphone_key = $('#user_microphone_select').find(":selected").val();
                pressToTalk.connectUserMicrophone(microphone_key);
            }
        });

        $("#show_press_to_talk_modal").click(function () {
            $("#press_to_talk_modal").modal("show");

            pressToTalk.getUserMicrophone();
        });

        $("#select_local_microphone_btn").click(function () {
            $("#press_to_talk_modal").modal("hide");
        });
    },
    getUserMicrophone: function () {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(
                devices = devices.filter((d) => d.kind === 'audioinput'));

            let microphone_html = "";
            $.each(devices, function (key, value) {
                if (value.label != "") {
                    microphone_html = microphone_html + "<option value=" + key + ">" + value.label + "</option>";
                }
            });

            if (microphone_html != "") {
                $("#user_microphone_select").empty();
                $("#user_microphone_select").append(microphone_html);
            }
            else {
                $("#user_microphone_select").empty();
                $("#user_microphone_select").append("<option selected disabled>No microphones found.</option>");
            }
        });
    },
    connectUserMicrophone: function (microphone_id) {
        navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: microphone_id,
            }
        }).then((stream) => {
            microphoneStream = radioPlayout.settings.radioPlayerAudioContext.createMediaStreamSource(stream);
            microphoneStream.connect(radioPlayout.settings.radioPlayerAudioContext.destination);
            microphoneStream.connect(radioPlayout.settings.radioPlayerWebCast);

            $(".press_to_talk_button").click(function () {
                    microphoneStream.disconnect(radioPlayout.settings.radioPlayerAudioContext.destination);
                    microphoneStream.disconnect(radioPlayout.settings.radioPlayerWebCast);
            });
        });
    }
}

const musicLibrary = {
    settings: {
        modalOuter: null
    },
    init: function () {
        musicLibrary.filterMusicLibrary();
        musicLibrary.bindUIAction();
    },
    bindUIAction: function () {
        s.modalOuter = $("#music_library_modal");

        $("#musicLibraryBtn").click(function () {
            $("#music_library_modal").modal('show');
        });

        $(".music_library_item").draggable({
            connectToSortable: "#schedule_content_items_outer",
            helper: "clone",
            revert: "invalid"
        });

        $("#filter_music_library_form").on('submit', function (e) {
            e.preventDefault();
            musicLibrary.filterMusicLibrary($(this).serialize());
        });

        $("#filter_music_library_reset_btn").click(function () {
            musicLibrary.filterMusicLibrary(null);
        });
    },
    filterMusicLibrary: function(filterData) {
        $.ajax({
            url: $("#music_catalogue_items_outer").data("request-url"),
            type: "POST",
            data: filterData,
            success: function (result) {
                musicLibrary.populateMusicLibrary(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        })
    },
    populateMusicLibrary: function (audio_items) {
        let musicCatalogueHTML = "";

        $("#music_library_results_returned").text(audio_items.length + " results returned.");

        $.each(audio_items, function (key, value) {
            musicCatalogueHTML = musicCatalogueHTML + '<div class="row no-gutters border border-dark align-items-center music_library_item" data-audio_id=' + value.AudioId + ' draggable=true >' +
                '<div class="col-8">' +
                    '<ul class="list-unstyled m-0 text-truncate pl-1" >' +
                        '<li>' + value.ArtistName + '</li>' +
                        '<li>' + value.AudioTitle + '</li>' +
                    '</ul>' +
                '</div>' +
                '<div class="col-4">' +
                    '<ul class="list-unstyled m-0 text-truncate text-right pr-1">' +
                        '<li>' + value.AudioDuration + '</li>' +
                        '<li>IN ' + value.AudioIn + '</li>' +
                    '</ul>' +
                '</div>' +
                '</div>';
        });

        $("#music_catalogue_items_outer").html(musicCatalogueHTML);
        musicLibrary.bindUIAction();
    }
};

const schedule = {
    settings: {
        scheduleDate: new Date()
    },
    init: function () {
        s = schedule.settings;

        schedule.bindUIAction();
    },
    bindUIAction: function () {
        $(".schedule_content_progress_indicator").click(function (e) {
            schedule.progressIndicatorChange($(this));
        });

        $("#schedule_content_items_outer").on('dragover', function (e) {
            // Trigger when a schedule item is dragged over itself
            e.preventDefault();
            e.stopPropagation();
        });

        $("#schedule_content_items_outer").sortable({
            items: ".schedule_content_item:not(.played_track,.current_track,.next_track)",
            update: function (event, ui) {
                if ($(ui.item[0]).hasClass("music_library_item")) {
                    radioPlayout.getTrackData($(ui.item[0]).data("audio_id"), function (audio_values) {
                        // Item has come from the music library
                        // Reset the class of the item 
                        $(ui.item[0]).attr("class", "row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect")
                        // Remove the items styling
                        $(ui.item[0]).removeAttr("style");
                        // Empty the elements from the item
                        $(ui.item[0]).empty();

                        let scheduleItemHTML =
                            '<div class="col-2 schedule_item_time">00:00:00</div>' +
                            '<div class="col-7">' +
                            '<ul class="list-unstyled m-0 text-truncate">' +
                            '<li>' + audio_values.ArtistName + '</li>' +
                            '<li>' + audio_values.AudioTitle + '</li>' +
                            '</ul>' +
                            '</div>' +
                            '<div class="col-2">' +
                            '<ul class="list-unstyled m-0">' +
                            '<li class="schedule_item_duration">' + audio_values.AudioDuration + '</li>' +
                            '<li>IN ' + audio_values.AudioIn + '</li>' +
                            '</ul>' +
                            '</div>' +
                            '<div class="col-1 schedule_content_progress_indicator"><i class="fas fa-play pointer"></i></div>';
                        // Add the new items as HTML
                        $(ui.item[0]).append(scheduleItemHTML);

                        $(".schedule_content_progress_indicator").off("click");
                        $(".schedule_content_progress_indicator").click(function (e) {
                            schedule.progressIndicatorChange($(this));
                        });

                        if ($("#schedule_content_items_outer").find(".current_track").length == 0) {
                            $(ui.item[0]).addClass("current_track");
                            radioPlayout.loadCurrentTrack();
                        }
                        else if ($("#schedule_content_items_outer").find(".next_track").length == 0) {
                            $(ui.item[0]).addClass("next_track");
                        }

                        schedule.calculateScheduleTimes();
                    });
                }
                else {
                    schedule.calculateScheduleTimes();
                }
            }
        });

        $('.dropdown-menu').click(function (e) {
            e.stopPropagation();
        });

        $("#schedule_clock_options").on("change", function () {
            schedule.changeScheduleClock($(this).val());
        });
    },
    progressIndicatorChange: function (selectedElement) {
        // When the user changes the progress selection on an individual schedule item
        if ($(selectedElement).children().hasClass("fa-play")) {
            $(selectedElement).children().removeClass("fa-play").addClass("fa-pause");
        }
        else {
            $(selectedElement).children().removeClass("fa-pause").addClass("fa-play");
        }
    },
    calculateScheduleTimes: function () {
        let currentTime = 0;

        // Set the time each item is predicted to be played at
        $(".schedule_content_item ").each(function (index) {
            if ($(this).find(".schedule_item_duration")[0].innerHTML.match("^\\d+$")) {
                currentTime = parseInt(currentTime) + parseInt($(this).find(".schedule_item_duration")[0].innerHTML);

                let date = new Date(schedule.settings.scheduleDate);
                date.setSeconds(currentTime);

                $(this).find(".schedule_item_time")[0].innerHTML = date.toISOString().substr(11, 8);
            }
        });

        // Set the hour duration time
        let date = new Date(null);
        date.setSeconds(currentTime);
        $("#schedule_hour_duration")[0].innerHTML = date.toISOString().substr(11, 8);

        // Set whether the hour will be over/under run
        if (currentTime == 3600) {
            $("#schedule_hour_running")[0].innerHTML = "Overrun: 00:00:00";
        }
        else if (currentTime < 3600) {
            let date = new Date(null);
            date.setSeconds(3600 - currentTime);

            $("#schedule_hour_running")[0].innerHTML = "Underrun: " + date.toISOString().substr(11, 8);
        }
        else {
            let date = new Date(null);
            date.setSeconds(currentTime - 3600);

            $("#schedule_hour_running")[0].innerHTML = "Overrun: " + date.toISOString().substr(11, 8);
        }
    },
    changeScheduleClock: function (scheduleClockId) {
        $.ajax({
            type: "POST",
            url: $("#schedule_clock_options").data("get-clock"),
            data: {
                scheduleClockId: scheduleClockId
            },
            success: function (scheduleClock) {
                schedule.loadScheduleClockItems(scheduleClock);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error generating schedule clock");
            }
        })
    },
    loadScheduleClockItems: function (scheduleClock) {
        $("#schedule_content_items_outer").empty();

        $.each(scheduleClock, function (key, value) {
            let scheduleItemHTML = "";

            if (key == 0) {
                scheduleItemHTML = scheduleItemHTML + "<div class='row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect current_track' data-audio_id='" + value.AudioId + "'>";
            }
            else if (key == 1) {
                scheduleItemHTML = scheduleItemHTML + "<div class='row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect next_track' data-audio_id='" + value.AudioId + "'>";
            }
            else {
                scheduleItemHTML = scheduleItemHTML + "<div class='row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect' data-audio_id='" + value.AudioId + "'>";
            }

            scheduleItemHTML = scheduleItemHTML + '<div class="col-2 schedule_item_time">00:00:00</div>' +
                '<div class="col-7">' +
                '<ul class="list-unstyled m-0 text-truncate">' +
                '<li>' + value.ArtistName + '</li>' +
                '<li>' + value.AudioTitle + '</li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-2">' +
                '<ul class="list-unstyled m-0">' +
                '<li class="schedule_item_duration">' + value.AudioDuration + '</li>' +
                '<li>IN ' + value.AudioIn + '</li>' +
                '</ul>' +
                '</div>' +
                '<div class="col-1 schedule_content_progress_indicator"><i class="fas fa-play pointer"></i></div>';

            $("#schedule_content_items_outer").append(scheduleItemHTML);
        });

        // Set the event handlers for the progression indicators
        $(".schedule_content_progress_indicator").off("click");
        $(".schedule_content_progress_indicator").click(function (e) {
            schedule.progressIndicatorChange($(this));
        });

        // Load the current track into the player
        radioPlayout.loadCurrentTrack();

        // Calculate schedule times
        schedule.calculateScheduleTimes();
    }
};

$(document).ready(function () {
    $.event.addProp('dataTransfer');

    enterRadioPlayoutModal.init();
    pressToTalk.init();
    schedule.init();
    musicLibrary.init();
});