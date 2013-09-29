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
    // Log out
    //
    
    $('#main').on('click','#log-out',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Ask if the user really wants to log out
        var q = confirm('Sikker på at du vil logge ut?');
        
        // Check if he/she want to or not
        if (q) {
            // Send the request to the class
            base.logout();
        }
    });
    
    //
    // Sheep - Display all
    //
    
    $('#main').on('click','#home-all',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sheep_all();
    });
    $('#main').on('click','.sheep-single-view',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sheep_one($(this).data('id'));
    });
    $('#main').on('click','#sheep_single_delete',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Ask if the user really wants to log out
        var q = confirm('Sikker på at du vil slette '+$(this).data('name')+' (#'+$(this).data('identification')+') ?');
        
        // Check if he/she want to or not
        if (q) {
            // Send the request to the class
            base.sheep_one_delete($(this).data('id'));
        }
    });
    $('#main').on('click','#sheep_single_edit',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load edit
        base.sheep_one_edit($(this).data('id'));
    });
    
    //
    // Sheep - Display on map
    //
    
    $('#main').on('click','#home-map',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sheep_map();
    });
    document.ontouchstart = function (e) {
        base.handle_scrolling(e);
    }
    
    //
    // Sheep - Add
    //
    
    $('#main').on('click','#home-add',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sheep_add();
    });
    
    //
    // Admin - Edit
    //
    
    $('#main').on('click','#admin-edit',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.admin_edit();
    });
    
    //
    // Admin - Alert
    //
    
    $('#main').on('click','#admin-alert',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.admin_alert();
    });
    $('#main').on('click','.block-alert .link a',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Find parent
        var $parent = $(this).parent().parent().parent();
        
        // Toggle active-class
        if ($parent.hasClass('active')) {
            $parent.removeClass('active');
        }
        else {
            $parent.addClass('active');
        }
        
        // Resize!
        base.animate.resizeMain();
    });
    
    //
    // Admin - Log
    //
    
    $('#main').on('click','#admin-log',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.admin_log();
    });
    
    //
    // Init
    //
    
    base.init();
});