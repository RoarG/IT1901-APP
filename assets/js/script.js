$(document).ready(function () {
    // Load the base-object
    var base = new Base();
    
    // Login
    $('#main').on('submit','#login_form',function () {
        base.login($(this).serialize());
        
        // Return false to avoid the actual form from getting submitted
        return false;
    });
    
    $('#notifications').on('click',function () {
        $notification_window = $('#notification-window');
        
        if ($notification_window.is(':hidden')) {
            $notification_window.show();
        }
        else {
            $notification_window.hide();
        }
    });
    
    // Initiate the entire thingy!
    base.init();
});