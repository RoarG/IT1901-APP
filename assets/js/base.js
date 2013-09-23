/*
 * File: base.php
 * Holds: Holds 
 * Last updated: 16.09.13
 * Project: Prosjekt1
 * 
*/

function Base () {
    
    //
    //  Variables
    //
    
    this.ls,
    this.token = null,
    this.notifications = 0,
    this.disable_scrolling = false,
    this.map = null,
    this.notification_interval = null;
    
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
        this.ls.setItem('api-token',t);
    };
    
    //
    // Notification
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
                                
                                // Highlight?
                            }
                        }
                        else {
                            // Error here
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
    
    //
    // Animations
    //
    
    this.animate = {
        fadeIn : function (target, html, depth) {
            // If writing to #main, we have to wrap it
            if (target == '#main') {
                html = '<div id="main-'+depth+'">'+html+'</div>';
            }
            
            $(target).fadeOut(400,function () {
                $(target).html(html).fadeIn(400);
            });
        },
        slideLeft : function (html, depth, callback) {
            // Get the current depth
            var current_depth = $('#main > div').length;
            var display_depth = 0;
            
            // Decide if we should append or update html-content
            if (current_depth == depth) {
                $('#main-'+depth).html(html);
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
                display_depth = depth;
            }
            else {
                $('#main').append('<div id="main-'+depth+'">'+html+'</div>').css('width',((current_depth+1)*640));
                $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400,function () {
                    // Execute callback if supplied
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
                display_depth = current_depth + 1;
            }
            
            // Set height for the container
            $('#main').css('height',$('#main-'+display_depth).height());
            
            // Display back-button if it's hidden
            var $back = $('#back');
            if ($back.is(':hidden')) {
                $back.show();
            }
        },
        slideRight : function (html, depth, destroy) {
            //
        },
        resizeMain : function () {
            // Get current depth
            var depth = Math.abs(parseInt($('#main').css('margin-left'),10) / 640) + 1;
            
            // Set height for the container
            $('#main').css('height',$('#main-'+depth).height());
        },
    };
    
    //
    // Back-button
    //
    
    this.handleBack = function () {
        // Get the current depth
        var depth = Math.abs(parseInt($('#main').css('margin-left'),10) / 640);
        
        // Send back
        $('#main').animate({marginLeft: '-'+((depth-1)*640)+'px'},400);
        
        // Set height for the container
        $('#main').css('height',$('#main-'+depth).height());
        
        // Enable scrolling (if turned off)
        disable_scrolling = false;
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
                        document.title = 'Sheep :: '+json.response.system_name;
                        
                        // Set notification-number & show
                        $('#notifications a').html(json.response.notifications);
                        $('#notifications').show();
                        self.notifications = json.response.notifications;
                        
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
                    document.title = 'Sheep :: '+json.response.system_name;
                    
                    // Set notification-number & show
                    $('#notifications a').html(json.response.notifications);
                    $('#notifications').show();
                    self.notifications = json.response.notifications;
                    
                    // Start fetching notifications every 20 seconds
                    self.notification_interval_handler(true);
                }
                else {
                    var $wrong_box = $('#login_wrong_pw');
                    if ($wrong_box.is(':hidden')) {
                        $wrong_box.slideDown(400);
                    }
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
                self.animate.fadeIn('#main',json.tpl.login.base, 1);
                    
                // Change title
                document.title = 'Sheep';
                
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
                    self.animate.slideLeft(output, 2);
                }
                else {
                    // Something went wrong!
                }
            }
        });
    };
    
    //
    // Sheep - Display on map
    //
    
    this.sheep_map = function () {
        var self = this;
        
        $.ajax ({
            url: 'api/map?method=get&tpl=sheep_map&access_token='+self.token,
            cache: false,
            headers: { 'cache-control': 'no-cache' },
            dataType: 'json',
            success: function(json) {
                if (json.code == 200) {               
                    // Run the animation
                    self.animate.slideLeft(json.tpl.sheep_map.base, 2, function () {
                        // Set the height of the map
                        $('#map').css('height',$(window).height());
                        // Resize
                        self.animate.resizeMain();
                        
                        // Scroll
                        $('html, body').scrollTop(161);
                        
                        // Disable scrolling
                        disable_scrolling = true;
                        
                        var pos = json.response.center;
                        
                        // Init Google Maps
                        self.map = new google.maps.Map(document.getElementById("map"),{
                            center: new google.maps.LatLng(pos.lat, pos.lng), 
                            zoom: 9,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            streetViewControl: false});
                        
                        // Get all the sheeps and display them
                        for (var i = 0; i < json.response.sheep.length; i++) {
                            var current_sheep = json.response.sheep[i];
                            var map_marker = new google.maps.Marker({
                                map: self.map,
                                position: new google.maps.LatLng(current_sheep.lat, current_sheep.lng),
                                //icon: 'assets/css/gfx/kartikoner/overnatting.png',
                                visible: true
                            });
                            
                            // TODO, marker + infobox
                        }
                    });
                }
                else {
                    // Something went wrong!
                }
            }
        });
    };
    this.handle_scrolling = function (e) {
        console.log(e);
        // Disable scrolling if displaying the map
        if (disable_scrolling) {
            e.preventDefault();
        }
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
                self.animate.slideLeft(json.tpl.sheep_add.base, 2);
            }
        });
    }
    
    //
    // Admin - Edit
    //
    
    
    
    //
    // Admin - Alert
    //
    
    //
    // Admin - Log
    //
}