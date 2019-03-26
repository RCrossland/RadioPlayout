let s;

let manageUsers = {
    settings: {

    },
    init: function () {
        s = manageUsers.settings;

        manageUsers.bindUIActions();
    },
    bindUIActions: function () {
        $("#add_user_modal_toggle").click(function () {
            $("#add_user_modal").modal('show');
        });
    }
};

$(document).ready(function () {
    manageUsers.init();
});