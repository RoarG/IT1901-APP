/*
 * File: script.php
 * Holds: Holds every event used in the app
 * Last updated: 29.09.13
 * Project: Prosjekt1
 * 
*/

//
// Methods
//

function is_numeric(strString) { // http://www.pbdr.com/vbtips/asp/JavaNumberValid.htm (modified)
    var strValidChars = '0123456789.';
    var strChar;
    var blnResult = true;

    if (strString.length == 0) {
        return false;
    }
    
    for (i = 0; i < strString.length && blnResult == true; i++) {
        strChar = strString.charAt(i);
        if (strValidChars.indexOf(strChar) == -1) {
            blnResult = false;
        }
    }
    
    return blnResult;
}

function checkemail(str) {
    var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
    if (filter.test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function is_valid_date(d) { // Validating html5-datefield (format yyyy-mm-dd)
    if (d.length == 0) {
        return false;
    }
    else {
        var splt = d.split('-');
        if (splt.length != 3) {
            return false;
        }
        else {
            if (splt[0].length != 4) {
                return false;
            }
            if (splt[1].length != 2) {
                return false;
            }
            if (splt[2].length != 2) {
                return false;
            }
        }
    }
    
    return true;
}

function check_required_callback_add() { // Check if there are any fields with required-error on them left in the form
    var $error_text = $('#sheep_add_error');
    if ($error_text.is(':visible')) {
        // Do the check
        var found = false;
        
        // Check identification first
        if ($('#identification-holder').hasClass('required-error')) {
            return;
        }
        
        $('#sheep_add_form input').each(function () {
            if ($(this).hasClass('required-error')) {
                found = true;
            }
        });
        
        if (!found) {
            // No errors left! Hide the warning
            $error_text.fadeOut(400);
        }
    }
}
function check_required_callback_add_dyamic(form,err) { // Check if there are any fields with required-error on them left in the form
    var $error_text = $('#'+err);
    if ($error_text.is(':visible')) {
        // Do the check
        var found = false;
        
        $('#'+form+' input').each(function () {
            if ($(this).hasClass('required-error')) {
                found = true;
            }
        });
        
        if (!found) {
            // No errors left! Hide the warning
            $error_text.fadeOut(400);
        }
    }
}

//
// jQuery
//

$(document).ready(function () {
    
    //
    // Variables, objects and stuff we need
    //
    
    var base = new Base();
    var is_loading_new_content = false;
    var page = 1;
    var can_do_ajax = true;
    
    //
    // Back-button
    //
    
    $('#back-button').on('click',function (e) {
        // Prevent default
        e.preventDefault();
        
        // Check if currently busy or not
        if (!base.busy) {
            // Set busy
            base.busy = true;
            
            // Handle back-click
            base.handleBack();
        }
        
        // Resetting block on dynamic adding ajax-content
        can_do_ajax = true;
        page = 1;
    });
    
    //
    // Notifications
    //
    
    $('#notifications, #notification-window-overlay').on('click',function (e) {
        // Prevent default
        e.preventDefault();
        // Toggle show/hide on notification-window based on it's current state
        $notification_window = $('#notification-window');
        
        if ($notification_window.is(':hidden')) {
            $('#notification-window-overlay').fadeIn(400);
            $notification_window.show();
            
            // Check if the dropdown has any value at all
            if ($('#notifications-body').data('hasinitialvalue') == '0') {
                // Load initial values
                base.notification_fetch_dropdown();
            }
            
        }
        else {
            $('#notification-window-overlay').fadeOut(400);
            $notification_window.hide();
        }
    });
    
    //
    // Login
    //
    
    $('#main').on('submit','#login_form',function () {
        // Check if currently busy
        if (!base.busy) {
            // Set busy
            base.busy = true;
            
            // Tranfser this
            var $self = $(this);
            
            // Hide button, show loader
            $('#login_sbmt').stop().fadeOut(400);
            $('#login_loader').stop().fadeIn(400, function () {
                // Send the login-info to the base-class
                base.login($self.serialize());
            });
        }
        
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
    $('#wrapper').on('click','.sheep-single-view',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Check if clicked from the notification-overlay
        if ($(this).hasClass('from-notification')) {
            // Trigger click on background to hide the notification-overlay
            $('#notification-window-overlay').trigger('click');
            
            // Load the content
            base.sheep_one($(this).data('id'), 2);
        }
        else {
            // Load the content
            base.sheep_one($(this).data('id'), null);
        } 
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
    $('#main').on('click','#sheep_single_map',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load edit
        base.sheep_map($(this).data('id'));
    });
    
    //
    // Sheep - Display on map
    //
    
    $('#main').on('click','#home-map',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sheep_map(null);
    });
    
    //
    // Sheep - Add
    //
    
    $('#main').on('click','#home-add',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Load the content
        base.sheep_add();
    });
    $('#main').on('click','#sheep-add-dropdown',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        var $that = $(this);
        
        // Check if open or close
        if (!$that.hasClass('open')) {
            // Open it
            $that.addClass('open');
            $('#sheep-add-dropdown .dropdown-body').stop().slideDown(400, function () {
                // Resize viewport
                base.animate.resizeMain();
            });
        }
        else {
            // Close it
            $that.removeClass('open');
            $('#sheep-add-dropdown .dropdown-body').stop().slideUp(400, function () {
                // Resize viewport
                base.animate.resizeMain();
            });
        }
    });
    $('#main').on('click','#sheep-add-dropdown .dropdown-body ul li a',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        e.stopPropagation();
        
        // Store this
        var $that = $(this);
        
        // Update info
        $('#vaccine').val($that.data('value'));
        $('#sheep-add-dropdown .dropdown-head p').html('Vaksinert: '+$that.html());
        
        // Remove active and set the right one
        $('#sheep-add-dropdown ul li').removeClass('active');
        $that.parent().addClass('active');
        
        // Close it
        $('#sheep-add-dropdown').removeClass('open');
        $('#sheep-add-dropdown .dropdown-body').stop().slideUp(400);
    });
    $('#main').on('clickoutside','#sheep-add-dropdown',function(e) { // TODO, this does not work
		$that = $('#sheep-add-dropdown');
        
        // Check if opened
        if ($that.hasClass('open')) {
            // Trigger click to simulate close
            $that.trigger('click');
        }
	});
    $('#main').on('submit','#sheep_add_form, #sheep_edit_form',function () {
        var error = false;
        
        // Validate identification
        var identification = $('#identification').val();
        if (identification.length < 2 || !is_numeric(identification)) {
            error = true;
            $('#identification-holder').addClass('required-error').animate({borderColor: 'red'});
        }
        
        // Validate name
        if ($('#name').val().length < 2 ) {
            error = true;
            $('#name').addClass('required-error').animate({borderColor: 'red'});
        }
        
        // Validate birthday
        if (!is_valid_date($('#birthday').val())) {
            error = true;
            $('#birthday').addClass('required-error').animate({borderColor: 'red'});
        }
        
        // Validate weight
        var weight = $('#weight').val();
        if (weight.length < 2 || !is_numeric(weight)) {
            error = true;
            $('#weight').addClass('required-error').animate({borderColor: 'red'});
        }
        
        // Validate lat
        var lat = $('#lat').val();
        if (lat.length < 2 || !is_numeric(lat)) {
            error = true;
            $('#lat').addClass('required-error').animate({borderColor: 'red'});
        }
        
        // Validate lng
        var lng = $('#lng').val();
        if (lng.length < 2 || !is_numeric(lng)) {
            error = true;
            $('#lng').addClass('required-error').animate({borderColor: 'red'});
        }
        
        if (error == true) {
            $error_text = $('#sheep_add_error');
            if ($error_text.is(':hidden')) {
                // Display error-text
                $error_text.fadeIn(400);
            }
        }
        else {
            // Run the api-call!
            if (this.id == 'sheep_add_form') {
                base.sheep_add_submit($(this).serialize());
            }
            else {
                base.sheep_edit_submit($('#id').val(), $(this).serialize());
            }
        }
        
        return false;
    });
    $('#main').on('keyup','#sheep_add_form input, #sheep_edit_form input',function () {
        var $that = $(this);
        var idn = $that[0].id;
        
        // Check if we need to check class on another object than this
        if (idn == 'identification') {
            // Special case
            $check_obj = $('#identification-holder');
        }
        else {
            $check_obj = $that;
        }
        
        // Check for the class
        if ($check_obj.hasClass('required-error')) {
            // Has the class, check if we can remove it
            var valu = $that.val();
            
            if (idn == 'birthday') {
                // Check for correct date-value
                if (is_valid_date(valu)) {
                    $check_obj.removeClass('required-error').animate({borderColor: '#8CC7ED'},400,check_required_callback_add);
                }
            }
            else if (idn == 'identification' || idn == 'weight' || idn == 'lat' || idn == 'lng') {
                // Check for numeric values
                if (valu.length > 0 && is_numeric(valu)) {
                    $check_obj.removeClass('required-error').animate({borderColor: '#8CC7ED'},400,check_required_callback_add);
                }
            }
            else {
                // Normal case
                if (valu.length > 0) {
                    $check_obj.removeClass('required-error').animate({borderColor: '#8CC7ED'},400,check_required_callback_add);
                }
            }
        }
    });
    $('#main').on('focus','#sheep_add_form input, #sheep_edit_form input, #alert-add-form input',function () {
        // Show helptext
        $('#'+this.id+'_help').stop().slideDown(400,function () {
            // Resize!
            base.animate.resizeMain();
        });
    });
    $('#main').on('blur','#sheep_add_form input, #sheep_edit_form input, #alert-add-form input',function () {
        // Hide helptext
        $('#'+this.id+'_help').stop().slideUp(400,function () {
            // Resize!
            base.animate.resizeMain();
        });
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
        setTimeout(function () {
            base.animate.resizeMain();
        }, 100); 
    });
    $('#main').on('submit','.admin-alert-form',function () {
        // Animate
        $('.block-alert',this).addClass('removed').slideUp(400, function () {
            // Resize!
            base.animate.resizeMain();
        });
        
        // Send request
        base.admin_alert_remove();
        
        // Return to avoid submitting the form
        return false;
    });
    $('#main').on('submit','#alert-add-form',function () {
        // Validate
        var error = false;
        
        // Validate name
        if ($('#name').val().length < 2 ) {
            error = true;
            $('#name').addClass('required-error').animate({borderColor: 'red'});
        }
        
        // Validate name
        var epost = $('#epost').val();
        if (epost.length < 2 || !checkemail(epost)) {
            error = true;
            $('#epost').addClass('required-error').animate({borderColor: 'red'});
        }
        
        if (error == true) {
            $error_text = $('#alert_add_error');
            if ($error_text.is(':hidden')) {
                // Display error-text
                $error_text.fadeIn(400);
            }
        }
        else {
            // Run the api-call!
            base.admin_alert_add({'name' : $('#name').val(), 'epost': $('#epost').val() });
        }
        
        // Return to avoid submitting the form
        return false;
    });
    $('#main').on('keyup','#alert-add-form input',function () {
        var $that = $(this);
        var idn = $that[0].id;
        
        // Check for the class
        if ($that.hasClass('required-error')) {
            // Has the class, check if we can remove it
            var valu = $that.val();
            
            if (idn == 'epost') {
                // Check for epost
                if (valu.length > 0 && checkemail(valu)) {
                    $that.removeClass('required-error').animate({borderColor: '#8CC7ED'},400,check_required_callback_add_dyamic('alert-add-form','alert_add_error'));
                }
            }
            else {
                // Normal case
                if (valu.length > 0) {
                    $that.removeClass('required-error').animate({borderColor: '#8CC7ED'},400,check_required_callback_add_dyamic('alert-add-form','alert_add_error'));
                }
            }
        }
    });
    
    //
    // Admin - Log
    //
    
    $('#main').on('click','#admin-log',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        // Avoid load new logs at once
        can_do_ajax = false;
        
        // Load the content
        base.admin_log(1, function (num_logs) {
            can_do_ajax = true;
            
            // If the request returned 20 entries, we can run another fetch
            if (num_logs != 20) {
                can_do_ajax = false;
            }
        });
    });
    $(document).on('scroll', function() {
        if ($('.active #notification-list').length > 0) {
            if (can_do_ajax) {
                if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
                    if (!is_loading_new_content) {
                        // Updating new vars
                        is_loading_new_content = true;
                        page++;
                        
                        base.admin_log(page, function (num_logs) {
                            // No longer loading new content
                            is_loading_new_content = false;
                            
                            // If the request returned 20 entries, we can run another fetch
                            if (num_logs != 20) {
                                can_do_ajax = false;
                            }
                        });
                    }
                }
            }
        }
    });
    
    //
    // Init
    //
    
    base.init();
});