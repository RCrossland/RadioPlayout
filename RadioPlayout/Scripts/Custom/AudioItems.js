let editAudioItems = {
    settings: {
        wavesurfer: null
    },
    init: function () {
        editAudioItems.bindUIElements();

        editAudioItems.settings.wavesurfer = WaveSurfer.create({
            container: '#waveform'
        });

        editAudioItems.loadWaveForm('/Content/Audio/Olly Murs - Excuses.wav');
    },
    bindUIElements: function () {
        $("#add_audio_button").click(function () {
            $("#audio_items_modal").modal('show');
        });

        $("#audio_modal_pause").click(function () {
            editAudioItems.settings.wavesurfer.pause();
        });

        $("#audio_modal_play").click(function () {
            editAudioItems.settings.wavesurfer.play();
        });
    },
    loadWaveForm: function (filePath) {
        editAudioItems.settings.wavesurfer.load('/Content/Audio/Olly Murs - Excuses.wav');

        editAudioItems.settings.wavesurfer.on('ready', function () {
            let date = new Date(null);
            date.setSeconds(editAudioItems.settings.wavesurfer.getDuration());

            $("#audioDuration").attr("placeholder", date.toISOString().substr(11, 8));
        });
    }
}

$(document).ready(function () {
    editAudioItems.init();
})