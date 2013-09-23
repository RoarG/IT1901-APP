$(document).ready(function () {
    //
    // Variables, objects and stuff we need
    //
    
    var base = new Base();
    
    //
    // Back-button
    //
    
    $('#back').on('click',function () {
        base.handleBack();
    });
    
    //
    // Notifications
    //
    
    $('#notifications').on('click',function () {
        // Toggle show/hide on notification-window based on it's current state
        $notification_window = $('#notification-window');
        
        if ($notification_window.is(':hidden')) {
            $notification_window.show();
        }
        else {
            $notification_window.hide();
        }
    });
    
    //
    // Login
    //
    
    $('#main').on('submit','#login_form',function () {
        // Send the login-info to the base-class
        base.login($(this).serialize());
        
        // Return false to avoid the actual form from getting submitted
        return false;
    });
    
    //
    // Vis alle
    //
    
    $('#main').on('click','#home-all',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sau_alle();
    });
    
    //
    // Init
    //
    
    base.init();
});