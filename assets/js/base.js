/*
 * File: base.php
 * Holds: Holds the base-object that takes care of all the animations and communication with the api
 * Last updated: 29.09.13
 * Project: Prosjekt1
 * 
*/

//
// Prototypes / Methods
//

Number.prototype.formatNumber = function(decPlaces, thouSeparator, decSeparator) { // http://stackoverflow.com/a/9318724/921563
    var n = this,
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
    decSeparator = decSeparator == undefined ? "." : decSeparator,
    thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
    sign = n < 0 ? "-" : "",
    i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

//
// Base-class
//

function Base () {
    
    //
    //  Variables
    //
    
    this.ls = null,
    this.token = null,
    this.notifications = 0,
    this.map = null,
    this.busy = false,
    this.notification_interval = null,
    this.map_interval = null,
    this.map_objects = {'marker': [], 'infowindow': []},
    this.contact = null,
    this.months = ['Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Des'],
    this.displayingMap = false;
    
    //
    //  Constructor
    //
    
    // Accessing localStoreage
    this.ls = localStorage;
        
    // Setting token-value
    var temp_token = this.ls.getItem('api-token');
    if (temp_token != null && temp_token.length > 10) {
        this.token = temp_token;
    };
        
    //
    // Token
    //
    
    this.setToken = function (t) {
        this.token = t;
        this.ls.setItem('api-token', t);
    };
    
    //
    // Back to login
    //
    
    this.kick_out = function () {
        // If something goes wrong, the user ends up here
        var self = this;
        
        // Check if map-unfuck
        if ($('.active #map').lenght > 0) {
            self.animate.mapSpecial(false);
        }
        
        // Clear all intervals
        clearInterval(self.notification_interval);
        clearInterval(self.map_interval);
        
        // Reset all other variables
        self.displayingMap = false;
        self.map_objects.markers = []; self.map_objects.infowindow = [];
        self.contact = null;
        self.notifications = 0;
        self.busy = false;
        self.displayingMap = false;
        
        // Reset tokens
        self.token = null;
        self.ls.setItem('api-token', null);
        
        // Hide back and notification-holder
        $('#back, #notifications').hide();
        
        // Load the login-template
        $.ajax ({
            url: 'api/?tpl=login',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                self.animate.backToStart(json.tpl.login.base, function () {
                    // Reset title
                    document.title = 'Sheep Locator';
                    
                    // Alert, telling the user he was kicked out
                    alert('Noe gikk galt. Du har blitt logget ut av systemet. Dette kan være fordi brukeren din ble logget inn et annet sted.');
                });
            }
        });
    }
    
    //
    // Notifications
    //
    
    this.notification_interval_handler = function (state) {
        var self = this;
        if (state) {
            // Turn fetching on
            this.notification_interval = setInterval(function () {
                $.ajax ({
                    url: 'api/notification/num?method=get&access_token='+self.token,
                    cache: false,
                    headers: { 'cache-control': 'no-cache' },
                    dataType: 'json',
                    success: function(json) {
                        if (json.code == '200') {
                            var new_notification_value = json.response.notifications;
                            if (new_notification_value != self.notifications) {
                                // Store new value
                                self.notifications = new_notification_value;
                                
                                // Update displayed value
                                $('#notifications a').html(new_notification_value);
                                
                                // Update notification-number in overlay
                                $('#notifications-top span').html(' ('+ new_notification_value +')');
                                
                                // Fetch the new notifications and store them in the popup
                                self.notification_fetch_dropdown();
                            }
                        }
                        else {
                            // Kick out of the system
                            self.kick_out();
                        }
                    }
                });
            },20000);
        }
        else {
            // Turn fetching off
            clearInterval(this.notification_interval);
        }
    };
    this.notification_fetch_dropdown = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/notification/dropdown?method=get&access_token='+self.token+'&tpl=notifications',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Check if number is less than it was eariler and if the window is open, in that case, don't overwrite
                    
                    // Parse sheep-overlay if we need it
                    for (var i = 0; i < json.response.notifications.length; i++) {
                        if (json.response.notifications[i].sheep != null) {
                            json.response.notifications[i].sheep_overlay = '<div class="notification-to-sheep-overlay image-overlay"><a class="sheep-single-view from-notification" href="#" data-id="'+json.response.notifications[i].sheep+'"><img src="assets/css/gfx/blank2x2.png" alt="" /></a></div>';
                        }
                        else {
                            json.response.notifications[i].sheep_overlay = '';
                        }
                    }
                    
                    var template = _.template(json.tpl.notifications.base);
                    var output = template({
                        inner: _.template(json.tpl.notifications.row,{items:json.response.notifications})
                    });
                    
                    $('#notifications-body').html(output);
                    
                    // Ugly haaack
                    $('#notifications-body .notification').each(function () {
                        var $that = $(this);
                        var that_height = $that.outerHeight();
                        var that_width = $that.outerWidth()
                        if ($that.hasClass('.sheep-is-read-1')) {
                            $('.is-read-indicator, .is-read-indicator img', $that).css({
                                height: that_height,
                                width: that_width
                            });
                        }
                        if (!$that.hasClass('sheep-is-sheep-')) {
                            $('.notification-to-sheep-overlay, .notification-to-sheep-overlay img', $that).css({
                                height: that_height,
                                width: that_width
                            });
                        }
                    });
                    
                    // Reset intiail
                    $('#notifications-body').data('hasinitialvalue', 1);
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    this.notification_all = function (num, callback) {
        var self = this;
        
        $.ajax ({
            url: 'api/notification/'+num+'?method=get&access_token='+self.token+'&tpl=notifications',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    for (var i = 0; i < json.response.notifications.length; i++) {
                        if (json.response.notifications[i].sheep != null) {
                            json.response.notifications[i].sheep_overlay = '<div class="notification-to-sheep-overlay image-overlay"><a class="sheep-single-view from-notification" href="#" data-id="'+json.response.notifications[i].sheep+'"><img src="assets/css/gfx/blank2x2.png" alt="" /></a></div>';
                        }
                        else {
                            json.response.notifications[i].sheep_overlay = '';
                        }
                    }
                    
                    // Check if we should append or compile the entire view
                    if (num == 1) {
                        // Generate entire view
                        var template = _.template(json.tpl.notifications.base_view);
                        var output = template({
                            inner: _.template(json.tpl.notifications.row,{items:json.response.notifications})
                        });
                        
                        // Run the animation
                        self.animate.slideLeft(output, 2, function () {
                            // Resize
                            self.animate.resizeMain();
                            
                            // Scroll to top of page
                            $('html, body').scrollTop(161);
                            
                            // Call callback
                            if (typeof callback == 'function') {
                                callback(json.response.notifications.length);
                            }
                        });
                    }
                    else {
                        // Generate the logs
                        var output = _.template(json.tpl.notifications.row,{items:json.response.notifications});
                        
                        // Append the content
                        $('#notifications-all').append(output);
                        
                        // Resize the window
                        self.animate.resizeMain();
                        
                        // Call callback
                        if (typeof callback == 'function') {
                            callback(json.response.notifications.length);
                        }
                    }
                    
                    $('#notifications-all .notification').each(function () {
                        var $that = $(this);
                        var that_height = $that.outerHeight();
                        var that_width = $that.outerWidth()
                        if ($that.hasClass('.sheep-is-read-1')) {
                            $('.is-read-indicator, .is-read-indicator img', $that).css({
                                height: that_height,
                                width: that_width
                            });
                        }
                        if (!$that.hasClass('sheep-is-sheep-')) {
                            $('.notification-to-sheep-overlay, .notification-to-sheep-overlay img', $that).css({
                                height: that_height,
                                width: that_width
                            });
                        }
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    
    //
    // Animations
    //
    
    this.animate = {
        fadeIn : function (target, html, depth) {
            // If writing to #main, we have to wrap it
            if (target == '#main') {
                html = '<div class="active" id="main-'+depth+'">'+html+'</div>';
            }
            
            // Remove active on all existing objects
            $('#main > div').removeClass('active');
            
            $(target).fadeOut(400,function () {
                $(target).html(html).fadeIn(400);
            });
        },
        slideLeft : function (html, depth, callback) {
            // Check if the depth already exists
            var $obj = $('#main-'+depth);
            var current_depth = $('#main > div').length;
            
            // Remove active on all existing objects
            $('#main > div').removeClass('active');
            
            if ($obj.length > 0) {
                // Object does exits
                $('#main-'+depth).html(html).addClass('active');
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            }
            else {
                $('#main').append('<div class="active" id="main-'+depth+'">'+html+'</div>').css('width',((current_depth+1)*640));
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            }
            
            // Set height for the container
            $('#main').animate({Height: $('#main-'+depth).height()},400);
            
            // Display back-button if it's hidden
            var $back = $('#back');
            if ($back.is(':hidden')) {
                $back.show();
            }
        },
        resizeMain : function () {
            // Get current depth
            var depth = Math.abs(parseInt($('#main').css('margin-left'),10) / 640) + 1;
            
            // Set height for the container
            $('#main').css('height', $('#main-'+depth).height());
            
            // Swap active
            $('#main > div').removeClass('active');
            $('#main-'+depth).addClass('active');
        },
        mapSpecial : function (mode) {
            $('#nav').animate({marginTop : ((mode)?'-161px':'0px')},400);
        },
        backToStart : function (html, callback) {
            // Check if we should animate left or just fade the content
            if ($('#main-1').hasClass('active')) {
                $('#main-1').fadeOut(400, function () {
                    $(this).html(html);
                    $(this).fadeIn(400, function () {
                        if (typeof callback == 'function') {
                            callback();
                        }
                    });
                });
            }
            else {
                // Not on the first page, animate left slide
                $('#main > div').removeClass('active');
                
                $('#main-1').html(html);
                $('#main').animate({marginLeft: '0px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                    this.animate.resizeMain();
                });
            }
        },
    };
    
    //
    // Back-button
    //
    
    this.handleBack = function () {
        var self = this;
        
        // Get the current depth
        var depth = Math.abs(parseInt($('#main').css('margin-left'),10) / 640);
        
        // Swap active
        $('#main > div').removeClass('active');
        $('#main-'+depth).addClass('active');
        
        // Send back
        $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400, function () {
            // Resize the container
            self.animate.resizeMain();
            
            // Set busy to false
            self.busy = false;
        });
        
        // Enable scrolling (if turned off)
        disable_scrolling = false;
        
        // Hide the back-button
        if (depth == 1) {
            $('#back').hide();
        }
        
        // Check if currently displaying map
        if (this.displayingMap) {
            this.displayingMap = false;
            
            clearInterval(this.map_interval);
            
            this.animate.mapSpecial(false);
        }
    };
    
    //
    // Init
    //
        
    this.init = function () {
        var self = this;
        if (this.token == null) {
            // No token sat, display login-form
            $.ajax ({
                url: 'api/?tpl=login',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    self.animate.fadeIn('#main', json.tpl.login.base);
                }
            });
        }
        else {
            // We have a token, validate it
            $.ajax ({
                url: 'api/auth/validate?method=get&access_token='+this.token+'&tpl=login,home',
                cache: false,
                headers: { 'cache-control': 'no-cache' },
                dataType: 'json',
                success: function(json) {
                    if (json.code == '200') {
                        // Update content
                        self.animate.fadeIn('#main', json.tpl.home.base, 1);
                        
                        // Change title
                        document.title = 'Sheep Locator :: '+json.response.system_name;
                        
                        // Set notification-number & show
                        $('#notifications a').html(json.response.notifications);
                        $('#notifications').show();
                        self.notifications = json.response.notifications;
                        
                        // Update notification-number in overlay
                        $('#notifications-top span').html(' ('+ json.response.notifications +')');
                        
                        // Start fetching notifications every 20 seconds
                        self.notification_interval_handler(true);
                    }
                    else {
                        self.animate.fadeIn('#main', json.tpl.login.base, 1);
                    }
                }
            });
        }
    };
    
    //
    // Login
    //
    
    this.login = function (ajax_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/auth?method=put&tpl=home',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: ajax_data,
            success: function(json) {
                if (json.code == 200) {
                    // Setting token
                    self.setToken(json.response.access_token);
                    
                    // Animating
                    self.animate.fadeIn('#main',json.tpl.home.base, 1);
                    
                    // Change title
                    document.title = 'Sheep Locator :: '+json.response.system_name;
                    
                    // Set notification-number & show
                    $('#notifications a').html(json.response.notifications);
                    $('#notifications').show();
                    self.notifications = json.response.notifications;
                    
                    // Update notification-number in overlay
                    $('#notifications-top span').html(' ('+ json.response.notifications +')');
                    
                    // Start fetching notifications every 20 seconds
                    self.notification_interval_handler(true);
                    
                    self.busy = false;
                }
                else {
                    var $wrong_box = $('#login_wrong_pw');
                    if ($wrong_box.is(':hidden')) {
                        $wrong_box.fadeIn(400);
                    }
                    
                    // Show submit-button again
                    $('#login_sbmt').stop().fadeIn(400);
                    $('#login_loader').stop().fadeOut(400, function () {
                        self.busy = false;
                    });
                }
            }
        });
    };
    
    //
    // Log out
    //
    
    this.logout = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/auth?method=get&tpl=login&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                // Setting token
                self.setToken(null);
                
                // Animating
                self.animate.fadeIn('#main', json.tpl.login.base, 1);
                    
                // Change title
                document.title = 'Sheep Locator';
                
                // Hide notification-number & show
                $('#notifications').hide();
                
                // Stop fetching notifications every 20 seconds
                self.notification_interval_handler(false);
                
                // Hide back-button
                $('#back').hide();
            }
        });
    };
    
    //
    // Sheep - Display all
    //  
    
    this.sheep_all = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep?method=get&tpl=sheep_all&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Generate the template
                    var template = _.template(json.tpl.sheep_all.base);
                    var output = template({
                        inner: _.template(json.tpl.sheep_all.row,{items:json.response.sheep})
                    });
                    
                    // Run the animation
                    self.animate.slideLeft(output, 2, function () {
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll to top of page
                        $('html, body').scrollTop(161);
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    this.sheep_one = function (id, base) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=get&tpl=sheep_single&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    var response = json.response;
                    
                    // Vaccine
                    if (response.vaccine == 1) {
                        response.vaccine = 'Ja';
                    }
                    else {
                        response.vaccine = 'Nei';
                    }
                    
                    // Status
                    if (response.alive == 1) {
                        response.status = '<span style="color: green;">Lever</span>';
                    }
                    else {
                        response.status = '<span style="color: red;">Død</span>';
                    }
                    
                    // Weight
                    response.weight = parseInt(response.weight, 10).formatNumber(0,',','');
                    
                    // Birthday
                    var birthday = response.birthday.split('-');
                    response.birthday = parseInt(birthday[2])+'. '+self.months[parseInt(birthday[1])-1]+' '+birthday[0];
                    
                    // Calculate age using moment.js
                    response.age = moment([birthday[0], birthday[1], birthday[2]]).fromNow(true);
                    
                    // Last updated
                    var last_updated = response.last_updated.split(' ');
                    var last_updated_date = last_updated[0].split('-');
                    response.last_updated = parseInt(last_updated_date[2])+'. '+self.months[parseInt(last_updated_date[1])-1]+' '+last_updated_date[0]+', kl: '+last_updated[1];
                    
                    // Comment
                    var comment = response.comment;
                    if (comment.length == 0) {
                        response.comment = '<p><i>Ingen kommentar</i></p>';
                    }
                    else {
                        var comment_split = comment.split("\n");
                        if (comment_split.length > 1) {
                            var temp_comment = '';
                            for (var i = 0; i < comment_split.length; i++) {
                                temp_comment += '<p>'+comment_split[i]+'</p>';
                            }
                            response.comment = temp_comment;
                        }
                        else {
                            response.comment = '<p>'+comment+'</p>';
                        }
                    }
                    
                    // Generate the template
                    var output = _.template(json.tpl.sheep_single.base,response);
                    
                    // Run the animation
                    self.animate.slideLeft(output, ((base == null)? 3 : base), function () {
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll to top of page
                        $('html, body').scrollTop(161);
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    this.sheep_one_delete = function (id) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=delete&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Go back to the previous page
                    self.sheep_all();
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    }
    this.sheep_one_edit = function (id) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=get&tpl=sheep_single_edit&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Fix vaccine_pretty for parsing
                    json.response.vaccine_pretty = ((json.response.vaccine == '1')?'Ja':'Nei');
                    
                    // Parse the template
                    var template = _.template(json.tpl.sheep_single_edit.base, json.response);
                    
                    // Run the animation
                    self.animate.slideLeft(template, 4, function () {
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll to top of page
                        $('html, body').scrollTop(161);
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    }
    this.sheep_edit_submit = function (id, ajax_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/'+id+'?method=put&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: ajax_data,
            success: function(json) {
                var code = json.code;
                if (code == 200) {
                    // Display the new sheep
                    self.sheep_one(json.response.id);
                }
                else if (code == 121) {
                    // Kick out of the system
                    self.kick_out();
                }
                else {
                    // Return error-message!
                    alert('Noe gikk galt. Systemet returnerte feilkode #'+code+' og teksten '+json.msg);
                }
            }
        });
    }
    
    //
    // Sheep - Display on map
    //
    
    this.sheep_map = function (sheep) {
        var self = this;
        
        // Storing current state
        self.displayingMap = true;
        
        // Check if displaying all of just one
        if (sheep == null) {
            var api_additions = '';
        }
        else {
            var api_additions = '/'+sheep;
        }
        
        $.ajax ({
            url: 'api/map'+api_additions+'?method=get&tpl=sheep_map&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    // Run the animations
                    self.animate.mapSpecial(true);
                    self.animate.slideLeft(json.tpl.sheep_map.base, 2, function () {
                        // Set the height of the map
                        $('#map').css('height',$(window).height() - 101);
                        
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll to top
                        $('html, body').scrollTop(0);
                        
                        var pos = json.response.center;
                        
                        // Init Google Maps
                        self.map = new google.maps.Map(document.getElementById("map"),{
                            center: new google.maps.LatLng(pos.lat, pos.lng), 
                            zoom: 15,
                            mapTypeId: google.maps.MapTypeId.SATELLITE,
                            streetViewControl: false});
                        
                        // Empty map-objects
                        self.map_objects.marker = [];
                        self.map_objects.infowindow = [];
                        
                        // Get all the sheeps and display them
                        for (var i = 0; i < json.response.sheep.length; i++) {
                            // Reference to current sheep
                            var current_sheep = json.response.sheep[i];
                            
                            // Defining the color of the marker
                            var marker_image = 'marker_blue.png';
                            
                            if (sheep != null && sheep == current_sheep.id) {
                                // The centered sheep should be displayed as green
                                marker_image = 'marker_green.png';
                            }
                            else if (current_sheep.alive == '0') {
                                // This sheep is dead!
                                marker_image = 'marker_red.png';
                            }
                            
                            var map_marker = new google.maps.Marker({
                                map: self.map,
                                position: new google.maps.LatLng(current_sheep.lat, current_sheep.lng),
                                icon: {
                                    url: 'assets/css/gfx/markers/'+marker_image,
                                    size: new google.maps.Size(72, 72),
                                    origin: new google.maps.Point(0, 0),
                                    anchor: new google.maps.Point(37, 37)},
                                visible: true,
                                title: current_sheep.name+' (#'+current_sheep.identification+')'
                            });
                            
                            // Add marker to the array
                            self.map_objects.marker.push(map_marker);
                            
                            // Konverterer siste oppdatering
                            var last_updated = current_sheep.last_updated.split(' ');
                            var last_updated_date = last_updated[0].split('-');
                            var last_updated_pretty = parseInt(last_updated_date[2])+'. '+self.months[parseInt(last_updated_date[1])-1]+' '+last_updated_date[0]+', kl: '+last_updated[1];
                            
                            // Generate infowindow content and eventListener
                            var temp_infowindow = new google.maps.InfoWindow({
                                content: '<div class="map-overlay"><h2>' + current_sheep.name+' (#'+current_sheep.identification+')'+'</h2><p><b>Status:</b> '+((current_sheep.alive == '1')?'Lever':'Død')+'</p><p><b>Posisjon:</b> ['+current_sheep.lat+', '+current_sheep.lng+']</p><p><b>Siste oppdatering:</b> '+last_updated_pretty+'</p> <input type="button" value="Vis info" data-id="'+current_sheep.id+'"/></div>'
                            });
                            
                            // Add infowindow to the array
                            self.map_objects.infowindow.push(temp_infowindow);
                            
                            google.maps.event.addListener(self.map_objects.marker[i], 'click', function(key) {
                                return function() {
                                    for (var j = 0; j < self.map_objects.infowindow.length; j++) {
                                        self.map_objects.infowindow[j].close();
                                    }
                                    self.map_objects.infowindow[key].open(self.map, self.map_objects.marker[key]);
                                }
                            }(i));
                        }
                        
                        // Start fetching positions and values every 20 second
                        self.map_interval = setInterval(function (self_ref, sheep) {
                            return function () {
                                var self = self_ref;
                                
                                // Check if displaying all of just one
                                if (sheep == null) {
                                    var api_additions = '';
                                }
                                else {
                                    var api_additions = '/'+sheep;
                                }
                                
                                $.ajax ({
                                    url: 'api/map'+api_additions+'?method=get&tpl=sheep_map&access_token='+self.token,
                                    cache: false,
                                    headers: { 'cache-control': 'no-cache' },
                                    dataType: 'json',
                                    success: function(json) {
                                        if (json.code == 200) {
                                            for (var i = 0; i < json.response.sheep.length; i++) {
                                                // Reference to current sheep
                                                var current_sheep = json.response.sheep[i];
                                                
                                                // Update position
                                                self.map_objects.marker[i].setPosition(new google.maps.LatLng(current_sheep.lat, current_sheep.lng));
                                                
                                                // Update text
                                                self.map_objects.infowindow[i].setContent('<div class="map-overlay"><h2>' + current_sheep.name+' (#'+current_sheep.identification+')'+'</h2><p><b>Status:</b> '+((current_sheep.alive == '1')?'Lever':'Død')+'</p><p><b>Posisjon:</b> ['+current_sheep.lat+', '+current_sheep.lng+']</p><p><b>Siste oppdatering:</b> '+last_updated_pretty+'</p> <input type="button" value="Vis info" data-id="'+current_sheep.id+'"/></div>');
                                                
                                                // Update marker-image
                                                var marker_image = 'marker_blue.png';
                                                if (current_sheep.alive == '0') {
                                                    marker_image = 'marker_red.png';
                                                }
                                                
                                                self.map_objects.marker[i].setIcon({
                                                    url: 'assets/css/gfx/markers/'+marker_image,
                                                    size: new google.maps.Size(72, 72),
                                                    origin: new google.maps.Point(0, 0),
                                                    anchor: new google.maps.Point(37, 37)});
                                            }
                                        }
                                    }
                                });
                            }
                        }(self, sheep), 20000);
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    
    //
    // Sheep - Add
    //
    
    this.sheep_add = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/?tpl=sheep_add',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                // Run the animation
                self.animate.slideLeft(json.tpl.sheep_add.base, 2, function () {
                    // Resize
                    self.animate.resizeMain();
                    
                    // Scroll to top of page
                    $('html, body').scrollTop(161);
                });
            }
        });
    }
    this.sheep_add_submit = function (ajax_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/sheep/?method=post&access_token='+self.token+'&tpl=sheep_add',
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: ajax_data,
            success: function(json) {
                var code = json.code;
                if (code == 200) {
                    // Reset the form
                    $('#sheep_add_form input').val('');
                    
                    // Display the new sheep
                    self.sheep_one(json.response.id);
                }
                else if (code == 121) {
                    // Kick out of the system
                    self.kick_out();
                }
                else {
                    // Return error-message!
                    alert('Noe gikk galt. Systemet returnerte feilkode #'+code+' og teksten '+json.msg);
                }
            }
        });
    }
    
    //
    // Admin - Edit
    //
    
    this.admin_edit = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/user?method=get&tpl=admin_edit&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {
                    var output = _.template(json.tpl.admin_edit.base, json.response);
                    
                    // Run the animation
                    self.animate.slideLeft(output, 2, function () {
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll to top of page
                        $('html, body').scrollTop(161);
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    this.admin_edit_submit_pw = function (form_data) {
        var self = this;
        
        $.ajax ({
            url: 'api/user/login?method=put&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: form_data,
            success: function(json) {
                $error_text = $('#admin_edit_error2');
                if (json.code == 200) {               
                    // This worked!
                    $('#current_password, #new_password1, #new_password2').val('');
                    $error_text.hide();
                    
                    // Quick and ugly alert goes here! :D
                    alert('Du har nå endret passord');
                }
                else if (json.code == 192) {
                    // Old password was incorrect
                    $error_text.html('Det nåværende passordet er feil.');
                    if ($error_text.is(':hidden')) {
                        // Display error-text
                        $error_text.stop().fadeIn(400);
                    }
                }
                else if (json.code == 121) {
                    // Creditials not matching
                    self.kick_out();
                }
                else {
                    // Unknown error
                    $error_text.html('En ukjent feil oppsto, prøv igjen');
                    if ($error_text.is(':hidden')) {
                        // Display error-text
                        $error_text.stop().fadeIn(400);
                    }
                }
            }
        });
    };
    this.admin_edit_submit_settings = function (form_data, system) {
        var self = this;
        
        $.ajax ({
            url: 'api/user?method=put&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: form_data,
            success: function(json) {
                $error_text = $('#admin_edit_error1');
                if (json.code == 200) {               
                    // This worked!
                    $error_text.hide();
                    
                    // Update title (in case the name of the system was changed)
                    document.title = 'Sheep Locator :: '+system;
                    
                    // Quick and ugly alert goes here! :D
                    alert('Endringene er lagret.');
                }
                else if (json.code == 121) {
                    // Kick out of the system
                    self.kick_out();
                }
                else {
                    // Unknown error
                    $error_text.html('En ukjent feil oppsto, prøv igjen');
                    if ($error_text.is(':hidden')) {
                        // Display error-text
                        $error_text.stop().fadeIn(400);
                    }
                }
            }
        });
    }
    
    //
    // Admin - Alert
    //
    
    this.admin_alert = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/contact?method=get&tpl=admin_alert&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {               
                    // Generate the template
                    var template = _.template(json.tpl.admin_alert.base);
                    var output = template({
                        inner: _.template(json.tpl.admin_alert.row,{items:json.response.contact})
                    });
                    
                    // Storing conact for laters
                    self.contact = json.response.contact;
                    
                    // Run the animation
                    self.animate.slideLeft(output, 2, function () {
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll to top of page
                        $('html, body').scrollTop(161);
                    });
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    this.admin_alert_remove = function() {
        var self = this;
        
        // Building new contact-array without the one element we wish to delete
        var new_arr = [];
        var local_contact = self.contact;
        
        $('.admin-alert-form').each(function () {
            // Check if removed
            if (!$('.block-alert', this).hasClass('removed')) {
                var this_form_epost = $(this).data('epost');
                for (var i = 0; i < local_contact.length; i++) {
                    var local_local_contact = local_contact[i];
                    
                    // Check if we can append this contact-person or not
                    if (local_local_contact.epost == this_form_epost) {
                        // Append
                        new_arr.push(local_local_contact);
                    }
                }
            }
        });
        
        // Setting new contact
        self.contact = new_arr;
        
        // Doing the request
        $.ajax ({
            url: 'api/contact?method=put&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: { 'contact' : new_arr },
            success: function(json) {
                // Resize the window
                self.animate.resizeMain();
                
                // Check if should be kicked out of the system
                if (json.code == 121) {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    this.admin_alert_add = function (elm) {
        var self = this;
        
        // Building new contact-array without the one element we wish to delete
        self.contact.push(elm);
        
        $.ajax ({
            url: 'api/contact?method=put&tpl=admin_alert&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: { 'contact' : self.contact },
            success: function(json) {
                // Generate the new box
                var output = _.template(json.tpl.admin_alert.row,{items:[elm]});
                $('#admin-alert-container').append(output);
                
                // Resize the window
                self.animate.resizeMain();
                
                // Reset form
                $('#name,#epost').val('');
                
                // Check if should be kicked out of the system
                if (json.code == 121) {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
    
    //
    // Admin - Log
    //
    
    this.admin_log = function (num, callback) {
        var self = this;
        
        $.ajax ({
            url: 'api/log/'+num+'?method=get&tpl=admin_log&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            type: 'post',
            data: { 'contact' : self.contact },
            success: function(json) {
                if (json.code == 200) {
                    // Check if we should append or compile the entire view
                    if (num == 1) {
                        // Generate entire view
                        var template = _.template(json.tpl.admin_log.base);
                        var output = template({
                            inner: _.template(json.tpl.admin_log.row,{items:json.response.log})
                        });
                        
                        // Run the animation
                        self.animate.slideLeft(output, 2, function () {
                            // Resize
                            self.animate.resizeMain();
                            
                            // Scroll to top of page
                            $('html, body').scrollTop(161);
                            
                            // Call callback
                            if (typeof callback == 'function') {
                                callback(json.response.log.length);
                            }
                        });
                    }
                    else {
                        // Generate the logs
                        var output = _.template(json.tpl.admin_log.row,{items:json.response.log});
                        
                        // Append the content
                        $('#notification-list').append(output);
                        
                        // Resize the window
                        self.animate.resizeMain();
                        
                        // Call callback
                        if (typeof callback == 'function') {
                            callback(json.response.log.length);
                        }
                    }
                }
                else {
                    // Kick out of the system
                    self.kick_out();
                }
            }
        });
    };
}