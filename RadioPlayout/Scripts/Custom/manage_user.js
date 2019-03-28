let s;

let manageUsers = {
    settings: {
        editUserSuccessRef: null,
        editUserErrorRef: null,
        editUserFirstNameRef: null,
        editUserLastNameRef: null,
        editUserEmailRef: null,
        editUserHiddenEmailRef: null
    },
    init: function () {
        s = manageUsers.settings;

        manageUsers.bindUIActions();
    },
    bindUIActions: function () {
        s.editUserSuccessRef = $("#edit_user_success");
        s.editUserErrorRef = $("#edit_user_error");
        s.editUserFirstNameRef = $("#edit_user_first_name");
        s.editUserLastNameRef = $("#edit_user_last_name");
        s.editUserEmailRef = $("#edit_user_email");
        s.editUserHiddenEmailRef = $("#edit_user_hidden_email");

        $("#add_user_modal_toggle").click(function () {
            $("#add_user_form")[0].reset()
            $("#add_user_modal").modal("show");
        });

        $(".edit_user_btn").click(function () {
            s.editUserSuccessRef.empty();
            s.editUserErrorRef.empty();

            $("#edit_user_modal").modal("show");
            manageUsers.findUserDetails($(this).data("audio-id"));
        });

        $(".delete_user_btn").click(function () {
            manageUsers.deleteUser($(this).data("audio-id"));
        });
    },
    findUserDetails: function (user_id) {
        $.ajax({
            type: "POST",
            url: $("#user_list_outer").data("edit-url"),
            data: {
                userId: user_id
            },
            success: function (data) {
                $("#edit_user_form")[0].reset();

                s.editUserFirstNameRef.val(data.user.FirstName);
                s.editUserLastNameRef.val(data.user.LastName);
                s.editUserEmailRef.val(data.user.Email);
                s.editUserHiddenEmailRef.val(data.user.Email);
            },
            error: function (data) {
                s.addUserSuccessRef.text("");
                s.addUserErrorRef.text(data.responseJSON.error);
            }
        });
    },
    deleteUser: function (user_id) {
        $.ajax({
            type: "POST",
            url: $("#user_list_outer").data("delete-url"),
            data: {
                userId: user_id
            }
        });
    }
};

$(document).ready(function () {
    manageUsers.init();
});