/*
 * File: script.php
 * Holds: Holds every event used in the app
 * Last updated: 24.09.13
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

//
// jQuery
//

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
    $('#main').on('click','#sheep-add-dropdown',function (e) {
        // Prevent default behaviour
        e.preventDefault();
        
        var $that = $(this);
        
        // Check if open or close
        if (!$that.hasClass('open')) {
            // Open it
            $that.addClass('open');
            $('#sheep-add-dropdown .dropdown-body').stop().slideDown(400);
        }
        else {
            // Close it
            $that.removeClass('open');
            $('#sheep-add-dropdown .dropdown-body').stop().slideUp(400);
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
    $('#main').on('submit','#sheep_add_form',function () {
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
            $error_text = $('#sheep_add_error');
            if ($error_text.is(':visible')) {
                // Hide error-text
                $error_text.fadeOut(400);
            }
        }
        
        return false;
    });
    $('#main').on('keyup','#sheep_add_form input',function () {
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
                    $check_obj.removeClass('required-error').animate({borderColor: '#8CC7ED'});
                }
            }
            else if (idn == 'identification' || idn == 'weight' || idn == 'lat' || idn == 'lng') {
                // Check for numeric values
                if (valu.length > 0 && is_numeric(valu)) {
                    $check_obj.removeClass('required-error').animate({borderColor: '#8CC7ED'});
                }
            }
            else {
                // Normal case
                if (valu.length > 0) {
                    $check_obj.removeClass('required-error').animate({borderColor: '#8CC7ED'});
                }
            }
        }
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