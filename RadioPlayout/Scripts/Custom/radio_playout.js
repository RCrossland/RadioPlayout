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
            radioPlayout.setPlayerAudioContext();
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

        radioPlayer1Locked: false,
        radioPlayer2Locked: false,

        radioPlayout1SongDuration: 10,
        radioPlayout2SongDuration: 0.00,

        radioPlayout1AudioRef: null,
        radioPlayout2AudioRef: null,

        radioPlayout1AudioContext: null,
        radioPlayout1Analyser: null,
        radioPlayout1ScriptProcessor: null,
        radioPlayout1ElementSource: null,

        radioPlayout2AudioContext: null,
        radioPlayout2Analyser: null,
        radioPlayout2ScriptProcessor: null,
        radioPlayout2ElementSource: null
    },
    init: function () {
        s = radioPlayout.settings;

        radioPlayout.bindUIAction();
    },
    bindUIAction: function () {
        $("#radio_player_1_duration_bar").click(function (e) {
            radioPlayout.clickSongDuration($(this), e, s.radioPlayout1SongDuration, s.radioPlayout1AudioRef);
        });

        $("#radio_player_2_duration_bar").click(function (e) {
            radioPlayout.clickSongDuration($(this), e, s.radioPlayout2SongDuration, s.radioPlayout2AudioRef);
        });

        $("#radio_player_1_play").click(function (e) {
            s.radioPlayout1ElementSource.connect(s.radioPlayout1Analyser);
            s.radioPlayout1Analyser.connect(s.radioPlayout1ScriptProcessor);
            s.radioPlayout1ElementSource.connect(s.radioPlayout1AudioContext.destination);
            s.radioPlayout1ScriptProcessor.connect(s.radioPlayout1AudioContext.destination);

            s.radioPlayout1AudioRef.play();
        });

        $("#radio_player_1_pause").click(function (e) {
            s.radioPlayout1ElementSource.disconnect(s.radioPlayout1Analyser);
            s.radioPlayout1Analyser.disconnect(s.radioPlayout1ScriptProcessor);
            s.radioPlayout1ElementSource.disconnect(s.radioPlayout1AudioContext.destination);
            s.radioPlayout1ScriptProcessor.disconnect(s.radioPlayout1AudioContext.destination);

            s.radioPlayout1AudioRef.pause();
        });

        $("#radio_player_1_eject").click(function () {
            radioPlayout.clearRadioPlayer1();
        });

        $("#radio_player_1_volume_slider").on('input', function (e) {
            s.radioPlayout1AudioRef.volume = ($(this)[0].value / 100);
        });

        $("#radio_player_2_play").click(function (e) {
            s.radioPlayout2ElementSource.connect(s.radioPlayout2Analyser);
            s.radioPlayout2Analyser.connect(s.radioPlayout2ScriptProcessor);
            s.radioPlayout2ElementSource.connect(s.radioPlayout2AudioContext.destination);
            s.radioPlayout2ScriptProcessor.connect(s.radioPlayout2AudioContext.destination);

            s.radioPlayout2AudioRef.play();
        }),

            $("#radio_player_2_pause").click(function (e) {
                s.radioPlayout2ElementSource.disconnect(s.radioPlayout2Analyser);
                s.radioPlayout2Analyser.disconnect(s.radioPlayout2ScriptProcessor);
                s.radioPlayout2ElementSource.disconnect(s.radioPlayout2AudioContext.destination);
                s.radioPlayout2ScriptProcessor.disconnect(s.radioPlayout2AudioContext.destination);

                s.radioPlayout2AudioRef.pause();
            });

        $("#radio_player_2_eject").click(function () {
            radioPlayout.clearRadioPlayer2();
        });

        $("#radio_player_2_volume_slider").change(function (e) {
            s.radioPlayout2AudioRef.volume = ($(this)[0].value / 100);
        });

        $(".push_to_talk_button").click(function () {
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
    setPlayerAudioContext: function () {
        // For legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        radioPlayout.init();

        s.radioPlayout1AudioRef = $("#radio_player_1_audio")[0];
        s.radioPlayout1AudioContext = new AudioContext();
        radioPlayout.setPlayer1Analyser();

        s.radioPlayout2AudioRef = $("#radio_player_2_audio")[0];
        s.radioPlayout2AudioContext = new AudioContext();
        radioPlayout.setPlayer2Analyser();

        radioPlayout.loadCurrentTrack();
    },
    setPlayer1Analyser: function () {
        // Reference the radioPlayout1 to allow the audio context to manipulate the output.
        s.radioPlayout1ElementSource = s.radioPlayout1AudioContext.createMediaElementSource(s.radioPlayout1AudioRef);

        // Creates an analyser which is to be used to expose audio time and frequency data.
        s.radioPlayout1Analyser = s.radioPlayout1AudioContext.createAnalyser();
        // s.radioPlayout1Analyser.smoothingTimeConstant = 0.3;
        // s.radioPlayout1Analyser.fftSize = 1024;

        // Allows the generation processing or analysing of audio data. (buffer_size, no. of input channels, no. of output channels)
        s.radioPlayout1ScriptProcessor = s.radioPlayout1AudioContext.createScriptProcessor(2048, 1, 1);
        // Loops over each channel of the input stream. This will be at '1' as specified above.
        s.radioPlayout1ScriptProcessor.onaudioprocess = function () {
            var array = new Uint8Array(s.radioPlayout1Analyser.frequencyBinCount);
            s.radioPlayout1Analyser.getByteFrequencyData(array);

            let averageFrequencyDataPercentage = Math.average(array);

            if (averageFrequencyDataPercentage > 95) {
                $("#radio_player_1_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_1_volume_level").children(".progress_bar").removeClass("bg-success").addClass("bg-danger");
            }
            else {
                $("#radio_player_1_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_1_volume_level").children(".progress_bar").removeClass("bg-danger").addClass("bg-success");
            }

            // When the song has finished, clear the player
            if (s.radioPlayout1AudioRef.currentTime == s.radioPlayout1SongDuration) {
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
    },
    setPlayer2Analyser: function () {
        // Reference the radioPlayout1 to allow the audio context to manipulate the output.
        s.radioPlayout2ElementSource = s.radioPlayout2AudioContext.createMediaElementSource(s.radioPlayout2AudioRef);

        // Creates an analyser which is to be used to expose audio time and frequency data.
        s.radioPlayout2Analyser = s.radioPlayout2AudioContext.createAnalyser();
        // s.radioPlayout1Analyser.smoothingTimeConstant = 0.3;
        // s.radioPlayout1Analyser.fftSize = 1024;

        // Allows the generation processing or analysing of audio data. (buffer_size, no. of input channels, no. of output channels)
        s.radioPlayout2ScriptProcessor = s.radioPlayout2AudioContext.createScriptProcessor(2048, 1, 1);
        // Loops over each channel of the input stream. This will be at '1' as specified above.
        s.radioPlayout2ScriptProcessor.onaudioprocess = function () {
            var array = new Uint8Array(s.radioPlayout2Analyser.frequencyBinCount);
            s.radioPlayout2Analyser.getByteFrequencyData(array);

            let averageFrequencyDataPercentage = Math.average(array);

            if (averageFrequencyDataPercentage > 95) {
                $("#radio_player_2_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_2_volume_level").children(".progress_bar").removeClass("bg-success").addClass("bg-danger");
            }
            else {
                $("#radio_player_2_volume_level").children(".progress_bar").css({ "height": averageFrequencyDataPercentage + "%" });
                $("#radio_player_2_volume_level").children(".progress_bar").removeClass("bg-danger").addClass("bg-success");
            }

            if (s.radioPlayout2AudioRef.currentTime == s.radioPlayout2SongDuration) {
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
    },
    loadPlayer1Track: function (trackData) {
        s.radioPlayout1AudioRef.setAttribute('src', trackData.AudioLocation);

        s.radioPlayout1AudioRef.onloadeddata = function () {
            s.radioPlayer1Locked = true;
            s.radioPlayout1AudioRef.volume = 0.75;
            s.radioPlayout1SongDuration = s.radioPlayout1AudioRef.duration;
            $("#radio_player_1_artist_name").text(trackData.ArtistName);
            $("#radio_player_1_song_title").text(trackData.AudioTitle);
            $("#radio_player_1_duration").text(radioPlayout.convertSecondsToMinutes(s.radioPlayout1SongDuration));


            $(s.radioPlayout1AudioRef).on('timeupdate', function () {
                let currentTime = radioPlayout.convertSecondsToMinutes(s.radioPlayout1AudioRef.currentTime);
                let timeRemaining = radioPlayout.convertSecondsToMinutes(s.radioPlayout1SongDuration - s.radioPlayout1AudioRef.currentTime);

                // When the intro to the track is playing display green
                if (trackData.AudioIn > 0 && trackData.AudioIn > s.radioPlayout1AudioRef.currentTime) {
                    $("#radio_player_1_duration").text(radioPlayout.convertSecondsToMinutes(trackData.AudioIn - s.radioPlayout1AudioRef.currentTime));
                    $("#radio_player_1_duration").css("background-color", "green");
                }
                // When the outro to the track is playing display red
                else if (trackData.AudioOut > 0 && trackData.AudioOut > (s.radioPlayout1AudioRef.duration - s.radioPlayout1AudioRef.currentTime)) {
                    $("#radio_player_1_duration").text(timeRemaining);
                    $("#radio_player_1_duration").css("background-color", "red");
                }
                else {
                    $("#radio_player_1_duration").css("background-color", "");
                    $("#radio_player_1_duration").text(timeRemaining);
                }

                $("#radio_player_1_duration_bar").children(".progress-bar").css({ "width": (s.radioPlayout1AudioRef.currentTime / s.radioPlayout1SongDuration) * 100 + "%" });
                $("#radio_player_1_duration_bar").children(".progress-bar").text(radioPlayout.convertSecondsToMinutes(s.radioPlayout1AudioRef.currentTime));
            });
        };
    },
    loadPlayer2Track: function (trackData) {
        s.radioPlayout2AudioRef.setAttribute('src', trackData.AudioLocation);

        s.radioPlayout2AudioRef.onloadeddata = function () {
            s.radioPlayer2Locked = true;
            s.radioPlayout2AudioRef.volume = 0.75;
            s.radioPlayout2SongDuration = s.radioPlayout2AudioRef.duration;
            $("#radio_player_2_artist_name").text(trackData.ArtistName);
            $("#radio_player_2_song_title").text(trackData.AudioTitle);
            $("#radio_player_2_duration").text(radioPlayout.convertSecondsToMinutes(s.radioPlayout2SongDuration));

            $(s.radioPlayout2AudioRef).on('timeupdate', function () {
                let currentTime = radioPlayout.convertSecondsToMinutes(s.radioPlayout2AudioRef.currentTime);
                let timeRemaining = radioPlayout.convertSecondsToMinutes(s.radioPlayout2SongDuration - s.radioPlayout2AudioRef.currentTime);

                // When the intro to the track is playing display green
                if (trackData.AudioIn > 0 && trackData.AudioIn > s.radioPlayout2AudioRef.currentTime) {
                    $("#radio_player_2_duration").text(radioPlayout.convertSecondsToMinutes(trackData.AudioIn - s.radioPlayout2AudioRef.currentTime));
                    $("#radio_player_2_duration").css("background-color", "green");
                }
                // When the outro to the track is playing display red
                else if (trackData.AudioOut > 0 && trackData.AudioOut > (s.radioPlayout2AudioRef.duration - s.radioPlayout2AudioRef.currentTime)) {
                    $("#radio_player_2_duration").text(timeRemaining);
                    $("#radio_player_2_duration").css("background-color", "red");
                }
                else {
                    $("#radio_player_2_duration").css("background-color", "");
                    $("#radio_player_2_duration").text(timeRemaining);
                }

                $("#radio_player_2_duration_bar").children(".progress-bar").css({ "width": (s.radioPlayout2AudioRef.currentTime / s.radioPlayout2SongDuration) * 100 + "%" });
                $("#radio_player_2_duration_bar").children(".progress-bar").text(radioPlayout.convertSecondsToMinutes(s.radioPlayout2AudioRef.currentTime));
            });
        };
    },
    clearRadioPlayer1: function () {
        // Remove the attributes from Radio Player 1
        s.radioPlayout1AudioRef.removeAttribute("src");
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
        s.radioPlayout2AudioRef.removeAttribute("src");
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
    convertSecondsToMinutes: function (durationSeconds) {
        let minutes = parseInt(durationSeconds / 60);
        let seconds = parseInt(durationSeconds % 60) < 10 ? "0" + parseInt(durationSeconds % 60).toString() : parseInt(durationSeconds % 60);

        let minutesAndSeconds = minutes.toString() + "." + seconds.toString();
        return minutesAndSeconds;
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
                radioPlayout.runScheduleItems(s.radioPlayout1AudioRef);
            }
            else if (!s.radioPlayer2Locked) {
                // Pass the track data in order for it to be loaded
                radioPlayout.loadPlayer2Track(currentTrackData);

                // Once the track has been loaded run the rest of the schedule items
                radioPlayout.runScheduleItems(s.radioPlayout2AudioRef);
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
                            nextTrackPlayerRef = s.radioPlayout1AudioRef;
                            // Load the next track onto Radio Player 1 by passing the track data
                            radioPlayout.loadPlayer1Track(nextTrackData);
                            // Set the variable to let the function know that this function has ran
                            nextTrackLoaded = true;

                            s.radioPlayout1ElementSource.connect(s.radioPlayout1Analyser);
                            s.radioPlayout1Analyser.connect(s.radioPlayout1ScriptProcessor);
                            s.radioPlayout1ElementSource.connect(s.radioPlayout1AudioContext.destination);
                            s.radioPlayout1ScriptProcessor.connect(s.radioPlayout1AudioContext.destination);
                        }
                        else if (!s.radioPlayer2Locked) {
                            // If Radio Player 2 isn't locked
                            // Set the local variable to a reference of Radio Player 2
                            nextTrackPlayerRef = s.radioPlayout2AudioRef;
                            // Load the next track onto Radio Player 2 by passing the track data
                            radioPlayout.loadPlayer2Track(nextTrackData);
                            // Set the varaible to let the function know that this function has ran
                            nextTrackLoaded = true;

                            s.radioPlayout2ElementSource.connect(s.radioPlayout2Analyser);
                            s.radioPlayout2Analyser.connect(s.radioPlayout2ScriptProcessor);
                            s.radioPlayout2ElementSource.connect(s.radioPlayout2AudioContext.destination);
                            s.radioPlayout2ScriptProcessor.connect(s.radioPlayout2AudioContext.destination);
                        }
                        else {
                            // If both of the players are locked then an error has occured
                            // TODO: This needs to be handled
                            console.log("An error occured");
                        }
                    });
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
    }
};

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
        schedule: "1",
        scheduleDate: "27 February 2019 01:00"
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

                        schedule.calculateScheduleTimes();

                        schedule.addNewScheduleItem(schedule.settings.schedule, ui.item.data("audio_id"), ui.item.index() + 1);
                    });
                }
                else {
                    schedule.calculateScheduleTimes();

                    schedule.updateScheduleItemPosition(ui.item.data("schedule_id"), ui.item.index() + 1);
                }
            }
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

        // Update the database to reflect the change
        $.ajax({
            url: $("#schedule_content_items_outer").data("update-indicator-url"),
            type: "POST",
            data: { "scheduleItemId": $(selectedElement).data("schedule_item_id") },
            success: function (data) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // TODO: Add error messages when the schedule can't be loaded
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        })
    },
    getScheduleItems: function (scheduleId) {
        $.ajax({
            url: $("#schedule_content_items_outer").data("request-url"),
            type: "POST",
            data: { "scheduleId": scheduleId },
            success: function (scheduleItems) {
                $("#schedule_content_items_outer").empty();

                $.each(scheduleItems, function (index, value) {
                    let scheduleItemsHTML = "";
                    if (index == 0) {
                        scheduleItemsHTML = "<div class=\"row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect current_track\" data-audio_id=" + value.Audio.AudioId + " data-schedule_id=" + value.ScheduleItemsId + ">";
                    }
                    else if (index == 1) {
                        scheduleItemsHTML = "<div class=\"row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect next_track\" data-audio_id=" + value.Audio.AudioId + " data-schedule_id=" + value.ScheduleItemsId + ">"
                    }
                    else {
                        scheduleItemsHTML = "<div class=\"row no-gutters schedule_content_item border border-top-0 border-dark align-items-center text-center pointer noSelect\" data-audio_id=" + value.Audio.AudioId + " data-schedule_id=" + value.ScheduleItemsId + ">";
                    }

                    scheduleItemsHTML = scheduleItemsHTML + '<div class="col-2 schedule_item_time">00:00:00</div>' +
                        '<div class="col-7">' +
                            '<ul class="list-unstyled m-0 text-truncate">' +
                                '<li>' + value.Audio.ArtistName + '</li>' +
                                '<li>' + value.Audio.AudioTitle + '</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="col-2">' +
                            '<ul class="list-unstyled m-0">' +
                                '<li class="schedule_item_duration">' + value.Audio.AudioDuration + '</li>' +
                                '<li>IN ' + value.Audio.AudioIn + '</li>' +
                            '</ul>' +
                        '</div>';
                    if (value.PlayNextItem == 0) {
                        scheduleItemsHTML = scheduleItemsHTML + '<div class="col-1 schedule_content_progress_indicator" data-schedule_item_id=' + value.ScheduleItemsId + '><i class="fas fa-pause pointer"></i></div >';
                        } else {
                        scheduleItemsHTML = scheduleItemsHTML + '<div class="col-1 schedule_content_progress_indicator" data-schedule_item_id=' + value.ScheduleItemsId + '><i class="fas fa-play pointer"></i></div >';
                        }
                        scheduleItemsHTML = scheduleItemsHTML + '</div>';
                    $("#schedule_content_items_outer").append(scheduleItemsHTML);
                });

                schedule.bindUIAction();
                schedule.calculateScheduleTimes();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // TODO: Add error messages when the schedule can't be loaded
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        });
    },
    updateScheduleItemPosition: function (scheduleItemId, newItemOrderIndex) {
        $.ajax({
            url: $("#schedule_content_items_outer").data("update-url"),
            type: "POST",
            data: {
                "scheduleId": schedule.settings.schedule,
                "scheduleItemId": scheduleItemId,
                "newItemOrderIndex": newItemOrderIndex
            },
            success: function (data) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        });
    },
    addNewScheduleItem: function (scheduleId, audioId, orderIndex) {
        $.ajax({
            url: $("#schedule_content_items_outer").data("new-url"),
            method: "POST",
            data: {
                "scheduleId": scheduleId,
                "audioId": audioId,
                "orderIndex": orderIndex
            },
            success: function (data) {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //or you can put jqXHR.responseText somewhere as complete response. Its html.
            }
        })
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
    }
};

const autoDJSwitch = {
    settings: {

    },
    init: function () {
        autoDJSwitch.bindUIElements();
    },
    bindUIElements: function () {
        $(".auto_dj_switch").click(function () {
            if ($(this).hasClass("fa-rotate-180")) {
                // Auto DJ has been turned on
                $(this).css("color", "green");
                $(this).removeClass("fa-rotate-180");

                radioPlayout.autoDJ = true;
            }
            else {
                // Auto DJ has been turned off
                $(this).css("color", "red");
                $(this).addClass("fa-rotate-180");

                radioPlayout.autoDJ = false;
            }
        });
    }
};

$(document).ready(function () {
    $.event.addProp('dataTransfer');

    enterRadioPlayoutModal.init();
    schedule.init();
    musicLibrary.init();
    autoDJSwitch.init();

    schedule.getScheduleItems(1);
});